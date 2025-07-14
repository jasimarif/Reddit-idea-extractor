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

  useEffect(() => {
    const storedToken =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    if (storedToken) {
      const decoded = jwtDecode(storedToken);
      setUser({
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        memberSince: decoded.memberSince,
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password, rememberMe = false) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await apiRequest.post("/auth/login", {
        email,
        password,
      });
      const token = response.data.token;

      if (rememberMe) {
        localStorage.setItem("auth_token", token);
      } else {
        sessionStorage.setItem("auth_token", token);
      }

      setUser({
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.name,
        memberSince: response.data.user.createdAt,
      });
    } catch (error) {
      throw new Error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email, password, name) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await apiRequest.post("/auth/signup", {
        email,
        password,
        name,
      });

      const token = response.data.token;
      localStorage.setItem("auth_token", token);

      setUser({
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.name,
        memberSince: response.data.user.createdAt,
      });
    } catch (error) {
      throw new Error("Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await apiRequest.post("/auth/logout");
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_token");
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
