import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase, onAuthStateChange } from "../lib/supabaseClient";

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
  const [session, setSession] = useState(null);

  // Format user data from Supabase session
  const formatUserData = useCallback((session) => {
    if (!session?.user) return null;
    
    const { user } = session;
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email.split('@')[0],
      memberSince: user.created_at,
      avatar: user.user_metadata?.avatar_url,
      emailVerified: user.email_confirmed_at || user.confirmed_at || false
    };
  }, []);

  // Update user state when session changes
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession ? formatUserData(initialSession) : null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);
      setUser(session ? formatUserData(session) : null);
      
      // Handle token refresh
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        // Update API client with new token if needed
        if (session?.access_token) {
          // You can update your API client headers here if needed
          // apiRequest.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [formatUserData]);

  const login = async (email, password, rememberMe = false) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        throw new Error(error.message || 'Login failed. Please check your credentials.');
      }
      
      // Set persistence based on user's remember me preference
      if (rememberMe) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
      
      return formatUserData(data.session);
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email, password, name) => {
    try {
      setIsLoading(true);
      
      // First, sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            avatar: ''
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
          emailConfirm: true
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        // Handle specific error cases
        if (error.message.includes('already registered')) {
          throw new Error('This email is already registered. Please sign in instead.');
        }
        throw new Error(error.message || 'Signup failed. Please try again.');
      }
      
      // Check if email is already registered
      if (data.user?.identities?.length === 0) {
        throw new Error('This email is already registered. Please sign in instead.');
      }
      
      // If we're in development, log the user in automatically for easier testing
      const isDevelopment = import.meta.env.DEV;
      if (isDevelopment && data.user) {
        await supabase.auth.signInWithPassword({
          email,
          password
        });
      }
      
      // Save user to your database
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            name,
            supabaseUserId: data.user.id,
            emailVerified: false // Will be updated after email verification
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to save user to database:', errorData);
          // Don't throw here, as the auth user was created successfully
          // The user can still verify their email and we'll handle the database sync later
        }
      } catch (dbError) {
        console.error('Error saving user to database:', dbError);
        // Continue even if database save fails, as the auth user was created
      }
      
      // If we get here, the signup was successful
      return {
        ...formatUserData(data),
        requiresEmailConfirmation: !data.session // If no session, email needs confirmation
      };
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      
      // Clear any stored session data
      setUser(null);
      setSession(null);
      
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to log out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password reset functionality
  const resetPassword = async (email) => {
    try {
      setIsLoading(true);
      const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
      const redirectUrl = new URL(`/reset-password?type=recovery&email=${encodeURIComponent(email)}`, frontendUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl.toString()
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update user password
  const updatePassword = async (newPassword) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      // Use environment variable with fallback to current origin for local development
      const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
      const redirectUrl = new URL('/dashboard', frontendUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl.toString(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false,
        },
      });
      
      if (error) {
        console.error('Google OAuth error details:', error);
        throw error;
      }
      
      // No need to return data or navigate here as Supabase will handle the redirect
      return;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};