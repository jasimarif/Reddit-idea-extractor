import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import apiRequest from '../lib/apiRequest';
import { useAuth } from './AuthContext';

const PaymentContext = createContext();

// Initialize Stripe (use test publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const PaymentProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  // Check premium status when user changes
  useEffect(() => {
    if (user) {
      checkPremiumStatus();
    } else {
      setIsPremium(false);
      setIsLoading(false);
    }
  }, [user]);

  const checkPremiumStatus = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest.get('/payments/premium-status');
      setIsPremium(response.data.isPremium);
    } catch (error) {
      console.error('Failed to check premium status:', error);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  const createPaymentSession = async (successUrl, cancelUrl) => {
    try {
      const response = await apiRequest.post('/payments/create-session', {
        successUrl,
        cancelUrl,
      });
      
      if (response.data.success) {
        const stripe = await stripePromise;
        
        // Redirect to Stripe Checkout
        const { error } = await stripe.redirectToCheckout({
          sessionId: response.data.sessionId,
        });
        
        if (error) {
          throw new Error(error.message);
        }
      } else {
        throw new Error(response.data.message || 'Failed to create payment session');
      }
    } catch (error) {
      console.error('Payment session creation error:', error);
      throw error;
    }
  };

  const handlePaymentSuccess = async (sessionId) => {
    try {
      const response = await apiRequest.get(`/payments/success?session_id=${sessionId}`);
      
      if (response.data.success) {
        await checkPremiumStatus(); // Refresh premium status
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Payment success handling error:', error);
      return false;
    }
  };

  const openBillingPortal = async () => {
    try {
      const response = await apiRequest.post('/payments/billing-portal', {
        returnUrl: window.location.origin + '/dashboard',
      });
      
      if (response.data.success) {
        window.open(response.data.url, '_blank');
      } else {
        throw new Error(response.data.message || 'Failed to open billing portal');
      }
    } catch (error) {
      console.error('Billing portal error:', error);
      throw error;
    }
  };

  const value = {
    isPremium,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    createPaymentSession,
    handlePaymentSuccess,
    openBillingPortal,
    checkPremiumStatus,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
