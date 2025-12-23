import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  createAlbum,
  uploadImagesToBackend,
} from "../services/api.js";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";
import {
  Upload,
  Download,
  Link as LinkIcon,
  Heart,
  Sparkles,
  GripVertical,
  X,
} from "lucide-react";
import CategorySelector from "../components/CategorySelector";
import ParticleSystem from "../components/ParticleSystem";
import { removeTheme } from "../themes/categories";

// Alias to satisfy linters that don't detect JSX namespace usage
const MOTION_ALIAS = motion;

export default function CreateAlbumPage() {
  const [form, setForm] = useState({
    names: "",
    date: "",
    description: "",
    category: "weddings",
    allow_downloads: true,
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [album, setAlbum] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const fileInputRef = useRef(null);


  // Initialize: ensure page reflects current dark mode implicitly via CSS, no category theme

  // Ensure Create page uses default site theme/background, not category themes
  useEffect(() => {
    // Clear any previously applied category theme variables/classes
    try {
      removeTheme();
    } catch {
      /* noop */
    }
  }, []);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setUploadProgress(0);
    try {
      if (!files?.length) throw new Error("Please select at least one photo");
      
      // Upload with real progress tracking
      const imageObjects = await uploadImagesToBackend(files, (progress) => {
        setUploadProgress(Math.min(progress, 90));
      });
      
      setUploadProgress(95);
      
      const payload = {
        names: form.names,
        date: form.date,
        description: form.description,
        category: form.category,
        photos: imageObjects,
        allow_downloads: form.allow_downloads,
      };
      const res = await createAlbum(payload);
      setUploadProgress(100);
      setAlbum(res);
      toast.success("Album created!");
      
      // Clear form after successful creation
      setForm({
        names: "",
        date: "",
        description: "",
        category: "weddings",
        allow_downloads: true,
      });
      setFiles([]);
    } catch (err) {
      setError(err.message || "Failed to create album");
      toast.error(err.message || "Failed to create album");
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const albumUrl = album?.url;
  const onDrop = (e) => {
    e.preventDefault();
    const items = Array.from(e.dataTransfer.files || []);
    if (items?.length) setFiles((prev) => [...prev, ...items]);
  };
  const onSelectFiles = (e) => setFiles(Array.from(e.target.files || []));
  const removeFile = (idx) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  const openPicker = () => fileInputRef.current?.click();
  
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };
  
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newFiles = [...files];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);
    
    setFiles(newFiles);
    setDraggedIndex(index);
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };
  
  const handleTouchStart = (index) => {
    setDraggedIndex(index);
  };
  
  const handleTouchMove = (e) => {
    if (draggedIndex === null) return;
    e.preventDefault();
  };
  
  const handleTouchEnd = () => {
    setDraggedIndex(null);
  };
  
  const movePhoto = (fromIndex, direction) => {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= files.length) return;
    
    const newFiles = [...files];
    const temp = newFiles[fromIndex];
    newFiles[fromIndex] = newFiles[toIndex];
    newFiles[toIndex] = temp;
    setFiles(newFiles);
  };

  const downloadQR = () => {
    const canvas = document.querySelector("#album-qr canvas");
    if (!canvas) {
      toast.error("QR code not found");
      return;
    }
    try {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png", 1.0);
      link.download = `${form.names || "album"}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR code downloaded!");
    } catch {
      toast.error("Failed to download QR code");
    }
  };

  const downloadAlbumQR = (albumUrl, albumName) => {
    const canvas = document.createElement("canvas");
    // Context not needed; QRCode lib draws to canvas directly
    canvas.width = 256;
    canvas.height = 256;

    import("qrcode").then((QRCode) => {
      QRCode.toCanvas(canvas, albumUrl, { width: 256, margin: 2 }, (error) => {
        if (error) {
          toast.error("Failed to generate QR code");
          return;
        }
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png", 1.0);
        link.download = `${albumName || "album"}-qr-code.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("QR code downloaded!");
      });
    });
  };
  const copyLink = async () => {
    if (albumUrl) {
      await navigator.clipboard.writeText(albumUrl);
      toast.success("Link copied to clipboard");
    }
  };

  const shareAlbum = async () => {
    if (!albumUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Robel Studio Album",
          text: form.names || "Wedding Album",
          url: albumUrl,
        });
      } else {
        await navigator.clipboard.writeText(albumUrl);
        toast("Share not supported, link copied instead");
      }
    } catch {
      // user cancelled share
    }
  };

  return (
    <motion.section
      className="py-6 md:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="text-center mb-8 md:mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h1
          className="font-serif text-3xl md:text-5xl lg:text-6xl font-semibold mb-3 md:mb-4"
          style={{ color: "var(--text)" }}
        >
          Create Your <span style={{ color: "var(--accent)" }}>Love Story</span>
        </h1>
        <p
          className="text-base md:text-xl font-sans max-w-2xl mx-auto px-4"
          style={{ color: "var(--text-soft)" }}
        >
          Transform your precious moments into a beautiful, shareable wedding
          album
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        className="grid lg:grid-cols-2 gap-8 md:gap-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="space-y-6 md:space-y-8">
          <div>
            <label
              className="block text-sm font-medium font-sans mb-3"
              style={{ color: "var(--text)" }}
            >
              Album Category
            </label>
            <CategorySelector
              selectedCategory={form.category}
              onCategoryChange={(category) => setForm({ ...form, category })}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium font-sans mb-3"
              style={{ color: "var(--text)" }}
            >
              <Heart
                className="inline w-4 h-4 mr-2"
                style={{ color: "var(--accent)" }}
              />
              {form.category === "weddings"
                ? "Couple's Names"
                : form.category === "family"
                ? "Family Name"
                : form.category === "celebrations"
                ? "Event Name"
                : form.category === "travel"
                ? "Trip Name"
                : form.category === "special"
                ? "Event Name"
                : "Album Name"}
            </label>
            <input
              type="text"
              required
              value={form.names}
              onChange={(e) => setForm({ ...form, names: e.target.value })}
              className="w-full px-4 py-3 md:py-4 text-base md:text-lg font-serif"
              placeholder={
                form.category === "weddings"
                  ? "Sarah & Michael"
                  : form.category === "family"
                  ? "The Johnson Family"
                  : form.category === "celebrations"
                  ? "Birthday Celebration"
                  : form.category === "travel"
                  ? "European Adventure"
                  : form.category === "special"
                  ? "Graduation Day"
                  : "My Creative Journey"
              }
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium font-sans mb-3"
              style={{ color: "var(--text)" }}
            >
              {form.category === "weddings"
                ? "Wedding Date"
                : form.category === "family"
                ? "Event Date"
                : form.category === "celebrations"
                ? "Celebration Date"
                : form.category === "travel"
                ? "Trip Date"
                : form.category === "special"
                ? "Event Date"
                : "Creation Date"}
            </label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-3 md:py-4 font-sans"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium font-sans mb-3"
              style={{ color: "var(--text)" }}
            >
              {form.category === "weddings"
                ? "Your Love Story"
                : form.category === "family"
                ? "Family Story"
                : form.category === "celebrations"
                ? "Celebration Story"
                : form.category === "travel"
                ? "Adventure Story"
                : form.category === "special"
                ? "Event Story"
                : "Creative Story"}
            </label>
            <textarea
              rows="5"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full px-4 py-3 md:py-4 font-sans resize-none"
              placeholder={
                form.category === "weddings"
                  ? "Share the story of your special day..."
                  : form.category === "family"
                  ? "Share your family's special moments..."
                  : form.category === "celebrations"
                  ? "Tell us about this amazing celebration..."
                  : form.category === "travel"
                  ? "Describe your incredible journey..."
                  : form.category === "special"
                  ? "Share the story of this special occasion..."
                  : "Tell us about your creative process..."
              }
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium font-sans mb-3"
              style={{ color: "var(--text)" }}
            >
              <Sparkles
                className="inline w-4 h-4 mr-2"
                style={{ color: "var(--accent)" }}
              />
              {form.category === "weddings"
                ? "Wedding Photos"
                : form.category === "family"
                ? "Family Photos"
                : form.category === "celebrations"
                ? "Celebration Photos"
                : form.category === "travel"
                ? "Travel Photos"
                : form.category === "special"
                ? "Event Photos"
                : "Creative Photos"}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={onSelectFiles}
              className="hidden"
            />
            <motion.div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
              }}
              onClick={openPicker}
              whileTap={{ scale: 0.98 }}
            >
              <Upload
                className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4"
                style={{ color: "var(--accent)" }}
              />
              <p
                className="font-serif text-base md:text-lg mb-2"
                style={{ color: "var(--text)" }}
              >
                Drop your beautiful memories here
              </p>
              <p
                className="font-sans text-sm"
                style={{ color: "var(--text-soft)" }}
              >
                or click to browse your files
              </p>
            </motion.div>

            {files?.length ? (
              <motion.div
                className="mt-4 md:mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-xs font-sans mb-2" style={{ color: 'var(--text-soft)' }}>
                  Drag to reorder • {files.length} photo{files.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-2 md:gap-4">
                  {files.map((f, i) => (
                    <motion.div
                      key={i}
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDragEnd={handleDragEnd}
                      onTouchStart={() => handleTouchStart(i)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      className="relative group cursor-move"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: Math.min(0.05 * i, 0.4),
                      }}
                      style={{ opacity: draggedIndex === i ? 0.5 : 1 }}
                    >
                      <img
                        src={URL.createObjectURL(f)}
                        alt="preview"
                        loading="lazy"
                        className="h-24 md:h-32 w-full object-cover rounded-lg md:rounded-xl shadow-sm"
                      />
                      <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                        {i + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 grid place-items-center text-sm font-bold bg-red-500 text-white"
                      >
                        <X size={14} className="md:hidden" />
                        <span className="hidden md:inline">×</span>
                      </button>
                      <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical size={16} className="text-white drop-shadow" />
                      </div>
                      {/* Mobile reorder buttons */}
                      <div className="md:hidden absolute bottom-1 left-1 flex gap-1">
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => movePhoto(i, -1)}
                            className="w-6 h-6 rounded bg-black/70 text-white text-xs flex items-center justify-center"
                          >
                            ←
                          </button>
                        )}
                        {i < files.length - 1 && (
                          <button
                            type="button"
                            onClick={() => movePhoto(i, 1)}
                            className="w-6 h-6 rounded bg-black/70 text-white text-xs flex items-center justify-center"
                          >
                            →
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allow_downloads}
                onChange={(e) =>
                  setForm({ ...form, allow_downloads: e.target.checked })
                }
                className="w-5 h-5 rounded border-2 cursor-pointer"
                style={{ accentColor: "var(--accent)" }}
              />
              <span
                className="font-sans text-sm"
                style={{ color: "var(--text)" }}
              >
                <Download
                  className="inline w-4 h-4 mr-2"
                  style={{ color: "var(--accent)" }}
                />
                Allow guests to download photos
              </span>
            </label>
            <p
              className="font-sans text-xs mt-2 ml-8"
              style={{ color: "var(--text-soft)" }}
            >
              When enabled, guests can download individual photos and the entire
              album as a ZIP file
            </p>
          </div>

          {error ? (
            <motion.p
              className="text-sm text-rose-600 font-sans"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          ) : null}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 md:py-4 rounded-lg text-base md:text-lg font-medium transition-all duration-300 relative overflow-hidden"
            style={{
              background: 'var(--accent)',
              color: 'white',
            }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
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
                  : "Creating Your Album..."}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3 relative z-10">
                <Heart className="w-5 h-5" />
                {form.category === "weddings"
                  ? "Create My Love Story"
                  : form.category === "family"
                  ? "Create Family Album"
                  : form.category === "celebrations"
                  ? "Create Celebration Album"
                  : form.category === "travel"
                  ? "Create Adventure Album"
                  : form.category === "special"
                  ? "Create Special Album"
                  : "Create Creative Album"}
              </span>
            )}
          </motion.button>
        </div>

        <div className="lg:sticky lg:top-8 w-full max-w-full overflow-hidden">
          {album ? (
            <motion.div
              className="card text-center max-w-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6">
                <h3
                  className="font-serif text-2xl font-semibold mb-2"
                  style={{ color: "var(--text)" }}
                >
                  Your QR Code is Ready!
                </h3>
                <p className="font-sans" style={{ color: "var(--text-soft)" }}>
                  Share this beautiful code with your guests
                </p>
              </div>

              <div className="mb-8 w-full overflow-hidden" id="album-qr">
                <div
                  className="inline-block p-4 md:p-6 rounded-3xl shadow-lg mb-6"
                  style={{ background: "var(--surface)" }}
                >
                  <QRCodeCanvas value={albumUrl} size={200} includeMargin />
                </div>

                <a
                  href={albumUrl}
                  className="block font-sans text-xs md:text-sm break-all px-3 md:px-4 py-2 rounded-xl transition-colors overflow-hidden"
                  style={{ color: "var(--accent)", background: "var(--blush)", wordBreak: "break-all", overflowWrap: "break-word" }}
                  target="_blank"
                  rel="noreferrer"
                >
                  {albumUrl}
                </a>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={downloadQR}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  style={{
                    background: 'var(--accent)',
                    color: 'white',
                  }}
                >
                  <Download size={16} />
                  Download QR Code
                </button>
                <button
                  type="button"
                  onClick={copyLink}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  style={{
                    background: 'var(--accent)',
                    color: 'white',
                  }}
                >
                  <LinkIcon size={16} />
                  Copy Album Link
                </button>
                <button
                  type="button"
                  onClick={shareAlbum}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  style={{
                    background: 'var(--accent)',
                    color: 'white',
                  }}
                >
                  <Heart size={16} />
                  Share Your Love Story
                </button>
              </div>
            </motion.div>
          ) : (
            <div
              className="rounded-2xl border-2 border-dashed p-12 text-center"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
                color: "var(--text-soft)",
              }}
            >
              <QRCodeCanvas
                value="preview"
                size={120}
                includeMargin
                className="opacity-30 mx-auto mb-4"
              />
              <p className="font-serif text-lg mb-2">Your QR Code Preview</p>
              <p className="font-sans text-sm">
                Complete the form to generate your shareable QR code
              </p>
            </div>
          )}
        </div>
      </motion.form>


    </motion.section>
  );
}
