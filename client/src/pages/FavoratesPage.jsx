import React, { useState, useEffect } from "react";
import IdeaCard from "../components/IdeaCard";
import { Heart, Search } from "lucide-react";
import apiRequest from "../lib/apiRequest";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchFavorites = async () => {
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
      await apiRequest.delete(`/favorites/${ideaId}`);
      // Refetch favorites from backend to ensure sync
      const response = await apiRequest.get("/favorites", {
        params: { page: 1, limit: 100 },
      });
      setFavorites(response.data.data || []);
      setFilteredFavorites(response.data.data || []);
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  const categories = ["All", "Health", "Wealth", "Relationships"];
  const availableCategories = categories.filter(
    (cat) => cat === "All" || favorites.some((idea) => idea.category === cat)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Heart className="h-8 w-8 text-red-500 fill-current" />
            <h1 className="text-3xl font-bold text-gray-900">Your Favorites</h1>
          </div>
          <p className="text-gray-600">
            Ideas you've bookmarked for future reference
          </p>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
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
                  {availableCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? "bg-purple-100 text-purple-700 border border-purple-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
                      }`}
                    >
                      {category === "Health" && "💊 "}
                      {category === "Wealth" && "💸 "}
                      {category === "Relationships" && "❤️ "}
                      {category}
                    </button>
                  ))}
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
