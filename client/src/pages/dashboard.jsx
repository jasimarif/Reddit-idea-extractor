import React, { useState, useEffect } from 'react';
import IdeaCard from '../components/IdeaCard';
import { Filter, Search, RefreshCw, ChevronDown, Info, ChevronUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';

const mockIdeas = [
  {
    id: '1',
    title: 'Simple 5-minute meditation technique that changed my anxiety levels',
    summary: 'A user shares their personal experience with a breathing technique that involves counting breaths from 1 to 5 repeatedly. They noticed significant improvements in their anxiety within just two weeks of consistent practice.',
    category: 'Health',
    tags: ['meditation', 'anxiety', 'breathing', 'mental-health'],
    upvotes: 1247,
    subreddit: 'Anxiety',
    originalUrl: 'https://reddit.com/r/Anxiety/sample-post-1',
    isFavorited: false,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'How I built a $5k/month side business in 6 months with zero experience',
    summary: 'Detailed breakdown of starting a digital marketing consultancy from scratch. The poster shares their exact steps, tools used, first client acquisition strategies, and monthly revenue progression.',
    category: 'Wealth',
    tags: ['side-business', 'digital-marketing', 'entrepreneurship', 'consulting'],
    upvotes: 2156,
    subreddit: 'Entrepreneur',
    originalUrl: 'https://reddit.com/r/Entrepreneur/sample-post-2',
    isFavorited: true,
    createdAt: '2024-01-14'
  },
  {
    id: '3',
    title: 'Relationship advice that saved my 10-year marriage',
    summary: 'After nearly divorcing, a couple used specific communication techniques and weekly relationship check-ins to rebuild their connection. They share the exact framework they used.',
    category: 'Relationships',
    tags: ['marriage', 'communication', 'relationship-advice', 'couples'],
    upvotes: 987,
    subreddit: 'relationships',
    originalUrl: 'https://reddit.com/r/relationships/sample-post-3',
    isFavorited: false,
    createdAt: '2024-01-13'
  },
  {
    id: '4',
    title: 'ADHD-friendly workout routine that actually stuck for me',
    summary: 'A person with ADHD shares their struggle with traditional exercise routines and how they created a flexible, 15-minute daily routine that accommodates their attention patterns.',
    category: 'Health',
    tags: ['ADHD', 'fitness', 'workout', 'routine'],
    upvotes: 756,
    subreddit: 'ADHD',
    originalUrl: 'https://reddit.com/r/ADHD/sample-post-4',
    isFavorited: false,
    createdAt: '2024-01-12'
  },
  {
    id: '5',
    title: 'Emergency fund strategy that helped me save $10k in one year',
    summary: 'Step-by-step guide to building an emergency fund on a tight budget, including specific apps, automatic savings strategies, and mindset shifts that made the difference.',
    category: 'Wealth',
    tags: ['emergency-fund', 'savings', 'personal-finance', 'budgeting'],
    upvotes: 1834,
    subreddit: 'personalfinance',
    originalUrl: 'https://reddit.com/r/personalfinance/sample-post-5',
    isFavorited: true,
    createdAt: '2024-01-11'
  },
  {
    id: '6',
    title: 'How to set boundaries with toxic family members during holidays',
    summary: 'Practical strategies for maintaining mental health during family gatherings, including scripts for difficult conversations and self-care techniques for high-stress situations.',
    category: 'Relationships',
    tags: ['family', 'boundaries', 'toxic-relationships', 'holidays'],
    upvotes: 1456,
    subreddit: 'relationship_advice',
    originalUrl: 'https://reddit.com/r/relationship_advice/sample-post-6',
    isFavorited: false,
    createdAt: '2024-01-10'
  }
];

const DashboardPage = () => {
  const [ideas, setIdeas] = useState(mockIdeas);
  const [filteredIdeas, setFilteredIdeas] = useState(mockIdeas);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('upvotes');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCategoryInfo, setShowCategoryInfo] = useState(false);
  const itemsPerPage = 6;

  const allTags = Array.from(new Set(ideas.flatMap(idea => idea.tags)));

  useEffect(() => {
    let filtered = ideas;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(idea => idea.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(idea =>
        selectedTags.some(tag => idea.tags.includes(tag))
      );
    }

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'upvotes':
          return b.upvotes - a.upvotes;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredIdeas(filtered);
    setCurrentPage(1);
  }, [ideas, selectedCategory, searchTerm, sortBy, selectedTags]);

  const handleToggleFavorite = (ideaId) => {
    setIdeas(prev => prev.map(idea =>
      idea.id === ideaId ? { ...idea, isFavorited: !idea.isFavorited } : idea
    ));
  };

  const handleRefreshIdeas = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const categories = ['All', 'Health', 'Wealth', 'Relationships'];
  const totalPages = Math.ceil(filteredIdeas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentIdeas = filteredIdeas.slice(startIndex, startIndex + itemsPerPage);

  const categoryInfo = {
    Health: 'Mental health, fitness, wellness, medical advice, and lifestyle improvements',
    Wealth: 'Personal finance, entrepreneurship, side businesses, career advice, and financial planning',
    Relationships: 'Dating, marriage, family dynamics, parenting, and social connections'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Idea Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Discover and organize the best ideas from Reddit communities
              </p>
            </div>
            <button
              onClick={handleRefreshIdeas}
              disabled={isLoading}
              className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
              <span className="font-medium text-gray-900">About Categories</span>
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
                    {category === 'Health' && '💊'}
                    {category === 'Wealth' && '💸'}
                    {category === 'Relationships' && '❤️'}
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
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
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
              <span className="text-sm font-medium text-gray-700">Categories:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                    }`}
                  >
                    {category === 'Health' && '💊 '}
                    {category === 'Wealth' && '💸 '}
                    {category === 'Relationships' && '❤️ '}
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Filters */}
            <div className="flex items-start space-x-2">
              <span className="text-sm font-medium text-gray-700 mt-1">Popular Tags:</span>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 12).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            {(selectedTags.length > 0 || selectedCategory !== 'All' || searchTerm) && (
              <div className="flex items-center space-x-2 pt-2 border-t">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                {selectedCategory !== 'All' && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCategory('All')}>
                    {selectedCategory} ×
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm('')}>
                    "{searchTerm}" ×
                  </Badge>
                )}
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleTagToggle(tag)}>
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
            Showing {currentIdeas.length} of {filteredIdeas.length} ideas
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Ideas Grid */}
        {currentIdeas.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <div className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || selectedTags.length > 0 ? 'No matching ideas found' : 'No ideas available'}
            </div>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedTags.length > 0 
                ? 'Try adjusting your search terms or filters to find more ideas.'
                : 'Check back later for new ideas from Reddit communities.'
              }
            </p>
            {(searchTerm || selectedTags.length > 0 || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTags([]);
                  setSelectedCategory('All');
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
                key={idea.id}
                idea={idea}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                    ? 'text-white bg-purple-600 border border-purple-600'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
