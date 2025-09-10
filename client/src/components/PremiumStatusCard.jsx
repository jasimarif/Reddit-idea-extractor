import React, { useState } from 'react';
import { Crown, Star, Settings, ExternalLink } from 'lucide-react';
import { usePayment } from '../contexts/PaymentContext';
import PremiumModal from './PremiumModal';

const PremiumStatusCard = () => {
  const { isPremium, isLoading, openBillingPortal } = usePayment();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isOpeningBilling, setIsOpeningBilling] = useState(false);

  const handleManageBilling = async () => {
    try {
      setIsOpeningBilling(true);
      await openBillingPortal();
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setIsOpeningBilling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {isPremium ? (
              <Crown className="h-8 w-8 text-yellow-500" />
            ) : (
              <Star className="h-8 w-8 text-gray-400" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isPremium ? 'Premium Account' : 'Free Account'}
              </h3>
              <p className="text-sm text-gray-600">
                {isPremium 
                  ? 'You have access to all premium features' 
                  : 'Upgrade to unlock landing page creation'
                }
              </p>
            </div>
          </div>
          
          {isPremium ? (
            <button
              onClick={handleManageBilling}
              disabled={isOpeningBilling}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Settings className="h-4 w-4" />
              <span>Manage</span>
              {isOpeningBilling && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent"></div>
              )}
            </button>
          ) : (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              <Star className="h-4 w-4" />
              <span>Upgrade</span>
            </button>
          )}
        </div>

        {isPremium && (
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-800">Premium Features Unlocked:</span>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>✓ Unlimited landing page creation</li>
              <li>✓ One-click deployment to Vercel</li>
              <li>✓ Professional templates</li>
              <li>✓ Priority support</li>
            </ul>
          </div>
        )}
      </div>

      <PremiumModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </>
  );
};

export default PremiumStatusCard;
