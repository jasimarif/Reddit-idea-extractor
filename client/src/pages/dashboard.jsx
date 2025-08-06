import apiRequest from "../lib/apiRequest";
import React, { useState, useEffect } from "react";
import { Search, RefreshCw, Calendar, ExternalLink, Heart } from "lucide-react";
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

const DashboardPage = () => {
    const [allIdeas, setAllIdeas] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [totalIdeas, setTotalIdeas] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rankScore");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [favoriteIds, setFavoriteIds] = useState([]);
  // const [allTags, setAllTags] = useState([]);
  const [categories, setCategories] = useState([]);

  // // Tags state and fetch logic
  // useEffect(() => {
  //   const fetchTags = async () => {
  //     try {
  //       const response = await apiRequest.get("/ideas/tags");
  //       setAllTags(response.data?.data || []);
  //     } catch (error) {
  //       console.error("Failed to fetch tags:", error);
  //       setAllTags([]);
  //     }
  //   };
  //   fetchTags();
  // }, []);

  // Categories state and fetch logic
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiRequest.get("/ideas/categories");
        // Wrap string categories as objects with a 'name' property for UI compatibility
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

  // Fetch favorite IDs on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await apiRequest.get("/favorites", {
          params: { page: 1, limit: 1000 },
        });
        const ids = (response.data.data || []).map((fav) => fav._id || fav.id);
        setFavoriteIds(ids);
      } catch (error) {
        setFavoriteIds([]);
      }
    };
    fetchFavorites();
  }, []);

  const fetchAllIdeas = async () => {
    setIsLoading(true);
    try {
      const favResponse = await apiRequest.get("/favorites", {
        params: { page: 1, limit: 1000 },
      });
      const ids = Array.isArray(favResponse.data.data)
        ? favResponse.data.data.filter(Boolean).map((fav) => fav._id || fav.id)
        : [];
      setFavoriteIds(ids);

      const params = {};
      if (selectedCategories.length > 0) params.category = selectedCategories.join(",");
      if (searchTerm) params.search = searchTerm;
      if (selectedTags.length > 0) params.tags = selectedTags.join(",");
      params.limit = 1000; // Fetch all ideas at once

      console.log("Fetching all ideas with params:", params);
      const response = await apiRequest.get("/ideas", { params });
      console.log("Ideas API response:", response.data);
      
      let fetchedIdeas = Array.isArray(response.data.data)
        ? response.data.data.filter(Boolean)
        : [];

      // Apply category filter if any categories are selected (case-insensitive check)
      if (selectedCategories.length > 0) {
        fetchedIdeas = fetchedIdeas.filter((idea) => {
          const cat = idea.category || idea.topic;
          if (!cat) return false;
          
          // Get the category name in a case-insensitive way
          const categoryName = typeof cat === "string" 
            ? cat 
            : (cat.name || '');
            
          return selectedCategories.some(
            selectedCat => selectedCat.toLowerCase() === categoryName.toLowerCase()
          );
        });
      }

      // Mark favorites
      fetchedIdeas = fetchedIdeas.map((idea) => ({
        ...idea,
        isFavorited: idea && idea._id ? ids.includes(idea._id) : false,
      }));

      // Apply sorting
      if (sortBy === "rankScore") {
        fetchedIdeas = [...fetchedIdeas].sort(
          (a, b) => (b.rankScore || 0) - (a.rankScore || 0)
        );
      } else if (sortBy === "newest") {
        fetchedIdeas = [...fetchedIdeas].sort(
          (a, b) => new Date(b.postDate || 0) - new Date(a.postDate || 0)
        );
      } else if (sortBy === "oldest") {
        fetchedIdeas = [...fetchedIdeas].sort(
          (a, b) => new Date(a.postDate || 0) - new Date(b.postDate || 0)
        );
      }
      else if (sortBy === "Potential") {
        const potentialOrder = { 'High': 3, 'Medium': 2, 'Low': 1, 'None': 0 };
        fetchedIdeas = [...fetchedIdeas].sort(
          (a, b) => (potentialOrder[b.businessPotential] || 0) - (potentialOrder[a.businessPotential] || 0)
        );
      }

      setAllIdeas(fetchedIdeas);
      setTotalIdeas(fetchedIdeas.length);
    } catch (error) {
      console.error("Failed to fetch ideas:", error);
      setAllIdeas([]);
      setIdeas([]);
      setTotalIdeas(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch and filter ideas when filters/sort change
  useEffect(() => {
    fetchAllIdeas();
    setCurrentPage(1); // Reset to first page when filters change
    // eslint-disable-next-line
  }, [selectedCategories, searchTerm, sortBy, selectedTags]);

  // Apply pagination when currentPage or allIdeas change
  useEffect(() => {
    if (allIdeas.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedIdeas = allIdeas.slice(startIndex, endIndex);
      setIdeas(paginatedIdeas);
    } else {
      setIdeas([]);
    }
  }, [currentPage, allIdeas, itemsPerPage]);

  const handleToggleFavorite = async (ideaId) => {
    // Optimistically update both ideas and allIdeas state for immediate UI feedback
    setIdeas(prevIdeas => 
      prevIdeas.map(idea => 
        idea._id === ideaId 
          ? { ...idea, isFavorited: !idea.isFavorited } 
          : idea
      )
    );
  
    // Also update allIdeas to maintain consistency
    setAllIdeas(prevAllIdeas => 
      prevAllIdeas.map(idea => 
        idea._id === ideaId 
          ? { ...idea, isFavorited: !idea.isFavorited } 
          : idea
      )
    );

    // Update favoriteIds state
    setFavoriteIds(prev => {
      const isCurrentlyFavorited = prev.includes(ideaId);
      return isCurrentlyFavorited
        ? prev.filter(id => id !== ideaId)
        : [...prev, ideaId];
    });

    const isFavoriting = !favoriteIds.includes(ideaId);
  
    try {
      if (isFavoriting) {
        await apiRequest.post(`/favorites/${ideaId}`);
      } else {
        await apiRequest.delete(`/favorites/${ideaId}`);
      }
      
      // Refresh the data to ensure consistency with the server
      await fetchAllIdeas();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      
      // Revert the optimistic update if there's an error
      setIdeas(prevIdeas => 
        prevIdeas.map(idea => 
          idea._id === ideaId 
            ? { ...idea, isFavorited: !isFavoriting } 
            : idea
        )
      );
      
      setAllIdeas(prevAllIdeas => 
        prevAllIdeas.map(idea => 
          idea._id === ideaId 
            ? { ...idea, isFavorited: !isFavoriting } 
            : idea
        )
      );
      
      // Revert favoriteIds state
      setFavoriteIds(prev => 
        isFavoriting
          ? prev.filter(id => id !== ideaId)
          : [...prev, ideaId]
      );
      
      // Show error toast or notification
      // toast.error("Failed to update favorite status. Please try again.");
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

  const handleCategoryToggle = (category) => {
    // Convert to lowercase for consistent comparison
    const lowerCategory = category.toLowerCase();
    setSelectedCategories((prev) =>
      prev.some(cat => cat.toLowerCase() === lowerCategory)
        ? prev.filter(cat => cat.toLowerCase() !== lowerCategory)
        : [...prev, category] // Keep original case for display
    );
    setCurrentPage(1);
  };

  const getCategoryColor = (idea) => {
    if (idea.category === "tech") return "blue";
    if (idea.category === "business") return "orange";
    return "gray";
  };

  const totalPages = Math.max(1, Math.ceil(totalIdeas / itemsPerPage));
  const currentIdeas = ideas;

  // Define the hardcoded categories
  const sidebarCategories = categories.map(cat => cat.name);

  return (
    <div className="min-h-screen bg-[#e6ebef] pt-16 sm:pt-16 momentum-scroll">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-5">
        {/* Header */}
        <div className="mb-4 sm:mb-5 md:mb-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Idea Dashboard
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Discover and organize the best ideas from Reddit communities
            </p>
          </div>
        </div>
        
        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          
          {/* Sidebar */}
          <div className="w-full lg:w-56 flex-shrink-0">
            <div className="sticky top-4 bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-2 sm:mb-3">Categories</h3>
              <div className="space-y-1.5">
                {sidebarCategories.map((category) => {
                  // Check if this category is selected (case-insensitive)
                  const isSelected = selectedCategories.some(
                    cat => cat.toLowerCase() === category.toLowerCase()
                  );
                  
                  return (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {category}
                      {isSelected && (
                        <span className="ml-2 text-blue-500">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
        {/* Search and Sort */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-3 mb-3 sm:mb-4">
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            {/* Category Dropdown Removed - Moved to Sidebar */}
            {/* Search */}
            <div className="flex-1 mb-3 sm:mb-0 mx-0 sm:mx-2">
              <div className="relative">
                <input
                  type="text"
                  className="w-full text-sm sm:text-base pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Search ideas..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
              </div>
            </div>
            {/* Sort */}
            <div className="flex items-center justify-between sm:justify-start space-x-2 w-full sm:w-auto mt-2 sm:mt-0">
              <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                Sort by:
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-36 md:w-40 text-xs sm:text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="rankScore">Most Rank Score</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="Potential">Most Business Potential</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Filters */}
        {/* <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          <div className="space-y-3 sm:space-y-4"> */}
            {/* Category Filters Section Removed - Moved to Sidebar */}

            {/* Active Filters */}
            {/* {(selectedTags.length > 0 ||
              selectedCategories.length > 0 ||
              searchTerm) && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  Active Filters
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center bg-gradient-to-br from-purple-50 to-blue-50 text-purple-700 text-sm px-3 py-1.5 rounded-lg border border-purple-100 shadow-sm"
                    >
                      {tag}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTagToggle(tag);
                        }}
                        className="ml-2 text-purple-500 hover:text-purple-700 hover:bg-purple-100 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  {selectedCategories.map((cat) => (
                    <div
                      key={cat}
                      className="flex items-center bg-green-50 text-green-700 text-sm px-3 py-1.5 rounded-lg border border-green-100 shadow-sm"
                    >
                      {cat}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryToggle(cat);
                        }}
                        className="ml-2 text-green-500 hover:text-green-700 hover:bg-green-100 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  {searchTerm && (
                    <div className="flex items-center bg-gray-50 text-gray-700 text-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                      "{searchTerm}"
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchTerm("");
                        }}
                        className="ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )} */}
          {/* </div>
        </div> */}

        {/* Results Count */}
        

        {/* Ideas Grid */}
        <Card className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden -mt-2">
          <CardHeader className="pb-2 px-3 sm:px-4 pt-2 sm:pt-3 ">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-1 sm:space-y-0">
              <CardTitle className="text-sm sm:text-base font-semibold text-gray-900">
                Business Ideas ({currentIdeas.length})
              </CardTitle>

              <div className="mb-2 sm:mb-3 px-1 text-left">
          {isLoading ? (
            <div className="flex space-x-1.5">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-gray-500" />
              <p className="text-xs text-gray-600">Loading ideas...</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              {totalIdeas > 0
                ? `Showing ${Math.min(
                    currentIdeas.length,
                    itemsPerPage
                  )} of ${totalIdeas} ideas${
                    selectedCategories.length > 0
                      ? ` in ${selectedCategories.join(", ")}`
                      : ""
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
                <TableHeader className="bg-gray-50 hidden sm:table-header-group">
                  <TableRow className="border-b border-gray-200 h-8">
                    <TableHead className="px-1.5 sm:px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-8 sm:w-10"></TableHead>
                    <TableHead className="px-1.5 sm:px-4 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-auto sm:w-2/5">
                      Business Idea
                    </TableHead>
                    <TableHead className="px-1.5 sm:px-6 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-auto sm:w-2/5">
                      Description
                    </TableHead>
                    <TableHead className="px-1.5 sm:px-5 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell w-1/8">
                      Source
                    </TableHead>
                    <TableHead className="px-1.5 sm:px-7 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell w-1/8">
                      Category
                    </TableHead>
                    <TableHead className="px-1.5 sm:px-8 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-12 sm:w-16 md:w-20">
                      <span className="hidden sm:inline">Score</span>
                      <span className="sm:hidden">Score & Date</span>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell px-1.5 sm:px-12 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-1/8">
                      Date
                    </TableHead>
                    <TableHead className="hidden md:table-cell px-1.5 sm:px-4 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-1/8">
                      Potential
                    </TableHead>
                    
                    
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-100">
                  {currentIdeas.map((idea) => (
                    <TableRow
                      key={idea._id}
                      className="block sm:table-row hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 text-sm"
                    >
                      {/* Mobile Header */}
                      <div className="sm:hidden px-2 py-1.5 bg-gray-50 flex justify-between items-center border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleToggleFavorite(idea._id);
                            }}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
                                  : "text-gray-300 hover:text-red-400"
                              }`}
                              fill={idea.isFavorited ? "currentColor" : "none"}
                              strokeWidth="2"
                            />
                          </button>
                          <span className="text-sm font-medium text-gray-500">
                          <a 
                            href={idea.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors hover:underline"
                          >
                            {idea.platform || "reddit"}
                          </a>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-50 text-green-700 border border-green-100 text-[10px] font-medium py-0 h-5">
                            {idea.businessPotential}
                          </Badge>
                          <Link to={`/idea/${idea._id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-6 w-6 p-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                      <TableCell className="hidden sm:table-cell px-3 sm:px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleFavorite(idea._id);
                          }}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-purple-400"
                          title={
                            idea.isFavorited
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          <Heart
                            className={`h-5 w-5 transition-colors ${
                              idea.isFavorited
                                ? "text-red-500 fill-current"
                                : "text-gray-300 hover:text-red-400"
                            }`}
                            fill={idea.isFavorited ? "currentColor" : "none"}
                            strokeWidth="2"
                          />
                        </button>
                      </TableCell>
                      <TableCell className="block sm:table-cell px-4 sm:px-1 py-3 whitespace-normal text-xs text-left !text-gray-900 max-w-md ">
                        <div className="sm:hidden text-xs font-medium text-gray-900 mb-1">Business Idea</div>
                        <Link
                          to={`/idea/${idea._id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium block mb-2 sm:mb-0"
                        >
                          {idea.title || idea.summary}
                        </Link>
                      
                      </TableCell>

                      <TableCell className="block sm:table-cell px-4 sm:px-2 py-3 whitespace-normal text-xs text-left !text-gray-900 max-w-md ">
                        <div className="sm:hidden text-xs font-medium !text-gray-900 mb-1">Description</div>
                        {idea.summary && (
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                            {idea.summary}
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="hidden md:table-cell px-3 sm:px-4 py-3 whitespace-nowrap text-sm">
                        <div className="sm:hidden text-xs font-medium text-gray-500 mb-1">Source</div>
                        <div className="flex items-center">
                          <a 
                            href={idea.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors hover:underline"
                          >
                            {idea.platform || "reddit"}
                          </a>
                        </div>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell px-3 sm:px-4 py-3 whitespace-nowrap text-sm">
                        <div className="sm:hidden text-xs font-medium text-gray-500 mb-1">Category</div>
                        <Badge
                          variant="outline"
                          className={`${getCategoryColor(
                            idea.category
                          )} uppercase tracking-wide text-xs font-semibold`}
                        >
                          {idea.category || "General"}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col sm:block">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs sm:text-sm font-medium rounded">
                              {idea.rankScore?.toFixed(2) || "N/A"}
                            </span>
                            <span className="sm:hidden text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                              {new Date(idea.postDate).toLocaleDateString("en-US", {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                          {new Date(idea.postDate).toLocaleDateString("en-US", {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell px-3 sm:px-4 py-3 whitespace-nowrap text-sm">
                        <div className="sm:hidden text-xs font-medium text-gray-500 mb-1">Status</div>
                        <Badge className="bg-green-50 text-green-700 border border-green-100 text-xs font-medium">
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
            ) : currentIdeas.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-slate-400 mb-2">No ideas found</div>
                <p className="text-slate-600">
                  Try adjusting your filters to see more results.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

            </div>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
          <div className="mt-6 sm:mt-8">
            <div className="flex items-center justify-between sm:justify-center space-x-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
              >
                <svg
                  className="w-4 h-4 mr-1 sm:mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>

              <div className="flex items-center space-x-1 overflow-x-auto py-2 px-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show first page, last page, current page, and pages around current
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
                      className={`min-w-[32px] h-8 sm:min-w-[40px] sm:h-10 flex items-center justify-center text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                        currentPage === pageNum
                          ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-md shadow-purple-100 transform scale-105"
                          : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-purple-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="px-1 sm:px-2 text-gray-400 text-xs sm:text-sm">
                    ...
                  </span>
                )}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`min-w-[32px] h-8 sm:min-w-[40px] sm:h-10 flex items-center justify-center text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentPage === totalPages
                        ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-md shadow-purple-100 transform scale-105"
                        : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-purple-700"
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
                className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
              >
                <span className="sm:hidden">Next</span>
                <span className="hidden sm:inline">Next</span>
                <svg
                  className="w-4 h-4 ml-1 sm:ml-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
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
            <div className="mt-2 text-center text-xs text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
