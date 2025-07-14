import apiRequest from "../lib/apiRequest";
import React, { useState, useEffect } from "react";
import IdeaCard from "../components/IdeaCard";
import {
  Filter,
  Search,
  RefreshCw,
  ChevronDown,
  Info,
  ChevronUp,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";

const DashboardPage = () => {
  const [ideas, setIdeas] = useState([]);
  const [totalIdeas, setTotalIdeas] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("upvotes");
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCategoryInfo, setShowCategoryInfo] = useState(false);
  const itemsPerPage = 6;
  const [favoriteIds, setFavoriteIds] = useState([]);

  // Tags state and fetch logic
  const [allTags, setAllTags] = useState([]);
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await apiRequest.get("/ideas/tags");
        setAllTags(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch tags:", error);
        setAllTags([]);
      }
    };
    fetchTags();
  }, []);

  // Fetch favorite IDs on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await apiRequest.get("/favorites", { params: { page: 1, limit: 1000 } });
        const ids = (response.data.data || []).map(fav => fav._id || fav.id);
        setFavoriteIds(ids);
      } catch (error) {
        setFavoriteIds([]);
      }
    };
    fetchFavorites();
  }, []);

  const fetchIdeas = async () => {
    setIsLoading(true);
    try {
      const favResponse = await apiRequest.get("/favorites", { params: { page: 1, limit: 1000 } });
      const ids = (favResponse.data.data || []).map(fav => fav._id || fav.id);
      setFavoriteIds(ids);
  
      const params = {};
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;
      if (selectedTags.length > 0) params.tags = selectedTags.join(",");
      params.page = currentPage;
      params.limit = itemsPerPage;
  
      const response = await apiRequest.get("/ideas", { params });
      let fetchedIdeas = response.data.data || [];
  
      fetchedIdeas = fetchedIdeas.map(idea => ({
        ...idea,
        isFavorited: ids.includes(idea._id),
      }));
  
      if (sortBy === "upvotes") {
        fetchedIdeas = [...fetchedIdeas].sort((a, b) => b.upvotes - a.upvotes);
      } else if (sortBy === "newest") {
        fetchedIdeas = [...fetchedIdeas].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortBy === "oldest") {
        fetchedIdeas = [...fetchedIdeas].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }
  
      setIdeas(fetchedIdeas);
      setTotalIdeas(response.data.pagination?.totalItems || fetchedIdeas.length);
    } catch (error) {
      console.error("Failed to fetch ideas:", error);
      setIdeas([]);
      setTotalIdeas(0);
    } finally {
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    fetchIdeas();
    // eslint-disable-next-line
  }, [selectedCategory, searchTerm, sortBy, selectedTags, currentPage]);

  const handleToggleFavorite = async (ideaId) => {
    const idea = ideas.find((idea) => idea._id === ideaId);
    if (!idea) return;

    const newFavoriteStatus = !idea.isFavorited;
    const prevIdeas = [...ideas];

    // Optimistically update the UI
    setIdeas((prev) =>
      prev.map((idea) =>
        idea._id === ideaId ? { ...idea, isFavorited: newFavoriteStatus } : idea
      )
    );

    try {
      if (newFavoriteStatus) {
        await apiRequest.post(`/favorites/${ideaId}`);
      } else {
        await apiRequest.delete(`/favorites/${ideaId}`);
      }
      // Refetch favorites and ideas to ensure sync
      const response = await apiRequest.get("/favorites", { params: { page: 1, limit: 1000 } });
      const ids = (response.data.data || []).map(fav => fav._id || fav.id);
      setFavoriteIds(ids);
      await fetchIdeas();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert UI if the request fails
      setIdeas(prevIdeas);
    }
  };

  const handleRefreshIdeas = async () => {
    await fetchIdeas();
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
  };

  const categories = ["All", "Health", "Wealth", "Relationships"];
  const totalPages = Math.max(1, Math.ceil(totalIdeas / itemsPerPage));
  const currentIdeas = ideas;

  const categoryInfo = {
    Health:
      "Mental health, fitness, wellness, medical advice, and lifestyle improvements",
    Wealth:
      "Personal finance, entrepreneurship, side businesses, career advice, and financial planning",
    Relationships:
      "Dating, marriage, family dynamics, parenting, and social connections",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Idea Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Discover and organize the best ideas from Reddit communities
              </p>
            </div>
            <button
              onClick={handleRefreshIdeas}
              disabled={isLoading}
              className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh Ideas</span>
            </button>
          </div>
        </div>

        {/* About Categories Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <button
            onClick={() => setShowCategoryInfo(!showCategoryInfo)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-900">
                About Categories
              </span>
            </div>
            {showCategoryInfo ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {showCategoryInfo && (
            <div className="mt-4 space-y-3">
              {Object.entries(categoryInfo).map(([category, description]) => (
                <div key={category} className="flex items-start space-x-3">
                  <span className="text-lg">
                    {category === "Health" && "💊"}
                    {category === "Wealth" && "💸"}
                    {category === "Relationships" && "❤️"}
                  </span>
                  <div>
                    <h4 className="font-medium text-gray-900">{category}</h4>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search and Sort */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search ideas, content, or tags..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Sort by:
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upvotes">Most Upvotes</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            {/* Category Filters */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Categories:
              </span>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
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
            </div>

            {/* Tag Filters */}
            <div className="flex items-start space-x-2">
              <span className="text-sm font-medium text-gray-700 mt-1">
                Popular Tags:
              </span>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 12).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            {(selectedTags.length > 0 ||
              selectedCategory !== "All" ||
              searchTerm) && (
              <div className="flex items-center space-x-2 pt-2 border-t">
                <span className="text-sm font-medium text-gray-700">
                  Active filters:
                </span>
                {selectedCategory !== "All" && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory("All")}
                  >
                    {selectedCategory} ×
                  </Badge>
                )}
                {searchTerm && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setSearchTerm("")}
                  >
                    "{searchTerm}" ×
                  </Badge>
                )}
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag)}
                  >
                    #{tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {currentIdeas.length} of {totalIdeas} ideas
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Ideas Grid */}
        {currentIdeas.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <div className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || selectedTags.length > 0
                ? "No matching ideas found"
                : "No ideas available"}
            </div>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedTags.length > 0
                ? "Try adjusting your search terms or filters to find more ideas."
                : "Check back later for new ideas from Reddit communities."}
            </p>
            {(searchTerm ||
              selectedTags.length > 0 ||
              selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedTags([]);
                  setSelectedCategory("All");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {currentIdeas.map((idea) => (
              <IdeaCard
                key={idea._id}
                idea={{
                  id: idea._id,
                  title: idea.title,
                  summary: idea.summary,
                  category: idea.category || idea.topic,
                  tags: idea.tags || [],
                  upvotes: idea.upvotes,
                  subreddit: idea.subreddit,
                  originalUrl: idea.url,
                  isFavorited: idea.isFavorited,
                  createdAt: idea.createdAt || idea.postDate,
                }}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === page
                    ? "text-white bg-purple-600 border border-purple-600"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
