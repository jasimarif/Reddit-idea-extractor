import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';

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
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${'bg-green-100 text-green-800'}`}>
              r/{idea.category}
            </span>
            {/* {(isRecent() || idea.isNew) && (
              <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                {idea.isNew ? 'New' : 'Recent'}
              </Badge>
            )} */}
          </div>

          <div className="flex items-center space-x-0.5 sm:space-x-1">
            {/* Favorite Button */}
            <button
              onClick={() => onToggleFavorite(idea.id)}
              title={idea.isFavorited ? 'Unfavorite' : 'Favorite'}
              className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                idea.isFavorited
                  ? 'text-red-500 hover:text-red-600 bg-red-50'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`h-4 w-4 sm:h-5 sm:w-5${idea.isFavorited ? ' fill-current' : ''}`} 
                fill={idea.isFavorited ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 leading-tight sm:leading-normal">
          {idea.title}
        </h3>

        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 leading-relaxed">
          {idea.summary}
        </p>

        {/* <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
          {idea.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 text-[10px] sm:text-xs rounded sm:rounded-md hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[80px] sm:max-w-none"
            >
              #{tag}
            </span>
          ))}
          {idea.tags.length > 3 && (
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 text-[10px] sm:text-xs rounded sm:rounded-md">
              +{idea.tags.length - 3}
            </span>
          )}
        </div> */}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center space-x-0.5 sm:space-x-1">
              {/* <span>{idea.upvotes.toLocaleString()}</span> */}
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link
              to={`/idea/${idea.id}`}
              className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors"
            >
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">View</span>
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
