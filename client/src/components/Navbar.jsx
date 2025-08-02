import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, User, LogOut, Heart, BarChart3, ChevronDown, Home, TrendingUp, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 640);
  const menuRef = useRef(null);
  
  // Don't show user menu during auth-related flows
  const isAuthPage = [
    '/reset-password',
    '/forgot-password',
    '/login',
    '/signup',
    '/verify-email'
  ].includes(location.pathname);
  
  const shouldShowUserMenu = user && !isAuthPage;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobileView(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const getUserInitials = (name) => {
    if (!name || typeof name !== 'string') return '??';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={toggleMobileMenu}
        />
      )}
      
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between h-auto sm:h-16">
            <div className="flex items-center justify-between py-2 sm:py-0">
              <Link to="/" className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-purple-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Reddit Idea Extractor
                </span>
              </Link>
              {/* Mobile menu button */}
              <div className="sm:hidden">
                <button
                  onClick={toggleMobileMenu}
                  className="mobile-menu-button inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
                  aria-expanded="false"
                >
                  <span className="sr-only">Open main menu</span>
                  {!isMobileMenuOpen ? (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            <div 
              ref={menuRef}
              className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
                isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
              } sm:relative sm:translate-x-0 sm:shadow-none sm:w-auto sm:flex sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 sm:py-0 sm:px-0`}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 sm:hidden">
                <div className="flex items-center space-x-2">
                  <Brain className="h-8 w-8 text-purple-600" />
                  <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Menu
                  </span>
                </div>
                <button
                  onClick={toggleMobileMenu}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto h-[calc(100%-64px)] sm:p-0 sm:overflow-visible sm:h-auto">
                {shouldShowUserMenu ? (
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/dashboard')
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                      }`}
                    >
                      <Home className="h-4 w-4" />
                      <span>Ideas</span>
                    </Link>

                    <Link
                      to="/favorites"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/favorites')
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                      }`}
                    >
                      <Heart className="h-4 w-4" />
                      <span>Favorites</span>
                    </Link>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 sm:border-t-0 sm:pt-0 sm:mt-0 w-full">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md transition-colors w-full sm:w-auto">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-semibold">
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex items-center justify-between">
                            <span className="text-left">{user.name}</span>
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56 bg-white">
                          <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium leading-none">{user.name}</p>
                              <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </DropdownMenuLabel>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem asChild>
                            <Link to="/profile" className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                              <User className="h-4 w-4" />
                              <span>Profile</span>
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => {
                              handleLogout();
                              setIsMobileMenuOpen(false);
                            }}
                            className="flex items-center space-x-2 cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Log out</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-2 text-sm font-medium !text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 text-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
