import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Brain,
  Menu,
  X,
  User,
  LogOut,
  Heart,
  Home,
  ChevronDown,
  Zap,
  DollarSign,
  Clock,
  Mail,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const EnhancedAnimatedNavbar = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const menuRef = useRef(null);

  // Don't show user menu during auth-related flows
  const isAuthPage = [
    "/reset-password",
    "/forgot-password",
    "/login",
    "/signup",
    "/verify-email",
  ].includes(location.pathname);

  const shouldShowUserMenu = user && !isAuthPage;

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !event.target.closest(".mobile-menu-button")
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const getUserInitials = (name) => {
    if (!name || typeof name !== "string") return "??";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if current page is home
  const isHomePage = location.pathname === "/";

  // Navigation items for non-authenticated users (only shown on home page)
  const publicNavItems = isHomePage
    ? [
        { label: "Features", id: "features", icon: Zap },
        { label: "Pricing", id: "pricing", icon: DollarSign },
        { label: "Faqs", id: "Faqs", icon: Clock },
        { label: "Reviews", id: "contact", icon: Mail },
      ]
    : [];

  // Navigation items for authenticated users (always shown when logged in)
  const authenticatedNavItems = user
    ? [
        { label: "Ideas", path: "/dashboard", icon: Home },
        { label: "Favorites", path: "/favorites", icon: Heart },
      ]
    : [];

  // Homepage navigation items (only shown on home page)
  const homepageNavItems = isHomePage
    ? [
        { label: "Features", id: "features", icon: Zap },
        { label: "Pricing", id: "pricing", icon: DollarSign },
        { label: "Faqs", id: "Faqs", icon: Clock },
        { label: "Reviews", id: "contact", icon: Mail },
      ]
    : [];
  return (
    <>
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Navbar */}
      <motion.nav
        className={`fixed top-0 z-50 hidden md:block ${
          scrolled ? "navbar-centered" : ""
        }`}
        initial={false}
        animate={{
          y: 0,
          x: scrolled ? "-50%" : 0,
          left: scrolled ? "50%" : 0,
          width: scrolled ? "auto" : "100%",
          marginTop: scrolled ? "0.5rem" : 0,
        }}
        transition={{
          duration: 2.1,
          ease: [0.23, 1, 0.32, 1], // smoother easing curve
          type: "tween",
        }}
      >
        <motion.div
          className={`${
            scrolled
              ? "bg-white/95 backdrop-blur-xl rounded-full px-4 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-200/50"
              : "bg-transparent px-6 py-2 border-none"
          } transition-all duration-200 ease-out`}
          layout
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="flex items-center justify-between min-w-0 gap-6">
            {/* Logo */}
            <motion.div className="flex items-center space-x-2" layout>
              <Link to="/" className="flex items-center space-x-2">
                <div
                  className={`${
                    scrolled ? "h-6 w-6" : "h-7 w-7"
                  } rounded-lg bg-gray-900 flex items-center justify-center transition-all duration-500`}
                >
                  <Brain
                    className={`${
                      scrolled ? "h-3 w-3" : "h-3.5 w-3.5"
                    } text-white`}
                  />
                </div>
                <span
                  className={`${
                    scrolled ? "text-sm" : "text-base"
                  } font-semibold bg-gray-900 bg-clip-text text-transparent transition-all duration-500 whitespace-nowrap`}
                >
                  Reddit Idea Extractor
                </span>
              </Link>
            </motion.div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {shouldShowUserMenu ? (
                // Authenticated user navigation
                <>
                  {authenticatedNavItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-md font-medium transition-all duration-200 ${
                          isActive(item.path)
                            ? "!text-gray-900"
                            : "!text-gray-900 hover:text-gray-900 hover:bg-gray"
                        }`}
                      >
                        <IconComponent className="h-3.5 w-3.5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}

                  {/* Homepage navigation for authenticated users */}
                  {homepageNavItems.map((item) => {
                    return (
                      <Link
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-md font-medium transition-all duration-200 ${
                          isActive(item.id)
                            ? "!bg-gray-900 !text-gray-900"
                            : "!text-gray-900 hover:text-gray-900 hover:bg-gray"
                        }`}
                      >
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </>
              ) : (
                // Public navigation
                <>
                  {publicNavItems.map((item) => (
                    <Link
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-md font-medium transition-all duration-200 ${
                        isActive(item.id)
                          ? "!bg-gray-900 !text-gray-900"
                          : "!text-gray-900 hover:text-gray-900 hover:bg-gray"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </div>

            {/* Right side - Auth or CTA */}
            <div className="flex items-center space-x-3">
              {shouldShowUserMenu ? (
                // User dropdown
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                    <Avatar
                      className={`${
                        scrolled ? "h-6 w-6" : "h-7 w-7"
                      } transition-all duration-500`}
                    >
                      <AvatarFallback className="bg-gray-200 text-gray-700 text-xs font-semibold">
                        {getUserInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline text-xs">
                      {user?.name}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56 bg-white">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center space-x-2 cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // Login/Signup buttons for non-authenticated users
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-2 py-1 rounded-md "
                  >
                    Login
                  </Link>
                  <motion.button
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-500 ${
                      scrolled
                        ? "bg-gradient-to-r from-gray-900 to-gray-900 text-white hover:from-gray-900 hover:to-gray-900 shadow-md"
                        : "bg-gradient-to-r from-gray-900 to-gray-900 text-white hover:from-gray-900 hover:to-gray-900 shadow-md"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/signup")}
                    layout
                  >
                    Signup
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.nav>

      {/* Mobile Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-sm border-b border-gray-200/50">
        <div className="flex items-center justify-between px-4 py-2.5">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-7 w-7 rounded-lg bg-gray-900 flex items-center justify-center">
              <Brain className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-base font-semibold bg-gray-900 bg-clip-text text-transparent">
              Reddit Idea Extractor
            </span>
          </Link>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="mobile-menu-button p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-white">
              <div className="flex flex-col space-y-6 mt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-7 w-7 rounded-lg bg-gray-900 flex items-center justify-center">
                    <Brain className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-base font-semibold bg-gray-900 bg-clip-text text-transparent">
                    Reddit Idea Extractor
                  </span>
                </div>

                <div className="space-y-2">
                  {shouldShowUserMenu ? (
                    // Authenticated mobile menu
                    <>
                      {authenticatedNavItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center space-x-3 w-full text-left py-2.5 px-3 text-base !font-medium rounded-lg transition-colors ${
                              isActive(item.path)
                                ? "!text-gray-900"
                                : "!text-gray-900 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            <IconComponent className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}

                      {/* Homepage navigation for authenticated users in mobile */}
                      <div className="pt-2 border-t border-gray-100 mt-2">
                        {homepageNavItems.map((item) => {
                          return (
                            <button
                              key={item.id}
                              onClick={() => scrollToSection(item.id)}
                              className="flex items-center space-x-3 w-full text-left py-2.5 px-3 text-base !font-medium !text-gray-900 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-3 border-t border-gray-200 mt-4">
                        <div className="flex items-center space-x-3 px-3 py-2.5 mb-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-gray-200 text-gray-700 text-sm font-semibold">
                              {getUserInitials(user?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user?.email}
                            </p>
                          </div>
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 w-full text-left py-2.5 px-3 text-base !font-medium !text-gray-900 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <User className="h-5 w-5" />
                          <span>Profile</span>
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full text-left py-2.5 px-3 text-base !font-medium !text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    // Public mobile menu
                    <>
                      {publicNavItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className="block w-full text-left py-2.5 px-3 text-base !font-medium !text-gray-900 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}

                      <div className="pt-3 border-t border-gray-200 space-y-2 mt-4">
                        <Link
                          to="/login"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block w-full py-2.5 px-3 font-medium !text-gray-900 hover:text-gray-600 transition-colors text-center border border-gray-300 rounded-lg"
                        >
                          Login
                        </Link>
                        <Link
                          to="/signup"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block w-full py-2.5 px-3 bg-gradient-to-r from-gray-900 to-gray-900 !text-white rounded-lg font-medium hover:from-gray-900 hover:to-gray-900 transition-all text-center"
                        >
                          Sign up
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
};

export default EnhancedAnimatedNavbar;
