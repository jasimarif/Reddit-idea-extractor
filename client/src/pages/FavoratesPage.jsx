import React, { useState, useEffect } from "react";
import IdeaCard from "../components/IdeaCard";
import Footer from "../components/Footer";
import { Heart, Search, Brain, Instagram, Linkedin, Youtube, Twitter } from "lucide-react";
import apiRequest from "../lib/apiRequest";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest.get("/favorites", {
          params: { page: 1, limit: 100 },
        });
        const cleanData = Array.isArray(response.data.data)
          ? response.data.data.filter(Boolean)
          : [];
        setFavorites(cleanData);
        setFilteredFavorites(cleanData);
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  useEffect(() => {
    let filtered = favorites;

    if (selectedCategory !== "All") {
      filtered = filtered.filter((idea) => idea.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (idea) =>
          idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.tags?.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    setFilteredFavorites(filtered);
  }, [favorites, selectedCategory, searchTerm]);

  const handleToggleFavorite = async (ideaId) => {
    try {
      // Optimistically update the UI
      const updatedFavorites = favorites.filter(idea => idea._id !== ideaId);
      setFavorites(updatedFavorites);
      setFilteredFavorites(updatedFavorites);
      
      // Make the API call
      await apiRequest.delete(`/favorites/${ideaId}`);
      
      // Refresh the list to ensure everything is in sync
      const response = await apiRequest.get("/favorites", {
        params: { page: 1, limit: 100 },
      });
      const cleanData = Array.isArray(response.data.data)
        ? response.data.data.filter(Boolean)
        : [];
      setFavorites(cleanData);
      setFilteredFavorites(cleanData);
    } catch (err) {
      console.error("Error removing favorite:", err);
      // If there's an error, refetch the current favorites
      const response = await apiRequest.get("/favorites", {
        params: { page: 1, limit: 100 },
      });
      const cleanData = Array.isArray(response.data.data)
        ? response.data.data.filter(Boolean)
        : [];
      setFavorites(cleanData);
      setFilteredFavorites(cleanData);
    }
  };

    // Categories state and fetch logic
    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const response = await apiRequest.get("/ideas/categories");
          // Wrap string categories as objects with a 'name' property for UI compatibility
          const data = response.data?.data || [];
          const normalized = data.map(cat => typeof cat === 'string' ? { name: cat } : cat);
          setCategories(normalized);
        } catch (error) {
          console.error("Failed to fetch categories:", error);
          setCategories([]);
        }
      };
      fetchCategories();
    }, []);

  // Get unique categories from favorites
  const availableCategories = [
    { name: "All" },
    ...categories.filter(cat => 
      favorites.some(idea => idea.category === cat.name)
    )
  ];

  return (
    <div className="min-h-screen bg-[#e6ebef] pt-16 sm:pt-20 momentum-scroll">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        {/* Enhanced Header */}
        <div className="mb-8 sm:mb-12 text-center sm:text-left">
          <div className="inline-flex flex-col sm:flex-row items-center sm:items-start sm:justify-start mt-8">
            <div className="p-2 bg-red-100 rounded-lg sm:rounded-xl mr-0 sm:mr-4 mb-2 sm:mb-0 shadow-inner">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" fill="currentColor" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                Your <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Favorite Ideas</span>  
              </h2>
              <p className="mt-1 text-gray-600 text-sm sm:text-base">
                {window.innerWidth < 640 ? 'All your saved ideas' : 'All your saved ideas in one place • Quickly find what inspired you'}
              </p>
            </div>
          </div>
          
          {/* Beautiful Stats Cards */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
            {/* Total Saved Card */}
            <div className="relative group">
              <div className="absolute  rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Saved</p>
                    <p className="text-3xl font-bold text-gray-900">{favorites.length}</p>
                    <p className="text-xs text-gray-500 mt-1">{favorites.length === 1 ? 'Idea' : 'Ideas'}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Card */}
            <div className="relative group">
              <div className="absolute rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Categories</p>
                    <p className="text-3xl font-bold text-gray-900">{new Set(favorites.map(f => f.category)).size}</p>
                    <p className="text-xs text-gray-500 mt-1">Unique topics</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center ">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Most Popular Category Card */}
            <div className="relative group">
              <div className="absolute  rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Top Category</p>
                    <p className="text-lg font-bold text-gray-900 truncate max-w-[120px]">
                      {(() => {
                        const categoryCounts = favorites.reduce((acc, idea) => {
                          acc[idea.category] = (acc[idea.category] || 0) + 1;
                          return acc;
                        }, {});
                        const topCategory = Object.entries(categoryCounts).sort(([,a], [,b]) => b - a)[0];
                        return topCategory ? topCategory[0] : 'None';
                      })()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Most saved</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center ">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-5 bg-gray-200 rounded-full w-3/4 animate-pulse"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="h-6 bg-gray-100 rounded-full w-16 animate-pulse"></div>
                    <div className="h-6 bg-gray-100 rounded-full w-20 animate-pulse"></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-3 bg-gray-100 rounded w-16 animate-pulse"></div>
                    </div>
                    <div className="h-9 bg-gray-100 rounded-lg w-24 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No favorites yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start exploring ideas and save the ones you find interesting
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 text-sm font-medium !text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Browse Ideas
            </a>
          </div>
        ) : (
          <>
            {/* Filters and Search */}
            <div className="bg-white/40 backdrop-blur-sm rounded-lg sm:rounded-xl  p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-1 sm:mx-0">
                  {availableCategories.map((category) => {
                    const categoryName = category.name || category;
                    return (
                      <button
                        key={categoryName}
                        onClick={() => setSelectedCategory(categoryName === "All" ? "All" : categoryName)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                          selectedCategory === categoryName
                            ? "bg-purple-100 text-purple-700 shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                        }`}
                      >
                        {categoryName}
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-auto sm:min-w-[200px] mt-2 sm:mt-0">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search favorites..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-9 sm:pl-10 pr-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-xs sm:text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 focus:shadow-md"
                  />
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                {filteredFavorites.length} favorite
                {filteredFavorites.length !== 1 ? "s" : ""}
                {selectedCategory !== "All" && ` in ${selectedCategory}`}
              </p>
            </div>

            {/* Ideas Grid */}
            {filteredFavorites.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="text-gray-400 text-base sm:text-lg mb-1.5 sm:mb-2">
                  No favorites found
                </div>
                <p className="text-gray-500 text-sm sm:text-base">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {filteredFavorites.filter(Boolean).map((idea) => (
                  <IdeaCard
                    key={idea._id}
                    idea={{ ...idea, id: idea._id, isFavorited: true }}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default FavoritesPage;
