import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Plus, ChevronDown, ChevronUp, Users, DollarSign, Target, TrendingUp, Building2, Lock } from 'lucide-react';
import PremiumModal from './PremiumModal';
import { usePayment } from '../contexts/PaymentContext';
const BusinessIdeasGrid = ({ businessIdeas, isGeneratingIdeas }) => {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const { isPremium, isModalOpen, setIsModalOpen, landingPageUsage } = usePayment();

  const toggleExpanded = (ideaId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(ideaId)) {
      newExpanded.delete(ideaId);
    } else {
      newExpanded.add(ideaId);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <>
      <div>
        {isGeneratingIdeas ? (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-9 bg-gray-200 rounded-lg w-36 animate-pulse"></div>
            </div>

            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm w-full"
                >
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded-lg w-full mt-4 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : businessIdeas.length > 0 ? (
          <div className="space-y-6">
            {businessIdeas.map((businessIdea, index) => {
              const isExpanded = expandedItems.has(businessIdea.id);
              return (
                <div
                  key={businessIdea.id}
                  className="bg-white rounded-2xl  transition-all duration-300 group relative w-full overflow-hidden border border-gray-100/50"
                >
                  {/* Plus icon and text for creating landing page */}
                  {isPremium ? (
                    <Link
                      to={`/templates/${businessIdea.id || businessIdea._id}`}
                      className="absolute top-4 right-4 flex items-center space-x-1 px-3 py-1.5 rounded-md transition-colors text-xs z-10 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800"
                      title="Create landing page"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Landing Page</span>
                    </Link>
                  ) : landingPageUsage.limitReached ? (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="absolute top-4 right-4 flex items-center space-x-1 px-3 py-1.5 rounded-md transition-colors text-xs z-10 bg-gray-500 text-white cursor-pointer"
                      title="Upgrade to create more landing pages"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Limit Reached - Upgrade</span>
                    </button>
                  ) : (
                    <Link
                      to={`/templates/${businessIdea.id || businessIdea._id}`}
                      className="absolute top-4 right-4 flex items-center space-x-1 px-3 py-1.5 rounded-md transition-colors text-xs bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-800 z-10"
                      title={`Create landing page (${landingPageUsage.remaining} remaining)`}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Landing Page</span>
                    </Link>
                  )}

                  <div className="p-6">
                    {/* Always visible content */}
                    <div className="space-y-5">
                      {/* Header with Score and Create Landing Page */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-left">
                          <div className="flex items-center space-x-2 bg-btn text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                            <Target className="h-3.5 w-3.5" />
                            <span>Score: {businessIdea.feasibilityScore || businessIdea.score || "N/A"}</span>
                          </div>
                          <div className="flex items-center space-x-2 bg-teal-600 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105">
                            <span>{businessIdea.businessModel || "SaaS"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-blue-900 transition-colors duration-200 text-left">
                          {businessIdea.ideaName || businessIdea.title}
                        </h3>

                        {/* Description */}
                        <div className="bg-gray-50/30 backdrop-blur-sm rounded-xl p-4 border border-gray-100 ">
                          <p className="text-gray-700 text-base leading-relaxed text-left">
                            {businessIdea.description || businessIdea.solutionOverview}
                          </p>
                        </div>
                      </div>

                      {/* Keywords and Expand Button */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-wrap gap-2 text-left">
                          {businessIdea.keywords
                            ?.slice(0, 4)
                            .map((keyword, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-medium  "
                              >
                                #{keyword}
                              </span>
                            ))}
                        </div>
                        <button
                          onClick={() => toggleExpanded(businessIdea.id)}
                          className="flex items-center space-x-2 text-xs font-medium cursor-pointer text-blue-600 hover:text-blue-700 transition-all duration-200 focus:outline-none focus:ring-0 focus:border-none active:border-none active:outline-none border-none bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg"
                          style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                        >
                          <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable content */}
                    <div
                      className={`transition-all duration-500 ease-in-out overflow-hidden ${
                        isExpanded ? 'max-h-[3000px] opacity-100 mt-6' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="border-t border-gray-100 pt-6 space-y-6">
                        {/* Key Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Target Audience */}
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100/50 transition-all duration-200 text-left">
                            <div className="flex items-center space-x-2 mb-2">
                              <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              <h4 className="text-sm font-semibold text-gray-900">
                                Target Audience
                              </h4>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {businessIdea.targetAudience || "N/A"}
                            </p>
                          </div>

                          {/* Revenue Streams */}
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100/50 transition-all duration-200 text-left">
                            <div className="flex items-center space-x-2 mb-2">
                              <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <h4 className="text-sm font-semibold text-gray-900">
                                Revenue Streams
                              </h4>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {businessIdea.revenueStreams?.join(", ") || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Key Features */}
                        {businessIdea.keyFeatures?.length > 0 && (
                          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-100/50 transition-all duration-200 text-left">
                            <div className="flex items-center space-x-2 mb-3">
                              <Lightbulb className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <h4 className="text-base font-semibold text-gray-900">
                                Key Features
                              </h4>
                            </div>
                            <ul className="space-y-2">
                              {businessIdea.keyFeatures
                                .slice(0, 3)
                                .map((feature, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start space-x-2 text-gray-700 text-sm leading-relaxed"
                                  >
                                    <span className="text-amber-500  flex-shrink-0">•</span>
                                    <span>{feature}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}

                        {/* Implementation Steps */}
                        {businessIdea.implementationSteps?.length > 0 && (
                          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-100/50 transition-all duration-200 text-left">
                            <div className="flex items-center space-x-2 mb-3">
                              <Target className="h-5 w-5 text-purple-600 flex-shrink-0" />
                              <h4 className="text-base font-semibold text-gray-900">
                                Implementation Steps
                              </h4>
                            </div>
                            <ul className="space-y-2">
                              {businessIdea.implementationSteps
                                .slice(0, 3)
                                .map((step, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start space-x-2 text-gray-700 text-sm leading-relaxed"
                                  >
                                    <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0">{idx + 1}</span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}

                        {/* Potential Challenges */}
                        {businessIdea.potentialChallenges?.length > 0 && (
                          <div className="bg-gradient-to-br from-red-50 to-pink-50 p-5 rounded-xl border border-red-100/50 transition-all duration-200 text-left">
                            <div className="flex items-center space-x-2 mb-3">
                              <TrendingUp className="h-5 w-5 text-red-600 flex-shrink-0" />
                              <h4 className="text-base font-semibold text-gray-900">
                                Potential Challenges
                              </h4>
                            </div>
                            <ul className="space-y-2">
                              {businessIdea.potentialChallenges
                                .slice(0, 3)
                                .map((challenge, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start space-x-2 text-gray-700 text-sm leading-relaxed"
                                  >
                                    <span className="text-red-500  flex-shrink-0">⚠</span>
                                    <span>{challenge}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}

                        {/* Success Metrics and UVP */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Success Metrics */}
                          <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-100/50 transition-all duration-200 text-left">
                            <div className="flex items-center space-x-2 mb-2">
                              <TrendingUp className="h-4 w-4 text-gray-600 flex-shrink-0" />
                              <h4 className="text-sm font-semibold text-gray-900">
                                Success Metrics
                              </h4>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {businessIdea.successMetrics?.join(", ") || "N/A"}
                            </p>
                          </div>

                          {/* Unique Value Proposition */}
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100/50 transition-all duration-200 text-left">
                            <div className="flex items-center space-x-2 mb-2">
                              <Lightbulb className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <h4 className="text-sm font-semibold text-gray-900">
                                Unique Value Proposition
                              </h4>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {businessIdea.uniqueValueProposition?.join(", ") || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Use Case */}
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-100/50 transition-all duration-200 text-left">
                          <div className="flex items-center space-x-2 mb-3">
                            <Users className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            <h4 className="text-base font-semibold text-gray-900">
                              Use Case
                            </h4>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {businessIdea.useCase || "N/A"}
                          </p>
                        </div>

                        {/* Differentiator */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100/50 transition-all duration-200 text-left">
                          <div className="flex items-center space-x-2 mb-3">
                            <Target className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                            <h4 className="text-base font-semibold text-gray-900">
                              Differentiator
                            </h4>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {businessIdea.differentiator || "N/A"}
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-100 text-left">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
                              AI Generated
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
                            {new Date(
                              businessIdea.updatedAt || businessIdea.createdAt
                            ).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl p-8 shadow-sm text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent/20 border-t-accent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-accent animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Loading Solutions...
                </h3>
                <p className="text-muted-foreground text-sm">
                  Please wait while fetching business ideas
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <PremiumModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        limitReached={landingPageUsage.limitReached}
      />
    </>
  );
};

export default BusinessIdeasGrid;
