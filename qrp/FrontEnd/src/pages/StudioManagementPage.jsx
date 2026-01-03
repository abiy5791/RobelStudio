import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  FileText,
  Briefcase,
  MessageSquare,
  FolderOpen,
  Image,
  Plus,
  Edit,
  Trash2,
  Upload,
  Save,
  X,
  Eye,
  GripVertical,
  Film,
  AlertCircle,
  Calendar,
  Phone,
} from "lucide-react";
import {
  FiInstagram,
  FiFacebook,
  FiLinkedin,
  FiTwitter,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiCalendar as FiCalendarIcon,
  FiLink as FiLinkIcon,
} from "react-icons/fi";
import { FaTiktok, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import MultipleImageUpload from "../components/MultipleImageUpload";
import { formatNumber } from "../utils/numberUtils";
import toast from "react-hot-toast";
import {
  getStudioContent,
  updateStudioContent,
  getStudioContactInfo,
  updateStudioContactInfo,
  getStudioStats,
  createStudioStat,
  updateStudioStat,
  deleteStudioStat,
  getSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  getServices,
  createService,
  updateService,
  deleteService,
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getPortfolioCategories,
  createPortfolioCategory,
  updatePortfolioCategory,
  deletePortfolioCategory,
  getPortfolioImages,
  deletePortfolioImage,
  updatePortfolioImage,
  getServiceGalleryImages,
  deleteServiceGalleryImage,
  updateServiceGalleryImage,
  bulkUploadPortfolioImages,
  bulkUploadServiceImages,
  getMediaItems,
  createMediaItem,
  deleteMediaItem,
  updateMediaItem,
  getVideoCategories,
  createVideoCategory,
  updateVideoCategory,
  deleteVideoCategory,
  getVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  bulkUploadVideos,
} from "../services/studioManagementApi";

const MODAL_DEFAULT_STATE = {
  isOpen: false,
  mode: "info",
  title: "",
  description: "",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  confirmTone: "accent",
  details: [],
  onConfirm: null,
};

const CONTACT_DEFAULTS = {
  phone: "",
  whatsapp_number: "",
  emergency_phone: "",
  email: "",
  address: "",
  office_hours: "",
  booking_link: "",
  map_embed_url: "",
};

const SOCIAL_LINK_DEFAULT = {
  platform: "",
  icon: "FiLink",
  url: "",
  order: 0,
  is_active: true,
};

const SOCIAL_ICON_CHOICES = [
  "FiInstagram",
  "FiFacebook",
  "FiLinkedin",
  "FiTwitter",
  "FiGlobe",
  "FiMail",
  "FiMapPin",
  "FiCalendar",
  "FaTiktok",
  "FaWhatsapp",
  "FaYoutube",
];

const SOCIAL_ICON_COMPONENTS = {
  FiInstagram,
  FiFacebook,
  FiLinkedin,
  FiTwitter,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiCalendar: FiCalendarIcon,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
  FiLink: FiLinkIcon,
};

const resolveSocialPreviewIcon = (iconName) => {
  if (!iconName) {
    return FiLinkIcon;
  }
  return SOCIAL_ICON_COMPONENTS[iconName] || FiLinkIcon;
};

const stringifyFieldErrors = (data) => {
  if (!data || typeof data !== "object") return null;
  const entries = Object.entries(data);
  if (entries.length === 0) return null;
  return entries
    .map(([field, value]) => {
      const normalizedField =
        field === "non_field_errors"
          ? ""
          : field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const normalizedValue = Array.isArray(value)
        ? value.join(" ")
        : typeof value === "string"
        ? value
        : JSON.stringify(value);
      return normalizedField ? `${normalizedField}: ${normalizedValue}` : normalizedValue;
    })
    .filter(Boolean)
    .join(" | ");
};

const parseErrorMessage = (error, fallback = "Something went wrong") => {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error?.response) {
    const data = error.response.data;
    if (typeof data === "string") {
      return data;
    }
    if (data?.detail) {
      return data.detail;
    }
    const fieldMessages = stringifyFieldErrors(data);
    if (fieldMessages) {
      return fieldMessages;
    }
  }
  if (error?.message && error?.response?.status >= 400) {
    return error.message;
  }
  if (error.response?.data?.detail) return error.response.data.detail;
  if (error.message) return error.message;
  return fallback;
};

function ActionModal({
  isOpen,
  mode = "info",
  title,
  description,
  details = [],
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmTone = "accent",
  onClose,
  onConfirm,
  busy = false,
  errorMessage,
}) {
  if (!isOpen) return null;

  const isDanger = confirmTone === "danger" || mode === "delete";
  const gradientClass = isDanger
    ? "from-red-500 to-rose-600"
    : "from-pink-500 to-purple-600";
  const confirmClasses = isDanger
    ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
    : "bg-pink-600 hover:bg-pink-700 focus-visible:ring-pink-500";

  const icon =
    mode === "delete" ? (
      <Trash2 className="w-5 h-5" />
    ) : mode === "edit" ? (
      <Edit className="w-5 h-5" />
    ) : (
      <AlertCircle className="w-5 h-5" />
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center px-4 py-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradientClass} text-white flex items-center justify-center shadow-lg`}>
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {title}
                </h3>
                {description && (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {details.length > 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40">
            <dl className="divide-y divide-slate-200 dark:divide-slate-800">
              {details.map((detail, index) => (
                <div
                  key={`${detail.label}-${index}`}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <dt className="text-slate-500 dark:text-slate-400">
                    {detail.label}
                  </dt>
                  <dd className="text-slate-900 dark:text-white font-medium text-right">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-200">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-white font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${confirmClasses} ${busy ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {busy ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function StudioManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("content");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [globalError, setGlobalError] = useState(null);
  const [modalConfig, setModalConfig] = useState(MODAL_DEFAULT_STATE);
  const [modalBusy, setModalBusy] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Content state
  const [content, setContent] = useState({
    hero_title: "",
    hero_subtitle: "",
    about_title: "",
    about_text: "",
  });
  const [contactInfo, setContactInfo] = useState(CONTACT_DEFAULTS);
  const [contactSaving, setContactSaving] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);
  const [editingSocialLink, setEditingSocialLink] = useState(null);
  const [socialLinkForm, setSocialLinkForm] = useState(SOCIAL_LINK_DEFAULT);

  // Stats state
  const [stats, setStats] = useState([]);
  const [editingStat, setEditingStat] = useState(null);
  const [statForm, setStatForm] = useState({
    label: "",
    value: "",
    icon: "FiUsers",
    order: 0,
    is_active: true,
  });

  // Services state
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    icon: "FiCamera",
    order: 0,
    is_active: true,
  });

  // Testimonials state
  const [testimonials, setTestimonials] = useState([]);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [testimonialForm, setTestimonialForm] = useState({
    name: "",
    role: "",
    quote: "",
    avatar: null,
    order: 0,
    is_active: true,
  });

  // Portfolio state
  const [categories, setCategories] = useState([]);
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    order: 0,
    is_active: true,
  });

  // Service gallery state
  const [serviceGalleryImages, setServiceGalleryImages] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  // Media items state
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaForm, setMediaForm] = useState({
    title: "",
    media_type: "image",
    file: null,
  });
  const [selectedImage, setSelectedImage] = useState(null);

  // Video state
  const [videoCategories, setVideoCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedVideoCategory, setSelectedVideoCategory] = useState(null);
  const [editingVideoCategory, setEditingVideoCategory] = useState(null);
  const [videoCategoryForm, setVideoCategoryForm] = useState({
    name: "",
    order: 0,
    is_active: true,
  });
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoForm, setVideoForm] = useState({
    title: "",
    description: "",
    category: "",
    video_file: null,
    thumbnail: null,
    duration: "",
    year: "",
    order: 0,
    is_active: true,
  });
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const lightboxUrl =
    selectedImage && typeof selectedImage === "object"
      ? selectedImage.url
      : selectedImage || "";
  const lightboxType =
    selectedImage && typeof selectedImage === "object"
      ? selectedImage.type
      : undefined;
  const isVideoLightbox = Boolean(
    lightboxUrl &&
      (lightboxType === "video" ||
        /\.(mp4|webm|mov)$/i.test(lightboxUrl))
  );

  const scrollToSection = (sectionId) => {
    if (!sectionId) return;
    requestAnimationFrame(() => {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  const notifyError = (error, fallbackMessage) => {
    const message = parseErrorMessage(error, fallbackMessage);
    setGlobalError(message);
    toast.error(message);
    return message;
  };

  const closeModal = () => {
    setModalConfig({ ...MODAL_DEFAULT_STATE });
    setModalBusy(false);
    setModalError(null);
  };

  const openModal = (config) => {
    setModalError(null);
    setModalBusy(false);
    setModalConfig({
      ...MODAL_DEFAULT_STATE,
      ...config,
      isOpen: true,
    });
  };

  const handleModalConfirm = async () => {
    if (!modalConfig?.onConfirm) {
      closeModal();
      return;
    }
    try {
      setModalBusy(true);
      await Promise.resolve(modalConfig.onConfirm());
      closeModal();
    } catch (error) {
      const message = parseErrorMessage(error, "Failed to complete action");
      setModalError(message);
      setGlobalError(message);
    } finally {
      setModalBusy(false);
    }
  };

  const handleDeleteIntent = ({
    entityLabel,
    name,
    details = [],
    onConfirm,
  }) => {
    openModal({
      mode: "delete",
      title: `Delete ${entityLabel}`,
      description:
        "This action cannot be undone. The item will be removed from the live site immediately.",
      confirmLabel: "Delete",
      confirmTone: "danger",
      details: [{ label: "Item", value: name }, ...details],
      onConfirm,
    });
  };

  const handleEditIntent = ({
    entityLabel,
    name,
    details = [],
    onConfirm,
    sectionId,
  }) => {
    openModal({
      mode: "edit",
      title: `Edit ${entityLabel}`,
      description:
        "We'll load this item into the editor below so you can update it safely.",
      confirmLabel: "Load Editor",
      details: [{ label: "Item", value: name }, ...details],
      onConfirm: () => {
        onConfirm();
        scrollToSection(sectionId);
      },
    });
  };

  const handleContactFieldChange = (field, value) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactSave = async () => {
    setContactSaving(true);
    try {
      await updateStudioContactInfo(contactInfo);
      toast.success("Contact information updated successfully");
      loadData();
    } catch (error) {
      notifyError(error, "Failed to update contact information");
    } finally {
      setContactSaving(false);
    }
  };

  const resetSocialLinkForm = () => {
    setSocialLinkForm({ ...SOCIAL_LINK_DEFAULT });
    setEditingSocialLink(null);
  };

  const handleSocialLinkSave = async () => {
    try {
      const payload = {
        ...socialLinkForm,
        order: Number(socialLinkForm.order) || 0,
      };
      if (editingSocialLink) {
        await updateSocialLink(editingSocialLink.id, payload);
        toast.success("Social link updated successfully");
      } else {
        await createSocialLink(payload);
        toast.success("Social link created successfully");
      }
      resetSocialLinkForm();
      loadData();
    } catch (error) {
      notifyError(error, "Failed to save social link");
    }
  };

  const handleSocialLinkDelete = (link) => {
    handleDeleteIntent({
      entityLabel: "Social Link",
      name: link.platform,
      details: [
        { label: "URL", value: link.url },
        { label: "Status", value: link.is_active ? "Active" : "Inactive" },
      ],
      onConfirm: async () => {
        await deleteSocialLink(link.id);
        toast.success("Social link deleted successfully");
        loadData();
      },
    });
  };

  const handleSocialLinkEdit = (link) => {
    handleEditIntent({
      entityLabel: "Social Link",
      name: link.platform,
      details: [
        { label: "URL", value: link.url },
        { label: "Order", value: link.order ?? 0 },
      ],
      sectionId: "social-links-card",
      onConfirm: () => {
        setEditingSocialLink(link);
        setSocialLinkForm({
          platform: link.platform,
          icon: link.icon || "FiLink",
          url: link.url,
          order: link.order ?? 0,
          is_active: link.is_active,
        });
      },
    });
  };

  const tabs = [
    { id: "content", label: "Content", icon: FileText },
    { id: "stats", label: "Statistics", icon: Settings },
    { id: "services", label: "Services", icon: Briefcase },
    { id: "testimonials", label: "Testimonials", icon: MessageSquare },
    { id: "portfolio", label: "Portfolio", icon: FolderOpen },
    { id: "gallery", label: "Service Gallery", icon: Image },
    { id: "videos", label: "Video Portfolio", icon: Film },
    { id: "contact", label: "Contact", icon: Phone },
  ];

  const iconOptions = [
    "FiCamera",
    "FiUsers",
    "FiFilm",
    "FiBriefcase",
    "FiAperture",
    "FiSun",
  ];

  const refreshPortfolioImages = useCallback(async (categoryId, notifyOnError = false) => {
    if (!categoryId) {
      setPortfolioImages([]);
      return;
    }
    try {
      const imagesData = await getPortfolioImages(categoryId);
      setPortfolioImages(Array.isArray(imagesData) ? imagesData : []);
    } catch (error) {
      setPortfolioImages([]);
      if (notifyOnError) {
        notifyError(error, "Failed to load portfolio images");
      }
    }
  }, []);

  const refreshServiceGallery = useCallback(async (serviceId, notifyOnError = false) => {
    if (!serviceId) {
      setServiceGalleryImages([]);
      return;
    }
    try {
      const galleryData = await getServiceGalleryImages(serviceId);
      setServiceGalleryImages(Array.isArray(galleryData) ? galleryData : []);
    } catch (error) {
      setServiceGalleryImages([]);
      if (notifyOnError) {
        notifyError(error, "Failed to load service gallery");
      }
    }
  }, []);

  const refreshVideos = useCallback(async (categoryId, notifyOnError = false) => {
    if (!categoryId) {
      setVideos([]);
      return;
    }
    try {
      const videosData = await getVideos(categoryId);
      setVideos(Array.isArray(videosData) ? videosData : []);
    } catch (error) {
      setVideos([]);
      if (notifyOnError) {
        notifyError(error, "Failed to load videos");
      }
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (!modalConfig.isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [modalConfig.isOpen]);

  useEffect(() => {
    if (activeTab !== "gallery") {
      setServiceGalleryImages([]);
      return;
    }
    if (selectedService) {
      refreshServiceGallery(selectedService);
    } else {
      setServiceGalleryImages([]);
    }
  }, [activeTab, selectedService, refreshServiceGallery]);

  useEffect(() => {
    if (activeTab !== "portfolio") {
      setPortfolioImages([]);
      return;
    }
    if (selectedCategory) {
      refreshPortfolioImages(selectedCategory);
    } else {
      setPortfolioImages([]);
    }
  }, [activeTab, selectedCategory, refreshPortfolioImages]);

  useEffect(() => {
    if (activeTab !== "videos") {
      setVideos([]);
      return;
    }
    if (selectedVideoCategory) {
      refreshVideos(selectedVideoCategory);
    } else {
      setVideos([]);
    }
  }, [activeTab, selectedVideoCategory, refreshVideos]);

  useEffect(() => {
    if (activeTab !== "videos" || editingVideo) return;
    if (selectedVideoCategory) {
      setVideoForm((prev) => ({
        ...prev,
        category: prev.category || String(selectedVideoCategory),
      }));
    }
  }, [activeTab, selectedVideoCategory, editingVideo]);

  const loadData = async () => {
    setLoading(true);
     setGlobalError(null);
    try {
      switch (activeTab) {
        case "contact":
          const [contactData, socialLinksData] = await Promise.all([
            getStudioContactInfo(),
            getSocialLinks(),
          ]);
          setContactInfo(
            contactData
              ? { ...CONTACT_DEFAULTS, ...contactData }
              : { ...CONTACT_DEFAULTS }
          );
          setSocialLinks(
            Array.isArray(socialLinksData) ? socialLinksData : []
          );
          setEditingSocialLink(null);
          setSocialLinkForm({ ...SOCIAL_LINK_DEFAULT });
          break;
        case "content":
          const [contentData, mediaItemsData] = await Promise.all([
            getStudioContent(),
            getMediaItems(),
          ]);
          setContent(
            contentData || {
              hero_title: "",
              hero_subtitle: "",
              about_title: "",
              about_text: "",
            }
          );
          setMediaItems(Array.isArray(mediaItemsData) ? mediaItemsData : []);
          break;
        case "stats":
          const statsData = await getStudioStats();
          setStats(Array.isArray(statsData) ? statsData : []);
          break;
        case "services":
          const servicesData = await getServices();
          setServices(Array.isArray(servicesData) ? servicesData : []);
          break;
        case "testimonials":
          const testimonialsData = await getTestimonials();
          setTestimonials(
            Array.isArray(testimonialsData) ? testimonialsData : []
          );
          break;
        case "portfolio":
          const categoriesData = await getPortfolioCategories();
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
          if (selectedCategory) {
            await refreshPortfolioImages(selectedCategory);
          } else {
            setPortfolioImages([]);
          }
          break;
        case "gallery":
          const servicesData2 = await getServices();
          setServices(Array.isArray(servicesData2) ? servicesData2 : []);
          if (selectedService) {
            await refreshServiceGallery(selectedService);
          } else {
            setServiceGalleryImages([]);
          }
          break;
        case "videos":
          const videoCategoriesData = await getVideoCategories();
          setVideoCategories(
            Array.isArray(videoCategoriesData) ? videoCategoriesData : []
          );
          if (selectedVideoCategory) {
            await refreshVideos(selectedVideoCategory);
          } else {
            setVideos([]);
          }
          break;
      }
    } catch (error) {
      notifyError(error, "Failed to load studio data");
      // Set empty arrays on error to prevent map errors
      if (activeTab === "services") setServices([]);
      if (activeTab === "testimonials") setTestimonials([]);
      if (activeTab === "portfolio") setCategories([]);
      if (activeTab === "videos") setVideoCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoCategorySave = async () => {
    try {
      if (editingVideoCategory) {
        await updateVideoCategory(editingVideoCategory.id, videoCategoryForm);
        toast.success("Video category updated successfully");
      } else {
        await createVideoCategory(videoCategoryForm);
        toast.success("Video category created successfully");
      }
      setEditingVideoCategory(null);
      setVideoCategoryForm({ name: "", order: 0, is_active: true });
      loadData();
    } catch (error) {
      notifyError(error, "Failed to save video category");
    }
  };

  const handleVideoCategoryDelete = (category) => {
    handleDeleteIntent({
      entityLabel: "Video Category",
      name: category.name,
      details: [
        { label: "Order", value: category.order ?? 0 },
        { label: "Status", value: category.is_active ? "Active" : "Inactive" },
      ],
      onConfirm: async () => {
        await deleteVideoCategory(category.id);
        toast.success("Video category deleted successfully");
        if (selectedVideoCategory === category.id) {
          setSelectedVideoCategory(null);
          setVideos([]);
        }
        loadData();
      },
    });
  };

  const handleVideoSave = async () => {
    if (!videoForm.category) {
      notifyError("Please select a video category");
      return;
    }
    setVideoUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("title", videoForm.title);
      formData.append("description", videoForm.description);
      formData.append("category", videoForm.category);
      formData.append("duration", videoForm.duration);
      formData.append("year", videoForm.year);
      formData.append("order", videoForm.order ?? 0);
      formData.append("is_active", String(videoForm.is_active));
      if (videoForm.video_file) {
        formData.append("video_file", videoForm.video_file);
      }
      if (videoForm.thumbnail) {
        formData.append("thumbnail", videoForm.thumbnail);
      }

      if (editingVideo) {
        await updateVideo(editingVideo.id, formData);
        toast.success("Video updated successfully");
      } else {
        await createVideo(formData);
        toast.success("Video created successfully");
      }

      setEditingVideo(null);
      setVideoForm({
        title: "",
        description: "",
        category: selectedVideoCategory
          ? String(selectedVideoCategory)
          : "",
        video_file: null,
        thumbnail: null,
        duration: "",
        year: "",
        order: 0,
        is_active: true,
      });
      loadData();
    } catch (error) {
      notifyError(error, "Failed to save video");
    } finally {
      setTimeout(() => setVideoUploadProgress(0), 1000);
    }
  };

  const handleVideoDelete = (video) => {
    handleDeleteIntent({
      entityLabel: "Video",
      name: video.title || "Untitled Video",
      details: [
        { label: "Duration", value: video.duration || "--" },
        {
          label: "Status",
          value: video.is_active ? "Active" : "Inactive",
        },
      ],
      onConfirm: async () => {
        await deleteVideo(video.id);
        toast.success("Video deleted successfully");
        if (selectedVideoCategory) {
          await refreshVideos(selectedVideoCategory, true);
        } else {
          loadData();
        }
      },
    });
  };

  const handleVideoUpload = async (result) => {
    try {
      toast.success(
        `Uploaded ${result.videos?.length || 0} videos successfully`
      );
      if (selectedVideoCategory) {
        await refreshVideos(selectedVideoCategory, true);
      }
    } catch (error) {
      notifyError("Failed to refresh videos");
    }
  };

  const handleContentSave = async () => {
    try {
      await updateStudioContent(content);
      toast.success("Content updated successfully");
    } catch (error) {
      notifyError(error, "Failed to update content");
    }
  };

  const handleServiceSave = async () => {
    try {
      if (editingService) {
        await updateService(editingService.id, serviceForm);
        toast.success("Service updated successfully");
      } else {
        await createService(serviceForm);
        toast.success("Service created successfully");
      }
      setEditingService(null);
      setServiceForm({
        title: "",
        description: "",
        icon: "FiCamera",
        order: 0,
        is_active: true,
      });
      loadData();
    } catch (error) {
      notifyError(error, "Failed to save service");
    }
  };

  const handleServiceDelete = (service) => {
    handleDeleteIntent({
      entityLabel: "Service",
      name: service.title,
      details: [
        { label: "Order", value: service.order ?? 0 },
        { label: "Status", value: service.is_active ? "Active" : "Inactive" },
      ],
      onConfirm: async () => {
        await deleteService(service.id);
        toast.success("Service deleted successfully");
        loadData();
      },
    });
  };

  const handleTestimonialSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", testimonialForm.name);
      formData.append("role", testimonialForm.role);
      formData.append("quote", testimonialForm.quote);
      formData.append("order", testimonialForm.order);
      formData.append("is_active", String(testimonialForm.is_active));
      if (testimonialForm.avatar) {
        formData.append("avatar", testimonialForm.avatar);
      }

      if (editingTestimonial) {
        await updateTestimonial(editingTestimonial.id, formData);
        toast.success("Testimonial updated successfully");
      } else {
        await createTestimonial(formData);
        toast.success("Testimonial created successfully");
      }
      setEditingTestimonial(null);
      setTestimonialForm({
        name: "",
        role: "",
        quote: "",
        avatar: null,
        order: 0,
        is_active: true,
      });
      loadData();
    } catch (error) {
      notifyError(error, "Failed to save testimonial");
    }
  };

  const handleTestimonialDelete = (testimonial) => {
    handleDeleteIntent({
      entityLabel: "Testimonial",
      name: testimonial.name,
      details: [
        { label: "Role", value: testimonial.role || "--" },
        { label: "Order", value: testimonial.order ?? 0 },
      ],
      onConfirm: async () => {
        await deleteTestimonial(testimonial.id);
        toast.success("Testimonial deleted successfully");
        loadData();
      },
    });
  };

  const handleCategorySave = async () => {
    try {
      if (editingCategory) {
        await updatePortfolioCategory(editingCategory.id, categoryForm);
        toast.success("Category updated successfully");
      } else {
        await createPortfolioCategory(categoryForm);
        toast.success("Category created successfully");
      }
      setEditingCategory(null);
      setCategoryForm({ name: "", order: 0, is_active: true });
      loadData();
    } catch (error) {
      notifyError(error, "Failed to save category");
    }
  };

  const handleStatSave = async () => {
    try {
      if (editingStat) {
        await updateStudioStat(editingStat.id, statForm);
        toast.success("Statistic updated successfully");
      } else {
        await createStudioStat(statForm);
        toast.success("Statistic created successfully");
      }
      setEditingStat(null);
      setStatForm({
        label: "",
        value: "",
        icon: "FiUsers",
        order: 0,
        is_active: true,
      });
      loadData();
    } catch (error) {
      notifyError(error, "Failed to save statistic");
    }
  };

  const handleStatDelete = (stat) => {
    handleDeleteIntent({
      entityLabel: "Statistic",
      name: stat.label,
      details: [
        { label: "Value", value: stat.value },
        { label: "Order", value: stat.order ?? 0 },
      ],
      onConfirm: async () => {
        await deleteStudioStat(stat.id);
        toast.success("Statistic deleted successfully");
        loadData();
      },
    });
  };

  const handleCategoryDelete = (category) => {
    handleDeleteIntent({
      entityLabel: "Portfolio Category",
      name: category.name,
      details: [
        { label: "Order", value: category.order ?? 0 },
        {
          label: "Status",
          value: category.is_active ? "Active" : "Inactive",
        },
      ],
      onConfirm: async () => {
        await deletePortfolioCategory(category.id);
        toast.success("Category deleted successfully");
        if (selectedCategory === category.id) {
          setSelectedCategory(null);
          setPortfolioImages([]);
        }
        loadData();
      },
    });
  };

  const handlePortfolioUpload = async (result) => {
    try {
      toast.success(
        `Uploaded ${result.images?.length || 0} images successfully`
      );
      if (selectedCategory) {
        await refreshPortfolioImages(selectedCategory, true);
      }
    } catch (error) {
      notifyError("Failed to refresh portfolio images");
    }
  };

  const handleServiceGalleryUpload = async (result) => {
    try {
      toast.success(
        `Uploaded ${result.images?.length || 0} images successfully`
      );
      if (selectedService) {
        await refreshServiceGallery(selectedService, true);
      }
    } catch (error) {
      notifyError("Failed to refresh gallery images");
    }
  };

  const handleMediaItemSave = async () => {
    setLoading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("title", mediaForm.title);
      formData.append("media_type", mediaForm.media_type);
      if (mediaForm.file) {
        formData.append("file", mediaForm.file);
      }

      // Use XHR for progress tracking
      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
      const token = localStorage.getItem("access_token");

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", `${API_BASE}/api/manage/media-items/`);
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }
        xhr.send(formData);
      });

      toast.success("Media item added successfully");
      setMediaForm({ title: "", media_type: "image", file: null });
      loadData();
    } catch (error) {
      notifyError(error, "Failed to upload media item");
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleMediaItemDelete = (item) => {
    handleDeleteIntent({
      entityLabel: "Hero Media Item",
      name: item.title || item.media_type,
      details: [
        { label: "Type", value: item.media_type },
        { label: "Order", value: item.order ?? 0 },
      ],
      onConfirm: async () => {
        await deleteMediaItem(item.id);
        toast.success("Media item deleted successfully");
        loadData();
      },
    });
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (dragIndex === dropIndex) return;

    const newItems = [...mediaItems];
    const draggedItem = newItems[dragIndex];
    newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    // Update order values
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));

    setMediaItems(updatedItems);

    // Update database
    try {
      await Promise.all(
        updatedItems.map((item) =>
          updateMediaItem(item.id, { order: item.order })
        )
      );
      toast.success("Order updated successfully");
    } catch (error) {
                              notifyError("Failed to update order");
      loadData(); // Reload on error
    }
  };

  return (
    <motion.div
      className="py-8 gradient-bg min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container-app">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-4"
            style={{ color: "var(--text)" }}
          >
            Studio <span style={{ color: "var(--accent)" }}>Management</span>
          </h1>
          <p
            className="font-sans text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: "var(--text-soft)" }}
          >
            Manage your studio content, services, and portfolio with ease
          </p>
          {user?.email && (
            <p
              className="mt-2 text-sm font-sans uppercase tracking-wide"
              style={{ color: "var(--text-soft)" }}
            >
              Signed in as {user.email}
            </p>
          )}
        </motion.div>

        {globalError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div className="flex-1 leading-relaxed">{globalError}</div>
              <button
                onClick={() => setGlobalError(null)}
                className="p-1 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Enhanced Tabs */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 backdrop-filter backdrop-blur-sm ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg transform -translate-y-1"
                    : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md hover:-translate-y-0.5"
                } border border-white/20 dark:border-gray-700/50`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {activeTab === "contact" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="card-enhanced" id="contact-info-card">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2
                    className="text-2xl font-serif font-semibold mb-2"
                    style={{ color: "var(--text)" }}
                  >
                    Studio Contact Details
                  </h2>
                  <p
                    className="font-sans text-sm"
                    style={{ color: "var(--text-soft)" }}
                  >
                    Primary channels clients see on the public site and booking flows
                  </p>
                </div>
                <motion.button
                  onClick={handleContactSave}
                  disabled={contactSaving}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-60"
                  whileHover={{ scale: contactSaving ? 1 : 1.02 }}
                  whileTap={{ scale: contactSaving ? 1 : 0.98 }}
                >
                  <Save className="w-4 h-4" />
                  {contactSaving ? "Saving..." : "Save Contact"}
                </motion.button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: "var(--text)" }}>
                    Primary Phone
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => handleContactFieldChange("phone", e.target.value)}
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="0912345678"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: "var(--text)" }}>
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.whatsapp_number}
                    onChange={(e) => handleContactFieldChange("whatsapp_number", e.target.value)}
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="WhatsApp-enabled phone"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: "var(--text)" }}>
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.emergency_phone}
                    onChange={(e) => handleContactFieldChange("emergency_phone", e.target.value)}
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="Optional backup number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: "var(--text)" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => handleContactFieldChange("email", e.target.value)}
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="studio@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: "var(--text)" }}>
                    Booking Link
                  </label>
                  <input
                    type="url"
                    value={contactInfo.booking_link}
                    onChange={(e) => handleContactFieldChange("booking_link", e.target.value)}
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="https://calendly.com/robelstudio"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Only secure https links are accepted for booking redirects.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: "var(--text)" }}>
                    Map Embed URL
                  </label>
                  <input
                    type="url"
                    value={contactInfo.map_embed_url}
                    onChange={(e) => handleContactFieldChange("map_embed_url", e.target.value)}
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="https://www.google.com/maps/embed?..."
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Paste the full Google Maps embed URL to power the locator section.
                  </p>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: "var(--text)" }}>
                    Studio Address
                  </label>
                  <textarea
                    rows="3"
                    value={contactInfo.address}
                    onChange={(e) => handleContactFieldChange("address", e.target.value)}
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="123 Wedding Lane, Addis Ababa"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: "var(--text)" }}>
                    Office Hours
                  </label>
                  <textarea
                    rows="4"
                    value={contactInfo.office_hours}
                    onChange={(e) => handleContactFieldChange("office_hours", e.target.value)}
                    className="input-enhanced w-full px-4 py-3"
                    placeholder={"Mon-Fri: 9am - 6pm\nSat: 10am - 2pm"}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Multi-line text supported; each line renders as a separate bullet on the landing page.
                  </p>
                </div>
              </div>
            </div>

            <div className="card-enhanced" id="social-links-card">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2
                    className="text-2xl font-serif font-semibold mb-2"
                    style={{ color: "var(--text)" }}
                  >
                    Social Links
                  </h2>
                  <p
                    className="font-sans text-sm"
                    style={{ color: "var(--text-soft)" }}
                  >
                    Control badges that appear across the site footer and hero CTA ribbon ({socialLinks.length})
                  </p>
                </div>
                {editingSocialLink && (
                  <motion.button
                    onClick={resetSocialLinkForm}
                    className="btn-ghost flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X className="w-4 h-4" />
                    Cancel Edit
                  </motion.button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: "var(--text)" }}>
                    Platform Label
                  </label>
                  <input
                    type="text"
                    value={socialLinkForm.platform}
                    onChange={(e) =>
                      setSocialLinkForm({
                        ...socialLinkForm,
                        platform: e.target.value,
                      })
                    }
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="Instagram"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: "var(--text)" }}>
                    Icon Identifier
                  </label>
                  <select
                    value={socialLinkForm.icon}
                    onChange={(e) =>
                      setSocialLinkForm({
                        ...socialLinkForm,
                        icon: e.target.value,
                      })
                    }
                    className="input-enhanced w-full px-4 py-3"
                  >
                    {SOCIAL_ICON_CHOICES.map((iconName) => (
                      <option key={iconName} value={iconName}>
                        {iconName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: "var(--text)" }}>
                    Destination URL
                  </label>
                  <input
                    type="url"
                    value={socialLinkForm.url}
                    onChange={(e) =>
                      setSocialLinkForm({
                        ...socialLinkForm,
                        url: e.target.value,
                      })
                    }
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="https://instagram.com/robelstudio"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: "var(--text)" }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={socialLinkForm.order}
                    onChange={(e) =>
                      setSocialLinkForm({
                        ...socialLinkForm,
                        order: Number(e.target.value) || 0,
                      })
                    }
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={socialLinkForm.is_active}
                      onChange={(e) =>
                        setSocialLinkForm({
                          ...socialLinkForm,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-2 cursor-pointer"
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span className="font-sans text-sm font-medium" style={{ color: "var(--text)" }}>
                      Active (visible on website)
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <motion.button
                  onClick={handleSocialLinkSave}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save className="w-4 h-4" />
                  {editingSocialLink ? "Update Link" : "Add Link"}
                </motion.button>
                {!editingSocialLink && (
                  <button
                    type="button"
                    onClick={resetSocialLinkForm}
                    className="btn-ghost"
                  >
                    Reset Form
                  </button>
                )}
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                All social URLs must start with https:// to pass the backend validation layer.
              </p>

              <div className="mt-10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-serif font-semibold" style={{ color: "var(--text)" }}>
                    Existing Links
                  </h3>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {socialLinks.length} configured
                  </span>
                </div>
                {socialLinks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    No social links yet. Add your first link above to power the landing page badges.
                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {socialLinks.map((link) => {
                      const IconPreview = resolveSocialPreviewIcon(link.icon);
                      return (
                        <div
                          key={link.id}
                          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40 p-5 flex flex-col gap-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/15 to-rose-600/20 text-pink-600 flex items-center justify-center">
                                <IconPreview className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-base font-semibold" style={{ color: "var(--text)" }}>
                                  {link.platform || "Untitled Link"}
                                </p>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm text-pink-600 dark:text-pink-400 hover:underline break-all"
                                >
                                  {link.url}
                                </a>
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${link.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
                            >
                              {link.is_active ? "Active" : "Hidden"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex flex-col gap-1">
                              <span className="uppercase tracking-wide text-[10px] text-slate-400">
                                Icon
                              </span>
                              <span className="font-medium text-slate-600 dark:text-slate-200">
                                {link.icon || "FiLink"}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="uppercase tracking-wide text-[10px] text-slate-400">
                                Display Order
                              </span>
                              <span className="font-medium text-slate-600 dark:text-slate-200">
                                {link.order ?? 0}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => handleSocialLinkEdit(link)}
                              className="btn-ghost flex items-center gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSocialLinkDelete(link)}
                              className="btn-ghost text-red-600 hover:text-red-700 flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="card-enhanced" id="portfolio-form">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2
                    className="text-2xl font-serif font-semibold mb-2"
                    style={{ color: "var(--text)" }}
                  >
                    Studio Content
                  </h2>
                  <p
                    className="font-sans text-sm"
                    style={{ color: "var(--text-soft)" }}
                  >
                    Manage your studio's main content and messaging
                  </p>
                </div>
                <motion.button
                  onClick={handleContentSave}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-pink-600/25 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </motion.button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    Hero Title
                  </label>
                  <input
                    type="text"
                    value={content.hero_title}
                    onChange={(e) =>
                      setContent({ ...content, hero_title: e.target.value })
                    }
                    className="input-enhanced w-full px-4 py-3 font-serif text-lg"
                    placeholder="Your Studio Name"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    About Title
                  </label>
                  <input
                    type="text"
                    value={content.about_title}
                    onChange={(e) =>
                      setContent({ ...content, about_title: e.target.value })
                    }
                    className="input-enhanced w-full px-4 py-3 font-serif text-lg"
                    placeholder="About Our Studio"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    Hero Subtitle
                  </label>
                  <textarea
                    rows="3"
                    value={content.hero_subtitle}
                    onChange={(e) =>
                      setContent({ ...content, hero_subtitle: e.target.value })
                    }
                    className="input-enhanced w-full px-4 py-3 font-sans resize-none"
                    placeholder="Capturing life's most precious moments..."
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    About Text
                  </label>
                  <textarea
                    rows="5"
                    value={content.about_text}
                    onChange={(e) =>
                      setContent({ ...content, about_text: e.target.value })
                    }
                    className="input-enhanced w-full px-4 py-3 font-sans resize-none"
                    placeholder="Tell your story and what makes your studio special..."
                  />
                </div>
              </div>
            </div>

            {/* Media Items Section */}
            <div className="card-enhanced" id="video-categories-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2
                    className="text-xl font-serif font-semibold mb-1"
                    style={{ color: "var(--text)" }}
                  >
                    Hero Media Items
                  </h2>
                  <p
                    className="font-sans text-sm"
                    style={{ color: "var(--text-soft)" }}
                  >
                    Add images and videos for your homepage hero section
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    value={mediaForm.title}
                    onChange={(e) =>
                      setMediaForm({ ...mediaForm, title: e.target.value })
                    }
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="Optional title"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    Media Type
                  </label>
                  <select
                    value={mediaForm.media_type}
                    onChange={(e) =>
                      setMediaForm({ ...mediaForm, media_type: e.target.value })
                    }
                    className="input-enhanced w-full px-4 py-3"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    File
                  </label>
                  <div
                    className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-pink-400 dark:hover:border-pink-500 transition-all duration-300 bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-700/50"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add(
                        "border-pink-500",
                        "bg-pink-50/50"
                      );
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove(
                        "border-pink-500",
                        "bg-pink-50/50"
                      );
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove(
                        "border-pink-500",
                        "bg-pink-50/50"
                      );
                      const files = e.dataTransfer.files;
                      if (files.length > 0) {
                        setMediaForm({ ...mediaForm, file: files[0] });
                      }
                    }}
                  >
                    <input
                      type="file"
                      accept={
                        mediaForm.media_type === "image" ? "image/*" : "video/*"
                      }
                      onChange={(e) =>
                        setMediaForm({ ...mediaForm, file: e.target.files[0] })
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white shadow-lg">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div>
                        {/* <p
                          className="text-lg font-semibold"
                          style={{ color: "var(--text)" }}
                        >
                          {mediaForm.file
                            ? mediaForm.file.name
                            : "Drop your file here"}
                        </p> */}
                        <p
                          className="text-sm"
                          style={{ color: "var(--text-soft)" }}
                        >
                          or click to browse •{" "}
                          {mediaForm.media_type === "image"
                            ? "Images"
                            : "Videos"}{" "}
                          only
                        </p>
                      </div>
                      {mediaForm.file && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          File selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={handleMediaItemSave}
                disabled={!mediaForm.file || loading}
                className="w-full px-4 py-3 rounded-lg text-base md:text-lg font-medium transition-all duration-300 relative overflow-hidden"
                style={{
                  background: "var(--accent)",
                  color: "white",
                }}
                whileHover={{ scale: !mediaForm.file || loading ? 1 : 1.02 }}
                whileTap={{ scale: !mediaForm.file || loading ? 1 : 0.98 }}
              >
                {loading && uploadProgress > 0 && (
                  <div
                    className="absolute inset-0 bg-white/20 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                )}
                {loading ? (
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    <div className="spinner" />
                    {uploadProgress > 0 && uploadProgress < 100
                      ? `Uploading... ${uploadProgress}%`
                      : uploadProgress === 100
                      ? "Finalizing..."
                      : "Uploading..."}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    <Plus className="w-5 h-5" />
                    Add Media Item
                  </span>
                )}
              </motion.button>

              {mediaItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-8"
                >
                  <h3
                    className="text-lg font-serif font-semibold mb-6"
                    style={{ color: "var(--text)" }}
                  >
                    Current Media Items ({mediaItems.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mediaItems.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, idx)}
                        className="group cursor-move relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 bg-white dark:bg-gray-800 shadow-md"
                      >
                        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-6 h-6 bg-black/50 backdrop-blur-sm rounded flex items-center justify-center">
                            <GripVertical size={12} className="text-white" />
                          </div>
                        </div>
                        <div
                          onClick={() =>
                            setSelectedImage({
                              url: item.url,
                              type: item.media_type,
                            })
                          }
                          className="cursor-pointer"
                        >
                          {item.media_type === "image" ? (
                            <img
                              src={item.url}
                              alt={item.title}
                              className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <video
                              src={item.url}
                              className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105"
                              controls
                              muted
                              preload="metadata"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="flex items-center justify-between">
                                <span className="text-white text-sm font-medium bg-slate-900/70 backdrop-blur-sm px-3 py-1 rounded-full">
                                  {item.media_type}
                                </span>
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMediaItemDelete(item);
                                  }}
                                  className="w-8 h-8 bg-red-500/80 backdrop-blur-sm rounded-full flex items-center justify-center"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Trash2 size={14} className="text-white" />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Statistics Tab */}
        {activeTab === "stats" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="card-enhanced" id="stats-form">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2
                    className="text-2xl font-serif font-semibold mb-2"
                    style={{ color: "var(--text)" }}
                  >
                    {editingStat ? "Edit Statistic" : "Add New Statistic"}
                  </h2>
                  <p
                    className="font-sans text-sm"
                    style={{ color: "var(--text-soft)" }}
                  >
                    Showcase your studio's achievements and milestones
                  </p>
                </div>
                {editingStat && (
                  <motion.button
                    onClick={() => {
                      setEditingStat(null);
                      setStatForm({
                        label: "",
                        value: "",
                        icon: "FiUsers",
                        order: 0,
                        is_active: true,
                      });
                    }}
                    className="btn-ghost flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    Label
                  </label>
                  <input
                    type="text"
                    value={statForm.label}
                    onChange={(e) =>
                      setStatForm({ ...statForm, label: e.target.value })
                    }
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="Happy Clients"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    Value
                  </label>
                  <input
                    type="text"
                    value={statForm.value}
                    onChange={(e) =>
                      setStatForm({ ...statForm, value: e.target.value })
                    }
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="500+"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    Icon
                  </label>
                  <select
                    value={statForm.icon}
                    onChange={(e) =>
                      setStatForm({ ...statForm, icon: e.target.value })
                    }
                    className="input-enhanced w-full px-4 py-3"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={statForm.order}
                    onChange={(e) =>
                      setStatForm({
                        ...statForm,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={statForm.is_active}
                      onChange={(e) =>
                        setStatForm({
                          ...statForm,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-2 cursor-pointer"
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span
                      className="font-sans text-sm font-medium"
                      style={{ color: "var(--text)" }}
                    >
                      Active (visible on website)
                    </span>
                  </label>
                </div>
              </div>

              <motion.button
                onClick={handleStatSave}
                className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-pink-600/25 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-4 h-4" />
                {editingStat ? "Update Statistic" : "Add Statistic"}
              </motion.button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {stats.map((stat, index) => {
                const getIconComponent = (iconName) => {
                  const iconMap = {
                    FiUsers: "👥",
                    FiCamera: "📷",
                    FiAward: "🏆",
                    FiHeart: "❤️",
                    FiFilm: "🎬",
                    FiBriefcase: "💼",
                    FiAperture: "📸",
                    FiSun: "☀️",
                  };
                  return iconMap[iconName] || "📊";
                };

                return (
                  <motion.div
                    key={stat.id}
                    className="card-enhanced group relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-500/10 to-pink-600/10 rounded-full -translate-y-6 translate-x-6"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white shadow-lg text-2xl">
                          {getIconComponent(stat.icon)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              stat.is_active
                                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {stat.is_active ? "Active" : "Inactive"}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              onClick={() =>
                                handleEditIntent({
                                  entityLabel: "Statistic",
                                  name: stat.label,
                                  details: [
                                    { label: "Value", value: stat.value },
                                    {
                                      label: "Order",
                                      value: stat.order ?? 0,
                                    },
                                  ],
                                  sectionId: "stats-form",
                                  onConfirm: () => {
                                    setEditingStat(stat);
                                    setStatForm({
                                      label: stat.label,
                                      value: stat.value,
                                      icon: stat.icon,
                                      order: stat.order,
                                      is_active: stat.is_active,
                                    });
                                  },
                                })
                              }
                              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 transition-all duration-200"
                              title="Edit"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleStatDelete(stat)}
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-all duration-200"
                              title="Delete"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <h3
                          className="text-lg font-serif font-semibold mb-1"
                          style={{ color: "var(--text)" }}
                        >
                          {stat.label}
                        </h3>
                        <p
                          className="text-3xl font-bold"
                          style={{ color: "var(--accent)" }}
                        >
                          {formatNumber(stat.value)}
                        </p>
                      </div>
                      <div
                        className="flex items-center gap-3 text-xs"
                        style={{ color: "var(--text-soft)" }}
                      >
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                          Order: {stat.order}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                          {stat.icon}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="card-enhanced" id="services-form">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2
                    className="text-2xl font-serif font-semibold mb-2"
                    style={{ color: "var(--text)" }}
                  >
                    {editingService ? "Edit Service" : "Add New Service"}
                  </h2>
                  <p
                    className="font-sans text-sm"
                    style={{ color: "var(--text-soft)" }}
                  >
                    Manage the services you offer to your clients
                  </p>
                </div>
                {editingService && (
                  <motion.button
                    onClick={() => {
                      setEditingService(null);
                      setServiceForm({
                        title: "",
                        description: "",
                        icon: "FiCamera",
                        order: 0,
                        is_active: true,
                      });
                    }}
                    className="btn-ghost flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    Service Title
                  </label>
                  <input
                    type="text"
                    value={serviceForm.title}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, title: e.target.value })
                    }
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="Wedding Photography"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    Icon
                  </label>
                  <select
                    value={serviceForm.icon}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, icon: e.target.value })
                    }
                    className="input-enhanced w-full px-4 py-3"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={serviceForm.order}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        order: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    Description
                  </label>
                  <textarea
                    rows="4"
                    value={serviceForm.description}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        description: e.target.value,
                      })
                    }
                    className="input-enhanced w-full px-4 py-3 resize-none"
                    placeholder="Describe your service and what makes it special..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={serviceForm.is_active}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-2 cursor-pointer"
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span
                      className="font-sans text-sm font-medium"
                      style={{ color: "var(--text)" }}
                    >
                      Active (visible on website)
                    </span>
                  </label>
                </div>
              </div>

              <motion.button
                onClick={handleServiceSave}
                className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-pink-600/25 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-4 h-4" />
                {editingService ? "Update Service" : "Add Service"}
              </motion.button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service, index) => {
                const getServiceIcon = (iconName) => {
                  const iconMap = {
                    FiCamera: "📷",
                    FiUsers: "👥",
                    FiFilm: "🎬",
                    FiBriefcase: "💼",
                    FiAperture: "📸",
                    FiSun: "☀️",
                  };
                  return iconMap[iconName] || "📷";
                };

                return (
                  <motion.div
                    key={service.id}
                    className="card-enhanced group relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full -translate-y-6 translate-x-6"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg text-2xl">
                          {getServiceIcon(service.icon)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              service.is_active
                                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {service.is_active ? "Active" : "Inactive"}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              onClick={() =>
                                handleEditIntent({
                                  entityLabel: "Service",
                                  name: service.title,
                                  details: [
                                    {
                                      label: "Order",
                                      value: service.order ?? 0,
                                    },
                                    {
                                      label: "Status",
                                      value: service.is_active
                                        ? "Active"
                                        : "Inactive",
                                    },
                                  ],
                                  sectionId: "services-form",
                                  onConfirm: () => {
                                    setEditingService(service);
                                    setServiceForm({
                                      title: service.title,
                                      description: service.description,
                                      icon: service.icon,
                                      order: service.order ?? 0,
                                      is_active: service.is_active,
                                    });
                                  },
                                })
                              }
                              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 transition-all duration-200"
                              title="Edit Service"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleServiceDelete(service)}
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-all duration-200"
                              title="Delete Service"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <h3
                          className="text-lg font-serif font-semibold mb-2"
                          style={{ color: "var(--text)" }}
                        >
                          {service.title}
                        </h3>
                        <p
                          className="text-sm font-sans leading-relaxed"
                          style={{ color: "var(--text-soft)" }}
                        >
                          {service.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs px-3 py-1 rounded-full font-medium"
                          style={{
                            background: "var(--blush)",
                            color: "var(--accent)",
                          }}
                        >
                          {service.gallery_count || 0} images
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs">
                          {service.icon}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs">
                          Order: {service.order ?? 0}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Testimonials Tab */}
        {activeTab === "testimonials" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="card-enhanced" id="testimonials-form">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2
                    className="text-2xl font-serif font-semibold mb-2"
                    style={{ color: "var(--text)" }}
                  >
                    {editingTestimonial
                      ? "Edit Testimonial"
                      : "Add New Testimonial"}
                  </h2>
                  <p
                    className="font-sans text-sm"
                    style={{ color: "var(--text-soft)" }}
                  >
                    Share what your clients say about your work
                  </p>
                </div>
                {editingTestimonial && (
                  <motion.button
                    onClick={() => {
                      setEditingTestimonial(null);
                      setTestimonialForm({
                        name: "",
                        role: "",
                        quote: "",
                        avatar: null,
                        order: 0,
                        is_active: true,
                      });
                    }}
                    className="btn-ghost flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={testimonialForm.name}
                    onChange={(e) =>
                      setTestimonialForm({
                        ...testimonialForm,
                        name: e.target.value,
                      })
                    }
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="Sarah Johnson"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    Role/Title
                  </label>
                  <input
                    type="text"
                    value={testimonialForm.role}
                    onChange={(e) =>
                      setTestimonialForm({
                        ...testimonialForm,
                        role: e.target.value,
                      })
                    }
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="Bride, Wedding Client"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={testimonialForm.order}
                    onChange={(e) =>
                      setTestimonialForm({
                        ...testimonialForm,
                        order: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    Testimonial Quote
                  </label>
                  <textarea
                    rows="4"
                    value={testimonialForm.quote}
                    onChange={(e) =>
                      setTestimonialForm({
                        ...testimonialForm,
                        quote: e.target.value,
                      })
                    }
                    className="input-enhanced w-full px-4 py-3 resize-none"
                    placeholder="Share what the client said about your work..."
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label
                    className="block text-sm font-medium font-sans"
                    style={{ color: "var(--text)" }}
                  >
                    Avatar Image
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setTestimonialForm({
                          ...testimonialForm,
                          avatar: e.target.files[0],
                        })
                      }
                      className="input-enhanced w-full px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-pink-50 file:to-pink-100 file:text-pink-700 hover:file:from-pink-100 hover:file:to-pink-200 file:transition-all file:duration-200 file:shadow-sm hover:file:shadow-md"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <Upload
                        className="w-5 h-5"
                        style={{ color: "var(--text-soft)" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={testimonialForm.is_active}
                      onChange={(e) =>
                        setTestimonialForm({
                          ...testimonialForm,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-2 cursor-pointer"
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span
                      className="font-sans text-sm font-medium"
                      style={{ color: "var(--text)" }}
                    >
                      Active (visible on website)
                    </span>
                  </label>
                </div>
              </div>

              <motion.button
                onClick={handleTestimonialSave}
                className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-pink-600/25 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-4 h-4" />
                {editingTestimonial ? "Update Testimonial" : "Add Testimonial"}
              </motion.button>
            </div>

            <div className="grid gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  className="card group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="flex-shrink-0">
                        {testimonial.avatar ? (
                          <div className="relative">
                            <img
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              className="w-16 h-16 rounded-full object-cover border-3 border-pink-200 dark:border-pink-800 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105"
                            />
                            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-xl font-serif shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 border-2 border-pink-300 dark:border-pink-700">
                            {testimonial.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3
                              className="text-lg font-serif font-semibold"
                              style={{ color: "var(--text)" }}
                            >
                              {testimonial.name}
                            </h3>
                            <p
                              className="text-sm font-sans"
                              style={{ color: "var(--text-soft)" }}
                            >
                              {testimonial.role}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                testimonial.is_active
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                            >
                              {testimonial.is_active ? "Active" : "Inactive"}
                            </span>
                            <span className="px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                              Order: {testimonial.order ?? 0}
                            </span>
                          </div>
                        </div>
                        <blockquote
                          className="text-sm font-sans italic leading-relaxed p-4 rounded-lg"
                          style={{
                            color: "var(--text-soft)",
                            background: "var(--blush)",
                            borderLeft: "4px solid var(--accent)",
                          }}
                        >
                          "{testimonial.quote}"
                        </blockquote>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4">
                      <motion.button
                        onClick={() =>
                          handleEditIntent({
                            entityLabel: "Testimonial",
                            name: testimonial.name,
                            details: [
                              {
                                label: "Role",
                                value: testimonial.role || "--",
                              },
                              {
                                label: "Order",
                                value: testimonial.order ?? 0,
                              },
                            ],
                            sectionId: "testimonials-form",
                            onConfirm: () => {
                              setEditingTestimonial(testimonial);
                              setTestimonialForm({
                                name: testimonial.name,
                                role: testimonial.role,
                                quote: testimonial.quote,
                                avatar: null,
                                order: testimonial.order ?? 0,
                                is_active: testimonial.is_active,
                              });
                            },
                          })
                        }
                        className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 transition-all duration-200"
                        title="Edit Testimonial"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleTestimonialDelete(testimonial)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-all duration-200"
                        title="Delete Testimonial"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Portfolio Tab */}
        {activeTab === "portfolio" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="card-enhanced">
              <div className="mb-8">
                <h2
                  className="text-2xl font-serif font-semibold mb-2"
                  style={{ color: "var(--text)" }}
                >
                  Portfolio Categories
                </h2>
                <p
                  className="font-sans text-sm"
                  style={{ color: "var(--text-soft)" }}
                >
                  Organize your portfolio into different categories
                </p>
              </div>

              <div className="space-y-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex flex-1 flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      placeholder="Category name (e.g., Weddings, Portraits)"
                      value={categoryForm.name}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, name: e.target.value })
                      }
                      className="input-enhanced flex-1 px-4 py-3"
                    />
                    <input
                      type="number"
                      value={categoryForm.order}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          order: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="input-enhanced sm:w-40 px-4 py-3"
                      placeholder="Order"
                    />
                  </div>
                  <motion.button
                    onClick={handleCategorySave}
                    className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-pink-600/25 transition-all duration-300 whitespace-nowrap"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-4 h-4" />
                    {editingCategory ? "Update Category" : "Add Category"}
                  </motion.button>
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={categoryForm.is_active}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-2 cursor-pointer"
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span
                      className="font-sans text-sm font-medium"
                      style={{ color: "var(--text)" }}
                    >
                      Active (visible on website)
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    className="card-enhanced group relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-full -translate-y-6 translate-x-6"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg text-2xl">
                          🖼️
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              category.is_active
                                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {category.is_active ? "Active" : "Inactive"}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              onClick={() =>
                                handleEditIntent({
                                  entityLabel: "Portfolio Category",
                                  name: category.name,
                                  details: [
                                    {
                                      label: "Order",
                                      value: category.order ?? 0,
                                    },
                                    {
                                      label: "Status",
                                      value: category.is_active
                                        ? "Active"
                                        : "Inactive",
                                    },
                                  ],
                                  sectionId: "portfolio-form",
                                  onConfirm: () => {
                                    setEditingCategory(category);
                                    setCategoryForm({
                                      name: category.name,
                                      order: category.order ?? 0,
                                      is_active: category.is_active,
                                    });
                                  },
                                })
                              }
                              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 transition-all duration-200"
                              title="Edit Category"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleCategoryDelete(category)}
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-all duration-200"
                              title="Delete Category"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h3
                          className="text-lg font-serif font-semibold mb-1"
                          style={{ color: "var(--text)" }}
                        >
                          {category.name}
                        </h3>
                        <p
                          className="text-sm font-sans"
                          style={{ color: "var(--text-soft)" }}
                        >
                          Portfolio category
                        </p>
                        <p
                          className="text-xs font-sans mt-1"
                          style={{ color: "var(--text-soft)" }}
                        >
                          Order: {category.order ?? 0}
                        </p>
                      </div>
                      <motion.button
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          selectedCategory === category.id
                            ? "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Eye className="w-4 h-4" />
                        {selectedCategory === category.id
                          ? "Selected"
                          : "View Images"}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {selectedCategory && (
              <div className="card-enhanced" id="video-form-card">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3
                      className="text-xl font-serif font-semibold mb-1"
                      style={{ color: "var(--text)" }}
                    >
                      Portfolio Images
                    </h3>
                    <p
                      className="font-sans text-sm"
                      style={{ color: "var(--text-soft)" }}
                    >
                      Upload and manage images for this category
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setSelectedCategory(null)}
                    className="btn-ghost flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X className="w-4 h-4" />
                    Close
                  </motion.button>
                </div>

                <div className="mb-8">
                  <MultipleImageUpload
                    onUploadComplete={handlePortfolioUpload}
                    uploadFunction={bulkUploadPortfolioImages}
                    categoryId={selectedCategory}
                    acceptedTypes="image/*"
                    maxFiles={50}
                  />
                </div>

                {portfolioImages.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h4
                        className="text-lg font-serif font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        Current Images
                      </h4>
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          background: "var(--blush)",
                          color: "var(--accent)",
                        }}
                      >
                        {portfolioImages.length} images
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {portfolioImages.map((image, index) => (
                        <motion.div
                          key={image.id}
                          className="relative group cursor-move"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.05 * index }}
                          draggable
                          onDragStart={(e) =>
                            e.dataTransfer.setData(
                              "text/plain",
                              index.toString()
                            )
                          }
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={async (e) => {
                            e.preventDefault();
                            const dragIndex = parseInt(
                              e.dataTransfer.getData("text/plain")
                            );
                            if (dragIndex === index) return;

                            const newImages = [...portfolioImages];
                            const draggedImage = newImages[dragIndex];
                            newImages.splice(dragIndex, 1);
                            newImages.splice(index, 0, draggedImage);

                            // Update order values
                            const updatedImages = newImages.map((img, idx) => ({
                              ...img,
                              order: idx,
                            }));

                            setPortfolioImages(updatedImages);

                            // Update database
                            try {
                              await Promise.all(
                                updatedImages.map((img) =>
                                  updatePortfolioImage(img.id, {
                                    order: img.order,
                                  })
                                )
                              );
                              toast.success("Order updated successfully");
                            } catch (error) {
                              notifyError("Failed to update order");
                              loadData(); // Reload on error
                            }
                          }}
                        >
                          <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-6 h-6 bg-black/50 backdrop-blur-sm rounded flex items-center justify-center">
                              <GripVertical size={12} className="text-white" />
                            </div>
                          </div>
                          <div
                            className="aspect-square overflow-hidden rounded-xl shadow-lg border-2 border-purple-100 dark:border-purple-900/30 cursor-pointer"
                            onClick={() =>
                              setSelectedImage({ url: image.url, type: "image" })
                            }
                          >
                            <img
                              src={image.thumbnail_url || image.url}
                              alt="Portfolio"
                              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteIntent({
                                entityLabel: "Portfolio Image",
                                name:
                                  image.caption ||
                                  image.category ||
                                  `Image #${index + 1}`,
                                details: [
                                  {
                                    label: "Order",
                                    value: image.order ?? index,
                                  },
                                ],
                                onConfirm: async () => {
                                  await deletePortfolioImage(image.id);
                                  toast.success("Image deleted");
                                  if (selectedCategory) {
                                    await refreshPortfolioImages(
                                      selectedCategory
                                    );
                                  }
                                },
                              });
                            }}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-sm font-bold shadow-lg"
                            title="Delete Image"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Service Gallery Tab */}
        {activeTab === "gallery" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="card-enhanced">
              <div className="mb-8">
                <h2
                  className="text-2xl font-serif font-semibold mb-2"
                  style={{ color: "var(--text)" }}
                >
                  Service Gallery Management
                </h2>
                <p
                  className="font-sans text-sm"
                  style={{ color: "var(--text-soft)" }}
                >
                  Upload and manage images for your services
                </p>
              </div>

              <div className="mb-8">
                <label
                  className="block text-sm font-medium font-sans mb-3"
                  style={{ color: "var(--text)" }}
                >
                  Select Service
                </label>
                <select
                  value={selectedService ?? ""}
                  onChange={(e) =>
                    setSelectedService(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="input-enhanced w-full px-4 py-3"
                >
                  <option value="">Choose a service...</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedService && (
                <div className="space-y-6">
                  <div
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: "var(--blush)" }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                      <span className="text-lg">📷</span>
                    </div>
                    <div>
                      <h3
                        className="text-lg font-serif font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        {
                          services.find((s) => s.id === selectedService)?.title ||
                          ""
                        }
                      </h3>
                      <p
                        className="text-sm font-sans"
                        style={{ color: "var(--text-soft)" }}
                      >
                        Upload images to showcase this service
                      </p>
                    </div>
                  </div>

                  <MultipleImageUpload
                    onUploadComplete={handleServiceGalleryUpload}
                    uploadFunction={bulkUploadServiceImages}
                    serviceId={selectedService}
                    acceptedTypes="image/*"
                    maxFiles={50}
                  />

                  {serviceGalleryImages.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h4
                          className="text-lg font-serif font-semibold"
                          style={{ color: "var(--text)" }}
                        >
                          Current Images
                        </h4>
                        <span
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            background: "var(--blush)",
                            color: "var(--accent)",
                          }}
                        >
                          {serviceGalleryImages.length} images
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {serviceGalleryImages.map((image, index) => (
                          <motion.div
                            key={image.id}
                            className="relative group cursor-move"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.05 * index }}
                            draggable
                            onDragStart={(e) =>
                              e.dataTransfer.setData(
                                "text/plain",
                                index.toString()
                              )
                            }
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={async (e) => {
                              e.preventDefault();
                              const dragIndex = parseInt(
                                e.dataTransfer.getData("text/plain")
                              );
                              if (dragIndex === index) return;

                              const newImages = [...serviceGalleryImages];
                              const draggedImage = newImages[dragIndex];
                              newImages.splice(dragIndex, 1);
                              newImages.splice(index, 0, draggedImage);

                              // Update order values
                              const updatedImages = newImages.map(
                                (img, idx) => ({
                                  ...img,
                                  order: idx,
                                })
                              );

                              setServiceGalleryImages(updatedImages);

                              // Update database
                              try {
                                await Promise.all(
                                  updatedImages.map((img) =>
                                    updateServiceGalleryImage(img.id, {
                                      order: img.order,
                                    })
                                  )
                                );
                                toast.success("Order updated successfully");
                              } catch (error) {
                                notifyError("Failed to update order");
                                loadData(); // Reload on error
                              }
                            }}
                          >
                            <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="w-6 h-6 bg-black/50 backdrop-blur-sm rounded flex items-center justify-center">
                                <GripVertical
                                  size={12}
                                  className="text-white"
                                />
                              </div>
                            </div>
                            <div
                              className="aspect-square overflow-hidden rounded-xl shadow-lg border-2 border-blue-100 dark:border-blue-900/30 cursor-pointer"
                              onClick={() =>
                                setSelectedImage({
                                  url: image.image,
                                  type: "image",
                                })
                              }
                            >
                              <img
                                src={image.image}
                                alt="Service gallery"
                                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteIntent({
                                  entityLabel: "Service Gallery Image",
                                  name:
                                    image.caption ||
                                    services.find((s) => s.id === selectedService)
                                      ?.title ||
                                    "Gallery image",
                                  details: [
                                    {
                                      label: "Order",
                                      value: image.order ?? index,
                                    },
                                  ],
                                  onConfirm: async () => {
                                    await deleteServiceGalleryImage(image.id);
                                    toast.success("Image deleted");
                                    loadData();
                                  },
                                });
                              }}
                              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-sm font-bold shadow-lg"
                              title="Delete Image"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Video Portfolio Tab */}
        {activeTab === "videos" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="card-enhanced">
              <div className="mb-8">
                <h2
                  className="text-2xl font-serif font-semibold mb-2"
                  style={{ color: "var(--text)" }}
                >
                  Video Categories
                </h2>
                <p
                  className="font-sans text-sm"
                  style={{ color: "var(--text-soft)" }}
                >
                  Organize your video portfolio into different categories
                </p>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex flex-1 flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      placeholder="Category name (e.g., Weddings, Corporate)"
                      value={videoCategoryForm.name}
                      onChange={(e) =>
                        setVideoCategoryForm({
                          ...videoCategoryForm,
                          name: e.target.value,
                        })
                      }
                      className="input-enhanced flex-1 px-4 py-3"
                    />
                    <input
                      type="number"
                      value={videoCategoryForm.order}
                      onChange={(e) =>
                        setVideoCategoryForm({
                          ...videoCategoryForm,
                          order: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="input-enhanced sm:w-40 px-4 py-3"
                      placeholder="Order"
                    />
                  </div>
                  <motion.button
                    onClick={handleVideoCategorySave}
                    className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-pink-600/25 transition-all duration-300 whitespace-nowrap"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-4 h-4" />
                    {editingVideoCategory ? "Update Category" : "Add Category"}
                  </motion.button>
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={videoCategoryForm.is_active}
                      onChange={(e) =>
                        setVideoCategoryForm({
                          ...videoCategoryForm,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-2 cursor-pointer"
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span
                      className="font-sans text-sm font-medium"
                      style={{ color: "var(--text)" }}
                    >
                      Active (visible on website)
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {videoCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    className="card-enhanced group relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-500/10 to-pink-600/10 rounded-full -translate-y-6 translate-x-6"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white shadow-lg text-2xl">
                          🎬
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              category.is_active
                                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {category.is_active ? "Active" : "Inactive"}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              onClick={() =>
                                handleEditIntent({
                                  entityLabel: "Video Category",
                                  name: category.name,
                                  details: [
                                    {
                                      label: "Order",
                                      value: category.order ?? 0,
                                    },
                                    {
                                      label: "Status",
                                      value: category.is_active
                                        ? "Active"
                                        : "Inactive",
                                    },
                                  ],
                                  sectionId: "video-categories-card",
                                  onConfirm: () => {
                                    setEditingVideoCategory(category);
                                    setVideoCategoryForm({
                                      name: category.name,
                                      order: category.order ?? 0,
                                      is_active: category.is_active,
                                    });
                                  },
                                })
                              }
                              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 transition-all duration-200"
                              title="Edit Category"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={() =>
                                handleVideoCategoryDelete(category)
                              }
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-all duration-200"
                              title="Delete Category"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h3
                          className="text-lg font-serif font-semibold mb-1"
                          style={{ color: "var(--text)" }}
                        >
                          {category.name}
                        </h3>
                        <p
                          className="text-sm font-sans"
                          style={{ color: "var(--text-soft)" }}
                        >
                          Video category
                        </p>
                        <p
                          className="text-xs font-sans mt-1"
                          style={{ color: "var(--text-soft)" }}
                        >
                          Order: {category.order ?? 0}
                        </p>
                      </div>
                      <motion.button
                        onClick={() => setSelectedVideoCategory(category.id)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          selectedVideoCategory === category.id
                            ? "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Eye className="w-4 h-4" />
                        {selectedVideoCategory === category.id
                          ? "Selected"
                          : "View Videos"}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {selectedVideoCategory && (
              <div className="card-enhanced">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h3
                      className="text-xl font-serif font-semibold mb-1"
                      style={{ color: "var(--text)" }}
                    >
                      Video Management
                    </h3>
                    <p
                      className="font-sans text-sm"
                      style={{ color: "var(--text-soft)" }}
                    >
                      Upload and manage videos for this category
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setSelectedVideoCategory(null)}
                    className="btn-ghost flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X className="w-4 h-4" />
                    Close
                  </motion.button>
                </div>

                {/* Add/Edit Video Form */}
                <div
                  className="mb-8 p-6 rounded-xl"
                  style={{ background: "var(--blush)" }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
                      <Film className="w-6 h-6" />
                    </div>
                    <div>
                      <h3
                        className="text-lg font-serif font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        {editingVideo ? "Edit Video" : "Add New Video"}
                      </h3>
                      <p
                        className="text-sm font-sans"
                        style={{ color: "var(--text-soft)" }}
                      >
                        Upload videos to showcase your work
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label
                        className="block text-sm font-medium font-sans"
                        style={{ color: "var(--text)" }}
                      >
                        Video Title
                      </label>
                      <input
                        type="text"
                        value={videoForm.title}
                        onChange={(e) =>
                          setVideoForm({ ...videoForm, title: e.target.value })
                        }
                        className="input-enhanced w-full px-4 py-3"
                        placeholder="e.g., Romantic Wedding Highlights"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="block text-sm font-medium font-sans"
                        style={{ color: "var(--text)" }}
                      >
                        Category *
                      </label>
                      <select
                        value={videoForm.category}
                        onChange={(e) =>
                          setVideoForm({
                            ...videoForm,
                            category: e.target.value,
                          })
                        }
                        className="input-enhanced w-full px-4 py-3"
                        required
                      >
                        <option value="">Select a category</option>
                        {videoCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label
                        className="block text-sm font-medium font-sans"
                        style={{ color: "var(--text)" }}
                      >
                        Duration
                      </label>
                      <input
                        type="text"
                        value={videoForm.duration}
                        onChange={(e) =>
                          setVideoForm({
                            ...videoForm,
                            duration: e.target.value,
                          })
                        }
                        className="input-enhanced w-full px-4 py-3"
                        placeholder="e.g., 3:45"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="block text-sm font-medium font-sans"
                        style={{ color: "var(--text)" }}
                      >
                        Year
                      </label>
                      <input
                        type="number"
                        value={videoForm.year}
                        onChange={(e) =>
                          setVideoForm({ ...videoForm, year: e.target.value })
                        }
                        className="input-enhanced w-full px-4 py-3"
                        placeholder="2024"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="space-y-2">
                      <label
                        className="block text-sm font-medium font-sans"
                        style={{ color: "var(--text)" }}
                      >
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={videoForm.order}
                        onChange={(e) =>
                          setVideoForm({
                            ...videoForm,
                            order: parseInt(e.target.value) || 0,
                          })
                        }
                        className="input-enhanced w-full px-4 py-3 md:w-1/2"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label
                        className="block text-sm font-medium font-sans"
                        style={{ color: "var(--text)" }}
                      >
                        Video File
                      </label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          setVideoForm({
                            ...videoForm,
                            video_file: e.target.files[0],
                          })
                        }
                        className="input-enhanced w-full px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-pink-50 file:to-pink-100 file:text-pink-700 hover:file:from-pink-100 hover:file:to-pink-200 file:transition-all file:duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="block text-sm font-medium font-sans"
                        style={{ color: "var(--text)" }}
                      >
                        Thumbnail Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setVideoForm({
                            ...videoForm,
                            thumbnail: e.target.files[0],
                          })
                        }
                        className="input-enhanced w-full px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-pink-50 file:to-pink-100 file:text-pink-700 hover:file:from-pink-100 hover:file:to-pink-200 file:transition-all file:duration-200"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2 mb-6">
                    <label
                      className="block text-sm font-medium font-sans"
                      style={{ color: "var(--text)" }}
                    >
                      Description
                    </label>
                    <textarea
                      rows="3"
                      value={videoForm.description}
                      onChange={(e) =>
                        setVideoForm({
                          ...videoForm,
                          description: e.target.value,
                        })
                      }
                      className="input-enhanced w-full px-4 py-3 resize-none"
                      placeholder="Brief description of the video content..."
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={videoForm.is_active}
                        onChange={(e) =>
                          setVideoForm({
                            ...videoForm,
                            is_active: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-2 cursor-pointer"
                        style={{ accentColor: "var(--accent)" }}
                      />
                      <span
                        className="font-sans text-sm font-medium"
                        style={{ color: "var(--text)" }}
                      >
                        Active (visible on website)
                      </span>
                    </label>
                    <motion.button
                      onClick={handleVideoSave}
                      disabled={videoUploadProgress > 0}
                      className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-pink-600/25 transition-all duration-300 relative overflow-hidden"
                      whileHover={{ scale: videoUploadProgress > 0 ? 1 : 1.02 }}
                      whileTap={{ scale: videoUploadProgress > 0 ? 1 : 0.98 }}
                    >
                      {videoUploadProgress > 0 && (
                        <div
                          className="absolute inset-0 bg-white/20 transition-all duration-300"
                          style={{ width: `${videoUploadProgress}%` }}
                        />
                      )}
                      {videoUploadProgress > 0 ? (
                        <span className="flex items-center justify-center gap-3 relative z-10">
                          <div className="spinner" />
                          {videoUploadProgress > 0 && videoUploadProgress < 100
                            ? `Uploading... ${videoUploadProgress}%`
                            : videoUploadProgress === 100
                            ? "Finalizing..."
                            : "Uploading..."}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-3 relative z-10">
                          <Save className="w-4 h-4" />
                          {editingVideo ? "Update Video" : "Add Video"}
                        </span>
                      )}
                    </motion.button>
                    {editingVideo && (
                      <motion.button
                        onClick={() => {
                          setEditingVideo(null);
                          setVideoForm({
                            title: "",
                            description: "",
                            category: selectedVideoCategory
                              ? String(selectedVideoCategory)
                              : "",
                            video_file: null,
                            thumbnail: null,
                            duration: "",
                            year: "",
                            order: 0,
                            is_active: true,
                          });
                        }}
                        className="btn-ghost flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Bulk Upload */}
                <div className="mb-8">
                  <MultipleImageUpload
                    onUploadComplete={handleVideoUpload}
                    uploadFunction={bulkUploadVideos}
                    categoryId={selectedVideoCategory}
                    acceptedTypes="video/*,image/*"
                    maxFiles={20}
                    title="Bulk Upload Videos"
                    description="Upload multiple videos with thumbnails. First video file, then matching thumbnail image."
                  />
                </div>

                {/* Current Videos || Video Collection */}

                {videos.length > 0 && (
                  <div className="space-y-6">
                    {/* Header Section */}
                    <div
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--blush) 0%, rgba(var(--accent-rgb), 0.1) 100%)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm">
                          <Film
                            className="w-5 h-5"
                            style={{ color: "var(--accent)" }}
                          />
                        </div>
                        <div>
                          <h3
                            className="text-xl font-serif font-bold"
                            style={{ color: "var(--text)" }}
                          >
                            Video Collection
                          </h3>
                          <p
                            className="text-sm opacity-75"
                            style={{ color: "var(--text)" }}
                          >
                            Manage your video content
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className="px-4 py-2 rounded-full text-sm font-semibold bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm"
                          style={{ color: "var(--accent)" }}
                        >
                          {videos.length}{" "}
                          {videos.length === 1 ? "Video" : "Videos"}
                        </span>
                        <div className="flex gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              videos.filter((v) => v.is_active).length > 0
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {videos.filter((v) => v.is_active).length} Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Video Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {videos.map((video, index) => (
                        <motion.div
                          key={video.id}
                          className="group relative"
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.05 * index,
                            type: "spring",
                            stiffness: 100,
                          }}
                          whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        >
                          {/* Card Container */}
                          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:border-slate-300 dark:group-hover:border-slate-700">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-pink-500/5 to-purple-600/5 rounded-full -translate-x-16 -translate-y-16"></div>
                            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tr from-blue-500/5 to-cyan-600/5 rounded-full translate-x-8 translate-y-8"></div>

                            {/* Status Badge */}
                            <div className="absolute top-4 right-4 z-10">
                              <span
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
                                  video.is_active
                                    ? "bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30"
                                    : "bg-gray-500/20 text-gray-700 dark:text-gray-300 border border-gray-500/30"
                                }`}
                              >
                                {video.is_active ? "● Live" : "○ Draft"}
                              </span>
                            </div>

                            {/* Order Badge */}
                            {video.order && (
                              <div className="absolute top-4 left-4 z-10">
                                <span className="px-2.5 py-1.5 rounded-lg bg-black/20 dark:bg-white/20 backdrop-blur-sm text-xs font-bold text-white dark:text-slate-900">
                                  #{video.order}
                                </span>
                              </div>
                            )}

                            {/* Thumbnail Section */}
                            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                              {video.thumbnail_url ? (
                                <div className="relative w-full h-full">
                                  <img
                                    src={video.thumbnail_url}
                                    alt={video.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-6">
                                  <div className="relative mb-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                                      <Film className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                                      <span className="text-xs font-bold text-white">
                                        HD
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    No thumbnail available
                                  </span>
                                </div>
                              )}

                              {/* Hover Overlay with Action Buttons */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
                                <div className="flex gap-3">
                                  <motion.button
                                    onClick={() =>
                                      handleEditIntent({
                                        entityLabel: "Video",
                                        name: video.title || "Untitled Video",
                                        details: [
                                          {
                                            label: "Duration",
                                            value: video.duration || "--",
                                          },
                                          {
                                            label: "Status",
                                            value: video.is_active
                                              ? "Active"
                                              : "Inactive",
                                          },
                                        ],
                                        sectionId: "video-form-card",
                                        onConfirm: () => {
                                          setEditingVideo(video);
                                          setVideoForm({
                                            title: video.title || "",
                                            description: video.description || "",
                                            category: video.category_id
                                              ? String(video.category_id)
                                              : "",
                                            duration: video.duration || "",
                                            year: video.year || "",
                                            order: video.order || 0,
                                            is_active: video.is_active,
                                          });
                                        },
                                      })
                                    }
                                    className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 group/edit"
                                    title="Edit Video"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover/edit:text-blue-700 dark:group-hover/edit:text-blue-300" />
                                  </motion.button>

                                  <motion.button
                                    onClick={() => handleVideoDelete(video)}
                                    className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 group/delete"
                                    title="Delete Video"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400 group-hover/delete:text-red-700 dark:group-hover/delete:text-red-300" />
                                  </motion.button>
                                </div>
                              </div>

                              {/* Duration Badge */}
                              {video.duration && (
                                <div className="absolute bottom-3 left-3">
                                  <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-xs font-medium text-white">
                                    {video.duration}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Content Section */}
                            <div className="p-5 relative">
                              {/* Title and Meta */}
                              <div className="mb-4">
                                <h5 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {video.title || "Untitled Video"}
                                </h5>

                                {/* Category & Year */}
                                <div className="flex items-center gap-3 mb-3">
                                  {(video.category_name || video.category) && (
                                    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                      {video.category_name || video.category}
                                    </span>
                                  )}
                                  {video.year && (
                                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {video.year}
                                    </span>
                                  )}
                                </div>

                                {/* Description */}
                                {video.description && (
                                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                    {video.description}
                                  </p>
                                )}
                              </div>

                              {/* Stats Bar */}
                              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                      <div
                                        className={`w-2 h-2 rounded-full ${
                                          video.is_active
                                            ? "bg-green-500 animate-pulse"
                                            : "bg-gray-400"
                                        }`}
                                      ></div>
                                      {video.is_active
                                        ? "Published"
                                        : "Unpublished"}
                                    </span>
                                    <span className="text-slate-500 dark:text-slate-400">
                                      Order:{" "}
                                      <span className="font-semibold text-slate-900 dark:text-slate-200">
                                        {video.order}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Glow Effect on Hover */}
                            <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div
                                className="absolute inset-0 rounded-2xl"
                                style={{
                                  background:
                                    "radial-gradient(circle at center, var(--blush) 0%, transparent 70%)",
                                  filter: "blur(20px)",
                                }}
                              ></div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Empty State for Active/Inactive */}
                    {videos.filter((v) => !v.is_active).length ===
                      videos.length && (
                      <div className="text-center py-12 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                          <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                          All Videos Are Inactive
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                          None of your videos are currently published. Edit a
                          video and set it to active to make it visible.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>

      <ActionModal
        isOpen={modalConfig.isOpen}
        mode={modalConfig.mode}
        title={modalConfig.title}
        description={modalConfig.description}
        details={modalConfig.details}
        confirmLabel={modalConfig.confirmLabel}
        cancelLabel={modalConfig.cancelLabel}
        confirmTone={modalConfig.confirmTone}
        onClose={closeModal}
        onConfirm={handleModalConfirm}
        busy={modalBusy}
        errorMessage={modalError}
      />

      {/* Media Lightbox */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 w-12 h-12 bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-all duration-300 hover:scale-110 z-10"
          >
            <X size={20} />
          </button>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full h-full max-w-6xl max-h-[85vh] mx-auto flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {isVideoLightbox ? (
              <video
                src={lightboxUrl}
                controls
                autoPlay
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              />
            ) : (
              <img
                src={lightboxUrl}
                alt="Media fullscreen"
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
