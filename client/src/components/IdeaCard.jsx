import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Lightbulb } from "lucide-react";

const IdeaCard = ({ idea, onToggleFavorite }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = (type) => {
    if (type === "link") {
      const url = `${window.location.origin}/idea/${idea.id}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      window.open(idea.originalUrl, "_blank");
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
    <Link to={`/idea/${idea.id}`} className="bg-white/40 backdrop-blur-sm rounded-lg sm:rounded-xl border-l-4 border-l-red-500 border-t border-r border-b border-gray-200 overflow-hidden hover:from-red-50 hover:to-white transition-all duration-300 cursor-pointer block">
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[5px] sm:text-xs font-medium ">
              <a
                href={idea.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 hover:underline hover:brightness-110 transition-all duration-200 ease-in-out"
              >
                r/{idea.subreddit}
              </a>
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
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(idea.id); }}
              title={idea.isFavorited ? "Unfavorite" : "Favorite"}
              className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                idea.isFavorited
                  ? "text-red-500 hover:text-red-600 bg-red-50"
                  : "text-gray-400 hover:text-red-500 hover:bg-red-50"
              }`}
            >
              <Heart
                className={`h-4 w-4 sm:h-5 sm:w-5${
                  idea.isFavorited ? " fill-current" : ""
                }`}
                fill={idea.isFavorited ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 leading-tight sm:leading-normal flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-red-500 flex-shrink-0" />
          {idea.title}
        </h3>

        <p className="text-gray-600 text-xs text-left sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 leading-relaxed">
          {idea.summary}
        </p>
      </div>

      {showShareMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </Link>
  );
};

export default IdeaCard;
