import React, { useState } from 'react';
import { Crown, Star, Settings, ExternalLink, Sparkles, Zap, Rocket, Shield, CheckCircle } from 'lucide-react';
import { usePayment } from '../contexts/PaymentContext';
import PremiumModal from './PremiumModal';

const PremiumStatusCard = () => {
  const { isPremium, isLoading, openBillingPortal, isModalOpen, setIsModalOpen } = usePayment();
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
      <div className="w-full bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-3xl shadow-xl border border-white/60 backdrop-blur-xl p-8 animate-pulse">
        <div className="flex items-center space-x-6">
          <div className="h-16 w-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/3"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3"></div>
          </div>
          <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full relative overflow-hidden">
        {/* Background with animated gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 rounded-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-3xl"></div>

        {/* Floating orbs for premium feel */}
        <div className="absolute top-4 right-8 w-20 h-20 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-4 left-8 w-16 h-16 bg-gradient-to-br from-pink-200/30 to-orange-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>

        <div className="relative backdrop-blur-sm border border-white/40 rounded-3xl shadow-2xl p-8 md:p-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left Section - Account Info */}
            <div className="flex items-center space-x-6 flex-1">
              <div className="relative group">
                {isPremium ? (
                  <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                    <Crown className="h-8 w-8 text-white drop-shadow-lg" fill="currentColor" />
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 to-orange-300/20 rounded-3xl animate-pulse"></div>
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-slate-400 via-gray-400 to-zinc-400 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                    <Star className="h-8 w-8 text-white drop-shadow-lg" />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-300/20 to-gray-300/20 rounded-3xl"></div>
                  </div>
                )}

                {/* Premium indicator */}
                {isPremium && (
                  <div className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-3 border-white flex items-center justify-center animate-bounce">
                    <CheckCircle className="h-3 w-3 text-white" fill="currentColor" />
                  </div>
                )}

                {/* Sparkle effects for premium */}
                {isPremium && (
                  <>
                    <div className="absolute -top-1 -left-1 text-yellow-400 animate-ping">
                      <Sparkles className="h-3 w-3" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 text-orange-400 animate-ping delay-500">
                      <Sparkles className="h-2 w-2" />
                    </div>
                  </>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    {isPremium ? 'Premium Account' : 'Free Account'}
                  </h3>
                  {isPremium && (
                    <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full border border-yellow-300/30">
                      <Shield className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-semibold text-yellow-700">Active</span>
                    </div>
                  )}
                </div>

                <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                  {isPremium
                    ? '🎉 Enjoy unlimited access to all premium features and tools'
                    : '🚀 Unlock powerful features to supercharge your business ideas'
                  }
                </p>

                {!isPremium && (
                  <div className="flex items-center space-x-2 mt-3">
                    <Zap className="h-4 w-4 text-blue-500 animate-pulse" />
                    <span className="text-sm text-blue-600 font-medium">Upgrade for just $29.99</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Action Button */}
            <div className="flex-shrink-0">
              {isPremium ? (
                <button
                  onClick={handleManageBilling}
                  disabled={isOpeningBilling}
                  className="group relative flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-white text-gray-800 rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer border border-gray-200/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Settings className="h-5 w-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="font-semibold relative z-10">Manage Billing</span>
                  {isOpeningBilling && (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-600 border-t-transparent relative z-10"></div>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="group relative flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"></div>
                  <Rocket className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                  <span className="font-semibold relative z-10">Upgrade Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
              )}
            </div>
          </div>

          {/* Premium Features Section */}
          {isPremium && (
            <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50/60 via-orange-50/60 to-amber-50/60 backdrop-blur-sm rounded-2xl border border-yellow-200/40 shadow-inner">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg">
                  <Crown className="h-4 w-4 text-white" fill="currentColor" />
                </div>
                <span className="text-lg font-bold text-yellow-800">Premium Features Unlocked</span>
                <div className="flex-1 h-px bg-gradient-to-r from-yellow-300 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: Rocket, text: 'Unlimited landing page creation', color: 'text-blue-600' },
                  { icon: Zap, text: 'One-click deployment to Vercel', color: 'text-purple-600' },
                  { icon: Sparkles, text: 'Professional templates', color: 'text-pink-600' },
                  { icon: Shield, text: 'Priority support', color: 'text-green-600' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl border border-white/30 hover:bg-white/70 transition-all duration-200 group">
                    <div className={`p-2 rounded-lg bg-gradient-to-br from-white to-gray-50 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                      <feature.icon className={`h-4 w-4 ${feature.color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <PremiumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default PremiumStatusCard;
