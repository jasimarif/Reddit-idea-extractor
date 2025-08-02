import { Link } from "react-router-dom";
import { Brain, TrendingUp, Filter, Heart, Search, Sparkles, BarChart2, Users, Zap, CheckCircle, MessageSquare, ArrowRight } from "lucide-react";

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
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
            <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <Filter className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Smart Categorization
            </h3>
            <p className="text-gray-600 text-center">
              Automatically organize ideas into Health, Wealth, and
              Relationships categories for easy discovery.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
            <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Trending Insights
            </h3>
            <p className="text-gray-600 text-center">
              Get the most upvoted and discussed ideas from popular Reddit
              communities.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
            <div className="bg-pink-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <Heart className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Save Favorites
            </h3>
            <p className="text-gray-600 text-center">
              Bookmark the best ideas and build your personal collection of
              insights.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform Reddit discussions into valuable insights in just a few clicks
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: <Search className="h-6 w-6 text-purple-600" />,
                title: "1. Discover",
                description: "Explore trending discussions across Reddit communities"
              },
              {
                icon: <Sparkles className="h-6 w-6 text-blue-600" />,
                title: "2. Extract",
                description: "Let our AI analyze and extract the most valuable insights"
              },
              {
                icon: <BarChart2 className="h-6 w-6 text-pink-600" />,
                title: "3. Analyze",
                description: "Gain actionable intelligence from the data"
              }
            ].map((step, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-opacity-20 flex items-center justify-center mb-4 mx-auto" 
                     style={{ backgroundColor: `${index === 0 ? 'rgba(147, 51, 234, 0.1)' : index === 1 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(236, 72, 153, 0.1)'}` }}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">{step.title}</h3>
                <p className="text-gray-600 text-center">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="bg-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of users who are already discovering valuable insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Found my next business idea within minutes of using this tool. The insights were incredibly valuable!",
                author: "Alex T.",
                role: "Entrepreneur",
                icon: "💼"
              },
              {
                quote: "As a content creator, this has become my secret weapon for finding trending topics and ideas.",
                author: "Jamie L.",
                role: "Content Creator",
                icon: "✨"
              },
              {
                quote: "The categorization and analysis features saved me hours of manual research. Highly recommend!",
                author: "Taylor R.",
                role: "Market Researcher",
                icon: "📊"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="text-4xl mb-4">{testimonial.icon}</div>
                <p className="text-gray-600 mb-6">"{testimonial.quote}"</p>
                <div className="mt-auto">
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-purple-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
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
