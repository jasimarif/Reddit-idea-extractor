import React, { useState, useEffect } from 'react';
import { X, Star, Check, Crown, Zap } from 'lucide-react';
import { usePayment } from '../contexts/PaymentContext';

const PremiumModal = ({ isOpen, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { createPaymentSession } = usePayment();

  const handleUpgrade = async () => {
    try {
      setIsProcessing(true);
      
      const successUrl = `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/dashboard`;
      
      await createPaymentSession(successUrl, cancelUrl);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to start payment process. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup function to restore scrollbar when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 overflow-hidden">
      <div 
        className="bg-white rounded-2xl max-w-sm w-full max-h-[85vh] overflow-y-auto premium-modal-scroll"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-500" fill="currentColor" />
              <h2 className="text-lg font-bold text-gray-900">Upgrade to Premium</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Hero Section */}
          <div className="text-center mb-4">
            <div className="bg-btn text-white p-3 rounded-xl mb-3">
              <Zap className="h-6 w-6 mx-auto mb-2" />
              <h3 className="text-base font-semibold">Unlock Landing Page Creation</h3>
              <p className="text-xs opacity-90">Create professional landing pages for your business ideas</p>
            </div>
          </div>

          {/* Price */}
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-gray-900 mb-1">$29.99</div>
            <div className="text-xs text-gray-500">One-time payment</div>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-4">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">What you get:</h4>
            {[
              'Unlimited landing page creation',
              'Professional templates',
              'One-click deployment to Vercel',
              
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="w-full bg-btn text-white py-2.5 px-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm cursor-pointer"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Star className="h-4 w-4" />
                  <span>Upgrade Now</span>
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-2.5 px-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm cursor-pointer"
            >
              Maybe Later
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>30-day Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
