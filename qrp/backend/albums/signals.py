import logging
import os
import queue
import threading
import time
from urllib.parse import urlparse

from django.conf import settings
from django.db import transaction
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver

from .models import (
    MediaItem,
    Photo,
    PortfolioImage,
    ServiceGalleryImage,
    Testimonial,
    Video,
)

logger = logging.getLogger(__name__)


_delete_queue: "queue.PriorityQueue[tuple[float, object, str, int]]" = queue.PriorityQueue()
_delete_worker_started = False
_delete_worker_lock = threading.Lock()


_FILEFIELD_REFERENCES = [
    (Testimonial, 'avatar'),
    (ServiceGalleryImage, 'image'),
    (PortfolioImage, 'image'),
    (Video, 'video_file'),
    (Video, 'thumbnail'),
    (MediaItem, 'file'),
]


def _relative_media_path_from_url(url: str) -> str | None:
    """Return storage-relative path for MEDIA_URL-backed URLs."""
    if not url:
        return None

    parsed = urlparse(url)
    request_path = parsed.path.lstrip('/')
    media_prefix = (settings.MEDIA_URL or '').lstrip('/')

    if media_prefix and request_path.startswith(media_prefix):
        relative_path = request_path[len(media_prefix):]
        return relative_path.lstrip('/')

    return None


def _cleanup_empty_dirs(start_dir: str, media_root: str) -> None:
    """Remove empty directories up to MEDIA_ROOT."""
    current_dir = os.path.abspath(start_dir)
    media_root = os.path.abspath(media_root)

    while current_dir.startswith(media_root) and current_dir != media_root:
        try:
            os.rmdir(current_dir)
        except OSError:
            break
        current_dir = os.path.dirname(current_dir)


def _ensure_delete_worker() -> None:
    """Start a single background worker to retry deletions on Windows locks."""
    global _delete_worker_started

    if _delete_worker_started:
        return

    with _delete_worker_lock:
        if _delete_worker_started:
            return

        def worker():
            while True:
                run_at, storage, storage_name, attempt = _delete_queue.get()
                try:
                    now = time.time()
                    if run_at > now:
                        time.sleep(run_at - now)
                    _safe_storage_delete(storage, storage_name, attempt=attempt)
                finally:
                    _delete_queue.task_done()

        thread = threading.Thread(target=worker, name='media-delete-worker', daemon=True)
        thread.start()
        _delete_worker_started = True


def _safe_storage_delete(storage, storage_name: str, attempt: int = 0) -> None:
    """Delete via Django storage.

    On Windows, video files can be temporarily locked by another process (browser,
    antivirus, preview, etc.). For PermissionError, this function schedules
    background retries with backoff.
    """
    if not storage_name:
        return

    # Storage.delete() is the most portable option (works for local + S3, etc.)
    try:
        storage.delete(storage_name)
    except PermissionError as exc:
        # Exponential-ish backoff, max ~2 minutes total.
        next_attempt = attempt + 1
        if next_attempt <= 8:
            delay = min(30.0, 0.5 * (2 ** attempt))
            logger.warning(
                "Unable to delete stored file %s (locked). Retrying in %.1fs (attempt %s/8): %s",
                storage_name,
                delay,
                next_attempt,
                exc,
            )
            _ensure_delete_worker()
            _delete_queue.put((time.time() + delay, storage, storage_name, next_attempt))
        else:
            logger.warning("Unable to delete stored file %s after retries: %s", storage_name, exc)
        return
    except Exception as exc:
        logger.warning("Unable to delete stored file %s: %s", storage_name, exc)
        return

    # Best-effort: remove empty directories for local FileSystemStorage
    try:
        absolute_path = storage.path(storage_name)
    except Exception:
        return

    media_root = os.path.abspath(settings.MEDIA_ROOT)
    try:
        _cleanup_empty_dirs(os.path.dirname(os.path.abspath(absolute_path)), media_root)
    except Exception:
        return


def _delete_media_file_by_url(url: str) -> None:
    relative_path = _relative_media_path_from_url(url)
    if not relative_path:
        return

    media_root = os.path.abspath(settings.MEDIA_ROOT)
    absolute_path = os.path.abspath(os.path.join(media_root, relative_path))

    # Safety: prevent path traversal deletes
    if not absolute_path.startswith(media_root):
        return

    if os.path.exists(absolute_path):
        try:
            os.remove(absolute_path)
            _cleanup_empty_dirs(os.path.dirname(absolute_path), media_root)
        except OSError as exc:
            logger.warning("Unable to delete media file %s: %s", absolute_path, exc)


def _delete_instance_files(instance, field_names: list[str]) -> None:
    """Delete stored files for the given instance fields."""
    for field_name in field_names:
        file_field = getattr(instance, field_name, None)
        file_name = getattr(file_field, 'name', '')
        if not file_field or not file_name:
            continue

        # If something accidentally stored an absolute URL in the FileField name,
        # fall back to URL-based deletion.
        if isinstance(file_name, str) and (file_name.startswith('http://') or file_name.startswith('https://')):
            _delete_media_file_by_url(file_name)
            continue

        storage = getattr(file_field, 'storage', None)
        if storage is None:
            continue

        transaction.on_commit(lambda s=storage, n=file_name: _safe_storage_delete(s, n))


def _is_file_referenced_anywhere(storage_name: str, *, exclude_model=None, exclude_pk=None) -> bool:
    """Conservative check: do NOT delete if any model still references the file.

    Use exclude_model/exclude_pk when checking old files during an update, because
    the current DB row still references the old file until the save completes.
    """
    if not storage_name:
        return True

    for model_cls, field_name in _FILEFIELD_REFERENCES:
        qs = model_cls.objects.filter(**{field_name: storage_name})
        if exclude_model is model_cls and exclude_pk is not None:
            qs = qs.exclude(pk=exclude_pk)
        if qs.exists():
            return True

    # Extra safety: some systems store absolute URLs for Photo; use endswith checks.
    for field_name in ('url', 'medium_url', 'thumbnail_url'):
        qs = Photo.objects.filter(**{f"{field_name}__endswith": storage_name})
        if exclude_model is Photo and exclude_pk is not None:
            qs = qs.exclude(pk=exclude_pk)
        if qs.exists():
            return True

    return False


def _delete_replaced_file_field(sender, instance, field_name: str) -> None:
    """Delete previous file when a FileField/ImageField is replaced.

    Safety: only deletes the old file if no other model still references the same
    stored file name.
    """
    if not instance.pk:
        return

    try:
        previous = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    old_field = getattr(previous, field_name, None)
    new_field = getattr(instance, field_name, None)

    old_name = getattr(old_field, 'name', '')
    new_name = getattr(new_field, 'name', '')

    if not old_name or old_name == new_name:
        return

    # If anyone references it, keep it.
    if _is_file_referenced_anywhere(old_name, exclude_model=sender, exclude_pk=instance.pk):
        return

    storage = getattr(old_field, 'storage', None)
    if storage is None:
        return

    # Delete after commit to avoid weird states during transaction.
    transaction.on_commit(lambda s=storage, n=old_name: _safe_storage_delete(s, n))


@receiver(post_delete, sender=Testimonial)
def delete_testimonial_media(sender, instance, **kwargs):
    _delete_instance_files(instance, ['avatar'])


@receiver(post_delete, sender=ServiceGalleryImage)
def delete_service_gallery_media(sender, instance, **kwargs):
    _delete_instance_files(instance, ['image'])


@receiver(post_delete, sender=PortfolioImage)
def delete_portfolio_media(sender, instance, **kwargs):
    _delete_instance_files(instance, ['image'])


@receiver(post_delete, sender=Video)
def delete_video_media(sender, instance, **kwargs):
    _delete_instance_files(instance, ['video_file', 'thumbnail'])


@receiver(post_delete, sender=MediaItem)
def delete_media_item_file(sender, instance, **kwargs):
    _delete_instance_files(instance, ['file'])


@receiver(post_delete, sender=Photo)
def delete_photo_assets(sender, instance, **kwargs):
    # Remove stored album files when either a photo or its parent album is deleted.
    for field in ('url', 'thumbnail_url', 'medium_url'):
        url_value = getattr(instance, field, '')
        if not url_value:
            continue

        # Safety: if another Photo still references the same URL, keep the file.
        if Photo.objects.filter(**{field: url_value}).exclude(pk=instance.pk).exists():
            continue

        _delete_media_file_by_url(url_value)


@receiver(pre_save, sender=Photo)
def delete_replaced_photo_assets(sender, instance, **kwargs):
    """When a Photo is edited and URLs change, remove the old files.

    Safety: only deletes a file if no other Photo still references the same URL.
    """
    if not instance.pk:
        return

    try:
        previous = Photo.objects.get(pk=instance.pk)
    except Photo.DoesNotExist:
        return

    for field in ('url', 'thumbnail_url', 'medium_url'):
        old_value = getattr(previous, field, '')
        new_value = getattr(instance, field, '')

        if not old_value or old_value == new_value:
            continue

        if Photo.objects.filter(**{field: old_value}).exclude(pk=instance.pk).exists():
            continue

        _delete_media_file_by_url(old_value)


@receiver(pre_save, sender=Testimonial)
def delete_replaced_testimonial_media(sender, instance, **kwargs):
    _delete_replaced_file_field(sender, instance, 'avatar')


@receiver(pre_save, sender=ServiceGalleryImage)
def delete_replaced_service_gallery_media(sender, instance, **kwargs):
    _delete_replaced_file_field(sender, instance, 'image')


@receiver(pre_save, sender=PortfolioImage)
def delete_replaced_portfolio_media(sender, instance, **kwargs):
    _delete_replaced_file_field(sender, instance, 'image')


@receiver(pre_save, sender=Video)
def delete_replaced_video_media(sender, instance, **kwargs):
    _delete_replaced_file_field(sender, instance, 'video_file')
    _delete_replaced_file_field(sender, instance, 'thumbnail')


@receiver(pre_save, sender=MediaItem)
def delete_replaced_media_item_file(sender, instance, **kwargs):
    _delete_replaced_file_field(sender, instance, 'file')
