import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Target,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import apiRequest from "../lib/apiRequest";

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'health':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'wealth':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'relationships':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'other':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

const IdeaDetailPage = () => {
  const { id } = useParams();
  const [idea, setIdea] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);


  useEffect(() => {
    const fetchIdea = async () => {
      if (!id) {
        console.log('No ID provided');
        setIdea(null);
        setIsLoading(false);
        return;
      }
      
      console.log('Fetching idea with ID:', id);
      setIsLoading(true);
      try {
        // First fetch the idea
        const response = await apiRequest.get(`/ideas/${id}`);
        console.log('API Response:', response);
        
        if (!response || !response.data) {
          throw new Error('No response data received');
        }
        
        if (!response.data.data) {
          throw new Error('No idea data in response');
        }
        
        const ideaData = response.data.data;
        console.log('Idea data:', ideaData);
        
        setIdea(ideaData);
        
        // Then check if it's a favorite - handle the 404 gracefully
        try {
          console.log('Checking favorite status...');
          const favoritesResponse = await apiRequest.get(`/favorites/check/${id}`);
          console.log('Favorite status response:', favoritesResponse);
          
          if (favoritesResponse.data && typeof favoritesResponse.data.isFavorite === 'boolean') {
            setIsFavorite(favoritesResponse.data.isFavorite);
          }
        } catch (favoriteError) {
          console.warn('Could not check favorite status:', favoriteError);
          // Set default to false if favorites endpoint is not available
          setIsFavorite(false);
        }
      } catch (error) {
        console.error("Failed to fetch idea:", error);
        setIdea(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdea();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Idea not found
          </h2>
          <p className="text-gray-600 mb-4">
            The idea you're looking for doesn't exist.
          </p>
          <Link
            to="/dashboard"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Back to Ideas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Ideas</span>
          </Link>
        </div>

        {/* Agent 1: Pain Point Analyzer - Updated with single pain point */}
      <Card className="border-l-4 border-red-500">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center space-x-2 text-red-700">
            <Target className="h-5 w-5" />
            <span> Pain Point Analyzer</span>
          </CardTitle>
          <p className="text-sm text-red-600">Extract and structure pain points, frustrations, and unmet needs</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          
          {/* Pain Point Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 border rounded-lg text-center bg-red-50">
              <p className="text-xs text-red-600 mb-1">Pain Point</p>
              <p className="text-lg font-bold text-red-700">{idea.title}</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <p className="text-xs text-slate-500 mb-1">Rank Score</p>
              <p className="text-lg font-bold text-red-600">{idea.rankScore}</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <p className="text-xs text-slate-500 mb-1">Intensity</p>
              <Badge variant={idea.intensity === 'High' ? 'destructive' : 'secondary'}>
                {idea.intensity}
              </Badge>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <p className="text-xs text-slate-500 mb-1">Urgency</p>
              <Badge variant={idea.urgency === 'High' ? 'destructive' : 'secondary'}>
                {idea.urgency}
              </Badge>
            </div>
          </div>

          {/* Main Pain Point Card */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-slate-900">{idea.title}</h3>
                <Badge className={getCategoryColor(idea.category)} variant="outline">
                  {idea.category}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <TrendingUp className="h-4 w-4" />
                <span>Score: {idea.rankScore}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Summary</p>
                <p className="text-slate-800 bg-white/60 p-3 rounded-lg border">{idea.summary}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Topic</p>
                <p className="text-slate-700 text-sm bg-white/60 p-3 rounded-lg border">{idea.topic}</p>
              </div>

              {idea.quotes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-700 mb-2">User Quote</p>
                  <blockquote className="bg-white border-l-4 border-red-400 p-4 rounded-r-lg italic text-slate-700">
                    "{idea.quotes[0]}"
                  </blockquote>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Subreddit</p>
                  <p className="font-medium text-sm">r/{idea.subreddit}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Frequency</p>
                  <p className="font-medium text-sm">{idea.frequency}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Solvability</p>
                  <Badge variant={idea.potentialSolvability ? 'default' : 'outline'} className="text-xs">
                    {idea.potentialSolvability ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Status</p>
                  <Badge variant="outline" className="text-xs capitalize">
                    {idea.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-red-200">
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  <span>Posted: {new Date(idea.postDate).toLocaleDateString()}</span>
                </div>
                {/* <Button asChild variant="outline" size="sm">
                  <a 
                    href={idea.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>View Source</span>
                  </a>
                </Button> */}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      


      
      </div>
    </div>
  );
};

export default IdeaDetailPage;
