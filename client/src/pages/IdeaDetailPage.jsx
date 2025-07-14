import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, ArrowUp, ExternalLink, Calendar, Tag } from 'lucide-react';
import apiRequest from '../lib/apiRequest';


const categoryColors = {
  Health: 'bg-green-100 text-green-800 border-green-200',
  Wealth: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Relationships: 'bg-pink-100 text-pink-800 border-pink-200'
};

const categoryEmojis = {
  Health: '💊',
  Wealth: '💸',
  Relationships: '❤️'
};

const IdeaDetailPage = () => {
  const { id } = useParams();
  const [idea, setIdea] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const fetchIdea = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest.get(`/ideas/${id}`);
      setIdea(response.data.data);
    } catch (error) {
      console.error('Failed to fetch idea:', error);
      setIdea(null);
    }
    setIsLoading(false);
  };

  fetchIdea();
}, [id]);

  const handleToggleFavorite = () => {
    if (idea) {
      setIdea({ ...idea, isFavorited: !idea.isFavorited });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Idea not found</h2>
          <p className="text-gray-600 mb-4">The idea you're looking for doesn't exist.</p>
          <Link to="/dashboard" className="text-purple-600 hover:text-purple-700 font-medium">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{categoryEmojis[idea.category]}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${categoryColors[idea.category]}`}>
                  {idea.category}
                </span>
              </div>
              <button
                onClick={handleToggleFavorite}
                className={`p-3 rounded-full transition-colors ${
                  idea.isFavorited
                    ? 'text-red-500 hover:text-red-600 bg-red-50'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart className={`h-6 w-6 ${idea.isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {idea.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <ArrowUp className="h-4 w-4" />
                <span>{idea.upvotes} upvotes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>r/{idea.subreddit}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
              <p className="text-gray-700 leading-relaxed mb-8">
                {idea.summary}
              </p>
            </div>

            {/* Tags */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-3">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {idea.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={idea.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 !text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View Original Post</span>
              </a>

              <button
                onClick={handleToggleFavorite}
                className={`flex items-center justify-center space-x-2 px-6 py-3 font-medium rounded-lg border transition-colors ${
                  idea.isFavorited
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Heart className={`h-4 w-4 ${idea.isFavorited ? 'fill-current' : ''}`} />
                <span>{idea.isFavorited ? 'Unfavorite' : 'Add to Favorites'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaDetailPage;
