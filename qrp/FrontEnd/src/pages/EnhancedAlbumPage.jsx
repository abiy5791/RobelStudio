import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Calendar,
  Download,
  Archive,
} from "lucide-react";
import {
  FiInstagram,
  FiFacebook,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLink,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";
import {
  getAlbum,
  createGuestMessage,
  downloadPhoto,
  downloadAlbumZip,
  togglePhotoLike,
} from "../services/api.js";
import { fetchStudioData } from "../services/studioApi.js";
import { getImageUrl } from "../utils/imageUtils.js";
import ProgressiveImage from "../components/ProgressiveImage.jsx";
import toast from "react-hot-toast";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import "../styles/photo-view-custom.css";
import {
  getTheme,
  getCategoryIcon,
  applyTheme,
  getThemeColors,
} from "../themes/categories";
import ParticleSystem from "../components/ParticleSystem";
import DeveloperCredit from "../components/DeveloperCredit.jsx";

const DEFAULT_SOCIAL_LINKS = [
  {
    platform: "Instagram",
    icon: "FiInstagram",
    url: "https://www.instagram.com/robel_studioet/",
  },
  {
    platform: "Facebook",
    icon: "FiFacebook",
    url: "https://web.facebook.com/robelstudiophotandvideo?_rdc=1&_rdr#",
  },
  {
    platform: "TikTok",
    icon: "FaTiktok",
    url: "https://www.tiktok.com/@robelstudio",
  },
  {
    platform: "Maps",
    icon: "FiMapPin",
    url: "https://maps.app.goo.gl/2vjswew27ztyZAy1A",
  },
  {
    platform: "Email",
    icon: "FiMail",
    url: "mailto:robelasrat22@gmail.com",
  },
];

const SOCIAL_ICON_LIBRARY = {
  FiInstagram,
  FiFacebook,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLink,
  FaTiktok,
};

const SOCIAL_ICON_KEYWORD_MAP = [
  { keywords: ["instagram", "ig"], icon: FiInstagram },
  { keywords: ["facebook", "meta"], icon: FiFacebook },
  { keywords: ["tiktok"], icon: FaTiktok },
  { keywords: ["map", "location", "pin", "address"], icon: FiMapPin },
  { keywords: ["mail", "email"], icon: FiMail },
  { keywords: ["phone", "call"], icon: FiPhone },
];

const resolveSocialIconComponent = (iconKey, platformLabel) => {
  const normalizedKey = iconKey?.trim();
  if (normalizedKey) {
    const candidates = [normalizedKey];

    const pascalKey =
      normalizedKey.length > 1
        ? normalizedKey[0].toUpperCase() + normalizedKey.slice(1)
        : normalizedKey.toUpperCase();

    candidates.push(pascalKey);

    if (!normalizedKey.startsWith("Fi") && !normalizedKey.startsWith("Fa")) {
      candidates.push(`Fi${pascalKey}`);
      candidates.push(`Fa${pascalKey}`);
    }

    for (const candidate of candidates) {
      if (SOCIAL_ICON_LIBRARY[candidate]) {
        return SOCIAL_ICON_LIBRARY[candidate];
      }
    }
  }

  const normalizedLabel = platformLabel
    ? platformLabel.toLowerCase().trim()
    : "";
  if (normalizedLabel) {
    for (const entry of SOCIAL_ICON_KEYWORD_MAP) {
      if (entry.keywords.some((keyword) => normalizedLabel.includes(keyword))) {
        return entry.icon;
      }
    }
  }

  return FiLink;
};

const sanitizePhoneValue = (value = "") => value.replace(/[^+0-9]/g, "");

export default function EnhancedAlbumPage() {
  const { slug } = useParams();
  const [album, setAlbum] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [messageForm, setMessageForm] = useState({ name: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [studioData, setStudioData] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("album-theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      return savedTheme === "dark" || (!savedTheme && prefersDark);
    }
    return false;
  });

  const theme = getTheme(album?.category || "weddings");
  const isDark = isDarkMode;
  const themeColors = getThemeColors(album?.category || "weddings", isDark);
  const particleType =
    {
      weddings: "petals",
      family: "memories",
      celebrations: "confetti",
      travel: "clouds",
      special: "bokeh",
      personal: "artistic",
    }[album?.category] || "petals";

  // Keep <html class="dark"> + CSS variables in sync with state.
  // useLayoutEffect avoids a visible "wrong theme" frame on reload.
  useLayoutEffect(() => {
    if (typeof document === "undefined") return;

    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem("album-theme", isDark ? "dark" : "light");
    } catch {
      // ignore storage errors (private mode / disabled storage)
    }

    // Apply theme variables even before the album loads, so we don't inherit
    // stale vars from a previous page/theme.
    applyTheme(album?.category || "weddings", isDark);
  }, [album?.category, isDark]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAlbum(slug)
      .then((data) => {
        if (active) {
          setAlbum(data);
        }
      })
      .catch((e) => active && setError(e.message || "Failed to load album"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchStudioData()
      .then((data) => setStudioData(data))
      .catch((err) => console.error("Failed to load studio data:", err));
  }, []);

  const contactInfo = studioData?.contact_info;

  const resolvedSocialLinks = useMemo(() => {
    if (!Array.isArray(studioData?.social_links)) {
      return [];
    }
    return [...studioData.social_links]
      .filter((link) => link && link.is_active !== false && link.url)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [studioData?.social_links]);

  const socialLinksForDisplay =
    resolvedSocialLinks.length > 0 ? resolvedSocialLinks : DEFAULT_SOCIAL_LINKS;

  const socialLinksForFooter = useMemo(() => {
    const filtered = socialLinksForDisplay.filter((link) => {
      const label = (link.platform || link.label || link.name || "")
        .toString()
        .toLowerCase()
        .trim();
      return !["maps", "map", "email"].includes(label);
    });

    return (filtered.length > 0 ? filtered : socialLinksForDisplay).slice(0, 4);
  }, [socialLinksForDisplay]);

  const contactMethods = useMemo(() => {
    const fallback = {
      phone: "+251 911 199 762",
      email: "robelasrat22@gmail.com",
      address: "Addis Ababa, Ethiopia",
      mapUrl: "https://maps.app.goo.gl/2vjswew27ztyZAy1A",
    };

    const phone = contactInfo?.phone || fallback.phone;
    const email = contactInfo?.email || fallback.email;
    const address = contactInfo?.address || fallback.address;

    const mapsFromSocial = socialLinksForDisplay.find((link) => {
      const label = (link.platform || link.label || link.name || "")
        .toString()
        .toLowerCase();
      return label.includes("map");
    })?.url;

    const mapUrl =
      contactInfo?.map_url ||
      contactInfo?.maps_url ||
      contactInfo?.google_maps_url ||
      mapsFromSocial ||
      fallback.mapUrl;

    return [
      {
        key: "phone",
        title: "Call Us",
        icon: FiPhone,
        value: phone,
        href: `tel:${sanitizePhoneValue(phone)}`,
      },
      {
        key: "email",
        title: "Email Us",
        icon: FiMail,
        value: email,
        href: `mailto:${email}`,
      },
      {
        key: "address",
        title: "Visit Us",
        icon: FiMapPin,
        value: address,
        href: mapUrl,
        external: true,
      },
    ];
  }, [contactInfo, socialLinksForDisplay]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const handlePhotoLike = async (photoId) => {
    setAlbum((prev) => ({
      ...prev,
      photos: prev.photos.map((photo) => {
        if (photo.id === photoId) {
          const newLiked = !photo.is_liked;
          return {
            ...photo,
            is_liked: newLiked,
            likes_count: newLiked
              ? photo.likes_count + 1
              : photo.likes_count - 1,
          };
        }
        return photo;
      }),
    }));

    try {
      const result = await togglePhotoLike(slug, photoId);
      setAlbum((prev) => ({
        ...prev,
        photos: prev.photos.map((photo) =>
          photo.id === photoId
            ? {
                ...photo,
                likes_count: result.likes_count,
                is_liked: result.liked,
              }
            : photo,
        ),
      }));
    } catch (err) {
      setAlbum((prev) => ({
        ...prev,
        photos: prev.photos.map((photo) => {
          if (photo.id === photoId) {
            const revertLiked = !photo.is_liked;
            return {
              ...photo,
              is_liked: revertLiked,
              likes_count: revertLiked
                ? photo.likes_count + 1
                : photo.likes_count - 1,
            };
          }
          return photo;
        }),
      }));
      console.error("Failed to toggle like:", err);
      toast.error("Failed to update like");
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createGuestMessage(slug, messageForm);
      setMessageForm({ name: "", message: "" });
      const updated = await getAlbum(slug);
      setAlbum(updated);
      toast.success("Message posted");
    } catch (err) {
      console.error(err);
      setError("Failed to submit message");
      toast.error("Failed to submit message");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="py-20 text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="font-sans" style={{ color: "var(--text-soft)" }}>
          Loading your beautiful album…
        </p>
      </div>
    );
  if (error)
    return (
      <div className="py-20 text-center">
        <p className="font-sans text-rose-600">{error}</p>
      </div>
    );
  if (!album)
    return (
      <div className="py-20 text-center">
        <p className="font-sans" style={{ color: "var(--text-soft)" }}>
          Album not found.
        </p>
      </div>
    );

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: themeColors.background,
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <ParticleSystem
          type={particleType}
          count={50}
          category={album?.category || "weddings"}
          isDarkMode={isDark}
        />
      </div>

      {/* Decorative Background Elements */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: -1 }}
      >
        <div
          className="animate-float"
          style={{
            position: "absolute",
            top: "10%",
            left: "5%",
            width: "24rem",
            height: "24rem",
            borderRadius: "50%",
            filter: "blur(60px)",
            background: `radial-gradient(circle, ${themeColors.primary}40, transparent)`,
            opacity: 0.6,
          }}
        />
        <div
          className="animate-float"
          style={{
            position: "absolute",
            top: "25%",
            right: "5%",
            width: "20rem",
            height: "20rem",
            borderRadius: "50%",
            filter: "blur(60px)",
            background: `radial-gradient(circle, ${themeColors.accent}35, transparent)`,
            animationDelay: "2s",
            opacity: 0.5,
          }}
        />
        <div
          className="animate-float"
          style={{
            position: "absolute",
            bottom: "10%",
            left: "30%",
            width: "18rem",
            height: "18rem",
            borderRadius: "50%",
            filter: "blur(60px)",
            background: `radial-gradient(circle, ${themeColors.primary}30, transparent)`,
            animationDelay: "4s",
            opacity: 0.4,
          }}
        />
      </div>

      {/* Mini Navigation Bar */}
      <motion.div
        className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {/* Studio Branding */}
        <Link to={`/?album=${slug}`}>
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-2 border border-white/10 hover:bg-black/30 transition-all duration-300 cursor-pointer">
            <div className="w-6 h-6 bg-gradient-to-r from-pink-600 to-rose-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              R
            </div>
            <span
              className="text-xs font-medium text-white/80 hover:text-white transition-colors"
              style={{ fontFamily: "'Kaushan Script', cursive" }}
            >
              Robel Studio
            </span>
          </div>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 bg-black/20 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-black/30 transition-all duration-300"
        >
          {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
      </motion.div>

      <motion.section
        className="relative z-10 pt-20 md:pt-24 pb-8 px-4 md:px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-12 md:mb-20 relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-4xl md:text-6xl">
                {getCategoryIcon(album?.category)}
              </span>
            </motion.div>

            <motion.h1
              className="font-light mb-6 md:mb-8 tracking-wide"
              style={{
                fontFamily: theme.fonts.display,
                fontSize: "clamp(2rem, 8vw, 4.5rem)",
                color: themeColors.text,
                textShadow: `0 2px 4px ${themeColors.primary}20`,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              {album?.names}
            </motion.h1>

            <motion.div
              className="flex items-center justify-center gap-3 mb-6 md:mb-8"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div
                className="w-12 md:w-20 h-px"
                style={{
                  background: `linear-gradient(to right, transparent, ${theme.colors.primary})`,
                }}
              />
              <Heart
                className="w-4 h-4 md:w-5 md:h-5"
                style={{ color: theme.colors.primary }}
                fill="currentColor"
              />
              <div
                className="w-12 md:w-20 h-px"
                style={{
                  background: `linear-gradient(to left, transparent, ${theme.colors.primary})`,
                }}
              />
            </motion.div>

            <motion.p
              className="text-xl md:text-2xl italic mb-8 md:mb-10"
              style={{
                color: theme.colors.accent,
                fontFamily: theme.fonts.serif,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {album?.category === "weddings"
                ? "A Love Story Captured"
                : album?.category === "family"
                  ? "Family Memories Preserved"
                  : album?.category === "celebrations"
                    ? "Celebration Moments"
                    : album?.category === "travel"
                      ? "Adventure Documented"
                      : album?.category === "special"
                        ? "Special Moments Remembered"
                        : "Creative Journey Shared"}
            </motion.p>

            {album?.description && (
              <motion.p
                className="max-w-2xl mx-auto text-base md:text-lg leading-relaxed px-4 mb-8"
                style={{
                  color: isDark ? themeColors.text : themeColors.text + "90",
                  fontFamily: theme.fonts.sans,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                {album.description}
              </motion.p>
            )}

            {/* Download All Button */}
            {album.allow_downloads && (
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <motion.button
                  onClick={() => downloadAlbumZip(slug)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                    color: "white",
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Archive className="w-5 h-5" />
                  Download All Photos
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          {/* Magazine Gallery */}
          <PhotoProvider maskOpacity={0.9} loop={true}>
            <motion.div
              className="magazine-gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              {album?.photos?.map((photo, i) => {
                const photoUrl = getImageUrl(
                  typeof photo === "string" ? photo : photo.url,
                );
                const thumbnailUrl =
                  typeof photo === "object" && photo.thumbnail_url
                    ? getImageUrl(photo.thumbnail_url)
                    : photoUrl;
                const mediumUrl =
                  typeof photo === "object" && photo.medium_url
                    ? getImageUrl(photo.medium_url)
                    : photoUrl;
                const photoId = typeof photo === "object" ? photo.id : i;
                const likesCount =
                  typeof photo === "object" ? photo.likes_count : 0;
                const isLiked =
                  typeof photo === "object" ? photo.is_liked : false;

                return (
                  <motion.div
                    key={photoId}
                    className="magazine-item group relative"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: Math.min(0.1 * i, 0.6),
                    }}
                    whileHover={{ y: -8 }}
                  >
                    <PhotoView src={photoUrl}>
                      <div className="image-container-enhanced">
                        <ProgressiveImage
                          thumbnail={thumbnailUrl}
                          src={mediumUrl}
                          alt={`Memory ${i + 1} from ${album.names}`}
                          className="magazine-image"
                        />
                      </div>
                    </PhotoView>

                    {likesCount > 0 && (
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 text-white text-sm">
                        <Heart
                          className="w-3 h-3 text-rose-400"
                          fill="currentColor"
                        />
                        <span>{likesCount}</span>
                      </div>
                    )}

                    <motion.button
                      onClick={() => handlePhotoLike(photoId)}
                      className="absolute top-2 left-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-2 shadow-lg hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100 md:opacity-0 opacity-100 z-10"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors duration-300 ${
                          isLiked ? "text-rose-500" : "text-gray-400"
                        }`}
                        fill={isLiked ? "currentColor" : "none"}
                      />
                    </motion.button>

                    {album.allow_downloads && (
                      <motion.button
                        onClick={() => downloadPhoto(slug, i)}
                        className="absolute top-2 right-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-2 shadow-lg hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100 md:opacity-0 opacity-100 z-10"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Download className="w-5 h-5 text-white drop-shadow-sm" />
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </PhotoProvider>

          {/* Guestbook Section */}
          <motion.div
            className="mt-16 md:mt-32 max-w-4xl mx-auto relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="text-center mb-8 md:mb-12 relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9, type: "spring" }}
              >
                <MessageCircle
                  className="inline w-10 h-10 md:w-12 md:h-12 mb-4"
                  style={{ color: themeColors.accent }}
                />
              </motion.div>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 md:mb-5"
                style={{
                  fontFamily: theme.fonts.display,
                  color: themeColors.text,
                }}
              >
                {album?.category === "weddings"
                  ? "Leave Your Wishes"
                  : album?.category === "family"
                    ? "Share Your Thoughts"
                    : album?.category === "celebrations"
                      ? "Celebration Messages"
                      : album?.category === "travel"
                        ? "Travel Comments"
                        : album?.category === "special"
                          ? "Special Messages"
                          : "Creative Feedback"}
              </h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div
                  className="w-8 h-px"
                  style={{
                    background: `linear-gradient(to right, transparent, ${themeColors.primary})`,
                  }}
                />
                <Heart
                  className="w-3 h-3"
                  style={{ color: themeColors.primary }}
                  fill="currentColor"
                />
                <div
                  className="w-8 h-px"
                  style={{
                    background: `linear-gradient(to left, transparent, ${themeColors.primary})`,
                  }}
                />
              </div>
              <p
                className="text-base md:text-lg px-4"
                style={{
                  color: isDark
                    ? themeColors.text + "CC"
                    : themeColors.text + "99",
                  fontFamily: theme.fonts.sans,
                }}
              >
                {album?.category === "weddings"
                  ? "Share your love and congratulations with the happy couple"
                  : album?.category === "family"
                    ? "Share your thoughts about these precious family moments"
                    : album?.category === "celebrations"
                      ? "Leave your celebration wishes and memories"
                      : album?.category === "travel"
                        ? "Share your thoughts about this amazing journey"
                        : album?.category === "special"
                          ? "Leave your congratulations and well wishes"
                          : "Share your creative feedback and inspiration"}
              </p>
            </div>

            <motion.form
              onSubmit={handleMessageSubmit}
              className="card-enhanced mb-12 relative"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                  <label
                    className="block text-sm font-semibold mb-2 flex items-center gap-2"
                    style={{
                      color: themeColors.text,
                      fontFamily: theme.fonts.sans,
                    }}
                  >
                    <Heart
                      className="w-4 h-4"
                      style={{ color: themeColors.primary }}
                      fill="currentColor"
                    />
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={messageForm.name}
                    onChange={(e) =>
                      setMessageForm({ ...messageForm, name: e.target.value })
                    }
                    className="w-full px-4 py-3 input-enhanced"
                    style={{ fontFamily: theme.fonts.sans }}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    className="block text-sm font-semibold mb-2 flex items-center gap-2"
                    style={{
                      color: themeColors.text,
                      fontFamily: theme.fonts.sans,
                    }}
                  >
                    <MessageCircle
                      className="w-4 h-4"
                      style={{ color: themeColors.accent }}
                    />
                    Your Message
                  </label>
                  <textarea
                    rows="5"
                    required
                    value={messageForm.message}
                    onChange={(e) =>
                      setMessageForm({
                        ...messageForm,
                        message: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 resize-none input-enhanced"
                    style={{ fontFamily: theme.fonts.sans }}
                    placeholder="Share your heartfelt wishes..."
                  />
                </div>
              </div>
              <motion.button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl w-full md:w-auto justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                  color: "white",
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="spinner" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4" fill="currentColor" />
                    Send Your Wishes
                  </span>
                )}
              </motion.button>
            </motion.form>

            <div className="space-y-6">
              {album.messages?.length > 0 && (
                <motion.div
                  className="text-center mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <p
                    className="text-lg md:text-xl italic"
                    style={{
                      color: themeColors.accent,
                      fontFamily: theme.fonts.serif,
                    }}
                  >
                    {album.messages.length}{" "}
                    {album.messages.length === 1 ? "Message" : "Messages"} of
                    Love
                  </p>
                </motion.div>
              )}
              {album.messages?.map((msg, i) => (
                <motion.div
                  key={i}
                  className="card-enhanced message-card group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                  whileHover={{ x: 4, y: -2 }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <motion.div
                      className="w-12 h-12 rounded-full grid place-items-center font-semibold text-white shadow-md flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.accent} 100%)`,
                        fontFamily: theme.fonts.serif,
                      }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {msg.name.charAt(0).toUpperCase()}
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="font-semibold text-lg"
                          style={{
                            color: themeColors.text,
                            fontFamily: theme.fonts.serif,
                          }}
                        >
                          {msg.name}
                        </div>
                        <Heart
                          className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: themeColors.primary }}
                          fill="currentColor"
                        />
                      </div>
                      <div
                        className="text-sm flex items-center gap-2"
                        style={{
                          color: isDark
                            ? themeColors.text + "B3"
                            : themeColors.text + "70",
                          fontFamily: theme.fonts.sans,
                        }}
                      >
                        <Calendar className="w-3 h-3" />
                        {new Date(msg.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <p
                    className="leading-relaxed text-base md:pl-16 pl-1"
                    style={{
                      color: isDark
                        ? themeColors.text + "CC"
                        : themeColors.text + "80",
                      fontFamily: theme.fonts.sans,
                    }}
                  >
                    "{msg.message}"
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Studio Contact Section */}
          {studioData && (
            <motion.div
              className="mt-16 md:mt-32 max-w-4xl mx-auto relative"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <div className="text-center mb-8 md:mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.1, type: "spring" }}
                >
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                      R
                    </div>
                    <span
                      className="text-2xl md:text-3xl font-semibold"
                      style={{
                        fontFamily: "'Kaushan Script', cursive",
                        color: themeColors.text,
                      }}
                    >
                      Robel Studio
                    </span>
                  </div>
                </motion.div>
                <h2
                  className="text-2xl md:text-3xl font-semibold mb-4"
                  style={{
                    fontFamily: theme.fonts.display,
                    color: themeColors.text,
                  }}
                >
                  Create Your Own Beautiful Memories
                </h2>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div
                    className="w-6 h-px"
                    style={{
                      background: `linear-gradient(to right, transparent, ${themeColors.primary})`,
                    }}
                  />
                  <Heart
                    className="w-3 h-3"
                    style={{ color: themeColors.primary }}
                    fill="currentColor"
                  />
                  <div
                    className="w-6 h-px"
                    style={{
                      background: `linear-gradient(to left, transparent, ${themeColors.primary})`,
                    }}
                  />
                </div>
                <p
                  className="text-base md:text-lg px-4"
                  style={{
                    color: isDark
                      ? themeColors.text + "CC"
                      : themeColors.text + "99",
                    fontFamily: theme.fonts.sans,
                  }}
                >
                  Professional photography services capturing life's precious
                  moments
                </p>
              </div>

              <motion.div
                className="card-enhanced text-center"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                  {contactMethods.map((method) => (
                    <motion.a
                      key={method.key}
                      href={method.href || "#"}
                      target={method.external ? "_blank" : undefined}
                      rel={method.external ? "noopener noreferrer" : undefined}
                      className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl hover:bg-white/5 transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-pink-600/20 rounded-xl flex items-center justify-center text-pink-400">
                        <method.icon size={18} />
                      </div>
                      <div className="text-center">
                        <div
                          className="font-semibold text-sm md:text-base"
                          style={{
                            color: themeColors.text,
                            fontFamily: theme.fonts.sans,
                          }}
                        >
                          {method.title}
                        </div>
                        <div
                          className="text-xs md:text-sm"
                          style={{
                            color: isDark
                              ? themeColors.text + "B3"
                              : themeColors.text + "70",
                            fontFamily: theme.fonts.sans,
                          }}
                        >
                          {method.value}
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>

                <div className="flex justify-center gap-3 md:gap-4">
                  {socialLinksForFooter.map((link) => {
                    const label = link.platform || link.label || link.name || "Link";
                    const Icon = resolveSocialIconComponent(link.icon, label);

                    return (
                      <motion.a
                        key={`${label}-${link.url}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-110"
                        style={{
                          borderColor: themeColors.primary + "40",
                          color: themeColors.primary,
                          backgroundColor: themeColors.primary + "10",
                        }}
                        whileHover={{
                          backgroundColor: themeColors.primary + "20",
                          scale: 1.1,
                        }}
                        aria-label={label}
                      >
                        <Icon size={18} />
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
        <div className="mt-10 text-xs flex justify-center">
          <DeveloperCredit />
        </div>
      </motion.section>

      {/* Back to Top Button */}
      {showBackToTop && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl grid place-items-center transition-all duration-300 backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
            color: "white",
            boxShadow: `0 8px 32px ${theme.colors.primary}40`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Heart className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" />
        </motion.button>
      )}
    </div>
  );
}
