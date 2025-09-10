import apiRequest from "../lib/apiRequest";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, RefreshCw, Calendar, ExternalLink, Heart, Brain, Instagram, Linkedin, Youtube, Twitter, Filter, Sparkles, TrendingUp, Zap, Rocket, Layers } from "lucide-react";
import { FaBrain } from "react-icons/fa";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import Footer from "../components/Footer";
import PremiumStatusCard from "../components/PremiumStatusCard";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const DashboardPage = () => {
  const [ideas, setIdeas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('rankScore');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalIdeas, setTotalIdeas] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6; // Use server-side pagination instead of fetching all
  
  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch categories only once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiRequest.get("/ideas/categories");
        const data = response.data?.data || [];
        const normalized = data.map((cat) =>
          typeof cat === "string" ? { name: cat } : cat
        );
        setCategories(normalized);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch favorites only once on mount and when needed
  const fetchFavorites = useCallback(async () => {
    try {
      const response = await apiRequest.get("/favorites", {
        params: { page: 1, limit: 1000 },
      });
      const ids = (response.data.data || []).map((fav) => fav._id || fav.id);
      setFavoriteIds(ids);
      return ids;
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      setFavoriteIds([]);
      return [];
    }
  }, []);

  // Main ideas fetching function - now uses server-side pagination
  const fetchIdeas = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);

    setIdeas([])

    try {
      // Build query parameters
      const params = {
        page,
        limit: itemsPerPage,
      };

      // Add filters
      if (selectedCategories.length > 0) {
        params.category = selectedCategories.join(",");
      }
      if (debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm.trim();
      }
      if (selectedTags.length > 0) {
        params.tags = selectedTags.join(",");
      }

      
      
      // Fetch ideas with server-side pagination
      const [ideasResponse, fetchedFavoriteIds] = await Promise.all([
        apiRequest.get("/ideas", { params }),
        favoriteIds.length === 0 ? fetchFavorites() : Promise.resolve(favoriteIds)
      ]);
      
      // Use the fetched favorite IDs
      const currentFavoriteIds = fetchedFavoriteIds || [];

      

      if (ideasResponse.data.success) {
        let fetchedIdeas = Array.isArray(ideasResponse.data.data)
          ? ideasResponse.data.data.filter(Boolean)
          : [];

        // Apply client-side sorting if needed (server should handle this ideally)
        if (sortBy === "rankScore") {
          fetchedIdeas = [...fetchedIdeas].sort(
            (a, b) => (b.rankScore || 0) - (a.rankScore || 0)
          );
        } else if (sortBy === "newest") {
          fetchedIdeas = [...fetchedIdeas].sort(
            (a, b) => new Date(b.postDate || b.createdAt || 0) - new Date(a.postDate || a.createdAt || 0)
          );
        } else if (sortBy === "oldest") {
          fetchedIdeas = [...fetchedIdeas].sort(
            (a, b) => new Date(a.postDate || a.createdAt || 0) - new Date(b.postDate || b.createdAt || 0)
          );
        } else if (sortBy === "Potential") {
          const potentialOrder = { 'High': 3, 'Medium': 2, 'Low': 1, 'None': 0 };
          fetchedIdeas = [...fetchedIdeas].sort(
            (a, b) => (potentialOrder[b.businessPotential] || 0) - (potentialOrder[a.businessPotential] || 0)
          );
        }

        // Mark favorites
        const ideasWithFavorites = fetchedIdeas.map((idea) => ({
          ...idea,
          isFavorited: idea && idea._id ? currentFavoriteIds.includes(idea._id) : false,
        }));

        setIdeas(ideasWithFavorites);
        
        // Use pagination info from server
        const pagination = ideasResponse.data.pagination;
        if (pagination) {
          setTotalIdeas(pagination.totalItems);
          setTotalPages(pagination.totalPages);
        } else {
          setTotalIdeas(fetchedIdeas.length);
          setTotalPages(Math.ceil(fetchedIdeas.length / itemsPerPage));
        }
      } else {
        throw new Error('API response indicates failure');
      }
    } catch (error) {
      console.error("Failed to fetch ideas:", error);
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
      setError(
        isTimeout 
          ? "Server is taking longer than expected to respond. This might be due to the server starting up. Please wait a moment and try again."
          : "Failed to load ideas. Please try again."
      );
      setIdeas([]);
      setTotalIdeas(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [selectedCategories, debouncedSearchTerm, selectedTags, sortBy, itemsPerPage]);

  // Initial load
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Fetch ideas when filters change
  useEffect(() => {
    fetchIdeas(1); // Reset to first page when filters change
    setCurrentPage(1);
  }, [fetchIdeas]);

  // Fetch ideas when page changes
useEffect(() => {

  if (currentPage !== 1 || (selectedCategories.length === 0 && !debouncedSearchTerm && selectedTags.length === 0)) {
    fetchIdeas(currentPage);
  }
}, [currentPage]);

  // Optimized favorite toggle with better error handling
  const handleToggleFavorite = useCallback(async (ideaId) => {
    const isCurrentlyFavorited = favoriteIds.includes(ideaId);
    const isFavoriting = !isCurrentlyFavorited;

    // Optimistic update
    setIdeas(prevIdeas => 
      prevIdeas.map(idea => 
        idea._id === ideaId 
          ? { ...idea, isFavorited: isFavoriting } 
          : idea
      )
    );

    setFavoriteIds(prev => 
      isFavoriting
        ? [...prev, ideaId]
        : prev.filter(id => id !== ideaId)
    );

    try {
      if (isFavoriting) {
        await apiRequest.post(`/favorites/${ideaId}`);
      } else {
        await apiRequest.delete(`/favorites/${ideaId}`);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      
      // Revert optimistic update on error
      setIdeas(prevIdeas => 
        prevIdeas.map(idea => 
          idea._id === ideaId 
            ? { ...idea, isFavorited: isCurrentlyFavorited } 
            : idea
        )
      );
      
      setFavoriteIds(prev => 
        isCurrentlyFavorited
          ? [...prev, ideaId]
          : prev.filter(id => id !== ideaId)
      );
      
      // Show error notification
      setError("Failed to update favorite status. Please try again.");
    }
  }, [favoriteIds]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleTagToggle = useCallback((tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
  }, []);

  const handleCategoryToggle = useCallback((category) => {
    const lowerCategory = category.toLowerCase();
    setSelectedCategories(prev =>
      prev.some(cat => cat.toLowerCase() === lowerCategory)
        ? prev.filter(cat => cat.toLowerCase() !== lowerCategory)
        : [...prev, category]
    );
    setCurrentPage(1);
  }, []);

  const handleRefreshIdeas = useCallback(async () => {
    await fetchIdeas(currentPage);
  }, [fetchIdeas, currentPage]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Memoized values
  const sidebarCategories = useMemo(() => 
    categories.map(cat => cat.name), [categories]
  );

  const getCategoryColor = useCallback((idea) => {
    if (idea.category === "tech") return "blue";
    if (idea.category === "business") return "orange";
    return "gray";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="pt-28 sm:pt-28 px-2 sm:px-4 lg:px-6">
        <div className="max-w-screen-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 sm:mb-10 md:mb-12 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mr-4 shadow-lg">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold  text-gray-900">
                  Idea Dashboard
                </h1>
              </div>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Discover and organize the most innovative business ideas from Reddit communities
              </p>
              <div className="mt-6 flex items-center justify-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  {totalIdeas} ideas available
                </span>
              </div>
            </div>
          </div>
        
        {/* Error Banner */}
        {error && (
          <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-orange-800">
                  Connection Issue
                </h3>
                <p className="mt-1 text-sm text-orange-700">
                  {error}
                </p>
                <div className="mt-3">
                  <button
                    onClick={handleRefreshIdeas}
                    className="bg-orange-100 px-3 py-1 rounded-md text-sm font-medium text-orange-800 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setError(null)}
                    className="ml-2 bg-transparent px-3 py-1 rounded-md text-sm font-medium text-orange-800 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-4">
            {/* Premium Status Card */}
            
            {/* Categories Card */}
            <div className="sticky top-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 -xl border border-white/20">
              <div className="flex items-center mb-4 sm:mb-6">
                <Layers className="h-6 w-6 text-btn mr-3 drop-shadow-lg transform hover:scale-110 hover:-rotate-6 transition-all duration-300" />
                <h3 className="text-lg font-bold text-gray-900">Categories</h3>
              </div>
              <div className="space-y-2">
                {sidebarCategories.map((category) => {
                  // Check if this category is selected (case-insensitive)
                  const isSelected = selectedCategories.some(
                    cat => cat.toLowerCase() === category.toLowerCase()
                  );

                  return (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`w-full text-left px-4 py-3 rounded-xl  ${
                        isSelected
                          ? "bg-gradient-to-r from-btn to-btn text-white -md font-medium"
                          : "text-gray-700 hover:bg-gray-100 hover:border-none hover:-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category}</span>
                        {isSelected && (
                          <span className="text-white text-lg">✓</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
        {/* Search and Sort */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl -xl border border-white/20 p-4 mb-4">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  className="w-full text-sm sm:text-base pl-12 pr-4 py-3  rounded-xl focus:outline-none bg-gray-100 transition-all duration-200"
                  placeholder="Search innovative ideas..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
              </div>
            </div>
            {/* Sort */}
            <div className="flex items-center space-x-1 ml-5">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Sort by:
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 text-sm bg-gray-100 cursor-pointer focus:ring-0 focus:ring-offset-0 border-none">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-xl">
                  <SelectItem value="newest" className="">Newest First</SelectItem>
                  <SelectItem value="rankScore" className="">Highest Score</SelectItem>
                  <SelectItem value="oldest" className="">Oldest First</SelectItem>
                  <SelectItem value="Potential" className="">Business Potential</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Ideas Grid */}
        <Card className="bg-white/80 backdrop-blur-sm rounded-2xl -xl border border-white/20 overflow-hidden shadow-none">
          <CardHeader className="pb-4 px-4 sm:px-6 pt-4 sm:pt-6 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <FaBrain className="h-6 w-6 text-purple-500 transition-all duration-300 hover:scale-110" />
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                  Business Ideas ({ideas.length})
                </CardTitle>
              </div>

              <div className="text-left">
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-purple-600" />
                    <p className="text-sm text-gray-600">
                      {isInitialLoad ? "Loading ideas..." : "Refreshing..."}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    {totalIdeas > 0
                      ? `Showing ${Math.min(ideas.length, itemsPerPage)} of ${totalIdeas} ideas${
                          selectedCategories.length > 0 ? ` in ${selectedCategories.join(", ")}` : ""
                        }`
                      : "No ideas found matching your criteria"}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table className="min-w-full">
                <TableHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                  <TableRow className="border-b border-gray-200 h-10">
                    <TableHead className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-6 sm:w-8">
                      <Heart className="h-4 w-4 mx-auto text-gray-500" />
                    </TableHead>
                    <TableHead className="px-2 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-auto sm:w-1/3">
                      <div className="flex items-center">
                        <Sparkles className="h-4 w-4 mr-2 text-gray-500" />
                        Business Idea
                      </div>
                    </TableHead>
                    <TableHead className="px-2 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-auto sm:w-1/3">
                      <div className="flex items-center">
                        <Brain className="h-4 w-4 mr-2 text-gray-500" />
                        Description
                      </div>
                    </TableHead>
                    <TableHead className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell w-16">
                      <div className="flex items-center">
                        <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                        Source
                      </div>
                    </TableHead>
                    <TableHead className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell w-20">
                      <div className="flex items-center">
                        <Layers className="h-4 w-4 mr-2 text-gray-500" />
                        Category
                      </div>
                    </TableHead>
                    <TableHead className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16 sm:w-20">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="hidden sm:inline">Score</span>
                        <span className="sm:hidden">Score & Date</span>
                      </div>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        Date
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell px-2 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-gray-500" />
                        Potential
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-100">
                  {ideas.map((idea) => (
                    <TableRow
                      key={idea._id}
                      className="block sm:table-row hover:bg-slate-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 text-sm"
                    >
                      {/* Mobile Header */}
                      <div className="sm:hidden px-4 py-3 bg-slate-50 flex justify-between items-center border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleToggleFavorite(idea._id);
                            }}
                            className="p-1.5 rounded-full hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            title={
                              idea.isFavorited
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                          >
                            <Heart
                              className={`h-4 w-4 transition-colors ${
                                idea.isFavorited
                                  ? "text-red-500 fill-current"
                                  : "text-gray-400 hover:text-red-400"
                              }`}
                              fill={idea.isFavorited ? "currentColor" : "none"}
                              strokeWidth="2"
                            />
                          </button>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Platform:</span>
                            <a
                              href={idea.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              {idea.platform || "reddit"}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={`text-xs font-medium py-1 px-2 rounded-md ${
                            idea.businessPotential === 'High'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : idea.businessPotential === 'Medium'
                              ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                              : 'bg-gray-50 text-gray-600 border border-gray-200'
                          }`}>
                            {idea.businessPotential}
                          </Badge>
                          <Link to={`/idea/${idea._id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-7 w-7 p-1.5 rounded-md"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                      <TableCell className="hidden sm:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleFavorite(idea._id);
                          }}
                          className="p-1.5 rounded-full hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          title={
                            idea.isFavorited
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          <Heart
                            className={`h-4 w-4 transition-colors ${
                              idea.isFavorited
                                ? "text-red-500 fill-current"
                                : "text-gray-400 hover:text-red-400"
                            }`}
                            fill={idea.isFavorited ? "currentColor" : "none"}
                            strokeWidth="2"
                          />
                        </button>
                      </TableCell>
                      <TableCell className="block sm:table-cell px-6 py-4 whitespace-normal text-sm text-left text-gray-900">
                        <div className="sm:hidden text-xs font-medium text-gray-700 mb-2">Business Idea</div>
                        <Link
                          to={`/idea/${idea._id}`}
                          className="text-btn hover:text-blue-800 hover:underline font-medium block mb-2 sm:mb-0 transition-colors"
                        >
                          {idea.title || idea.summary}
                        </Link>
                      </TableCell>

                      <TableCell className="block sm:table-cell px-6 py-4 whitespace-normal text-sm text-left text-gray-700">
                        <div className="sm:hidden text-xs font-medium text-gray-700 mb-2">Description</div>
                        {idea.summary && (
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                            {idea.summary}
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm">
                        <div className="sm:hidden text-xs font-medium text-gray-700 mb-2">Source</div>
                        <div className="flex items-center">
                          <a
                            href={idea.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            {idea.platform || "reddit"}
                          </a>
                        </div>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm">
                        <div className="sm:hidden text-xs font-medium text-gray-700 mb-2">Category</div>
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium rounded-md px-2 py-1 ${
                            idea.category === 'tech'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : idea.category === 'business'
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          {idea.category || "General"}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-6 py-4 whitespace-nowrap ">
                        <div className="flex flex-col sm:block space-y-2 sm:space-y-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                              {idea.rankScore?.toFixed(2) || "N/A"}
                            </span>
                            <span className="sm:hidden text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                              {new Date(idea.postDate).toLocaleDateString("en-US", {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-700">
                            {new Date(idea.postDate).toLocaleDateString("en-US", {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm">
                        <div className="sm:hidden text-xs font-medium text-gray-700 mb-2">Potential</div>
                        <Badge className={`text-xs font-medium py-1 px-2 rounded-md ${
                          idea.businessPotential === 'High'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : idea.businessPotential === 'Medium'
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}>
                          {idea.businessPotential}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {isLoading ? (
              <div className="space-y-4 p-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                        <div className="flex space-x-2">
                          <div className="h-4 bg-gray-100 rounded w-16"></div>
                          <div className="h-4 bg-gray-100 rounded w-20"></div>
                        </div>
                      </div>
                      <div className="h-8 bg-gray-100 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : ideas.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No ideas found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Try adjusting your filters or search terms to discover more innovative business ideas.
                </p>
                <Button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  Clear Filters
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

            </div>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 sm:mt-12">
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-purple-300 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white -sm hover:-md"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>

                <div className="flex items-center space-x-1 overflow-x-auto py-2 px-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[44px] h-11 flex items-center justify-center cursor-pointer text-sm font-medium rounded-xl transition-all duration-200 ${
                          currentPage === pageNum
                            ? "bg-btn text-white"
                            : "text-gray-600 bg-white hover:bg-gray-50 "
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="px-2 text-gray-400 text-sm">...</span>
                  )}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`min-w-[44px] h-11 flex items-center justify-center text-sm font-medium cursor-pointer rounded-xl transition-all duration-200 ${
                        currentPage === totalPages
                          ? "bg-gradient-to-br from-purple-500 to-blue-600 text-white -lg transform scale-105"
                          : "text-gray-600 bg-white  hover:bg-gray-50 "
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-3 text-sm font-medium text-gray-700 bg-white cursor-pointer rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white -sm hover:-md"
                >
                  Next
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
              <div className="mt-4 text-center text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardPage;
