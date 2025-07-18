import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Target,
  TrendingUp,
  Clock,
  AlertCircle,
  BarChart2,
  Activity,
  Flag,
  Tag,
  Star
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import apiRequest from "../lib/apiRequest";

  const getCategoryColor = (category) => {
    if (!category) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    switch (category.toLowerCase()) {
      case 'health':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'wealth':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'relationships':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'technology':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'workplace':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'career':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'wellness':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

const IdeaDetailPage = () => {
  const { id } = useParams();
  const [idea, setIdea] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);
  const [relatedPainPoints, setRelatedPainPoints] = useState([]);
  const [businessIdeas, setBusinessIdeas] = useState([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

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
      } catch (error) {
        console.error("Failed to fetch idea:", error);
        setIdea(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdea();
  }, [id]);

  const fetchRelatedPainPoints = async () => {
    const threadId = idea?.threadId || idea?._id;
    if (!threadId) {
      console.log('No thread ID available');
      setRelatedPainPoints([]);
      setIsLoadingRelated(false);
      return;
    }
    
    console.log('Fetching related pain points for thread ID:', threadId);
    setIsLoadingRelated(true);
    try {
      const response = await apiRequest.get(`/painpoints/pain-points/thread/${threadId}`);
      console.log('API Response:', response);
      
      if (!response || !response.data) {
        throw new Error('No response data received');
      }
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to load related pain points');
      }
      
      // Extract pain points from the nested data.painPoints array
      const relatedPainPointsData = response.data.data?.painPoints || [];
      console.log('Related pain points data:', relatedPainPointsData);
      
      // Get current pain point summary for comparison
      const currentPainPointSummary = idea?.painPoint?.summary?.toLowerCase().trim();
      const seenSummaries = new Set();
      
      // Process and filter pain points
      const formattedPainPoints = relatedPainPointsData
        // Filter out duplicates based on summary (case-insensitive)
        .filter(point => {
          if (!point.summary) return false; // Skip if no summary
          
          const normalizedSummary = point.summary.toLowerCase().trim();
          
          // Skip if this is the current pain point or a duplicate summary
          if (normalizedSummary === currentPainPointSummary || 
              seenSummaries.has(normalizedSummary)) {
            return false;
          }
          
          seenSummaries.add(normalizedSummary);
          return true;
        })
        // Map to the expected format
        .map(point => ({
          _id: point._id,
          title: point.title,
          summary: point.summary,
          category: point.category,
          intensity: point.intensity,
          urgency: point.urgency,
          keywords: point.keywords || []
        }))
        // Limit to 5 items
        .slice(0, 5);
      
      console.log('Filtered related pain points:', formattedPainPoints);
      console.log('Current pain point summary:', currentPainPointSummary);
      setRelatedPainPoints(formattedPainPoints);
    } catch (error) {
      console.error("Failed to fetch related pain points:", error);
      setRelatedPainPoints([]);
    } finally {
      setIsLoadingRelated(false);
    }
  };

  // Fetch related pain points when the idea is loaded
  useEffect(() => {
    if (idea?._id) {
      console.log('Idea loaded, fetching related pain points for thread ID:', idea.threadId || idea._id);
      fetchRelatedPainPoints();
    }
  }, [idea?._id]);

  // Fetch business ideas when the idea is loaded
  useEffect(() => {
    const fetchBusinessIdeas = async () => {
      if (!idea?._id) return;
      
      setIsGeneratingIdeas(true);
      try {
        console.log('Fetching business ideas for pain point ID:', idea._id);
        const response = await apiRequest.post('/marketgaps/generate-ideas', {
          painPointId: idea._id,
          // Include related pain points IDs if needed
          painPointIds: [idea._id, ...relatedPainPoints.map(p => p._id)]
        });
        
        console.log('Business ideas response:', response.data);
        
        if (response.data?.success) {
          setBusinessIdeas(Array.isArray(response.data.data) ? response.data.data : []);
        }
      } catch (error) {
        console.error('Failed to fetch business ideas:', error);
        setBusinessIdeas([]);
      } finally {
        setIsGeneratingIdeas(false);
      }
    };
    
    fetchBusinessIdeas();
  }, [idea?._id, relatedPainPoints]); // Re-run when idea._id or relatedPainPoints change

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Idea not found
          </h2>
          <p className="text-gray-600 mb-6">
            The idea you're looking for doesn't exist.
          </p>
          <Link
            to="/dashboard"
            className="px-6 py-2 text-lg font-semibold !text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 inline-block"
          >
            Back to Ideas
          </Link>
        </div>
      </div>
    );
  }


  // Function to get badge variant based on intensity/urgency
  const getBadgeVariant = (value) => {
    if (!value) return 'outline';
    switch(value.toLowerCase()) {
      case 'high': 
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      case 'medium': 
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
      case 'low': 
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      default: 
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
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

        {/* Agent 1: Pain Point Analyzer */}
        <Card className="bg-white rounded-xl shadow-md overflow-hidden border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <Target className="h-5 w-5" />
                  <span>Pain Point Analyzer</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Extract and structure pain points, frustrations, and unmet needs</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-primary">
                <span className="font-medium">Score: {idea.rankScore}</span>
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Combined Pain Point Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <h2 className="text-xl font-bold text-slate-900">{idea.title}</h2>
                    <Badge className={getCategoryColor(idea.category)} variant="outline">
                      {idea.category}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeVariant(idea.intensity).bg} ${getBadgeVariant(idea.intensity).text} ${getBadgeVariant(idea.intensity).border}`}>
                      {idea.intensity} Intensity
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeVariant(idea.urgency).bg} ${getBadgeVariant(idea.urgency).text} ${getBadgeVariant(idea.urgency).border}`}>
                      {idea.urgency} Urgency
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-1">Summary</h3>
                    <p className="text-foreground bg-muted/30 p-3 rounded-lg border">
                      {idea.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-1">Topic</h3>
                      <p className="text-foreground text-sm bg-card p-2 rounded border">
                        {idea.topic}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-1">Subreddit</h3>
                      <p className="text-foreground text-sm bg-card p-2 rounded border">
                        r/{idea.subreddit}
                      </p>
                    </div>
                  </div>

                  {idea.quotes && idea.quotes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-primary mb-2">User Quote</h3>
                      <blockquote className="bg-muted/50 border-l-4 border-primary p-4 rounded-r-lg italic text-foreground">
                        "{idea.quotes[0]}"
                      </blockquote>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-muted/10 px-6 py-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-muted-foreground gap-2">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Posted: {new Date(idea.postDate).toLocaleDateString()}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>Frequency: {idea.frequency}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Solvability:</span>
                    <Badge variant={idea.potentialSolvability ? 'default' : 'outline'} className="text-xs">
                      {idea.potentialSolvability ? 'High Potential' : 'Needs Research'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>


            {/* Key Points Section */}
            <div className="mt-8">
              <div className="text-left">
                <h3 className="text-lg font-medium text-foreground mb-4">
                  Related Pain Points
                </h3>
                
                {relatedPainPoints.length > 0 ? (
                  <ul className="space-y-3 list-disc pl-5 text-foreground">
                    {relatedPainPoints.slice(0, 5).map((point, index) => (
                      <li key={point._id}>
                        {point.summary}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No related pain points available</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Idea Generator */}
        <Card className="mt-8 bg-white rounded-xl shadow-md overflow-hidden border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Business Idea Generator</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Innovative business ideas based on the pain point analysis</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <span className="font-medium">{businessIdeas.length} Ideas Generated</span>
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            {isGeneratingIdeas ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-600">Generating innovative business ideas...</p>
              </div>
            ) : businessIdeas.length > 0 ? (
              <div className="space-y-8">
                {businessIdeas.map((idea, index) => (
                  <div key={idea.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-slate-900 mb-2">{idea.title}</h2>
                          <p className="text-foreground">{idea.description}</p>
                        </div>
                        <div className="ml-4">
                          <Badge variant="outline" className="text-sm">
                            {idea.businessModel || 'SaaS'}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4 mt-6">
                        <div>
                          <h3 className="text-sm font-medium text-foreground mb-1">Problem Statement</h3>
                          <p className="text-foreground bg-muted/30 p-3 rounded-lg border">
                            {idea.problemStatement}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-foreground mb-1">Target Audience</h3>
                            <p className="text-foreground text-sm bg-card p-2 rounded border">
                              {idea.targetAudience}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-foreground mb-1">Differentiator</h3>
                            <p className="text-foreground text-sm bg-card p-2 rounded border">
                              {idea.differentiator}
                            </p>
                          </div>
                        </div>

                        {idea.keyFeatures && idea.keyFeatures.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-foreground mb-2">Key Features</h3>
                            <ul className="space-y-2">
                              {idea.keyFeatures.map((feature, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-blue-500 mr-2">•</span>
                                  <span className="text-foreground">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {idea.useCase && (
                          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                            <h3 className="text-sm font-medium text-blue-800 mb-1">Use Case</h3>
                            <p className="text-blue-700">{idea.useCase}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-blue-50/30 px-6 py-3 border-t">
                      <div className="flex items-center justify-between text-sm text-blue-600">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Star className="h-4 w-4 mr-1" />
                            Score: {idea.score || 'N/A'}
                          </span>
                          {idea.keywords && idea.keywords.length > 0 && (
                            <div className="flex items-center flex-wrap gap-1">
                              {idea.keywords.slice(0, 3).map((keyword, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                              {idea.keywords.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{idea.keywords.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-blue-500">
                          Generated on {new Date(idea.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-600">Generating business ideas. Please wait...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IdeaDetailPage;
