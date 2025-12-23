import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Sun, Heart, Menu, X, User, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Header({ dark, toggleTheme }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { to: "/albums-app", label: "Albums" },
    ...(isAuthenticated
      ? [
          { to: "/recent_albums", label: "Gallery" },
          // { to: "/dashboard", label: "Dashboard" },
          { to: "/create", label: "Create Album" },
          { to: "/studio-management", label: "Studio Config" },
          ...(user?.is_admin
            ? [{ to: "/register", label: "Register User" }]
            : []),
        ]
      : []),
  ];

  return (
    <>
      <nav
        className={`fixed top-1 xs:top-2 sm:top-3 md:top-4 left-1 xs:left-2 sm:left-3 md:left-4 right-1 xs:right-2 sm:right-3 md:right-4 z-50 transition-all duration-300 ${
          scrolled || (typeof window !== "undefined" && window.innerWidth < 768)
            ? `backdrop-blur-md rounded-lg xs:rounded-xl sm:rounded-2xl shadow-xl ${
                dark
                  ? "bg-white/10 border border-white/20"
                  : "bg-black/10 border border-black/20"
              }`
            : ""
        }`}
      >
        <div className="px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1 xs:gap-2">
              <span
                className={`text-base xs:text-lg sm:text-xl md:text-2xl bg-gradient-to-r transition-all duration-300 ${
                  dark
                    ? "from-pink-400 to-purple-400 hover:from-pink-300 hover:to-purple-300"
                    : "from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                } bg-clip-text text-transparent font-bold`}
                style={{ fontFamily: "Kaushan Script, cursive" }}
              >
                <span>Robel Studio</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 lg:gap-4 xl:gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-xs lg:text-sm font-medium px-2 py-1 rounded transition-colors ${
                    dark
                      ? "text-white/80 hover:text-white"
                      : "text-slate-900/80 hover:text-slate-900"
                  } ${
                    location.pathname === item.to
                      ? dark
                        ? "text-white bg-white/10"
                        : "text-slate-900 bg-black/10"
                      : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-1 xs:gap-2 sm:gap-3">
              {/* Actions */}
              <div className="hidden md:flex items-center gap-3">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="bg-pink-600 text-white px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium hover:bg-pink-700 transition-colors"
                  >
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="bg-pink-600 text-white px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium hover:bg-pink-700 transition-colors"
                  >
                    <span className="hidden lg:inline">Sign In</span>
                    <span className="lg:hidden">Login</span>
                  </Link>
                )}
              </div>

              <button
                onClick={toggleTheme}
                className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors ${
                  dark
                    ? "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                    : "bg-black/10 border border-black/20 text-slate-900 hover:bg-black/20"
                }`}
              >
                {dark ? (
                  <Sun size={16} className="xs:w-[18px] xs:h-[18px]" />
                ) : (
                  <Moon size={16} className="xs:w-[18px] xs:h-[18px]" />
                )}
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`md:hidden w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors ${
                  dark
                    ? "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                    : "bg-black/10 border border-black/20 text-slate-900 hover:bg-black/20"
                }`}
              >
                {isMenuOpen ? (
                  <X size={16} className="xs:w-[18px] xs:h-[18px]" />
                ) : (
                  <Menu size={16} className="xs:w-[18px] xs:h-[18px]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className={`md:hidden transition-all duration-300 border-t backdrop-blur-md rounded-b-lg xs:rounded-b-xl sm:rounded-b-2xl ${
              dark ? "border-white/20 bg-white/5" : "border-black/20 bg-black/5"
            }`}
          >
            <div className="px-2 xs:px-3 sm:px-4 py-3 xs:py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                    dark
                      ? "text-white/80 hover:text-white hover:bg-white/10"
                      : "text-slate-900/80 hover:text-slate-900 hover:bg-black/10"
                  } ${
                    location.pathname === item.to
                      ? dark
                        ? "text-white bg-white/10"
                        : "text-slate-900 bg-black/10"
                      : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-lg text-sm font-medium bg-pink-600 text-white hover:bg-pink-700 transition-colors text-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
      <div className="h-12 xs:h-14 sm:h-16 md:h-18"></div>
    </>
  );
}
