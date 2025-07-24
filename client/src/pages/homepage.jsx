import { Link } from "react-router-dom";
import { Brain, TrendingUp, Filter, Heart } from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="mb-8">
              <Brain className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                Reddit Idea Extractor
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover and organize the best ideas from Reddit communities.
                Extract insights from Health, Wealth, and Relationship
                discussions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                to="/dashboard"
                className="px-8 py-4 text-lg font-semibold !text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Browse Ideas
              </Link>

            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Reddit Idea Extractor?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform scattered Reddit discussions into organized, actionable
            insights
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <Filter className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Smart Categorization
            </h3>
            <p className="text-gray-600">
              Automatically organize ideas into Health, Wealth, and
              Relationships categories for easy discovery.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Trending Insights
            </h3>
            <p className="text-gray-600">
              Get the most upvoted and discussed ideas from popular Reddit
              communities.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="bg-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Save Favorites
            </h3>
            <p className="text-gray-600">
              Bookmark the best ideas and build your personal collection of
              insights.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Preview */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore by Category
            </h2>
            <p className="text-xl text-gray-600">
              Discover ideas across three key areas of life
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 transition-all duration-300">
              <div className="text-4xl mb-4">💊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Health
              </h3>
              <p className="text-gray-600 text-sm">
                Mental health, fitness, chronic conditions, and wellness tips
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-100 hover:from-yellow-100 hover:to-amber-200 transition-all duration-300">
              <div className="text-4xl mb-4">💸</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Wealth
              </h3>
              <p className="text-gray-600 text-sm">
                Personal finance, entrepreneurship, careers, and business ideas
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-100 hover:from-pink-100 hover:to-rose-200 transition-all duration-300">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Relationships
              </h3>
              <p className="text-gray-600 text-sm">
                Dating, parenting, family dynamics, and social connections
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
