import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowUp, ExternalLink, Eye, Share, Copy, Check } from 'lucide-react';
import { Badge } from './ui/badge';

const categoryColors = {
  Health: 'bg-green-100 text-green-800',
  Wealth: 'bg-yellow-100 text-yellow-800',
  Relationships: 'bg-pink-100 text-pink-800',
};

const categoryEmojis = {
  Health: '💊',
  Wealth: '💸',
  Relationships: '❤️',
};

const IdeaCard = ({ idea, onToggleFavorite }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = (type) => {
    if (type === 'link') {
      const url = `${window.location.origin}/idea/${idea.id}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      window.open(idea.originalUrl, '_blank');
    }
    setShowShareMenu(false);
  };

  const isRecent = () => {
    const ideaDate = new Date(idea.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - ideaDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{categoryEmojis[idea.category]}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[idea.category]}`}>
              {idea.category}
            </span>
            {(isRecent() || idea.isNew) && (
              <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                {idea.isNew ? 'New' : 'Recent'}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 rounded-full transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              >
                <Share className="h-4 w-4" />
              </button>

              {showShareMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  <button
                    onClick={() => handleShare('link')}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                  <button
                    onClick={() => handleShare('reddit')}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Open Reddit</span>
                  </button>
                </div>
              )}
            </div>

            {/* Favorite Button */}
            <button
              onClick={() => onToggleFavorite(idea.id)}
              title={idea.isFavorited ? 'Unfavorite' : 'Favorite'}
              className={`p-2 rounded-full transition-colors ${
                idea.isFavorited
                  ? 'text-red-500 hover:text-red-600 bg-red-50'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`h-5 w-5${idea.isFavorited ? ' fill-current' : ''}`} fill={idea.isFavorited ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {idea.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {idea.summary}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {idea.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
          {idea.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
              +{idea.tags.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <ArrowUp className="h-4 w-4" />
              <span>{idea.upvotes.toLocaleString()}</span>
            </div>
            <span>r/{idea.subreddit}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={`/idea/${idea.id}`}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>View</span>
            </Link>
          </div>
        </div>
      </div>

      {showShareMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
};

export default IdeaCard;
