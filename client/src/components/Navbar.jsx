import React, { useState, useEffect, useRef } from "react";
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
  Sparkles,
  Rocket,
  Star,
  Crown,
  Gem,
  Palette,
  Lightbulb,
  Target,
  Trophy,
  Award,
  HomeIcon,
  HeartIcon,
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
        { label: "Contact", id: "footer", icon: Mail },
      ]
    : [];

  // Navigation items for authenticated users (always shown when logged in)
  const authenticatedNavItems = user
    ? [
        { label: "Ideas", path: "/dashboard", icon: Lightbulb },
        { label: "Favorites", path: "/favorites", icon: Heart },
      ]
    : [];

  // Homepage navigation items (only shown on home page)
  const homepageNavItems = isHomePage
    ? [
        { label: "Features", id: "features", icon: Zap },
        { label: "Pricing", id: "pricing", icon: DollarSign },
        { label: "Faqs", id: "Faqs", icon: Clock },
        { label: "Contact", id: "footer", icon: Mail },
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
      <nav className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 hidden md:block mt-3">
        <div className="bg-white backdrop-blur-xl rounded-4xl px-6 py-3 shad border border-gray-200/50">

          <div className="flex items-center justify-between min-w-0 gap-8 relative z-10">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-600  flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300">
                  <Rocket className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">
                  Reddit Idea Extractor
                </span>
              </Link>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-2">
              {shouldShowUserMenu ? (
                // Authenticated user navigation
                <>
                  {authenticatedNavItems.map((item) => {
                    const IconComponent = item.icon;
                    const getIconColor = (path) => {
                      switch (path) {
                        case '/dashboard': return 'text-blue-300';
                        case '/favorites': return 'text-red-300';
                        default: return 'text-white';
                      }
                    };
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                          isActive(item.path)
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <IconComponent className={`h-4 w-4 ${getIconColor(item.path)}`} fill="currentColor" />
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
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                          isActive(item.id)
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
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
                  {publicNavItems.map((item) => {
                    const getIcon = (id) => {
                      switch (id) {
                        case 'features': return <Sparkles className="h-4 w-4 text-yellow-300 drop-shadow-lg" />;
                        case 'pricing': return <Crown className="h-4 w-4 text-purple-300 drop-shadow-lg" />;
                        case 'Faqs': return <Lightbulb className="h-4 w-4 text-blue-300 drop-shadow-lg" />;
                        case 'footer': return <Mail className="h-4 w-4 text-green-300 drop-shadow-lg" />;
                        default: return <Star className="h-4 w-4 text-pink-300 drop-shadow-lg" />;
                      }
                    };

                    return (
                      <Link
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                          isActive(item.id)
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        {getIcon(item.id)}
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </>
              )}
            </div>

            {/* Right side - Auth or CTA */}
            <div className="flex items-center space-x-4">
              {shouldShowUserMenu ? (
                // User dropdown
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                    <Avatar className="h-7 w-7 ring-2 ring-gray-200">
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-sm font-bold">
                        {getUserInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline text-sm font-medium">
                      {user?.name}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
                    <DropdownMenuLabel className="font-semibold">
                      <div className="flex flex-col space-y-1">
                        <p className="text-base font-bold leading-none bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {user?.name}
                        </p>
                        <p className="text-sm leading-none text-gray-600">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator className="bg-gradient-to-r from-purple-200 to-pink-200" />

                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200"
                      >
                        <User className="h-5 w-5 text-purple-500" />
                        <span className="font-medium">Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-gradient-to-r from-purple-200 to-pink-200" />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center space-x-3 cursor-pointer text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // Login/Signup buttons for non-authenticated users
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <button
                    className="px-6 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={() => navigate("/signup")}
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200/50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-md">
              <Rocket className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Reddit Idea Extractor
            </span>
          </Link>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="mobile-menu-button p-2 hover:bg-gray-50 rounded-xl transition-colors duration-200">
                <Menu className="h-6 w-6 text-gray-700" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-white border-l border-gray-200">
              <div className="flex flex-col space-y-6 mt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-md">
                    <Rocket className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
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
                            <IconComponent className="h-5 w-5" fill="currentColor" />
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
