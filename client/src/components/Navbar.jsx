import React from 'react';
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-purple-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Reddit Idea Extractor
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/favorites"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/favorites')
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  <span>Favorites</span>
                </Link>

                <Link
                  to="/fetch"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/fetch')
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Trigger fetch</span>
                </Link>

                
                
                {/* More Dropdown for secondary links */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 transition-colors">
                    <span>More</span>
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-white w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/pain-points"><Brain className="h-4 w-4 mr-2" /> Pain Points</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/market-gaps"><TrendingUp className="h-4 w-4 mr-2" /> Market Gaps</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/landing-pages"><Globe className="h-4 w-4 mr-2" /> Landing Pages</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-semibold">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block">{user.name}</span>
                    <ChevronDown className="h-4 w-4" />
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
                      <Link to="/dashboard" className="flex items-center space-x-2 cursor-pointer">
                        <BarChart3 className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to="/favorites" className="flex items-center space-x-2 cursor-pointer">
                        <Heart className="h-4 w-4" />
                        <span>Favorites</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center space-x-2 cursor-pointer">
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
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium !text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
