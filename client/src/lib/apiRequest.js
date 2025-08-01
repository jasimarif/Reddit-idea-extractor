import axios from "axios";
import { supabase } from "./supabaseClient";

const apiRequest = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:3000") + "/api",
  timeout: 30000,
  withCredentials: true,
});

// Add interceptor to include Supabase JWT in Authorization header
apiRequest.interceptors.request.use(async (config) => {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    // If we have a session, add the access token to the request
    if (session?.access_token) {
      config.headers["Authorization"] = `Bearer ${session.access_token}`;
    }
    
    return config;
  } catch (error) {
    console.error("Error getting Supabase session:", error);
    return Promise.reject(error);
  }
});

// Add response interceptor to handle token refresh
apiRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 (Unauthorized) and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the session
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) throw refreshError;
        
        // Retry the original request with the new token
        originalRequest.headers["Authorization"] = `Bearer ${data.session.access_token}`;
        return apiRequest(originalRequest);
      } catch (refreshError) {
        console.error("Error refreshing session:", refreshError);
        // If refresh fails, redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiRequest;
