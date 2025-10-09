import React, { useState, useEffect } from "react";
import apiRequest from "../lib/apiRequest";
import { RefreshCw, ExternalLink, MessageCircle, ThumbsUp, Calendar, User, Database, Filter, ChevronDown, ChevronUp, Hash, Heart, Repeat2 } from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.tsx";
import { Input } from "../components/ui/input.tsx";
import { toast } from "../components/ui/sonner.tsx";
import CustomDialog from "../components/CustomDialog";
import Footer from "../components/Footer";
import PostDetailModal from "../components/PostDetailModal";

const RedditDataPage = () => {
    const [rawIdeas, setRawIdeas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isStoring, setIsStoring] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRawIdeasCount, setTotalRawIdeasCount] = useState(0);
    const [selectedSubreddits, setSelectedSubreddits] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [subredditCounts, setSubredditCounts] = useState({});
    const [expandedComments, setExpandedComments] = useState(new Set());
    const [availableSubreddits, setAvailableSubreddits] = useState([
        "personalfinance",
        "startups",
        "Entrepreneur",
        "smallbusiness",
        "freelance",
        "consulting",
        "overemployed",
        "jobs",
        "resumes",
        "careerguidance",
        "mentalhealth",
        "depression",
        "productivity",
        "tech",
        "logistics",
        "Accounting",
        "ecommerce",
        "marketing",
        "technology",
        "supplychain",
        "sales",
        "devops",
        "CRM",
        "oracle",
        "SAP",
        "nonprofit",
        "manufacturing",
    ]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [subredditInputs, setSubredditInputs] = useState(['', '', '', '', '']);
    
    // Twitter-related state
    const [activeTab, setActiveTab] = useState('reddit'); // 'reddit' or 'twitter'
    const [twitterPosts, setTwitterPosts] = useState([]);
    const [isTwitterLoading, setIsTwitterLoading] = useState(false);
    const [isTwitterStoring, setIsTwitterStoring] = useState(false);
    const [twitterCurrentPage, setTwitterCurrentPage] = useState(1);
    const [twitterTotalPages, setTwitterTotalPages] = useState(1);
    const [totalTwitterCount, setTotalTwitterCount] = useState(0);
    const [selectedHashtags, setSelectedHashtags] = useState([]);
    const [availableHashtags, setAvailableHashtags] = useState([]);
    const [hashtagCounts, setHashtagCounts] = useState({});
    const [isTwitterDialogOpen, setIsTwitterDialogOpen] = useState(false);
    const [hashtagInputs, setHashtagInputs] = useState(['', '', '', '', '']);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    const fetchNewIdeas = async () => {
        setIsDialogOpen(true);
    };

    const handleFetchWithSubreddits = async () => {
        const subreddits = subredditInputs.filter(input => input.trim() !== '').map(input => input.trim().toLowerCase());

        if (subreddits.length === 0) {
            toast.warning("No subreddits entered. Fetching from default subreddits.");
        }

        setIsDialogOpen(false);
        setIsStoring(true);
        setError(null);

        try {
            const response = await apiRequest.post("/reddit/fetch-raw", { subreddits });
            console.log("Raw ideas stored:", response.data);
            toast.success(`Successfully stored ${response.data.stats.totalStored} raw ideas from ${response.data.stats.subredditsProcessed} subreddits!`);

            if (subreddits.length > 0) {
                setAvailableSubreddits(prev => [...new Set([...prev, ...subreddits])]);
                setSelectedSubreddits(prev => [...new Set([...prev, ...subreddits])]);
                toast.success(`Subreddits added to filters: ${subreddits.join(', ')}`);
            }

            fetchStoredRawIdeas(1);
        } catch (error) {
            console.error("Failed to store raw ideas:", error);
            setError("Failed to store raw ideas. Please try again.");
            toast.error("Failed to store raw ideas. Please try again.");
        } finally {
            setIsStoring(false);
            setSubredditInputs(['', '', '', '', '']); 
        }
    };

    const fetchStoredRawIdeas = async (page = 1) => {
        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20'
            });

            if (selectedSubreddits.length > 0) {
                selectedSubreddits.forEach(subreddit => {
                    params.append('subreddit', subreddit);
                });
            }

            const response = await apiRequest.get(`/reddit/raw-ideas?${params.toString()}`);
            setRawIdeas(response.data.data || []);
            setCurrentPage(response.data.pagination.currentPage);
            setTotalPages(response.data.pagination.totalPages);
            setTotalRawIdeasCount(response.data.pagination.totalItems);
            //    console.log('Fetched raw ideas from API:', JSON.stringify(response.data.data, null, 2));
        } catch (error) {
            console.error("Failed to fetch stored raw ideas:", error);
            setError("Failed to fetch stored raw ideas. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubredditCounts = async () => {
        try {
            const response = await apiRequest.get("/reddit/subreddit-counts");
            setSubredditCounts(response.data.data || {});
        } catch (error) {
            console.error("Failed to fetch subreddit counts:", error);
        }
    };

    const handleApplyFilter = () => {
        fetchStoredRawIdeas(1);
        setShowFilter(false);
    };

    const handleClearFilter = () => {
        setSelectedSubreddits([]);
        setCurrentPage(1);
        fetchStoredRawIdeas(1);
        setShowFilter(false);
    };

    const handleSubredditToggle = (subreddit) => {
        setSelectedSubreddits((prev) =>
            prev.includes(subreddit)
                ? prev.filter((s) => s !== subreddit)
                : [...prev, subreddit]
        );
    };

    const toggleComments = (postId) => {
        setExpandedComments(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });
    };

    // Twitter functions
    const fetchNewTwitterPosts = async () => {
        setIsTwitterDialogOpen(true);
    };

    const handleFetchWithHashtags = async () => {
        const hashtags = hashtagInputs.filter(input => input.trim() !== '').map(input => input.trim().toLowerCase().replace('#', ''));

        if (hashtags.length === 0) {
            toast.warning("No hashtags entered. Fetching from default hashtags.");
        }

        setIsTwitterDialogOpen(false);
        setIsTwitterStoring(true);

        try {
            const response = await apiRequest.post("/twitter/fetch-posts", { 
                hashtags: hashtags.length > 0 ? hashtags : availableHashtags.slice(0, 5),
                maxResults: 10 
            });
            
            console.log("Twitter posts stored:", response.data);
            toast.success(`Successfully stored ${response.data.stats.stored} Twitter posts from ${response.data.stats.hashtagsProcessed} hashtags!`);

            if (hashtags.length > 0) {
                setAvailableHashtags(prev => [...new Set([...prev, ...hashtags])]);
                setSelectedHashtags(prev => [...new Set([...prev, ...hashtags])]);
                toast.success(`Hashtags added to filters: ${hashtags.join(', ')}`);
            }

            fetchStoredTwitterPosts(1);
            fetchHashtagCounts();
        } catch (error) {
            console.error("Failed to store Twitter posts:", error);
            toast.error("Failed to store Twitter posts. Please try again.");
        } finally {
            setIsTwitterStoring(false);
            setHashtagInputs(['', '', '', '', '']);
        }
    };

    const fetchStoredTwitterPosts = async (page = 1) => {
        setIsTwitterLoading(true);

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20'
            });

            if (selectedHashtags.length > 0) {
                selectedHashtags.forEach(hashtag => {
                    params.append('hashtag', hashtag);
                });
            }

            const response = await apiRequest.get(`/twitter/stored-posts?${params.toString()}`);
            setTwitterPosts(response.data.data || []);
            setTwitterCurrentPage(response.data.pagination.currentPage);
            setTwitterTotalPages(response.data.pagination.totalPages);
            setTotalTwitterCount(response.data.pagination.totalItems);
        } catch (error) {
            console.error("Failed to fetch stored Twitter posts:", error);
            toast.error("Failed to fetch stored Twitter posts. Please try again.");
        } finally {
            setIsTwitterLoading(false);
        }
    };

    const fetchHashtagCounts = async () => {
        try {
            const response = await apiRequest.get("/twitter/hashtag-counts");
            const counts = response.data.data || {};
            setHashtagCounts(counts);
            setAvailableHashtags(prev => [...new Set([...prev, ...Object.keys(counts)])]);
        } catch (error) {
            console.error("Failed to fetch hashtag counts:", error);
        }
    };

    const handleHashtagToggle = (hashtag) => {
        setSelectedHashtags((prev) =>
            prev.includes(hashtag)
                ? prev.filter((h) => h !== hashtag)
                : [...prev, hashtag]
        );
    };

    const handleTwitterApplyFilter = () => {
        fetchStoredTwitterPosts(1);
        setShowFilter(false);
    };

    const handleTwitterClearFilter = () => {
        setSelectedHashtags([]);
        setTwitterCurrentPage(1);
        fetchStoredTwitterPosts(1);
        setShowFilter(false);
    };

    const handleCardClick = (post) => {
        setSelectedPost(post);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPost(null);
    };

    useEffect(() => {
        fetchStoredRawIdeas();
    }, []);

    useEffect(() => {
        if (activeTab === 'twitter') {
            fetchStoredTwitterPosts();
            fetchHashtagCounts();
        }
    }, [activeTab]);

    // Prevent body scroll and hide navbar when modal is open
    useEffect(() => {
        const shouldHideNavbar = isModalOpen || isDialogOpen || isTwitterDialogOpen;

        if (shouldHideNavbar) {
            document.body.style.overflow = 'hidden';

            // Hide navbar
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                nav, .navbar, .nav, header, .navigation {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
        } else {
            document.body.style.overflow = 'unset';

            // Remove navbar hiding styles
            const style = document.getElementById('modal-styles');
            if (style) {
                style.remove();
            }
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
            const style = document.getElementById('modal-styles');
            if (style) {
                style.remove();
            }
        };
    }, [isModalOpen, isDialogOpen, isTwitterDialogOpen]);

    const currentData = activeTab === 'reddit' ? rawIdeas : twitterPosts;

    return (
        <div className={`min-h-screen bg-[#e6ebef] ${isModalOpen ? 'modal-open' : ''}`}>
            <div className="pt-28 sm:pt-28 px-2 sm:px-4 lg:px-6">
                <div className="max-w-screen-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 sm:mb-10 md:mb-12 text-center">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-center mb-4">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mr-4 shad-lg">
                                    <MessageCircle className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
                                    Raw <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Reddit Data</span>
                                </h1>
                            </div>
                            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                                {activeTab === 'reddit' ? 'Raw Reddit posts extracted from various subreddits' : 'Twitter posts extracted from hashtag searches'}
                            </p>
                            
                            {/* Tab Navigation */}
                            <div className="mt-8 flex items-center justify-center">
                                <div className="flex bg-white/30 backdrop-blur-sm border border-gray-200 rounded-2xl p-2">
                                    <button
                                        onClick={() => setActiveTab('reddit')}
                                        className={`flex items-center space-x-2 px-6 py-3 cursor-pointer rounded-xl font-semibold transition-all duration-300 ${
                                            activeTab === 'reddit'
                                                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white '
                                                : 'text-gray-600 hover:text-orange-600'
                                        }`}
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                        <span>Reddit</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('twitter')}
                                        className={`flex items-center space-x-2 px-6 py-3 rounded-xl cursor-pointer duration-300 font-semibold transition-all  ${
                                            activeTab === 'twitter'
                                                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                                                : 'text-gray-600 hover:text-orange-600'
                                        }`}
                                    >
                                        <Hash className="h-5 w-5" />
                                        <span>Twitter</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mt-8 flex items-center justify-center">
                                <Button
                                    onClick={activeTab === 'reddit' ? fetchNewIdeas : fetchNewTwitterPosts}
                                    disabled={activeTab === 'reddit' ? isStoring : isTwitterStoring}
                                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl transition-all duration-200 transform cursor-pointer flex items-center space-x-2"
                                >
                                    {(activeTab === 'reddit' ? isStoring : isTwitterStoring) ? (
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                    ) : (
                                        activeTab === 'reddit' ? <Database className="h-5 w-5" /> : <Hash className="h-5 w-5" />
                                    )}
                                    <span>
                                        {(activeTab === 'reddit' ? isStoring : isTwitterStoring) 
                                            ? "Fetching..." 
                                            : activeTab === 'reddit' 
                                                ? "Fetch New Ideas" 
                                                : "Fetch Twitter Posts"
                                        }
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Custom Dialog for Subreddit Input */}
                    <CustomDialog
                        isOpen={isDialogOpen}
                        onClose={() => setIsDialogOpen(false)}
                        title="Enter Subreddits"
                        description="Enter up to 5 subreddits to fetch ideas from. Leave fields empty to skip."
                        footer={
                            <>
                                <Button
                                    onClick={() => {
                                        setSubredditInputs(['', '', '', '', '']);
                                        setIsDialogOpen(false);
                                    }}
                                    variant="outline"
                                    className="bg-white/30 backdrop-blur-sm border border-gray-200 hover:bg-white/50 cursor-pointer text-gray-700 hover:text-orange-600 px-6 py-3 rounded-xl transition-all duration-200 font-semibold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleFetchWithSubreddits}
                                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl transition-all duration-200 transform cursor-pointer font-semibold"
                                >
                                    Fetch Ideas
                                </Button>
                            </>
                        }
                    >
                        <div className="grid gap-4">
                            {subredditInputs.map((input, index) => (
                                <div key={index} className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor={`subreddit-${index}`} className="text-right text-sm font-medium text-gray-700">
                                        Subreddit {index + 1}
                                    </label>
                                    <Input
                                        id={`subreddit-${index}`}
                                        value={input}
                                        onChange={(e) => {
                                            const newInputs = [...subredditInputs];
                                            newInputs[index] = e.target.value;
                                            setSubredditInputs(newInputs);
                                        }}
                                        placeholder="e.g., python, javascript"
                                        className="col-span-3 bg-white/50 border-gray-200 focus:border-orange-300"
                                    />
                                </div>
                            ))}
                        </div>
                    </CustomDialog>

                    {/* Custom Dialog for Hashtag Input */}
                    <CustomDialog
                        isOpen={isTwitterDialogOpen}
                        onClose={() => setIsTwitterDialogOpen(false)}
                        title="Enter Hashtags"
                        description="Enter up to 5 hashtags to fetch Twitter posts from. Leave fields empty to skip. Don't include the # symbol."
                        footer={
                            <>
                                <Button
                                    onClick={() => {
                                        setHashtagInputs(['', '', '', '', '']);
                                        setIsTwitterDialogOpen(false);
                                    }}
                                    variant="outline"
                                    className="bg-white/30 backdrop-blur-sm border border-gray-200 hover:bg-white/50 cursor-pointer text-gray-700 hover:text-orange-600 px-6 py-3 rounded-xl transition-all duration-200 font-semibold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleFetchWithHashtags}
                                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl transition-all duration-200 transform cursor-pointer font-semibold"
                                >
                                    Fetch Posts
                                </Button>
                            </>
                        }
                    >
                        <div className="grid gap-4">
                            {hashtagInputs.map((input, index) => (
                                <div key={index} className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor={`hashtag-${index}`} className="text-right text-sm font-medium text-gray-700">
                                        Hashtag {index + 1}
                                    </label>
                                    <Input
                                        id={`hashtag-${index}`}
                                        value={input}
                                        onChange={(e) => {
                                            const newInputs = [...hashtagInputs];
                                            newInputs[index] = e.target.value;
                                            setHashtagInputs(newInputs);
                                        }}
                                        placeholder="e.g., entrepreneur, startup"
                                        className="col-span-3 bg-white/50 border-gray-200 focus:border-orange-300"
                                    />
                                </div>
                            ))}
                        </div>
                    </CustomDialog>

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
                                        Error
                                    </h3>
                                    <p className="mt-1 text-sm text-orange-700">
                                        {error}
                                    </p>
                                    <div className="mt-3">
                                        <button
                                            onClick={fetchNewIdeas}
                                            className="bg-orange-100 px-3 py-1 rounded-md text-sm font-medium text-orange-800 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Total Count Display */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                        <div className=" px-6 py-4 ">
                            <div className="text-center">
                                <div className="text-sm font-medium text-gray-600 mb-1">
                                    {activeTab === 'reddit' ? 'Total Raw Ideas' : 'Total Twitter Posts'} 
                                    <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                        {(activeTab === 'reddit' ? totalRawIdeasCount : totalTwitterCount).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => {
                                setShowFilter(!showFilter);
                                if (!showFilter) {
                                    if (activeTab === 'reddit') {
                                        fetchSubredditCounts();
                                    } else {
                                        fetchHashtagCounts();
                                    }
                                }
                            }}
                            variant="outline"
                            className="bg-white/30 backdrop-blur-sm border border-gray-200 hover:bg-white/50 cursor-pointer text-gray-700 hover:text-orange-600 px-6 py-3 rounded-2xl transition-all duration-300 flex items-center space-x-2 font-semibold "
                        >
                            <Filter className="h-5 w-5" />
                            <span>{activeTab === 'reddit' ? 'Filter by Subreddit' : 'Filter by Hashtag'}</span>
                            {(activeTab === 'reddit' ? selectedSubreddits : selectedHashtags).length > 0 && (
                                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                                    {(activeTab === 'reddit' ? selectedSubreddits : selectedHashtags).length}
                                </span>
                            )}
                        </Button>
                    </div>

                    {/* Filter Panel */}
                    {showFilter && (
                        <div className="mb-8 bg-white/30 backdrop-blur-sm border border-gray-200 rounded-3xl p-6 md:p-8 transition-all duration-500">
                            <div className="pb-4 border-b border-gray-100 mb-6">
                                <h3 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center">
                                    <Filter className="h-5 w-5 mr-2 text-orange-500" />
                                    {activeTab === 'reddit' ? 'Filter by Subreddit' : 'Filter by Hashtag'}
                                </h3>
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {activeTab === 'reddit' ? (
                                        availableSubreddits.map((subreddit) => (
                                            <button
                                                key={subreddit}
                                                onClick={() => handleSubredditToggle(subreddit)}
                                                className={`group relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform  cursor-pointer ${selectedSubreddits.includes(subreddit)
                                                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white '
                                                        : 'bg-white/50 text-gray-800 hover:bg-white/70  border border-gray-100'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold">r/{subreddit}</span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ml-2 font-semibold ${selectedSubreddits.includes(subreddit)
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700'
                                                        }`}>
                                                        {subredditCounts[subreddit] || 0}
                                                    </span>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        availableHashtags.map((hashtag) => (
                                            <button
                                                key={hashtag}
                                                onClick={() => handleHashtagToggle(hashtag)}
                                                className={`group relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform  cursor-pointer ${selectedHashtags.includes(hashtag)
                                                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white '
                                                        : 'bg-white/50 text-gray-800 hover:bg-white/70  border border-gray-100'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold">#{hashtag}</span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ml-2 font-semibold ${selectedHashtags.includes(hashtag)
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700'
                                                        }`}>
                                                        {hashtagCounts[hashtag] || 0}
                                                    </span>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                                    <div className="text-sm text-gray-600 font-medium">
                                        <span className="text-orange-600 font-bold">
                                            {activeTab === 'reddit' ? selectedSubreddits.length : selectedHashtags.length}
                                        </span> {activeTab === 'reddit' ? 'subreddit' : 'hashtag'}{(activeTab === 'reddit' ? selectedSubreddits.length : selectedHashtags.length) !== 1 ? 's' : ''} selected
                                    </div>
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <Button
                                            onClick={activeTab === 'reddit' ? handleClearFilter : handleTwitterClearFilter}
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 sm:flex-none text-gray-700 hover:bg-white/50 cursor-pointer border border-gray-200 bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all duration-200 "
                                        >
                                            Clear All
                                        </Button>
                                        <Button
                                            onClick={activeTab === 'reddit' ? handleApplyFilter : handleTwitterApplyFilter}
                                            size="sm"
                                            className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-red-600 text-white cursor-pointer hover:from-orange-600 hover:to-red-700 rounded-xl font-semibold transform  transition-all duration-200"
                                        >
                                            Apply Filter
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Posts List */}
                    <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {currentData.map((post, index) => (
                            <div 
                                key={post.id || index} 
                                onClick={() => handleCardClick(post)}
                                className="group bg-white/30 backdrop-blur-sm rounded-3xl overflow-hidden transition-all duration-500 hover:bg-white/40 cursor-pointer flex flex-col h-full"
                            >
                                <div className="p-6 md:p-8 flex flex-col flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            {activeTab === 'reddit' ? (
                                                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 leading-tight hover:text-orange-600 transition-colors duration-200 line-clamp-2">
                                                    <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                        {post.postTitle || post.title}
                                                    </a>
                                                </h3>
                                            ) : (
                                                <div className="text-base md:text-lg font-bold text-gray-900 mb-3 leading-tight line-clamp-3">
                                                    {post.text}
                                                </div>
                                            )}
                                            <div className="flex items-center flex-wrap gap-x-3 gap-y-2 text-xs text-gray-500">
                                                {activeTab === 'reddit' ? (
                                                    <>
                                                        <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-full">
                                                            <User className="h-3 w-3 text-orange-500" />
                                                            <span className="font-medium">{post.author}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1 bg-gradient-to-r from-orange-100 to-red-100 px-2 py-1 rounded-full">
                                                            <span className="font-semibold text-orange-700">r/{post.subreddit}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <ThumbsUp className="h-3 w-3 text-blue-500" />
                                                            <span className="font-medium">{post.upvotes}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <MessageCircle className="h-3 w-3 text-green-500" />
                                                            <span className="font-medium">{post.commentCount}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-full">
                                                            <User className="h-3 w-3 text-orange-500" />
                                                            <span className="font-medium">{post.authorId}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-100 to-blue-100 px-2 py-1 rounded-full">
                                                            <Hash className="h-3 w-3 text-blue-700" />
                                                            <span className="font-semibold text-blue-700">{post.searchHashtag}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Heart className="h-3 w-3 text-red-500" />
                                                            <span className="font-medium">{post.likes}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Repeat2 className="h-3 w-3 text-green-500" />
                                                            <span className="font-medium">{post.retweets}</span>
                                                        </div>
                                                    </>
                                                )}
                                                {(post.fetchedAt || post.createdAt) && (
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="h-3 w-3 text-purple-500" />
                                                        <span>{new Date(post.fetchedAt || post.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <a
                                            href={activeTab === 'reddit' ? post.permalink : post.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-4 p-2 rounded-full bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 transition-all duration-200  cursor-pointer flex-shrink-0"
                                        >
                                            <ExternalLink className="h-4 w-4 text-orange-600" />
                                        </a>
                                    </div>

                                    {/* Content section */}
                                    {activeTab === 'reddit' && (post.selftext || post.description) && (
                                        <div className="my-4 flex-1">
                                            <p className="text-gray-700 leading-relaxed line-clamp-3 text-sm font-medium">
                                                {post.selftext || post.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Hashtags for Twitter */}
                                    {activeTab === 'twitter' && post.hashtags && post.hashtags.length > 0 && (
                                        <div className="my-4">
                                            <div className="mb-2">
                                                <span className="text-xs font-semibold text-gray-600">Hashtags:</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {post.hashtags.slice(0, 5).map((hashtag, idx) => (
                                                    <span key={idx} className="text-xs bg-gray-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                                        #{hashtag}
                                                    </span>
                                                ))}
                                                {post.hashtags.length > 5 && (
                                                    <span className="text-xs text-gray-500 px-2 py-1">
                                                        +{post.hashtags.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'reddit' && post.comments && post.comments.length > 0 && (
                                        <div className="border-t border-gray-100 pt-4 mt-auto">
                                            <button
                                                onClick={() => toggleComments(post.id)}
                                                className="flex items-center justify-between w-full text-left hover:bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-xl p-3 transition-all duration-200 cursor-pointer group/btn"
                                            >
                                                <div className="flex items-center">
                                                    <MessageCircle className="h-4 w-4 text-orange-500 mr-2" />
                                                    <h4 className="text-sm font-semibold text-gray-800 group-hover/btn:text-orange-600 transition-colors">
                                                        Comments ({post.comments.length})
                                                    </h4>
                                                </div>
                                                {expandedComments.has(post.id) ? (
                                                    <ChevronUp className="h-5 w-5 text-orange-500 transition-transform duration-200" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 text-gray-400 group-hover/btn:text-orange-500 transition-colors duration-200" />
                                                )}
                                            </button>

                                            {expandedComments.has(post.id) && (
                                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 mt-3 custom-scrollbar">
                                                    {post.comments.map((comment, commentIndex) => (
                                                        <div key={commentIndex} className="bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl p-4 border border-gray-100 hover:border-orange-200 transition-colors duration-200">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <User className="h-3 w-3 text-orange-500" />
                                                                <span className="text-xs font-semibold text-gray-700">{comment.author || 'anonymous'}</span>
                                                                <span className="text-gray-300">•</span>
                                                                <Calendar className="h-3 w-3 text-gray-400" />
                                                                <span className="text-xs text-gray-500">
                                                                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Unknown date'}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-800 leading-relaxed font-medium">
                                                                {comment.text || 'No comment text available'}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {(activeTab === 'reddit' ? isLoading : isTwitterLoading) && (
                            [...Array(6)].map((_, index) => (
                                <div key={index} className="bg-white/30 backdrop-blur-sm rounded-3xl overflow-hidden">
                                    <div className="p-6 md:p-8">
                                        <div className="animate-pulse">
                                            <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 mb-4"></div>
                                            <div className="flex flex-wrap gap-x-3 gap-y-2 mb-4">
                                                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
                                                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-24"></div>
                                                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16"></div>
                                            </div>
                                            <div className="space-y-2 mt-4">
                                                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
                                                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-5/6"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {!(activeTab === 'reddit' ? isLoading : isTwitterLoading) && currentData.length === 0 && !error && (
                            <div className="text-center py-16 px-4 md:col-span-2 lg:col-span-3">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                                    {activeTab === 'reddit' ? <MessageCircle className="h-8 w-8 text-gray-400" /> : <Hash className="h-8 w-8 text-gray-400" />}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {activeTab === 'reddit' 
                                        ? (selectedSubreddits.length > 0 ? 'No ideas found for selected subreddits' : 'No stored raw ideas found')
                                        : (selectedHashtags.length > 0 ? 'No posts found for selected hashtags' : 'No stored Twitter posts found')
                                    }
                                </h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    {activeTab === 'reddit'
                                        ? (selectedSubreddits.length > 0
                                            ? `No ideas found in the selected subreddits: ${selectedSubreddits.join(', ')}. Try selecting different subreddits or clear the filter.`
                                            : 'Click "Fetch New Ideas" to fetch and store raw ideas from all subreddits.'
                                        )
                                        : (selectedHashtags.length > 0
                                            ? `No posts found for the selected hashtags: ${selectedHashtags.join(', ')}. Try selecting different hashtags or clear the filter.`
                                            : 'Click "Fetch Twitter Posts" to fetch and store posts from trending hashtags.'
                                        )
                                    }
                                </p>
                                {(activeTab === 'reddit' ? selectedSubreddits : selectedHashtags).length > 0 ? (
                                    <Button
                                        onClick={activeTab === 'reddit' ? handleClearFilter : handleTwitterClearFilter}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-xl transition-all duration-200 transform  mr-4"
                                    >
                                        Clear Filter
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={activeTab === 'reddit' ? fetchNewIdeas : fetchNewTwitterPosts}
                                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-2 rounded-xl transition-all duration-200 transform hover"
                                    >
                                        {activeTab === 'reddit' ? 'Fetch New Ideas' : 'Fetch Twitter Posts'}
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {(activeTab === 'reddit' ? totalPages : twitterTotalPages) > 1 && (
                            <div className="mt-8 flex items-center justify-center space-x-2">
                                <button
                                    onClick={() => {
                                        if (activeTab === 'reddit') {
                                            fetchStoredRawIdeas(currentPage - 1);
                                        } else {
                                            fetchStoredTwitterPosts(twitterCurrentPage - 1);
                                        }
                                    }}
                                    disabled={
                                        (activeTab === 'reddit' ? currentPage : twitterCurrentPage) === 1 || 
                                        (activeTab === 'reddit' ? isLoading : isTwitterLoading)
                                    }
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                <span className="px-4 py-2 text-sm text-gray-700">
                                    Page {activeTab === 'reddit' ? currentPage : twitterCurrentPage} of {activeTab === 'reddit' ? totalPages : twitterTotalPages}
                                </span>

                                <button
                                    onClick={() => {
                                        if (activeTab === 'reddit') {
                                            fetchStoredRawIdeas(currentPage + 1);
                                        } else {
                                            fetchStoredTwitterPosts(twitterCurrentPage + 1);
                                        }
                                    }}
                                    disabled={
                                        (activeTab === 'reddit' ? currentPage : twitterCurrentPage) === (activeTab === 'reddit' ? totalPages : twitterTotalPages) || 
                                        (activeTab === 'reddit' ? isLoading : isTwitterLoading)
                                    }
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Post Detail Modal */}
            <PostDetailModal
                isOpen={isModalOpen}
                onClose={closeModal}
                post={selectedPost}
                activeTab={activeTab}
            />

            <Footer />
        </div>
    );
};

export default RedditDataPage;