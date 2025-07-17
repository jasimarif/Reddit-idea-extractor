import React, { useState, useEffect } from "react";
import IdeaCard from "../components/IdeaCard";
import { Heart, Search, Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-12 text-center lg:text-left">
          <div className="inline-flex items-center justify-center lg:justify-start bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-sm border border-gray-100 mb-4">
            <div className="p-2.5 bg-pink-100 rounded-xl mr-4 shadow-inner">
              <Heart className="h-8 w-8 text-pink-600" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Your Favorite Ideas
              </h1>
              <p className="mt-1.5 text-gray-600 text-sm md:text-base">
                All your saved ideas in one place
                <span className="hidden sm:inline"> • Quickly find what inspired you</span>
              </p>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-5 py-3 shadow-sm border border-gray-100 flex items-center">
              <div className="p-1.5 bg-blue-100 rounded-lg mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Saved</p>
                <p className="text-lg font-semibold text-gray-800">{favorites.length} {favorites.length === 1 ? 'Idea' : 'Ideas'}</p>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-5 py-3 shadow-sm border border-gray-100 flex items-center">
              <div className="p-1.5 bg-purple-100 rounded-lg mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Categories</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Set(favorites.map(f => f.category)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading your favorite ideas...</p>
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
              className="inline-flex items-center px-6 py-3 text-sm font-medium !text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              Browse Ideas
            </a>
          </div>
        ) : (
          <>
            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((category) => {
                    const categoryName = category.name || category;
                    return (
                      <button
                        key={categoryName}
                        onClick={() => setSelectedCategory(categoryName === "All" ? "All" : categoryName)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedCategory === categoryName
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
                        }`}
                      >
                        {categoryName === "Health" && "💊 "}
                        {categoryName === "Wealth" && "💸 "}
                        {categoryName === "Relationships" && "❤️ "}
                        {categoryName}
                      </button>
                    );
                  })}
                </div>

                {/* Search */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search favorites..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* Favorites Grid */}
            {filteredFavorites.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">
                  No favorites found
                </div>
                <p className="text-gray-500">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
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
    </div>
  );
};

export default FavoritesPage;
