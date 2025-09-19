import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import apiRequest from '../lib/apiRequest';
import {
  ExternalLink,
  Calendar,
  Globe,
  Eye,
  FileText,
  Trash2,
  AlertCircle,
  Loader2,
  Plus,
  LayoutTemplate,
  Rocket,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

const MyLandingPages = () => {
  const { user } = useAuth();
  const [landingPages, setLandingPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchMyLandingPages();
    } else {
      setLoading(false);
      setError('Please log in to view your landing pages.');
    }
  }, [user]);

  const fetchMyLandingPages = async () => {
    try {
      setLoading(true);

      const response = await apiRequest.get('/landingpages/my-pages');

      setLandingPages(response.data.landingPages || []);
    } catch (err) {
      console.error('Error fetching landing pages:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch landing pages');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'deployed':
        return 'Deployed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'generated':
        return 'Generated';
      case 'draft':
        return 'Draft';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTemplateIcon = (templateId) => {
    switch (templateId) {
      case 'saas':
        return <Rocket className="h-5 w-5" />;
      case 'corporate':
        return <LayoutTemplate className="h-5 w-5" />;
      case 'ecommerce':
        return <Globe className="h-5 w-5" />;
      case 'startup':
        return <Plus className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your landing pages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Landing Pages</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchMyLandingPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e6ebef]">
      {/* Header */}
      <header className="mb-8 relative z-10 pt-32">
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4 animate-fade-in">
              My <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">Landing </span> Pages
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Manage and view all your created landing pages
            </p>
            <div className="mt-6 inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold  border border-white/20  transition-all duration-300 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <FileText className="h-4 w-4 text-white/90" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
                <span className="text-white/95 font-medium">
                  {landingPages.length} page{landingPages.length !== 1 ? 's' : ''} created
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {landingPages.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Landing Pages Yet</h3>
            <p className="text-gray-600 mb-6">
              Start by creating your first landing page from a business idea
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Landing Page</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {landingPages.map((page, index) => {
              const gradients = [
                'from-orange-400 to-red-400',
              ];
              const cardGradient = gradients[index % gradients.length];
              
              return (
                <div
                  key={page._id}
                  className="group relative bg-white/50 rounded-2xl  transition-all duration-500 overflow-hidden  "
                >
                  {/* Gradient Top Border */}
                  <div className={`h-1 bg-gradient-to-r ${cardGradient}`}></div>
                  
                  <div className="p-6 relative">
                    {/* Decorative Background Element */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${cardGradient} opacity-5 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700`}></div>
                    
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6 relative z-10">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${cardGradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                          <div className="text-white">
                            {getTemplateIcon(page.templateId)}
                          </div>
                        </div>
                        <div>
                          <span className={`text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r ${cardGradient} uppercase tracking-wider`}>
                            {page.templateId || 'Default'}
                          </span>
                          <div className="flex items-center space-x-2 mt-2">
                            {getStatusIcon(page.deploymentStatus)}
                            <span className="text-xs font-semibold text-gray-700">
                              {getStatusText(page.deploymentStatus)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-8 relative z-10">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-gray-700 transition-colors leading-tight">
                        {page.headline}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {page.subheadline}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 relative z-10">
                      <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-full">
                        <Calendar className="h-3 w-3" />
                        <span className="font-medium">{formatDate(page.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        {page.landingPageUrl && (
                          <a
                            href={page.landingPageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r ${cardGradient} rounded-xl  transition-all duration-300`}
                            title="View Live Page"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>View Live</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLandingPages;