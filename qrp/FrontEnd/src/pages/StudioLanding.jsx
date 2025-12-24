import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiPlay,
  FiPause,
  FiCamera,
  FiUsers,
  FiFilm,
  FiBriefcase,
  FiAperture,
  FiSun,
  FiStar,
  FiInstagram,
  FiFacebook,
  FiMail,
  FiPhone,
  FiMapPin,
  FiAward,
  FiHeart,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMaximize2,
  FiSend,
  FiClock,
  FiImage,
  FiMoon,
  FiChevronDown,
  FiChevronUp,
  FiTwitter,
  FiLinkedin,
  FiMap,
  FiMenu,
} from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { fetchStudioData } from "../services/studioApi";
import { formatNumber } from "../utils/numberUtils";
import { validateAlbumId } from "../utils/albumUtils";

// Generate fallback media items from portfolio
const generateFallbackMedia = (portfolio) => {
  if (!portfolio?.length) return [];
  return portfolio.slice(0, 4).map((img) => ({
    media_type: "image",
    url: img.url,
    title: `Portfolio ${img.category || "Image"}`,
  }));
};

export default function StudioLanding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [filter, setFilter] = useState("all");
  const [selectedService, setSelectedService] = useState(null);
  const [selectedServiceImage, setSelectedServiceImage] = useState(null);
  const [currentServiceImageIndex, setCurrentServiceImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [portfolioZoomLevel, setPortfolioZoomLevel] = useState(1);
  const [portfolioPanX, setPortfolioPanX] = useState(0);
  const [portfolioPanY, setPortfolioPanY] = useState(0);
  const [portfolioIsDragging, setPortfolioIsDragging] = useState(false);
  const [portfolioDragStart, setPortfolioDragStart] = useState({ x: 0, y: 0 });
  const [currentTestimonialPage, setCurrentTestimonialPage] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("studio-theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      return savedTheme === "dark" || (!savedTheme && prefersDark);
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const [studioData, setStudioData] = useState({
    content: null,
    services: [],
    testimonials: [],
    portfolio: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceType: "",
    projectDetails: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // QR Album Access
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const albumId = searchParams.get("album");
  const [albumLoading, setAlbumLoading] = useState(false);

  // Validate and sanitize album ID
  const validAlbumId = validateAlbumId(albumId) ? albumId : null;

  // Security: Clear invalid album parameter from URL
  useEffect(() => {
    if (albumId && !validAlbumId) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("album");
      const newUrl = `${window.location.pathname}${
        newSearchParams.toString() ? "?" + newSearchParams.toString() : ""
      }`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [albumId, validAlbumId, searchParams]);

  // Icon mapping for services
  const iconMap = {
    FiCamera,
    FiUsers,
    FiFilm,
    FiBriefcase,
    FiAperture,
    FiSun,
  };

  const fallbackMedia = generateFallbackMedia(studioData.portfolio);
  const mediaItems =
    studioData.media_items?.length > 0 ? studioData.media_items : fallbackMedia;
  const currentMedia = mediaItems?.[currentIndex] || fallbackMedia[0];
  const categories = [
    "all",
    ...(studioData.categories?.map((cat) => cat.slug) || []),
  ];
  const filteredImages =
    filter === "all"
      ? studioData.portfolio
      : studioData.portfolio.filter((img) => img.category === filter);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(studioData.testimonials.length / itemsPerPage);
  const currentTestimonials = studioData.testimonials.slice(
    currentTestimonialPage * itemsPerPage,
    (currentTestimonialPage + 1) * itemsPerPage
  );

  const stats =
    studioData.content?.stats?.length > 0
      ? studioData.content.stats.map((stat) => ({
          icon: iconMap[stat.icon] || FiUsers,
          number: stat.value,
          label: stat.label,
        }))
      : [
          { icon: FiUsers, number: "500+", label: "Happy Clients" },
          { icon: FiCamera, number: "6+", label: "Years Experience" },
          { icon: FiAward, number: "50+", label: "Awards Won" },
          { icon: FiHeart, number: "1000+", label: "Moments Captured" },
        ];

  useEffect(() => {
    if (!isPlaying || !mediaItems?.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, mediaItems?.length]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [mediaItems?.length]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const loadStudioData = async () => {
    try {
      setLoading(true);
      const data = await fetchStudioData();
      setStudioData(data);
    } catch (err) {
      setError("Failed to load studio data");
      console.error("Error loading studio data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStudioData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadStudioData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      setIsAtBottom(scrollTop + windowHeight >= docHeight - 100);
      setIsScrolled(scrollTop > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const portfolioLightboxRef = useRef(null);
  const serviceLightboxRef = useRef(null);

  useEffect(() => {
    if (zoomLevel <= 1) {
      setPanX(0);
      setPanY(0);
    }
  }, [zoomLevel]);

  useEffect(() => {
    if (portfolioZoomLevel <= 1) {
      setPortfolioPanX(0);
      setPortfolioPanY(0);
    }
  }, [portfolioZoomLevel]);

  useEffect(() => {
    if (selectedImage) {
      const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.5 : 0.5;
        setPortfolioZoomLevel((prev) => Math.max(1, Math.min(5, prev + delta)));
      };
      document.addEventListener("wheel", handleWheel, { passive: false });
      return () => document.removeEventListener("wheel", handleWheel);
    }
  }, [selectedImage]);

  useEffect(() => {
    if (selectedServiceImage) {
      const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.5 : 0.5;
        setZoomLevel((prev) => Math.max(1, Math.min(5, prev + delta)));
      };
      document.addEventListener("wheel", handleWheel, { passive: false });
      return () => document.removeEventListener("wheel", handleWheel);
    }
  }, [selectedServiceImage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        serviceType: "",
        projectDetails: "",
      });

      alert(
        "Message sent successfully! We'll get back to you within 24 hours."
      );
    } catch (error) {
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewAlbum = async () => {
    if (!validAlbumId || albumLoading) return;

    setAlbumLoading(true);
    try {
      // Sanitize album ID for navigation with QR tracking
      const sanitizedId = encodeURIComponent(validAlbumId);
      navigate(`/albums/${sanitizedId}?from=qr`);
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback: try direct URL construction
      window.location.href = `/albums/${encodeURIComponent(validAlbumId)}?from=qr`;
    } finally {
      setAlbumLoading(false);
    }
  };

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("studio-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("studio-theme", "light");
    }
  };

  const openLightbox = (src, idx) => {
    setSelectedImage(src);
    setCurrentImageIndex(idx);
    setPortfolioZoomLevel(1);
    setPortfolioPanX(0);
    setPortfolioPanY(0);
  };

  const nextImage = () => {
    const nextIdx = (currentImageIndex + 1) % filteredImages.length;
    setCurrentImageIndex(nextIdx);
    setSelectedImage(filteredImages[nextIdx]?.url);
    setPortfolioZoomLevel(1);
    setPortfolioPanX(0);
    setPortfolioPanY(0);
  };

  const prevImage = () => {
    const prevIdx =
      (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
    setCurrentImageIndex(prevIdx);
    setSelectedImage(filteredImages[prevIdx]?.url);
    setPortfolioZoomLevel(1);
    setPortfolioPanX(0);
    setPortfolioPanY(0);
  };

  const openServiceLightbox = (img, idx, service) => {
    setSelectedServiceImage(img);
    setCurrentServiceImageIndex(idx);
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  };

  const nextServiceImage = () => {
    if (!selectedService) return;
    const nextIdx =
      (currentServiceImageIndex + 1) % selectedService.gallery_images.length;
    setCurrentServiceImageIndex(nextIdx);
    setSelectedServiceImage(selectedService.gallery_images[nextIdx]);
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  };

  const prevServiceImage = () => {
    if (!selectedService) return;
    const prevIdx =
      (currentServiceImageIndex - 1 + selectedService.gallery_images.length) %
      selectedService.gallery_images.length;
    setCurrentServiceImageIndex(prevIdx);
    setSelectedServiceImage(selectedService.gallery_images[prevIdx]);
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  };

  return (
    <div
      className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${
        isDarkMode ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"
      }`}
    >
      {/* Navigation */}
      <nav
        className={`fixed top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-50 transition-all duration-300 ${
          isScrolled || window.innerWidth < 768
            ? `backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl ${
                isDarkMode
                  ? "bg-white/10 border border-white/20"
                  : "bg-black/10 border border-black/20"
              }`
            : ""
        }`}
      >
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              {/* <img 
                src={isDarkMode ? "/src/assets/light_logo.png" : "/src/assets/logo.png"}
                alt="Robel Studio Logo" 
                className="w-50 h-8 object-contain"
              /> */}
              <span
                className={`text-2xl bg-gradient-to-r transition-all duration-300 ${
                  isDarkMode
                    ? "from-pink-400 to-purple-400 hover:from-pink-300 hover:to-purple-300"
                    : "from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                } bg-clip-text text-transparent`}
                style={{ fontFamily: "Kaushan Script, cursive" }}
              >
                Robel Studio
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {[
                { href: "#", label: "Home" },
                { href: "#about", label: "About" },
                { href: "#services", label: "Services" },
                { href: "#portfolio", label: "Portfolio" },
                { href: "#contact", label: "Contact" },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    isDarkMode
                      ? "text-white/80 hover:text-white"
                      : "text-slate-900/80 hover:text-slate-900"
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Actions */}
              <div className="hidden md:flex items-center gap-3">
                {!validAlbumId &&
                  (isAuthenticated ? (
                    <Link
                      to="/dashboard"
                      className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors"
                    >
                      Sign In
                    </Link>
                  ))}
              </div>
              <button
                onClick={toggleTheme}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isDarkMode
                    ? "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                    : "bg-black/10 border border-black/20 text-slate-900 hover:bg-black/20"
                }`}
              >
                {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isDarkMode
                    ? "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                    : "bg-black/10 border border-black/20 text-slate-900 hover:bg-black/20"
                }`}
              >
                {mobileMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden transition-all duration-300 border-t backdrop-blur-md rounded-b-xl sm:rounded-b-2xl ${
              isDarkMode
                ? "border-white/20 bg-white/5"
                : "border-black/20 bg-black/5"
            }`}
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-2">
              {/* QR Album Button - Mobile */}
              {validAlbumId && (
                <button
                  onClick={() => {
                    handleViewAlbum();
                    setMobileMenuOpen(false);
                  }}
                  disabled={albumLoading}
                  className="w-full text-left py-3 px-4 text-sm font-medium bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                >
                  <FiImage size={16} />
                  {albumLoading ? "Loading..." : "View Album"}
                </button>
              )}

              {[
                { href: "#", label: "Home" },
                { href: "#about", label: "About" },
                { href: "#services", label: "Services" },
                { href: "#portfolio", label: "Portfolio" },
                { href: "#contact", label: "Contact" },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 text-sm font-medium transition-colors ${
                    isDarkMode
                      ? "text-white/80 hover:text-white"
                      : "text-slate-900/80 hover:text-slate-900"
                  }`}
                >
                  {label}
                </a>
              ))}
              {!validAlbumId && (
                isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="block py-2 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors text-left w-full"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
                  >
                    Sign In
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* QR Album Access - Desktop Header Banner */}
        {validAlbumId && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:block fixed top-20 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-4 ml-14 py-2 mt-4 rounded-full shadow-lg border border-white/20 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <FiImage size={16} />
                <span className="text-sm font-medium">Album ready to view</span>
                <button
                  onClick={handleViewAlbum}
                  disabled={albumLoading}
                  className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {albumLoading ? "Loading..." : "View Now"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
        <div className="absolute inset-0 z-0">
          {currentMedia?.media_type === "image" ? (
            <img
              key={currentIndex}
              src={currentMedia?.url}
              alt="Robel Studio"
              className="h-full w-full object-cover transition-opacity duration-1000"
            />
          ) : (
            <video
              key={currentIndex}
              src={currentMedia?.url}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />
        </div>

        {/* Hero Content - Bottom */}
        <div className="absolute bottom-8 left-0 right-0 z-10 text-center px-4 max-w-4xl mx-auto">
          {/* QR Album Access - Mobile Bottom Button */}
          {validAlbumId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden mb-6"
            >
              <button
                onClick={handleViewAlbum}
                disabled={albumLoading}
                className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto disabled:opacity-50 border-2 border-white/30"
                aria-label="View Album"
              >
                <FiImage size={20} />
                {albumLoading ? "Loading Album..." : "View Album"}
                <FiArrowRight size={20} />
              </button>
            </motion.div>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl sm:text-2xl lg:text-5xl font-semibold text-white mb-2 leading-snug font-dancing"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            {studioData.content?.hero_title ||
              currentMedia?.title ||
              "Capturing Life's Beautiful Moments"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={`text-xs sm:text-sm mb-5 max-w-md mx-auto leading-relaxed ${
              validAlbumId ? "text-pink-200" : "text-slate-300"
            }`}
          >
            {validAlbumId
              ? "Welcome! Your album is ready to view. Click the button above to access your photos."
              : studioData.content?.hero_subtitle ||
                "Professional photography services in Addis Ababa. Creating timeless memories with artistic vision and technical excellence."}
          </motion.p>
        </div>

        {/* Social Icons - Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-20 flex-col gap-4"
        >
          {[
            {
              Icon: FiInstagram,
              href: "https://www.instagram.com/robel_studioet/",
              label: "Instagram",
            },
            {
              Icon: FiFacebook,
              href: "https://web.facebook.com/robelstudiophotandvideo?_rdc=1&_rdr#",
              label: "Facebook",
            },
            {
              Icon: FaTiktok,
              href: "https://www.tiktok.com/@robelstudio",
              label: "Twitter",
            },
            {
              Icon: FiMapPin,
              href: "https://maps.app.goo.gl/2vjswew27ztyZAy1A",
              label: "LinkedIn",
            },
            {
              Icon: FiMail,
              href: "mailto:robelasrat22@gmail.com",
              label: "Email",
            },
          ].map(({ Icon, href, label }, idx) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + idx * 0.1 }}
              className={`group w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-pink-600 hover:scale-110 transition-all duration-300 hover:border-pink-500 ${
                isDarkMode
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-slate-800/80 text-white border border-slate-700/50 shadow-lg"
              }`}
              aria-label={label}
            >
              <Icon
                size={18}
                className="group-hover:scale-110 transition-transform duration-300"
              />
            </motion.a>
          ))}
        </motion.div>

        {/* Scroll Button - Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-3"
        >
          <div className="flex flex-col items-center gap-2">
            {isAtBottom ? (
              <motion.button
                key="top"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`text-xs font-medium tracking-wider rotate-90 whitespace-nowrap origin-center hover:text-pink-400 transition-colors cursor-pointer ${
                  isDarkMode ? "text-white" : "text-slate-400"
                }`}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                BACK TO TOP
              </motion.button>
            ) : (
              <motion.span
                key="down"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`text-xs font-medium tracking-wider rotate-90 whitespace-nowrap origin-center ${
                  isDarkMode ? "text-white" : "text-slate-400"
                }`}
              >
                SCROLL DOWN
              </motion.span>
            )}
            <motion.div
              className="relative mt-12"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className={`w-0.5 h-16 mx-auto ${
                  isAtBottom
                    ? isDarkMode
                      ? "bg-gradient-to-t from-white/60 via-white/40 to-transparent"
                      : "bg-gradient-to-t from-slate-800/60 via-slate-800/40 to-transparent"
                    : isDarkMode
                    ? "bg-gradient-to-b from-white/60 via-white/40 to-transparent"
                    : "bg-gradient-to-b from-slate-400/60 via-slate-400/40 to-transparent"
                }`}
              ></div>
              <div
                className={`absolute left-1/2 -translate-x-1/2 ${
                  isAtBottom ? "-top-0.5" : "-bottom-0.5"
                }`}
              >
                <div
                  className={`w-0 h-0 drop-shadow-sm ${
                    isAtBottom
                      ? isDarkMode
                        ? "border-l-[4px] border-r-[4px] border-b-[8px] border-l-transparent border-r-transparent border-b-white/70"
                        : "border-l-[4px] border-r-[4px] border-b-[8px] border-l-transparent border-r-transparent border-b-slate-800/70"
                      : isDarkMode
                      ? "border-l-[4px] border-r-[4px] border-t-[8px] border-l-transparent border-r-transparent border-t-white/70"
                      : "border-l-[4px] border-r-[4px] border-t-[8px] border-l-transparent border-r-transparent border-t-slate-800/70"
                  }`}
                ></div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Media Controls */}
        {mediaItems.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {mediaItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300  cursor-pointer ${
                  idx === currentIndex
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}

        {mediaItems.length > 1 && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute bottom-8 right-8 z-20 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
          >
            {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
          </button>
        )}
      </section>

      {/* About */}
      <section
        id="about"
        className={`section-padding transition-colors duration-300 ${
          isDarkMode ? "bg-slate-900/20" : "bg-gray-50"
        }`}
      >
        <div className="container-app">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mb-4 transition-colors duration-300 ${
                isDarkMode
                  ? "bg-slate-800/50 border border-slate-700/50 text-slate-300"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              About Robel Studio
            </span>
            <h2
              className={`text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl leading-tight font-display mb-4 transition-colors duration-300 ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              {studioData.content?.about_title ||
                "Crafting stories through the lens"}
            </h2>
            <p className="max-w-2xl text-slate-700 dark:text-slate-400 text-lg leading-relaxed mx-auto transition-colors duration-300">
              {studioData.content?.about_text ||
                "Founded in 2018 in Addis Ababa, we're passionate photographers dedicated to capturing life's most precious moments with artistic vision and professional excellence."}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {studioData.portfolio?.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    {studioData.portfolio.slice(0, 2).map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className={`overflow-hidden group rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105 ${
                          isDarkMode
                            ? "bg-slate-800/50 border-slate-700/50"
                            : "bg-white/80 border-slate-200/50 shadow-lg"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.title || `Portfolio ${idx + 1}`}
                          className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4 pt-8">
                    {studioData.portfolio.slice(2, 4).map((img, idx) => (
                      <div
                        key={img.id || idx + 2}
                        className={`overflow-hidden group rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105 ${
                          isDarkMode
                            ? "bg-slate-800/50 border-slate-700/50"
                            : "bg-white/80 border-slate-200/50 shadow-lg"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.title || `Portfolio ${idx + 3}`}
                          className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div
                      className={`rounded-2xl border ${
                        isDarkMode
                          ? "bg-slate-800/50 border-slate-700/50"
                          : "bg-white/80 border-slate-200/50"
                      } h-48 flex items-center justify-center`}
                    >
                      <span className="text-gray-400">No portfolio images</span>
                    </div>
                    <div
                      className={`rounded-2xl border ${
                        isDarkMode
                          ? "bg-slate-800/50 border-slate-700/50"
                          : "bg-white/80 border-slate-200/50"
                      } h-32 flex items-center justify-center`}
                    >
                      <span className="text-gray-400">Upload images</span>
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div
                      className={`rounded-2xl border ${
                        isDarkMode
                          ? "bg-slate-800/50 border-slate-700/50"
                          : "bg-white/80 border-slate-200/50"
                      } h-32 flex items-center justify-center`}
                    >
                      <span className="text-gray-400">in studio</span>
                    </div>
                    <div
                      className={`rounded-2xl border ${
                        isDarkMode
                          ? "bg-slate-800/50 border-slate-700/50"
                          : "bg-white/80 border-slate-200/50"
                      } h-48 flex items-center justify-center`}
                    >
                      <span className="text-gray-400">management</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`rounded-xl p-8 transition-colors duration-300 ${
                isDarkMode
                  ? "bg-slate-800/50 border border-slate-700/50"
                  : "bg-white shadow-lg"
              }`}
            >
              <h3
                className={`text-2xl font-bold mb-6 font-display transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Our Story
              </h3>
              <p
                className={`leading-relaxed mb-6 transition-colors duration-300 ${
                  isDarkMode ? "text-slate-300" : "text-slate-500"
                }`}
              >
                At Robel Studio, we believe every moment tells a story. Since
                our founding in 2018, we've been dedicated to preserving life's
                most precious memories through the art of photography.
              </p>
              <p
                className={`leading-relaxed mb-8 transition-colors duration-300 ${
                  isDarkMode ? "text-slate-300" : "text-slate-500"
                }`}
              >
                Our team combines technical expertise with creative vision to
                deliver stunning imagery that captures not just how you looked,
                but how you felt in those special moments.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  R
                </div>
                <div>
                  <div
                    className={`font-semibold transition-colors duration-300 ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Robel Studio Team
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                    Professional Photographers
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`rounded-xl p-6 text-center group hover:scale-105 transition-all duration-300 ${
                  isDarkMode
                    ? "bg-slate-800/50 border border-slate-700/50"
                    : "bg-white shadow-md"
                }`}
              >
                <div className="w-12 h-12 bg-pink-600/20 rounded-xl flex items-center justify-center text-pink-400 mx-auto mb-4 group-hover:bg-pink-600/30 transition-colors">
                  <stat.icon size={24} />
                </div>
                <div
                  className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {formatNumber(stat.number) + "+"}
                </div>
                <div className="text-slate-700 dark:text-slate-400 text-sm transition-colors duration-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="section-padding">
        <div className="container-app">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mb-4 transition-colors duration-300 ${
                isDarkMode
                  ? "bg-slate-800/50 border border-slate-700/50 text-slate-300"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              Services
            </span>
            <h2
              className={`text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl leading-tight font-display mb-4 transition-colors duration-300 ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              What we offer
            </h2>
            <p className="max-w-2xl text-slate-700 dark:text-slate-400 text-lg leading-relaxed mx-auto transition-colors duration-300">
              Professional photography services tailored to capture your most
              important moments
            </p>
          </motion.div>

          <div className="space-y-24">
            {studioData.services.map((service, idx) => {
              const ServiceIcon = iconMap[service.icon] || FiCamera;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${
                    idx % 2 === 1 ? "lg:grid-flow-dense" : ""
                  }`}
                >
                  <div
                    className={`space-y-6 ${
                      idx % 2 === 1 ? "lg:col-start-2" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-pink-600/20 rounded-2xl flex items-center justify-center text-pink-400 border border-pink-500/20">
                        <ServiceIcon size={28} />
                      </div>
                      <div>
                        <h3
                          className={`text-3xl font-bold mb-2 font-display transition-colors duration-300 ${
                            isDarkMode ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {service.title}
                        </h3>
                        <div className="w-12 h-1 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full"></div>
                      </div>
                    </div>
                    <p
                      className={`text-lg leading-relaxed transition-colors duration-300 ${
                        isDarkMode ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {service.description}
                    </p>
                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => setSelectedService(service)}
                        className="flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-700 transition-all duration-300 hover:scale-105"
                      >
                        <FiImage size={16} />
                        View Gallery
                      </button>
                      <a href="#contact">
                        <button className="flex items-center gap-2 text-pink-400 hover:text-pink-300 px-6 py-3 border border-pink-500/30 rounded-full font-semibold hover:bg-pink-600/10 transition-all duration-300">
                          Book Now <FiArrowRight size={16} />
                        </button>
                      </a>
                    </div>
                  </div>
                  <div
                    className={`${
                      idx % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""
                    }`}
                  >
                    <motion.div
                      layout
                      className="columns-1 sm:columns-2 gap-6 space-y-6"
                    >
                      {service.gallery_images.slice(0, 4).map((img, imgIdx) => (
                        <motion.div
                          key={imgIdx}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: imgIdx * 0.1 }}
                          onClick={() => setSelectedService(service)}
                          className={`group cursor-pointer relative overflow-hidden rounded-xl break-inside-avoid mb-6 transition-all duration-300 hover:scale-105 ${
                            isDarkMode
                              ? "bg-slate-900/50 border border-slate-700/50"
                              : "bg-white shadow-md hover:shadow-xl"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${service.title} ${imgIdx + 1}`}
                            className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div
                            className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                              isDarkMode
                                ? "from-slate-950/80"
                                : "from-slate-900/70"
                            }`}
                          >
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="flex items-center justify-between">
                                <span className="text-white text-sm font-medium bg-slate-900/70 backdrop-blur-sm px-3 py-1 rounded-full">
                                  {service.title.split(" ")[0]}
                                </span>
                                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                  <FiMaximize2
                                    size={14}
                                    className="text-white"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section
        id="portfolio"
        className={`section-padding transition-colors duration-300 ${
          isDarkMode ? "bg-slate-900/20" : "bg-gray-50"
        }`}
      >
        <div className="container-app">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mb-4 transition-colors duration-300 ${
                isDarkMode
                  ? "bg-slate-800/50 border border-slate-700/50 text-slate-300"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              Portfolio
            </span>
            <h2
              className={`text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl leading-tight font-display mb-4 transition-colors duration-300 ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Our recent work
            </h2>
            <p className="max-w-2xl text-slate-700 dark:text-slate-400 text-lg leading-relaxed mx-auto transition-colors duration-300">
              A collection of our favorite moments captured through our lens
            </p>
          </motion.div>

          <div className="flex justify-center gap-3 mb-12 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 capitalize ${
                  filter === cat
                    ? "bg-pink-600 text-white shadow-lg shadow-pink-600/25"
                    : isDarkMode
                    ? "bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
                    : "bg-white text-slate-800 hover:bg-gray-50 shadow-sm border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <motion.div
            layout
            className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
          >
            {filteredImages.map((img, idx) => (
              <motion.div
                key={img.id || img.url}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => openLightbox(img.url, idx)}
                className={`group cursor-pointer relative overflow-hidden rounded-xl break-inside-avoid mb-6 transition-all duration-300 hover:scale-105 ${
                  isDarkMode
                    ? "bg-slate-900/50 border border-slate-700/50"
                    : "bg-white shadow-md hover:shadow-xl"
                }`}
              >
                <img
                  src={img.url}
                  alt={`Portfolio ${idx + 1}`}
                  className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                    isDarkMode ? "from-slate-950/80" : "from-slate-900/70"
                  }`}
                >
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium bg-slate-900/70 backdrop-blur-sm px-3 py-1 rounded-full">
                        {img.category?.charAt(0).toUpperCase() +
                          img.category?.slice(1)}
                      </span>
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <FiMaximize2 size={14} className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className={`section-padding ${
          isDarkMode ? "" : "bg-slate-100/30"
        } transition-colors duration-300`}
      >
        <div className="container-app">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mb-4 transition-colors duration-300 ${
                isDarkMode
                  ? "bg-slate-800/50 border border-slate-700/50 text-slate-300"
                  : "bg-pink-100 border border-pink-200 text-pink-700"
              }`}
            >
              Testimonials
            </span>
            <h2
              className={`text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl leading-tight font-display mb-4 transition-colors duration-300 ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              What our clients say
            </h2>
            <p
              className={`max-w-2xl text-lg leading-relaxed mx-auto transition-colors duration-300 ${
                isDarkMode ? "text-slate-400" : "text-slate-700"
              }`}
            >
              Don't just take our word for it - hear from our happy clients
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentTestimonials.map((testimonial, idx) => (
              <motion.div
                key={`${testimonial.name}-${currentTestimonialPage}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105 ${
                  isDarkMode
                    ? "bg-slate-800/50 border-slate-700/50"
                    : "bg-white/80 border-slate-200/50 shadow-sm"
                }`}
              >
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p
                  className={`mb-6 leading-relaxed transition-colors duration-300 ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div
                      className={`font-medium transition-colors duration-300 ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {testimonial.name}
                    </div>
                    <div
                      className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                onClick={() =>
                  setCurrentTestimonialPage((prev) => Math.max(0, prev - 1))
                }
                disabled={currentTestimonialPage === 0}
                className={`w-10 h-10 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  isDarkMode
                    ? "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                    : "bg-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-300"
                }`}
              >
                <FiChevronLeft size={20} />
              </button>
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTestimonialPage(idx)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      idx === currentTestimonialPage
                        ? "bg-pink-600"
                        : isDarkMode
                        ? "bg-slate-600 hover:bg-slate-500"
                        : "bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() =>
                  setCurrentTestimonialPage((prev) =>
                    Math.min(totalPages - 1, prev + 1)
                  )
                }
                disabled={currentTestimonialPage === totalPages - 1}
                className={`w-10 h-10 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  isDarkMode
                    ? "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                    : "bg-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-300"
                }`}
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-app">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-600 to-rose-600 p-8 lg:p-12 text-white"
          >
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6">
                <FiStar size={16} />
                Premium Photography
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight font-display">
                Ready to capture your perfect moments?
              </h2>
              <p className="text-white/90 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
                Book your session today and let us create beautiful memories
                that will last a lifetime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#contact">
                  <button className="bg-white text-pink-600 px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-all duration-300 flex items-center gap-2 justify-center w-full sm:w-auto">
                    Book Session <FiArrowRight size={18} />
                  </button>
                </a>
                <Link to="/albums-app">
                  <button className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-300 w-full sm:w-auto">
                    QR Albums App
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className={`section-padding transition-colors duration-300 ${
          isDarkMode ? "bg-slate-900/20" : "bg-slate-100/50"
        }`}
      >
        <div className="container-app">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mb-4 transition-colors duration-300 ${
                isDarkMode
                  ? "bg-slate-800/50 border border-slate-700/50 text-slate-300"
                  : "bg-pink-100 border border-pink-200 text-pink-700"
              }`}
            >
              Contact Us
            </span>
            <h2
              className={`text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl leading-tight font-display mb-4 transition-colors duration-300 ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Let's create something amazing
            </h2>
            <p
              className={`max-w-2xl text-lg leading-relaxed mx-auto transition-colors duration-300 ${
                isDarkMode ? "text-slate-400" : "text-slate-700"
              }`}
            >
              Ready to capture your special moments? Get in touch and let's
              discuss your vision
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`p-6 text-center hover:scale-105 transition-all duration-300 rounded-2xl backdrop-blur-md border ${
                isDarkMode
                  ? "bg-slate-800/50 border-slate-700/50"
                  : "bg-white/80 border-slate-200/50 shadow-sm"
              }`}
            >
              <div className="w-16 h-16 bg-pink-600/20 rounded-2xl flex items-center justify-center text-pink-400 mx-auto mb-4">
                <FiPhone size={24} />
              </div>
              <h3
                className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Call Us
              </h3>
              <a
                href="tel:+251911199762"
                className={`transition-colors hover:text-pink-400 ${
                  isDarkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                +251 911199762
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={`p-6 text-center hover:scale-105 transition-all duration-300 rounded-2xl backdrop-blur-md border ${
                isDarkMode
                  ? "bg-slate-800/50 border-slate-700/50"
                  : "bg-white/80 border-slate-200/50 shadow-sm"
              }`}
            >
              <div className="w-16 h-16 bg-pink-600/20 rounded-2xl flex items-center justify-center text-pink-400 mx-auto mb-4">
                <FiMail size={24} />
              </div>
              <h3
                className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Email Us
              </h3>
              <a
                href="mailto:robelasrat22@gmail.com"
                className={`transition-colors hover:text-pink-400 ${
                  isDarkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                robelasrat22@gmail.com
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className={`p-6 text-center hover:scale-105 transition-all duration-300 rounded-2xl backdrop-blur-md border ${
                isDarkMode
                  ? "bg-slate-800/50 border-slate-700/50"
                  : "bg-white/80 border-slate-200/50 shadow-sm"
              }`}
            >
              <div className="w-16 h-16 bg-pink-600/20 rounded-2xl flex items-center justify-center text-pink-400 mx-auto mb-4">
                <FiMapPin size={24} />
              </div>
              <h3
                className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Visit Us
              </h3>
              <p
                className={`transition-colors duration-300 ${
                  isDarkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Addis Ababa, Ethiopia
              </p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`lg:col-span-3 p-8 rounded-2xl backdrop-blur-md border transition-colors duration-300 ${
                isDarkMode
                  ? "bg-slate-800/50 border-slate-700/50"
                  : "bg-white/80 border-slate-200/50 shadow-sm"
              }`}
            >
              <div className="mb-8">
                <h3
                  className={`text-2xl font-bold mb-2 font-display transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Send us a message
                </h3>
                <p
                  className={`transition-colors duration-300 ${
                    isDarkMode ? "text-slate-400" : "text-slate-700"
                  }`}
                >
                  We'll get back to you within 24 hours
                </p>
              </div>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      className={`block text-sm font-semibold transition-colors duration-300 ${
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                      className={`w-full px-4 py-4 border rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all duration-300 ${
                        isDarkMode
                          ? "bg-slate-800/30 border-slate-700/50 text-white placeholder-slate-500"
                          : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className={`block text-sm font-semibold transition-colors duration-300 ${
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                      className={`w-full px-4 py-4 border rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all duration-300 ${
                        isDarkMode
                          ? "bg-slate-800/30 border-slate-700/50 text-white placeholder-slate-500"
                          : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                      }`}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      className={`block text-sm font-semibold transition-colors duration-300 ${
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+251 911 449 901"
                      className={`w-full px-4 py-4 border rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all duration-300 ${
                        isDarkMode
                          ? "bg-slate-800/30 border-slate-700/50 text-white placeholder-slate-500"
                          : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className={`block text-sm font-semibold transition-colors duration-300 ${
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Service Type
                    </label>
                    <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-4 border rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all duration-300 ${
                        isDarkMode
                          ? "bg-slate-800/30 border-slate-700/50 text-white"
                          : "bg-white border-slate-300 text-slate-900"
                      }`}
                    >
                      <option value="">Select a service</option>
                      <option value="wedding">Wedding Photography</option>
                      <option value="portrait">Portrait Session</option>
                      <option value="event">Event Photography</option>
                      <option value="maternity">Maternity & Family</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-semibold transition-colors duration-300 ${
                      isDarkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Project Details *
                  </label>
                  <textarea
                    name="projectDetails"
                    value={formData.projectDetails}
                    onChange={handleInputChange}
                    rows="5"
                    placeholder="Tell us about your project, preferred dates, location, and any special requirements..."
                    required
                    className={`w-full px-4 py-4 border rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all duration-300 resize-none ${
                      isDarkMode
                        ? "bg-slate-800/30 border-slate-700/50 text-white placeholder-slate-500"
                        : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white py-4 px-8 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-pink-600/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <FiSend size={18} />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-6"
            >
              <div
                className={`p-6 rounded-2xl backdrop-blur-md border transition-colors duration-300 ${
                  isDarkMode
                    ? "bg-slate-800/50 border-slate-700/50"
                    : "bg-white/80 border-slate-200/50 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-pink-600/20 rounded-xl flex items-center justify-center text-pink-400">
                    <FiClock size={20} />
                  </div>
                  <h3
                    className={`text-lg font-semibold transition-colors duration-300 ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Opening Hours
                  </h3>
                </div>
                <div className="space-y-3">
                  <div
                    className={`flex justify-between items-center py-2 border-b transition-colors duration-300 ${
                      isDarkMode ? "border-slate-800/50" : "border-slate-200/50"
                    }`}
                  >
                    <span
                      className={`font-medium transition-colors duration-300 ${
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Monday - Saturday
                    </span>
                    <span
                      className={`font-semibold transition-colors duration-300 ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      08:30 AM - 08:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span
                      className={`font-medium transition-colors duration-300 ${
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Sunday
                    </span>
                    <span
                      className={`font-semibold transition-colors duration-300 ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      02:00 AM - 02:00 PM
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`overflow-hidden rounded-2xl backdrop-blur-md border transition-colors duration-300 ${
                  isDarkMode
                    ? "bg-slate-800/50 border-slate-700/50"
                    : "bg-white/80 border-slate-200/50 shadow-sm"
                }`}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3750.8793532340355!2d38.784787274749036!3d8.996747589493507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85e698e9d5d3%3A0x8e9292ac8fae83e2!2sRobel%20Studio!5e1!3m2!1sen!2set!4v1766144786785!5m2!1sen!2set"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                ></iframe>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`border-t py-12 transition-colors duration-300 ${
          isDarkMode ? "border-slate-800/50" : "border-slate-200/50"
        }`}
      >
        <div className="container-app">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
                  R
                </div>
                <span
                  className={`text-xl font-semibold font-display transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Robel Studio
                </span>
              </div>
              <p
                className={`max-w-md transition-colors duration-300 ${
                  isDarkMode ? "text-slate-400" : "text-slate-700"
                }`}
              >
                Professional photography services in Addis Ababa, capturing
                life's beautiful moments.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {[
                {
                  Icon: FiInstagram,
                  href: "https://www.instagram.com/robel_studioet/",
                  label: "Instagram",
                },
                {
                  Icon: FiFacebook,
                  href: "https://web.facebook.com/robelstudiophotandvideo?_rdc=1&_rdr#",
                  label: "Facebook",
                },
                {
                  Icon: FaTiktok,
                  href: "https://www.tiktok.com/@robelstudio",
                  label: "Twitter",
                },
                {
                  Icon: FiMapPin,
                  href: "https://maps.app.goo.gl/2vjswew27ztyZAy1A",
                  label: "LinkedIn",
                },
                {
                  Icon: FiMail,
                  href: "mailto:robelasrat22@gmail.com",
                  label: "Email",
                },
              ].map(({ Icon, href }, idx) => (
                <a
                  key={idx}
                  href={href}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isDarkMode
                      ? "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50"
                      : "bg-slate-200/50 text-slate-600 hover:text-slate-900 hover:bg-slate-300/50"
                  }`}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div
            className={`border-t mt-8 pt-8 text-center transition-colors duration-300 ${
              isDarkMode
                ? "border-slate-800/50 text-slate-500"
                : "border-slate-200/50 text-slate-600"
            }`}
          >
            <p>
              © {new Date().getFullYear()} Robel Studio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Portfolio Lightbox */}
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
            <FiX size={20} />
          </button>
          {/* Zoom Display */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
            <div className="w-16 h-12 bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
              <span className="text-sm font-medium">
                {Math.round(portfolioZoomLevel * 100)}%
              </span>
            </div>
          </div>
          {filteredImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-all duration-300 hover:scale-110 z-10"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-all duration-300 hover:scale-110 z-10"
              >
                <FiChevronRight size={20} />
              </button>
            </>
          )}
          <motion.div
            ref={portfolioLightboxRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full h-full max-w-6xl max-h-[85vh] mx-auto flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => {
              if (portfolioZoomLevel > 1) {
                setPortfolioIsDragging(true);
                setPortfolioDragStart({
                  x: e.clientX - portfolioPanX,
                  y: e.clientY - portfolioPanY,
                });
              }
            }}
            onMouseMove={(e) => {
              if (portfolioIsDragging && portfolioZoomLevel > 1) {
                setPortfolioPanX(e.clientX - portfolioDragStart.x);
                setPortfolioPanY(e.clientY - portfolioDragStart.y);
              }
            }}
            onMouseUp={() => setPortfolioIsDragging(false)}
            onMouseLeave={() => setPortfolioIsDragging(false)}
            style={{
              cursor:
                portfolioZoomLevel > 1
                  ? portfolioIsDragging
                    ? "grabbing"
                    : "grab"
                  : "default",
            }}
          >
            <img
              src={selectedImage}
              alt="Portfolio fullscreen"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              style={{
                transform: `scale(${portfolioZoomLevel}) translate(${portfolioPanX}px, ${portfolioPanY}px)`,
                transition: portfolioIsDragging
                  ? "none"
                  : "transform 0.3s ease",
              }}
            />
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md rounded-full px-4 py-2">
              <span className="text-white text-sm font-medium">
                {currentImageIndex + 1} / {filteredImages.length}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Service Gallery Modal */}
      {selectedService && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedService(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white font-display">
                    {selectedService.title}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">
                    {selectedService.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="w-10 h-10 bg-slate-800/80 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
              <motion.div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {selectedService.gallery_images.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="group relative overflow-hidden rounded-xl cursor-pointer break-inside-avoid mb-4"
                    onClick={() =>
                      openServiceLightbox(img, idx, selectedService)
                    }
                  >
                    <img
                      src={img}
                      alt={`${selectedService.title} ${idx + 1}`}
                      className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4">
                        <span className="text-white text-sm font-medium bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full">
                          {idx + 1} of {selectedService.gallery_images.length}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <FiMaximize2 size={14} className="text-white" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Service Gallery Lightbox */}
      {selectedServiceImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => {
            setSelectedServiceImage(null);
            setZoomLevel(1);
            setPanX(0);
            setPanY(0);
          }}
        >
          <button
            onClick={() => {
              setSelectedServiceImage(null);
              setZoomLevel(1);
              setPanX(0);
              setPanY(0);
            }}
            className="absolute top-6 right-6 w-12 h-12 bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-all duration-300 hover:scale-110 z-10"
          >
            <FiX size={20} />
          </button>
          {/* Zoom Display */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
            <div className="w-16 h-12 bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
              <span className="text-sm font-medium">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>
          </div>
          {selectedService && selectedService.gallery_images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevServiceImage();
                  setZoomLevel(1);
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-all duration-300 hover:scale-110 z-10"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextServiceImage();
                  setZoomLevel(1);
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-all duration-300 hover:scale-110 z-10"
              >
                <FiChevronRight size={20} />
              </button>
            </>
          )}
          <motion.div
            ref={serviceLightboxRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full h-full max-w-6xl max-h-[85vh] mx-auto flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => {
              if (zoomLevel > 1) {
                setIsDragging(true);
                setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
              }
            }}
            onMouseMove={(e) => {
              if (isDragging && zoomLevel > 1) {
                setPanX(e.clientX - dragStart.x);
                setPanY(e.clientY - dragStart.y);
              }
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            style={{
              cursor:
                zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "default",
            }}
          >
            <img
              src={selectedServiceImage}
              alt="Service gallery fullscreen"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              style={{
                transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                transition: isDragging ? "none" : "transform 0.3s ease",
              }}
            />
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md rounded-full px-4 py-2">
              <span className="text-white text-sm font-medium">
                {currentServiceImageIndex + 1} /{" "}
                {selectedService?.gallery_images.length}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
