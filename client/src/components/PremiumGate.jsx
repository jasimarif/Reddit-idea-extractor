import React from 'react';
import { Lock, Crown, Star } from 'lucide-react';
import { usePayment } from '../contexts/PaymentContext';
import PremiumModal from './PremiumModal';

const PremiumGate = ({ children, feature = "this feature" }) => {
  const { isPremium, isLoading, isModalOpen, setIsModalOpen } = usePayment();

  if (isLoading) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>
        </div>
        <div className="opacity-30">{children}</div>
      </div>
    );
  }

  if (isPremium) {
    return children;
  }

  return (
    <>
      <div className="relative">
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 bg-opacity-95 flex flex-col items-center justify-center rounded-lg z-10 backdrop-blur-sm">
          <div className="text-center p-6">
            <div className="mb-4">
              <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Premium Feature</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upgrade to unlock {feature}
              </p>
            </div>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Star className="h-4 w-4" />
              <span>Upgrade to Premium</span>
            </button>
          </div>
        </div>
        
        {/* Blurred content */}
        <div className="filter blur-sm opacity-50 pointer-events-none">
          {children}
        </div>
      </div>

      <PremiumModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default PremiumGate;
