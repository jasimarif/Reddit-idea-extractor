import apiRequest from "../lib/apiRequest";
import React, { useState, useEffect } from "react";
import { Search, RefreshCw, Calendar, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
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
  const [ideas, setIdeas] = useState([]);
  const [totalIdeas, setTotalIdeas] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("upvotes");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [categories, setCategories] = useState([]);

  // Tags state and fetch logic
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

  const fetchIdeas = async () => {
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
      if (selectedCategories.length > 0) params.categories = selectedCategories.join(",");
      if (searchTerm) params.search = searchTerm;
      if (selectedTags.length > 0) params.tags = selectedTags.join(",");
      params.page = currentPage;
      params.limit = itemsPerPage;

      console.log('Fetching ideas with params:', params);
      const response = await apiRequest.get("/ideas", { params });
      console.log('Ideas API response:', response.data);
      let fetchedIdeas = Array.isArray(response.data.data)
        ? response.data.data.filter(Boolean)
        : [];

      if (selectedCategories.length > 0) {
        fetchedIdeas = fetchedIdeas.filter((idea) => {
          const cat = idea.category || idea.topic;
          if (!cat) return false;
          if (typeof cat === 'string') {
            return selectedCategories.includes(cat);
          } else if (typeof cat === 'object' && cat.name) {
            return selectedCategories.includes(cat.name);
          }
          return false;
        });
      }

      fetchedIdeas = fetchedIdeas.map((idea) => ({
        ...idea,
        isFavorited: idea && idea._id ? ids.includes(idea._id) : false,
      }));

      if (sortBy === "upvotes") {
        fetchedIdeas = [...fetchedIdeas].sort((a, b) => b.upvotes - a.upvotes);
      } else if (sortBy === "newest") {
        fetchedIdeas = [...fetchedIdeas].sort(
          (a, b) => new Date(b.postDate) - new Date(a.postDate)
        );
      } else if (sortBy === "oldest") {
        fetchedIdeas = [...fetchedIdeas].sort(
          (a, b) => new Date(a.postDate) - new Date(b.postDate)
        );
      }

      setIdeas(fetchedIdeas);
      setTotalIdeas(
        response.data.pagination?.totalItems || fetchedIdeas.length
      );
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
  }, [selectedCategories, searchTerm, sortBy, selectedTags, currentPage]);

  // const handleToggleFavorite = async (ideaId) => {
  //   const idea = ideas.find((idea) => idea._id === ideaId);
  //   if (!idea) return;

  //   const newFavoriteStatus = !idea.isFavorited;
  //   const prevIdeas = [...ideas];

  //   // Optimistically update the UI
  //   setIdeas((prev) =>
  //     prev.map((idea) =>
  //       idea._id === ideaId ? { ...idea, isFavorited: newFavoriteStatus } : idea
  //     )
  //   );

  //   try {
  //     if (newFavoriteStatus) {
  //       await apiRequest.post(`/favorites/${ideaId}`);
  //     } else {
  //       await apiRequest.delete(`/favorites/${ideaId}`);
  //     }
  //     // Refetch favorites and ideas to ensure sync
  //     const response = await apiRequest.get("/favorites", {
  //       params: { page: 1, limit: 1000 },
  //     });
  //     const ids = (response.data.data || []).map((fav) => fav._id || fav.id);
  //     setFavoriteIds(ids);
  //     await fetchIdeas();
  //   } catch (error) {
  //     console.error("Error toggling favorite:", error);
  //     // Revert UI if the request fails
  //     setIdeas(prevIdeas);
  //   }
  // };

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
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((t) => t !== category)
        : [...prev, category]
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
          </div>
        </div>

        {/* Search and Sort */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Category Dropdown */}
            <div className="w-full md:w-56 mb-4 md:mb-0">
              <Select
                value={selectedCategories[0] || ""} // fallback for single-select UI, not needed for multi-select buttons
                onValueChange={(value) => {
                  if (value === "All") {
                    setSelectedCategories([]);
                  } else {
                    setSelectedCategories([value]);
                  }
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat._id || cat.id || cat.name}
                      value={cat.name}
                    >
                      {cat.icon && (
                        <span style={{ marginRight: 8 }}>{cat.icon}</span>
                      )}
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Search */}
            <div className="flex-1 mb-4 md:mb-0">
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Search ideas..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={18}
                />
              </div>
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
                <SelectContent className="bg-white"> 
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
            {/* Tag Filters */}
            <div className="flex items-start space-x-2">
              {/* <span className="text-sm font-medium text-gray-700 mt-1">
                Popular Tags:
              </span> */}
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

            {/* Category Filters */}
            <div className="flex items-start space-x-2 mt-4">
              <span className="text-sm font-medium text-gray-700 mt-1">
                Popular Categories:
              </span>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 12).map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryToggle(cat.name)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedCategories.includes(cat.name)
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            {(selectedTags.length > 0 ||
              selectedCategories.length > 0 ||
              searchTerm) && (
              <div className="flex items-center space-x-2 pt-2 border-t">
                <span className="text-sm font-medium text-gray-700">
                  Active filters:
                </span>
                {selectedCategories.map((cat) => (
                  <Badge
                    key={cat}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleCategoryToggle(cat)}
                  >
                    {cat} ×
                  </Badge>
                ))}
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
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
              <p className="text-sm text-gray-600">Loading ideas...</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              {totalIdeas > 0 
                ? `Showing ${Math.min(currentIdeas.length, itemsPerPage)} of ${totalIdeas} ideas${selectedCategories.length > 0 ? ` in ${selectedCategories.join(", ")}` : ''}`
                : 'No ideas found matching your criteria'}
            </p>
          )}
        </div>

        {/* Ideas Table */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Business Ideas ({currentIdeas.length})</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleRefreshIdeas} disabled={isLoading} className="border-gray-300">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="px-24 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">Business Idea</TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Source</TableHead>
                  <TableHead className="px-12 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Category</TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Score</TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Date</TableHead>
                  <TableHead className="px-12 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Status</TableHead>
                  <TableHead className="px-10 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {currentIdeas.map((idea) => (
                  <TableRow key={idea._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <TableCell className="px-6 py-4 whitespace-normal text-sm text-gray-900 max-w-md">
                      <Link 
                        to={`/idea/${idea._id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        {idea.title || idea.summary}
                      </Link>
                      {idea.summary && (
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {idea.summary}
                        </p>
                      )}
                    </TableCell>
                    
                    <TableCell className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {idea.url ? (
                          <a 
                            href={idea.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            {idea.platform || 'reddit'}
                          </a>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                            {idea.platform || 'reddit'}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-4 whitespace-nowrap">
                      <Badge 
                        variant="outline" 
                        className={`${getCategoryColor(idea.category)} uppercase tracking-wide text-xs font-semibold`}
                      >
                        {idea.category || 'General'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded">
                          {idea.rankScore?.toFixed(2) || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                        {new Date(idea.postDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-4 py-4 whitespace-nowrap">
                      <Badge className="bg-green-50 text-green-700 border border-green-100 text-xs font-medium">
                        {idea.status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/idea/${idea._id}`}>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                          <ExternalLink className="h-4 w-4 mr-1.5" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {currentIdeas.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-2">No ideas found</div>
              <p className="text-slate-600">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </CardContent>
      </Card>


        
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
