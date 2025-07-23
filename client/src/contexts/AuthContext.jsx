import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; 
import apiRequest from "../lib/apiRequest";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to get token from storage
  const getStoredToken = () => {
    return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
  };

  // Helper function to set default auth header
  const setDefaultAuthHeader = (token) => {
    if (token) {
      apiRequest.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiRequest.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = getStoredToken();
        
        if (storedToken) {
          // Set default header for all requests
          setDefaultAuthHeader(storedToken);
          
          const response = await apiRequest.get('/auth/me');
          
          if (response.data.success) {
            setUser({
              id: response.data.user.id,
              email: response.data.user.email,
              name: response.data.user.name,
              memberSince: response.data.user.createdAt,
            });
            return;
          }
        }
        
        // If we get here, either no token or invalid token
        localStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_token");
        setDefaultAuthHeader(null);
        setUser(null);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_token");
        setDefaultAuthHeader(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for storage events to sync auth state across tabs
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token' || e.key === null) {
        checkAuth();
      }
    };

    // Listen for custom events for immediate sync
    const handleAuthSync = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-sync', handleAuthSync);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-sync', handleAuthSync);
    };
  }, []);

  const login = async (email, password, rememberMe = false) => {
    setIsLoading(true);
    try {
      const response = await apiRequest.post("/auth/login", {
        email,
        password,
      });
      
      const { token, user } = response.data;
      
      // Always store in localStorage for cross-tab functionality
      // Only use sessionStorage if explicitly requested and user understands limitations
      if (rememberMe || true) { // Force localStorage for better UX
        localStorage.setItem("auth_token", token);
        sessionStorage.removeItem("auth_token"); // Clear session storage
      } else {
        sessionStorage.setItem("auth_token", token);
        localStorage.removeItem("auth_token"); // Clear local storage
      }
      
      // Set default auth header
      setDefaultAuthHeader(token);
      
      // Update the user state
      setUser({
        id: user.id,
        email: user.email,
        name: user.name,
        memberSince: user.createdAt,
      });
      
      // Notify other tabs immediately
      window.dispatchEvent(new CustomEvent('auth-sync'));
      window.dispatchEvent(new Event('storage'));
      
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email, password, name) => {
    setIsLoading(true);
    try {
      const response = await apiRequest.post("/auth/signup", {
        email,
        password,
        name,
      });

      const { token, user } = response.data;
      
      // Store token in localStorage for cross-tab functionality
      localStorage.setItem("auth_token", token);
      sessionStorage.removeItem("auth_token");
      
      // Set default auth header
      setDefaultAuthHeader(token);
      
      // Update the user state
      setUser({
        id: user.id,
        email: user.email,
        name: user.name,
        memberSince: user.createdAt,
      });
      
      // Notify other tabs immediately
      window.dispatchEvent(new CustomEvent('auth-sync'));
      window.dispatchEvent(new Event('storage'));
      
      return user;
    } catch (error) {
      console.error('Signup failed:', error);
      throw new Error(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest.post("/auth/logout");
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with client-side cleanup even if server logout fails
    } finally {
      // Clear tokens from all storage types
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_token");
      
      // Clear default auth header
      setDefaultAuthHeader(null);
      
      // Clear the user state
      setUser(null);
      
      // Notify other tabs immediately
      window.dispatchEvent(new CustomEvent('auth-sync'));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const value = {
    user,
    setUser,
    login,
    signup,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};