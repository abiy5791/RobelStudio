import { motion } from "framer-motion";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  FiMenu,
  FiCalendar,
  FiEye,
  FiLink,
  FiGlobe,
  FiTwitter,
  FiLinkedin,
  FiAlertTriangle,
} from "react-icons/fi";
import { FaTiktok, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { fetchStudioData } from "../services/studioApi";

import { formatNumber } from "../utils/numberUtils";
import { validateAlbumId } from "../utils/albumUtils";

const SERVICE_ICON_MAP = {
  FiCamera,
  FiUsers,
  FiFilm,
  FiBriefcase,
  FiAperture,
  FiSun,
  FiAward,
  FiHeart,
};

const DEFAULT_HERO_MEDIA = [
  {
    media_type: "image",
    url: "https://images.unsplash.com/photo-1719500718255-1fe62df00856?q=80&w=1031&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Robel Studio Showcase",
  },
];

const DEFAULT_STATS = [
  {
    icon: SERVICE_ICON_MAP.FiUsers,
    value: 0,
    suffix: "+",
    label: "Happy Clients",
  },
  {
    icon: SERVICE_ICON_MAP.FiCamera,
    value: 0,
    suffix: "+",
    label: "Years Experience",
  },
  { icon: FiAward, value: 0, suffix: "+", label: "Awards Won" },
  { icon: FiHeart, value: 0, suffix: "+", label: "Moments Captured" },
];

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
  FiLinkedin,
  FiTwitter,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiCalendar,
  FiLink,
  FiAward,
  FiUsers,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
};

const SOCIAL_ICON_KEYWORD_MAP = [
  { keywords: ["instagram", "ig"], icon: FiInstagram },
  { keywords: ["facebook", "meta"], icon: FiFacebook },
  { keywords: ["linkedin"], icon: FiLinkedin },
  { keywords: ["twitter", "x.com", "x "], icon: FiTwitter },
  { keywords: ["whatsapp", "wa.me"], icon: FaWhatsapp },
  { keywords: ["tiktok"], icon: FaTiktok },
  { keywords: ["youtube"], icon: FaYoutube },
  { keywords: ["map", "location", "pin", "address"], icon: FiMapPin },
  { keywords: ["mail", "email"], icon: FiMail },
  { keywords: ["phone", "call"], icon: FiPhone },
  { keywords: ["calendar", "book", "booking"], icon: FiCalendar },
  { keywords: ["site", "web", "portfolio", "globe"], icon: FiGlobe },
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

const DEFAULT_MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3750.8793532340355!2d38.784787274749036!3d8.996747589493507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85e698e9d5d3%3A0x8e9292ac8fae83e2!2sRobel%20Studio!5e1!3m2!1sen!2set!4v1766144786785!5m2!1sen!2set";

const sanitizePhoneValue = (value = "") => value.replace(/[^+0-9]/g, "");

const buildWhatsappLink = (value = "") => {
  const digitsOnly = value.replace(/[^0-9]/g, "");
  if (!digitsOnly) {
    return null;
  }
  return `https://wa.me/${digitsOnly}`;
};

// Generate fallback media items from portfolio
const generateFallbackMedia = (portfolio) => {
  if (!portfolio?.length) return DEFAULT_HERO_MEDIA;
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
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoFilter, setVideoFilter] = useState("all");
  const [showAllVideos, setShowAllVideos] = useState(false);
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
    videos: [],
    video_categories: [],
    media_items: [],
    categories: [],
    contact_info: null,
    social_links: [],
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
  const [formStatus, setFormStatus] = useState({ type: null, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [albumLoading, setAlbumLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [shouldLoadSelectedVideo, setShouldLoadSelectedVideo] = useState(false);
  const [selectedVideoSource, setSelectedVideoSource] = useState("");
  const [isHeroInView, setIsHeroInView] = useState(true);
  const videoRef = useRef(null);
  const selectedVideoPlayerRef = useRef(null);
  const heroSectionRef = useRef(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const albumId = searchParams.get("album") || searchParams.get("albums");
  const validAlbumId = validateAlbumId(albumId) ? albumId : null;

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    if (!albumId || validAlbumId) {
      return undefined;
    }

    const newSearchParams = new URLSearchParams(window.location.search);
    newSearchParams.delete("album");
    newSearchParams.delete("albums");
    const queryString = newSearchParams.toString();
    const newUrl = `${window.location.pathname}${
      queryString ? `?${queryString}` : ""
    }`;
    window.history.replaceState({}, "", newUrl);
    return undefined;
  }, [albumId, validAlbumId]);

  const fallbackMedia = useMemo(
    () => generateFallbackMedia(studioData.portfolio),
    [studioData.portfolio]
  );

  const mediaItems = useMemo(() => {
    if (
      Array.isArray(studioData.media_items) &&
      studioData.media_items.length
    ) {
      return studioData.media_items;
    }
    return fallbackMedia;
  }, [studioData.media_items, fallbackMedia]);
  const mediaItemsCount = mediaItems.length;
  const shouldAutoAdvance = isPlaying && isHeroInView && mediaItemsCount > 0;

  const currentMedia = useMemo(() => {
    if (mediaItems?.length) {
      return mediaItems[currentIndex % mediaItems.length];
    }
    return DEFAULT_HERO_MEDIA[0];
  }, [mediaItems, currentIndex]);

  const categories = useMemo(() => {
    const base = ["all"];
    if (Array.isArray(studioData.categories)) {
      base.push(
        ...studioData.categories.map((cat) => cat?.slug).filter(Boolean)
      );
    }
    return Array.from(new Set(base));
  }, [studioData.categories]);

  const filteredImages = useMemo(() => {
    if (!Array.isArray(studioData.portfolio)) {
      return [];
    }
    if (filter === "all") {
      return studioData.portfolio;
    }
    return studioData.portfolio.filter((img) => img.category === filter);
  }, [filter, studioData.portfolio]);

  const filteredVideos = useMemo(() => {
    if (!Array.isArray(studioData.videos)) {
      return [];
    }
    if (videoFilter === "all") {
      return studioData.videos;
    }
    return studioData.videos.filter((video) => video.category === videoFilter);
  }, [videoFilter, studioData.videos]);

  const itemsPerPage = 3;
  const totalPages = useMemo(() => {
    const total = Array.isArray(studioData.testimonials)
      ? studioData.testimonials.length
      : 0;
    return Math.max(1, Math.ceil(total / itemsPerPage));
  }, [studioData.testimonials, itemsPerPage]);

  const currentTestimonials = useMemo(() => {
    if (!Array.isArray(studioData.testimonials)) {
      return [];
    }
    const start = currentTestimonialPage * itemsPerPage;
    return studioData.testimonials.slice(start, start + itemsPerPage);
  }, [studioData.testimonials, currentTestimonialPage, itemsPerPage]);

  const stats = useMemo(() => {
    const resolvedStats = studioData.content?.stats?.length
      ? studioData.content.stats.map((stat) => ({
          icon: SERVICE_ICON_MAP[stat.icon] || FiUsers,
          value: stat.value,
          suffix: stat.suffix || "",
          label: stat.label,
        }))
      : DEFAULT_STATS;

    return resolvedStats.map((stat) => ({
      icon: stat.icon,
      number:
        typeof stat.value === "number"
          ? `${formatNumber(stat.value)}${stat.suffix || ""}`
          : stat.value || "",
      label: stat.label,
    }));
  }, [studioData.content?.stats]);

  const contactInfo = studioData.contact_info;

  const resolvedSocialLinks = useMemo(() => {
    if (!Array.isArray(studioData.social_links)) {
      return [];
    }
    return [...studioData.social_links]
      .filter((link) => link && link.is_active !== false && link.url)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [studioData.social_links]);

  const socialLinksForDisplay =
    resolvedSocialLinks.length > 0 ? resolvedSocialLinks : DEFAULT_SOCIAL_LINKS;

  const socialLinksForFooter = socialLinksForDisplay;

  const contactMethods = useMemo(() => {
    if (!contactInfo) return [];
    const methods = [];

    if (contactInfo.phone) {
      methods.push({
        key: "phone",
        title: "Call Us",
        icon: FiPhone,
        value: contactInfo.phone,
        href: `tel:${sanitizePhoneValue(contactInfo.phone)}`,
      });
    }

    if (contactInfo.whatsapp_number) {
      const waLink = buildWhatsappLink(contactInfo.whatsapp_number);
      if (waLink) {
        methods.push({
          key: "whatsapp",
          title: "WhatsApp",
          icon: FaWhatsapp,
          value: contactInfo.whatsapp_number,
          href: waLink,
          external: true,
        });
      }
    }

    if (contactInfo.emergency_phone) {
      methods.push({
        key: "emergency",
        title: "Emergency Line",
        icon: FiAlertTriangle,
        value: contactInfo.emergency_phone,
        href: `tel:${sanitizePhoneValue(contactInfo.emergency_phone)}`,
      });
    }

    if (contactInfo.email) {
      methods.push({
        key: "email",
        title: "Email Us",
        icon: FiMail,
        value: contactInfo.email,
        href: `mailto:${contactInfo.email}`,
      });
    }

    if (contactInfo.booking_link) {
      methods.push({
        key: "booking",
        title: "Book a Session",
        icon: FiCalendar,
        value: "Secure your slot online",
        href: contactInfo.booking_link,
        external: true,
      });
    }

    if (contactInfo.address) {
      methods.push({
        key: "address",
        title: "Visit Us",
        icon: FiMapPin,
        value: contactInfo.address,
      });
    }

    if (contactInfo.office_hours) {
      methods.push({
        key: "hours",
        title: "Office Hours",
        icon: FiClock,
        value: contactInfo.office_hours,
      });
    }

    return methods;
  }, [contactInfo]);

  const officeHoursEntries = useMemo(() => {
    if (!contactInfo?.office_hours) return null;
    return contactInfo.office_hours
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }, [contactInfo?.office_hours]);

  const mapEmbedUrl = contactInfo?.map_embed_url || DEFAULT_MAP_EMBED_URL;

  const primaryCtaProps = useMemo(() => {
    if (contactInfo?.booking_link) {
      return {
        href: contactInfo.booking_link,
        target: "_blank",
        rel: "noopener noreferrer",
      };
    }
    if (contactInfo?.phone) {
      return { href: `tel:${sanitizePhoneValue(contactInfo.phone)}` };
    }
    return { href: "#contact" };
  }, [contactInfo]);

  useEffect(() => {
    if (!shouldAutoAdvance) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaItemsCount);
    }, 5000);
    return () => clearInterval(interval);
  }, [shouldAutoAdvance, mediaItemsCount]);

  // Handle mobile video autoplay
  useEffect(() => {
    const handleUserInteraction = () => {
      if (videoRef.current && currentMedia?.media_type === "video") {
        videoRef.current.play().catch(() => {
          console.log("Video autoplay failed");
        });
      }
    };

    // Add event listeners for user interaction
    document.addEventListener("touchstart", handleUserInteraction, {
      once: true,
    });
    document.addEventListener("click", handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener("touchstart", handleUserInteraction);
      document.removeEventListener("click", handleUserInteraction);
    };
  }, [currentMedia?.media_type]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [mediaItemsCount]);

  useEffect(() => {
    setVideoError(false);
  }, [currentMedia?.url]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    let frameId = null;
    const handleResize = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      frameId = window.requestAnimationFrame(() => {
        setViewportWidth(window.innerWidth);
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const loadStudioData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchStudioData();
      if (!data) {
        throw new Error("No studio data returned");
      }
      const normalizeArray = (value) => (Array.isArray(value) ? value : []);
      setStudioData({
        content: data.content || null,
        services: normalizeArray(data.services),
        testimonials: normalizeArray(data.testimonials),
        portfolio: normalizeArray(data.portfolio),
        videos: normalizeArray(data.videos),
        video_categories: normalizeArray(data.video_categories),
        media_items: normalizeArray(data.media_items),
        categories: normalizeArray(data.categories),
        contact_info: data.contact_info || null,
        social_links: normalizeArray(data.social_links),
      });
    } catch (err) {
      setError(err?.message || "Failed to load studio data");
      console.error("Error loading studio data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStudioData();
    setRefreshing(false);
  }, [loadStudioData]);

  useEffect(() => {
    loadStudioData();
  }, [loadStudioData]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const updateScrollState = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight =
        window.innerHeight || document.documentElement.clientHeight;
      const docHeight = document.documentElement.scrollHeight;

      setIsAtBottom(scrollTop + windowHeight >= docHeight - 100);
      setIsScrolled(scrollTop > 10);
    };

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          updateScrollState();
          ticking = false;
        });
      }
    };

    updateScrollState();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (
      !heroSectionRef.current ||
      typeof IntersectionObserver === "undefined"
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsHeroInView(entry?.isIntersecting ?? true);
      },
      {
        root: null,
        threshold: 0.35,
      }
    );

    observer.observe(heroSectionRef.current);
    return () => observer.disconnect();
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

  useEffect(() => {
    setShouldLoadSelectedVideo(false);
    setSelectedVideoSource("");

    if (!selectedVideoPlayerRef.current) {
      return;
    }

    const player = selectedVideoPlayerRef.current;
    player.pause();
    player.currentTime = 0;
    player.removeAttribute("src");
    player.load();
  }, [selectedVideo]);

  useEffect(() => {
    const player = selectedVideoPlayerRef.current;
    if (!player || !shouldLoadSelectedVideo || !selectedVideoSource) {
      return undefined;
    }

    player.load();

    const playVideo = () => {
      player.play().catch(() => {
        /* Ignore autoplay issues; user can tap controls */
      });
    };

    if (player.readyState >= 2) {
      playVideo();
      return undefined;
    }

    player.addEventListener("loadeddata", playVideo, { once: true });
    return () => player.removeEventListener("loadeddata", playVideo);
  }, [shouldLoadSelectedVideo, selectedVideoSource]);

  const handleSelectedVideoPlay = useCallback(() => {
    if (!selectedVideo?.video_url) return;
    setSelectedVideoSource(selectedVideo.video_url);
    setShouldLoadSelectedVideo(true);
  }, [selectedVideo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ type: "loading", message: "Sending your message..." });
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
      setFormStatus({
        type: "success",
        message: "Message sent! We'll get back to you within 24 hours.",
      });
    } catch (error) {
      setFormStatus({
        type: "error",
        message: "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!formStatus.message || formStatus.type === "loading") {
      return undefined;
    }
    const timeoutId = setTimeout(
      () => setFormStatus({ type: null, message: "" }),
      5000
    );
    return () => clearTimeout(timeoutId);
  }, [formStatus]);

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
    if (!filteredImages.length) return;
    setSelectedImage(src);
    setCurrentImageIndex(idx);
    setPortfolioZoomLevel(1);
    setPortfolioPanX(0);
    setPortfolioPanY(0);
  };

  const nextImage = () => {
    if (!filteredImages.length) return;
    const nextIdx = (currentImageIndex + 1) % filteredImages.length;
    setCurrentImageIndex(nextIdx);
    setSelectedImage(filteredImages[nextIdx]?.url);
    setPortfolioZoomLevel(1);
    setPortfolioPanX(0);
    setPortfolioPanY(0);
  };

  const prevImage = () => {
    if (!filteredImages.length) return;
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

  const handleViewAlbum = async () => {
    if (!validAlbumId || albumLoading) {
      return;
    }

    setAlbumLoading(true);
    try {
      const sanitizedId = encodeURIComponent(validAlbumId);
      navigate(`/albums/${sanitizedId}?from=qr`);
    } catch (error) {
      console.error("Navigation error:", error);
      if (typeof window !== "undefined") {
        window.location.href = `/albums/${encodeURIComponent(
          validAlbumId
        )}?from=qr`;
      }
    } finally {
      setAlbumLoading(false);
    }
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
          isScrolled || viewportWidth < 768
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
              {!validAlbumId &&
                (isAuthenticated ? (
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
                ))}
            </div>
          </div>
        )}
      </nav>

      {error && (
        <div className="fixed top-24 left-1/2 z-40 -translate-x-1/2 px-4 w-full max-w-xl">
          <div
            className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg ${
              isDarkMode
                ? "bg-slate-900/80 border-red-500/30 text-red-200"
                : "bg-white border-red-500/20 text-red-700"
            }`}
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center justify-center rounded-full px-4 py-2 bg-red-500 text-white text-xs uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {refreshing ? "Retrying..." : "Retry"}
            </button>
          </div>
        </div>
      )}

      {(loading || refreshing) && !error && (
        <div className="fixed top-24 right-4 z-40">
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-lg ${
              isDarkMode
                ? "bg-white/10 text-white border border-white/20"
                : "bg-black/5 text-slate-700 border border-black/10"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
            <span>
              {loading ? "Loading studio data" : "Refreshing content"}
            </span>
          </div>
        </div>
      )}

      {/* Hero */}
      <section
        ref={heroSectionRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
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

        {validAlbumId && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden fixed top-20 left-1/2 -translate-x-1/2 z-40 w-4/5"
          >
            <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-3 py-2 mt-4 rounded-full shadow-lg border border-white/20 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FiImage size={16} />
                  <span className="text-sm font-medium">
                    Album ready to view
                  </span>
                </div>
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
          {currentMedia ? (
            currentMedia.media_type === "image" ? (
              <img
                key={currentIndex}
                src={currentMedia.url}
                alt="Robel Studio"
                className="h-full w-full object-cover transition-opacity duration-1000"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  key={currentIndex}
                  src={currentMedia.url || undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                  onLoadedData={() => {
                    if (videoRef.current) {
                      videoRef.current.play().catch(() => {
                        setVideoError(true);
                      });
                    }
                  }}
                  onError={() => setVideoError(true)}
                />
                {videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.play();
                          setVideoError(false);
                        }
                      }}
                      className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-4 text-white hover:bg-white/30 transition-all"
                    >
                      <FiPlay size={24} />
                    </button>
                  </div>
                )}
              </>
            )
          ) : (
            <div
              className={`${
                isDarkMode ? "bg-slate-900" : "bg-slate-200"
              } h-full w-full`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />
        </div>

        {/* Hero Content - Bottom */}
        <div className="absolute bottom-8 left-0 right-0 z-10 text-center px-4 max-w-4xl mx-auto">
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
          {socialLinksForDisplay.map((link, idx) => {
            const IconComponent = resolveSocialIconComponent(
              link.icon,
              link.platform
            );
            const href = link.url || link.href || "#";
            const label =
              link.platform || link.label || `Social Link ${idx + 1}`;
            return (
              <motion.a
                key={`${label}-${href}`}
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
                <IconComponent
                  size={18}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
              </motion.a>
            );
          })}
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
              <p
              className={`max-w-2xl text-lg leading-relaxed mx-auto transition-colors duration-300 ${
                isDarkMode ? "text-slate-400" : "text-slate-700"
              }`}
            >
              Robel Studio is dedicated to capturing authentic moments, real
              emotions, and timeless memories—beautifully preserved for a
              lifetime.
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
                {studioData.content?.about_text &&
                  "At Robel Studio, we believe that every moment tells a story worth preserving. Photography is more than just taking pictures—it’s about capturing genuine emotions, meaningful details, and fleeting moments that become lifelong memories."}
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
                  {stat.number}
                </div>
                <div
                  className={`max-w-2xl text-lg leading-relaxed mx-auto transition-colors duration-300 ${
                    isDarkMode ? "text-slate-400" : "text-slate-700"
                  }`}
                >
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
            <p
              className={`max-w-2xl text-lg leading-relaxed mx-auto transition-colors duration-300 ${
                isDarkMode ? "text-slate-400" : "text-slate-700"
              }`}
            >
              Professional photography services tailored to capture your most
              important moments
            </p>
          </motion.div>

          <div className="space-y-24">
            {studioData.services.map((service, idx) => {
              const ServiceIcon = SERVICE_ICON_MAP[service.icon] || FiCamera;
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
            <p
              className={`max-w-2xl text-lg leading-relaxed mx-auto transition-colors duration-300 ${
                isDarkMode ? "text-slate-400" : "text-slate-700"
              }`}
            >
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

      {/* Video Portfolio - Full Screen Modal */}
      {showAllVideos && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 backdrop-blur-xl flex items-center justify-center p-4 ${
            isDarkMode ? "bg-slate-950/95" : "bg-slate-50/95"
          }`}
          onClick={() => setShowAllVideos(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`relative w-full max-w-7xl mx-auto backdrop-blur-md rounded-2xl border overflow-hidden max-h-[90vh] ${
              isDarkMode
                ? "bg-slate-900/50 border-slate-700/50"
                : "bg-white/90 border-slate-200 shadow-2xl"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`sticky top-0 z-10 backdrop-blur-md border-b p-6 ${
                isDarkMode
                  ? "bg-slate-900/80 border-slate-700/50"
                  : "bg-white/95 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className={`text-xl font-semibold font-display ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Complete Video Portfolio
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Explore our professional video productions across different
                    industries
                  </p>
                </div>
                <button
                  onClick={() => setShowAllVideos(false)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isDarkMode
                      ? "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
              {/* Video Filter Buttons */}
              <div className="flex justify-center gap-3 mb-8 flex-wrap">
                {[
                  { key: "all", label: "All Videos" },
                  ...(studioData.video_categories?.map((cat) => ({
                    key: cat.slug,
                    label: cat.name,
                  })) || []),
                ].map((cat) => (
                  <motion.button
                    key={cat.key}
                    onClick={() => setVideoFilter(cat.key)}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                      videoFilter === cat.key
                        ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-600/25"
                        : isDarkMode
                        ? "bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white hover:shadow-md"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
                    }`}
                  >
                    {cat.label}
                  </motion.button>
                ))}
              </div>

              {/* Video Gallery Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                  {filteredVideos.map((video, idx) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="group cursor-pointer"
                      onClick={() => setSelectedVideo(video)}
                    >
                      {/* Card Container */}
                      <div
                        className={`overflow-hidden rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 ${
                          isDarkMode
                            ? "bg-slate-900 border-slate-800"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        {/* Thumbnail Container */}
                        <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                          {video.thumbnail_url ? (
                            <>
                              <img
                                src={video.thumbnail_url}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                                <FiPlay size={24} className="text-white ml-1" />
                              </div>
                            </div>
                          )}

                          {/* Category Badge */}
                          <div className="absolute top-1 left-3">
                            <span className="text-xs font-medium px-2 py-1 bg-black/70 text-white rounded">
                              {video.category.replace("-", " ").toUpperCase()}
                            </span>
                          </div>

                          {/* Duration Badge */}
                          {video.duration && (
                            <div className="absolute bottom-3 right-3">
                              <span className="text-xs font-medium px-2 py-1 bg-black/70 text-white rounded">
                                {video.duration}
                              </span>
                            </div>
                          )}

                          {/* Play Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-14 h-14 bg-white/90 dark:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <FiPlay
                                size={20}
                                className="text-slate-900 dark:text-white ml-1"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-4">
                          <h4 className={`font-semibold mb-2 line-clamp-2 leading-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                            {video.title}
                          </h4>

                          {/* Metadata */}
                          <div className="flex items-center justify-between text-sm">
                            <div className={`flex items-center gap-4 ${isDarkMode ? "text-slate-400" : "text-slate-700"}`}>
                              {video.views && (
                                <div className="flex items-center gap-1.5">
                                  <FiEye size={14} />
                                  <span>{video.views}</span>
                                </div>
                              )}

                              {video.year && (
                                <div className="flex items-center gap-1.5">
                                  <FiCalendar size={14} />
                                  <span>{video.year}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Loading State */}
                {/* {filteredVideos.length === 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                    {[...Array(8)].map((_, idx) => (
                      <div key={idx} className="animate-pulse">
                        <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                )} */}
                {filteredVideos.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                      Nothing here yet
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      We couldn’t find any matching videos.
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Video Count & CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className={`text-center mt-12 text-sm font-display ${
                  isDarkMode ? "text-white" : "text-slate-700"
                }`}
              >
                {filteredVideos.length} Videos Available
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Video Portfolio */}
      <section
        className={`py-20 transition-colors duration-300 ${
          isDarkMode ? "bg-slate-950" : "bg-white"
        }`}
        id="video-portfolio"
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
                  : "bg-pink-100 border border-pink-200 text-pink-700"
              }`}
            >
              Video Portfolio
            </span>
            <h2
              className={`text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl leading-tight font-display mb-4 transition-colors duration-300 ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Our Cinematic Work
            </h2>
            <p
              className={`max-w-2xl text-lg leading-relaxed mx-auto transition-colors duration-300 ${
                isDarkMode ? "text-slate-400" : "text-slate-700"
              }`}
            >
              Explore our professional video productions across different
              industries. Each video showcases our expertise in cinematic
              storytelling and professional videography.
            </p>
          </motion.div>

          {/* Featured Video Portfolio */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h3
                className={`text-md sm:text-2xl font-bold font-display transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Featured Video Work
              </h3>
              <button
                onClick={() => setShowAllVideos(true)}
                className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-pink-700 transition-all duration-300 hover:scale-105"
              >
                <FiFilm size={16} />
                View All {studioData.videos.length} Videos
              </button>
            </div>

            {/* Featured Video Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {studioData.videos.slice(0, 6).map((video, idx) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  className={`group relative overflow-hidden rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105 cursor-pointer ${
                    isDarkMode
                      ? "bg-slate-800/50 border-slate-700/50"
                      : "bg-slate-50/80 border-slate-200/50 shadow-lg"
                  }`}
                  onClick={() => setSelectedVideo(video)}
                >
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video overflow-hidden rounded-t-2xl">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                        <div className="text-center">
                          <FiPlay
                            size={40}
                            className="text-pink-400 mx-auto mb-2"
                          />
                          <span className="text-sm text-slate-400 font-medium">
                            Demo Video
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all">
                        <FiPlay size={24} className="text-white ml-1" />
                      </div>
                    </div>

                    <div
                      className={`absolute top-4 left-4 bg-gradient-to-r px-3 py-1 rounded-full text-sm font-medium ${
                        isDarkMode
                          ? "from-pink-400 to-purple-400 hover:from-pink-300 hover:to-purple-300"
                          : "from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                      }`}
                    >
                      {video.category.replace("-", " ").toUpperCase()}
                    </div>
                    {video.duration && (
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h4
                      className={`text-lg font-semibold mb-2 font-display transition-colors duration-300 ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {video.title}
                    </h4>
                    <p
                      className={`text-sm leading-relaxed transition-colors duration-300 ${
                        isDarkMode ? "text-slate-300" : "text-slate-600"
                      } line-clamp-3`}
                    >
                      {video.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Main CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <div className="space-y-4">
              <button
                onClick={() => setShowAllVideos(true)}
                className="inline-flex items-center gap-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-pink-600/25 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FiFilm size={20} />
                Explore Full Video Portfolio
                <FiArrowRight size={18} />
              </button>
              <p
                className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Featuring {studioData.videos.length} professional video
                productions
              </p>
            </div>
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
                <a {...primaryCtaProps}>
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

          {contactMethods.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {contactMethods.map((method, idx) => {
                const IconComponent = method.icon || FiLink;
                const interactiveProps = method.href
                  ? {
                      href: method.href,
                      target: method.external ? "_blank" : undefined,
                      rel: method.external ? "noopener noreferrer" : undefined,
                    }
                  : {};

                const Wrapper = method.href ? "a" : "div";

                return (
                  <motion.div
                    key={method.key || method.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    className={`p-6 text-center hover:scale-105 transition-all duration-300 rounded-2xl backdrop-blur-md border ${
                      isDarkMode
                        ? "bg-slate-800/50 border-slate-700/50"
                        : "bg-white/80 border-slate-200/50 shadow-sm"
                    }`}
                  >
                    <div className="w-16 h-16 bg-pink-600/20 rounded-2xl flex items-center justify-center text-pink-400 mx-auto mb-4">
                      <IconComponent size={24} />
                    </div>
                    <h3
                      className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {method.title}
                    </h3>
                    <Wrapper
                      {...interactiveProps}
                      className={`${
                        method.href
                          ? "transition-colors hover:text-pink-400"
                          : ""
                      } ${
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      } whitespace-pre-line`}
                    >
                      {method.value}
                    </Wrapper>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div
              className={`mb-12 p-6 rounded-2xl border text-center text-sm ${
                isDarkMode
                  ? "border-slate-700/50 text-slate-400"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              Contact information will appear here once it is configured.
            </div>
          )}

          {resolvedSocialLinks.length > 0 && (
            <div
              className={`mb-12 rounded-2xl border p-6 flex flex-col gap-4 ${
                isDarkMode
                  ? "border-slate-700/50 bg-slate-800/30"
                  : "border-slate-200 bg-white/80 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-600/15 flex items-center justify-center text-pink-500">
                  <FiLink size={18} />
                </div>
                <div>
                  <p
                    className={`text-sm mb-1 ${
                      isDarkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Connect With Us
                  </p>
                  <p
                    className={`text-base font-semibold ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Social & Messaging Channels
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {resolvedSocialLinks.map((link) => {
                  const IconComponent = resolveSocialIconComponent(
                    link.icon,
                    link.platform
                  );
                  return (
                    <a
                      key={`${link.platform}-${link.id || link.url}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        isDarkMode
                          ? "bg-slate-800/60 text-slate-200 hover:bg-slate-700/60"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <IconComponent size={16} />
                      {link.platform}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

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
                      placeholder="your full name"
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
                      placeholder="youremail@example.com"
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
                      placeholder="+251 911199762"
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
                {formStatus.message && (
                  <p
                    className={`text-sm text-center font-medium ${
                      formStatus.type === "error"
                        ? "text-red-400"
                        : formStatus.type === "success"
                        ? "text-emerald-400"
                        : "text-slate-400"
                    }`}
                  >
                    {formStatus.message}
                  </p>
                )}
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
                  {officeHoursEntries ? (
                    officeHoursEntries.map((entry, idx) => {
                      const [label, ...rest] = entry.split(":");
                      const value = rest.join(":").trim();
                      return (
                        <div
                          key={`${entry}-${idx}`}
                          className={`flex justify-between items-center py-2 border-b last:border-b-0 transition-colors duration-300 ${
                            isDarkMode
                              ? "border-slate-800/50"
                              : "border-slate-200/50"
                          }`}
                        >
                          <span
                            className={`font-medium transition-colors duration-300 ${
                              isDarkMode ? "text-slate-300" : "text-slate-700"
                            }`}
                          >
                            {value ? label : ""}
                          </span>
                          <span
                            className={`font-semibold text-right transition-colors duration-300 ${
                              isDarkMode ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {value || entry}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      <div
                        className={`flex justify-between items-center py-2 border-b transition-colors duration-300 ${
                          isDarkMode
                            ? "border-slate-800/50"
                            : "border-slate-200/50"
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
                    </>
                  )}
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
                  src={mapEmbedUrl}
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
              {socialLinksForFooter.map((link) => {
                const IconComponent = resolveSocialIconComponent(
                  link.icon,
                  link.platform
                );
                return (
                  <a
                    key={`${link.platform}-${link.url}`}
                    href={link.url}
                    title={link.platform}
                    target={link.url.startsWith("http") ? "_blank" : undefined}
                    rel={
                      link.url.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      isDarkMode
                        ? "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50"
                        : "bg-slate-200/50 text-slate-600 hover:text-slate-900 hover:bg-slate-300/50"
                    }`}
                  >
                    <IconComponent size={18} />
                  </a>
                );
              })}
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
          className={`fixed inset-0 z-50 backdrop-blur-xl flex items-center justify-center p-4 ${
            isDarkMode ? "bg-slate-950/95" : "bg-white/95"
          }`}
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className={`absolute top-6 right-6 w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10 ${
              isDarkMode
                ? "bg-slate-800/80 text-white hover:bg-slate-700"
                : "bg-slate-200/80 text-slate-900 hover:bg-slate-300"
            }`}
          >
            <FiX size={20} />
          </button>
          {/* Zoom Display */}
          {viewportWidth >= 768 && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
              <div
                className={`w-16 h-12 backdrop-blur-sm rounded-full flex items-center justify-center ${
                  isDarkMode ? "bg-slate-800/80 text-white" : "bg-slate-200/80 text-slate-900"
                }`}
              >
                <span className="text-sm font-medium">
                  {Math.round(portfolioZoomLevel * 100)}%
                </span>
              </div>
            </div>
          )}
          {filteredImages.length > 1 && viewportWidth >= 768 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className={`absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10 ${
                  isDarkMode
                    ? "text-white hover:bg-slate-700 bg-slate-800/80"
                    : "text-slate-900 hover:bg-slate-300 bg-slate-200/80"
                }`}
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className={`absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10 ${
                  isDarkMode
                    ? "text-white hover:bg-slate-700 bg-slate-800/80"
                    : "text-slate-900 hover:bg-slate-300 bg-slate-200/80"
                }`}
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
            onTouchStart={(e) => {
              e.currentTarget.dataset.touchStart = e.targetTouches[0].clientX;
            }}
            onTouchMove={(e) => {
              e.currentTarget.dataset.touchEnd = e.targetTouches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const start = parseFloat(e.currentTarget.dataset.touchStart);
              const end = parseFloat(e.currentTarget.dataset.touchEnd);
              if (!start || !end) return;
              const distance = start - end;
              const isLeftSwipe = distance > 50;
              const isRightSwipe = distance < -50;
              if (isLeftSwipe && filteredImages.length > 1) nextImage();
              if (isRightSwipe && filteredImages.length > 1) prevImage();
            }}
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
            <div
              className={`absolute -bottom-12 left-1/2 -translate-x-1/2 backdrop-blur-md rounded-full px-4 py-2 ${
                isDarkMode ? "bg-slate-900/80 text-white" : "bg-white/80 text-slate-900"
              }`}
            >
              <span className="text-sm font-medium">
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
          {viewportWidth >= 768 && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
              <div
                className={`w-16 h-12 backdrop-blur-sm rounded-full flex items-center justify-center ${
                  isDarkMode ? "bg-slate-800/80 text-white" : "bg-slate-200/80 text-slate-900"
                }`}
              >
                <span className="text-sm font-medium">
                  {Math.round(zoomLevel * 100)}%
                </span>
              </div>
            </div>
          )}
          {selectedService && selectedService.gallery_images.length > 1 && viewportWidth >= 768 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevServiceImage();
                  setZoomLevel(1);
                }}
                className={`absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10 ${
                  isDarkMode
                    ? "text-white hover:bg-slate-700 bg-slate-800/80"
                    : "text-slate-900 hover:bg-slate-300 bg-slate-200/80"
                }`}
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextServiceImage();
                  setZoomLevel(1);
                }}
                className={`absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10 ${
                  isDarkMode
                    ? "text-white hover:bg-slate-700 bg-slate-800/80"
                    : "text-slate-900 hover:bg-slate-300 bg-slate-200/80"
                }`}
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
            onTouchStart={(e) => {
              e.currentTarget.dataset.touchStart = e.targetTouches[0].clientX;
            }}
            onTouchMove={(e) => {
              e.currentTarget.dataset.touchEnd = e.targetTouches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const start = parseFloat(e.currentTarget.dataset.touchStart);
              const end = parseFloat(e.currentTarget.dataset.touchEnd);
              if (!start || !end) return;
              const distance = start - end;
              const isLeftSwipe = distance > 50;
              const isRightSwipe = distance < -50;
              if (isLeftSwipe && selectedService && selectedService.gallery_images.length > 1) nextServiceImage();
              if (isRightSwipe && selectedService && selectedService.gallery_images.length > 1) prevServiceImage();
            }}
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

      {/* Video Player Modal */}
      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 backdrop-blur-xl flex items-center justify-center p-4 ${
            isDarkMode ? "bg-slate-950/95" : "bg-white/95"
          }`}
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`relative w-full max-w-4xl mx-auto backdrop-blur-md rounded-2xl border overflow-hidden ${
              isDarkMode
                ? "bg-slate-900/50 border-slate-700/50"
                : "bg-white/90 border-slate-200/50"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`sticky top-0 z-10 backdrop-blur-md border-b p-6 ${
                isDarkMode
                  ? "bg-slate-900/80 border-slate-700/50"
                  : "bg-white/95 border-slate-200/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className={`text-xl font-semibold font-display ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {selectedVideo.title}
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {selectedVideo.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isDarkMode
                      ? "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
                      : "bg-slate-200/80 text-slate-700 hover:text-slate-900 hover:bg-slate-300"
                  }`}
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="relative bg-black rounded-xl overflow-hidden">
                <video
                  key={selectedVideo.id || selectedVideo.video_url}
                  ref={selectedVideoPlayerRef}
                  src={selectedVideoSource || undefined}
                  controls
                  playsInline
                  className="w-full aspect-video"
                  poster={selectedVideo.thumbnail_url}
                  preload={shouldLoadSelectedVideo ? "metadata" : "none"}
                >
                  Your browser does not support the video tag.
                  <a
                    href={selectedVideo.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Click here to view the video
                  </a>
                </video>
                {!shouldLoadSelectedVideo && (
                  <button
                    type="button"
                    onClick={handleSelectedVideoPlay}
                    aria-label="Play video"
                    className={`absolute inset-0 flex flex-col items-center justify-center gap-3 font-semibold tracking-wide ${
                      isDarkMode
                        ? "bg-black/60 text-white"
                        : "bg-white/60 text-slate-900"
                    }`}
                  >
                    <div
                      className={`w-16 h-16 rounded-full backdrop-blur-sm flex items-center justify-center ${
                        isDarkMode ? "bg-white/20" : "bg-slate-800/20"
                      }`}
                    >
                      <FiPlay size={28} className="ml-1" />
                    </div>
                    <span>Play Video</span>
                  </button>
                )}
              </div>
              <div className="mt-4 text-center">
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Explore our professional video productions across different
                  industries.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
