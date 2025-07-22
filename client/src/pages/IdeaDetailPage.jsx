import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Target,
  Clock,
  Star,
  Lightbulb,
  Users,
  Zap,
  CheckCircle,
  Brain,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Check, Copy } from "lucide-react";
import apiRequest from "../lib/apiRequest";

const getCategoryColor = (category) => {
  if (!category) return "bg-muted text-muted-foreground";

  switch (category.toLowerCase()) {
    case "health":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "wealth":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "relationships":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "technology":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "workplace":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "career":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "wellness":
      return "bg-teal-100 text-teal-700 border-teal-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getBadgeVariant = (value) => {
  if (!value)
    return {
      bg: "bg-muted",
      text: "text-muted-foreground",
      border: "border-border",
    };
  switch (value.toLowerCase()) {
    case "high":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
      };
    case "medium":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
      };
    case "low":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
      };
    default:
      return {
        bg: "bg-muted",
        text: "text-muted-foreground",
        border: "border-border",
      };
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
  const [landingPages, setLandingPages] = useState({});
  const [copiedPromptId, setCopiedPromptId] = useState(null);

  useEffect(() => {
    const fetchIdea = async () => {
      if (!id) {
        console.log("No ID provided");
        setIdea(null);
        setIsLoading(false);
        return;
      }

      console.log("Fetching idea with ID:", id);
      setIsLoading(true);
      try {
        // First fetch the idea
        const response = await apiRequest.get(`/ideas/${id}`);
        console.log("API Response:", response);

        if (!response || !response.data) {
          throw new Error("No response data received");
        }

        if (!response.data.data) {
          throw new Error("No idea data in response");
        }

        const ideaData = response.data.data;
        console.log("Idea data:", ideaData);

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
      console.log("No thread ID available");
      setRelatedPainPoints([]);
      setIsLoadingRelated(false);
      return;
    }

    console.log("Fetching related pain points for thread ID:", threadId);
    setIsLoadingRelated(true);
    try {
      const response = await apiRequest.get(
        `/painpoints/pain-points/thread/${threadId}`
      );
      console.log("API Response:", response);

      if (!response || !response.data) {
        throw new Error("No response data received");
      }

      if (!response.data.success) {
        throw new Error(
          response.data.error || "Failed to load related pain points"
        );
      }

      // Extract pain points from the nested data.painPoints array
      const relatedPainPointsData = response.data.data?.painPoints || [];
      console.log("Related pain points data:", relatedPainPointsData);

      // Get current pain point summary for comparison
      const currentPainPointSummary = idea?.painPoint?.summary
        ?.toLowerCase()
        .trim();
      const seenSummaries = new Set();

      // Process and filter pain points
      const formattedPainPoints = relatedPainPointsData
        // Filter out duplicates based on summary (case-insensitive)
        .filter((point) => {
          if (!point.summary) return false; // Skip if no summary

          const normalizedSummary = point.summary.toLowerCase().trim();

          // Skip if this is the current pain point or a duplicate summary
          if (
            normalizedSummary === currentPainPointSummary ||
            seenSummaries.has(normalizedSummary)
          ) {
            return false;
          }

          seenSummaries.add(normalizedSummary);
          return true;
        })
        // Map to the expected format
        .map((point) => ({
          _id: point._id,
          title: point.title,
          summary: point.summary,
          category: point.category,
          intensity: point.intensity,
          urgency: point.urgency,
          keywords: point.keywords || [],
        }))
        // Limit to 5 items
        .slice(0, 5);

      console.log("Filtered related pain points:", formattedPainPoints);
      console.log("Current pain point summary:", currentPainPointSummary);
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
      console.log(
        "Idea loaded, fetching related pain points for thread ID:",
        idea.threadId || idea._id
      );
      fetchRelatedPainPoints();
    }
  }, [idea?._id]);

  // Fetch business ideas when the idea is loaded
  useEffect(() => {
    const fetchBusinessIdeas = async () => {
      if (!idea?._id) return;
      setIsGeneratingIdeas(true);
      try {
        console.log("Fetching business ideas for pain point ID:", idea._id);
        const response = await apiRequest.get(
          `/marketgaps/ideas/by-painpoint/${idea._id}`
        );
        console.log("Business ideas response:", response.data);
        if (response.data?.success) {
          setBusinessIdeas(
            Array.isArray(response.data.data) ? response.data.data : []
          );
        }
      } catch (error) {
        console.error("Failed to fetch business ideas:", error);
        setBusinessIdeas([]);
      } finally {
        setIsGeneratingIdeas(false);
      }
    };
    fetchBusinessIdeas();
  }, [idea?._id]);

  const copyToClipboard = (text, promptId) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(promptId);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const fetchLandingPage = async (businessIdeaId) => {
    console.log(
      `Fetching landing page for business idea ID: ${businessIdeaId}`
    );
    try {
      // First, try to get the landing page
      let response = await apiRequest.get(
        `/landingpage/landing-page/${businessIdeaId}`
      );
      console.log("Landing page response:", response);

      let landingPageData = null;

      // Handle different possible response structures
      if (response.data?.landingPage) {
        landingPageData = response.data.landingPage;
      } else if (response.data) {
        landingPageData = response.data;
      }

      // If no landing page exists, generate one
      if (!landingPageData) {
        console.log("No landing page found, generating a new one...");
        const generateResponse = await apiRequest.post(
          "/generate-landing-page",
          { businessIdeaId }
        );
        console.log("Generate landing page response:", generateResponse);

        if (generateResponse.data?.landingPage) {
          landingPageData = generateResponse.data.landingPage;
        } else if (generateResponse.data) {
          landingPageData = generateResponse.data;
        }

        if (!landingPageData) {
          console.warn("Failed to generate landing page");
          return null;
        }
      }

      console.log("Landing page data:", landingPageData);

      // Store the landing page data in state
      setLandingPages((prev) => ({
        ...prev,
        [businessIdeaId]: landingPageData,
      }));

      return landingPageData;
    } catch (error) {
      console.error("Failed to fetch landing page data:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received. Request config:", error.config);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }
      return null;
    }
  };

  // Fetch landing page data when business ideas are loaded
  useEffect(() => {
    if (businessIdeas.length > 0) {
      businessIdeas.forEach((idea) => {
        fetchLandingPage(idea.id || idea._id);
      });
    }
  }, [businessIdeas]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">
            Loading pain point analysis...
          </p>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 flex items-center justify-center">
        <div className="text-center bg-card p-8 rounded-2xl shadow-lg max-w-md w-full mx-4 border">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Pain Point Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            The pain point you're looking for doesn't exist or ID is missing.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Current ID: {id || "No ID provided"}
          </p>
          <Link to="/dashboard">
            <Button className="px-6 py-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Ideas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Ideas</span>
          </Link>
        </div>
      </div>

      <div className="w-full px-6 py-8">
        {/* Pain Point Analysis Section */}
        <div className="mb-16 animate-fade-in">
          {/* Section Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center animate-scale-in">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Pain Points
              </h1>
            </div>
            <p className="text-lg text-muted-foreground mt-2 text-center">
              AI-powered insights extracted from real user feedback and
              discussions
            </p>
          </div>

          {/* Main Pain Point Card */}
          <div
            className="w-full bg-gray-50 rounded-3xl p-8 shadow-lg mb-8 hover:shadow-xl transition-all duration-300 animate-scale-in"
            style={{ border: "1px solid rgba(0, 0, 0, 0.05)" }}
          >
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h2 className="text-2xl font-bold text-foreground leading-tight">
                      {idea.title}
                    </h2>
                  </div>
                  <div className="flex items-center space-x-3 mb-4">
                    <Badge
                      className={`${getCategoryColor(idea.category)} px-3 py-1`}
                      variant="outline"
                    >
                      {idea.category}
                    </Badge>
                    <Badge
                      className={`${getBadgeVariant(idea.intensity).bg} ${
                        getBadgeVariant(idea.intensity).text
                      } border-0 px-3 py-1`}
                    >
                      🔥 {idea.intensity} Intensity
                    </Badge>
                    <Badge
                      className={`${getBadgeVariant(idea.urgency).bg} ${
                        getBadgeVariant(idea.urgency).text
                      } border-0 px-3 py-1`}
                    >
                      ⚡ {idea.urgency} Urgency
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {idea.rankScore}
                  </div>
                  <div className="text-sm text-muted-foreground">AI Score</div>
                </div>
              </div>

              <div
                className="bg-gradient-to-br from-muted/30 to-muted/10 p-6 rounded-2xl"
                style={{ border: "1px solid rgba(0, 0, 0, 0.05)" }}
              >
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Problem Summary
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {idea.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className="bg-white p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  style={{ border: "1px solid rgba(0, 0, 0, 0.05)" }}
                >
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    Discussion Topic
                  </h3>
                  <p className="text-muted-foreground">{idea.topic}</p>
                </div>
                <div
                  className="bg-white p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  style={{ border: "1px solid rgba(0, 0, 0, 0.05)" }}
                >
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    Source Community
                  </h3>
                  <p className="text-muted-foreground">r/{idea.category}</p>
                </div>
              </div>

              {idea.quotes && idea.quotes.length > 0 && (
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-l-4 border-primary p-6 rounded-r-2xl">
                  <h3 className="text-sm font-semibold text-primary mb-3 flex items-center">
                    💬 Real User Quote
                  </h3>
                  <blockquote className="text-muted-foreground italic text-lg leading-relaxed">
                    "{idea.quotes[0]}"
                  </blockquote>
                </div>
              )}

              <div
                className="flex items-center justify-between pt-4 text-sm"
                style={{ borderTop: "1px solid rgba(0, 0, 0, 0.05)" }}
              >
                <div className="flex items-center space-x-6">
                  <span className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {new Date(idea.postDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <Badge
                  variant={idea.potentialSolvability ? "default" : "outline"}
                  className="px-3 py-1"
                >
                  {idea.potentialSolvability
                    ? "✅ Solvable"
                    : "🔍 Needs Research"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Related Pain Points */}
          <div
            className="w-full bg-gray-50 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
            style={{ border: "1px solid rgba(0, 0, 0, 0.05)" }}
          >
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                <Target className="h-5 w-5 text-primary" />
              </div>
              Related Pain Points
            </h3>

            {relatedPainPoints.length > 0 ? (
              <div className="space-y-4">
                {relatedPainPoints.slice(0, 4).map((point, index) => (
                  <div
                    key={point._id}
                    className="flex items-start space-x-4 p-4 bg-muted/20 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <span className="text-primary font-semibold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                      {point.summary}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="h-8 w-8" />
                </div>
                <p>No related pain points found</p>
              </div>
            )}
          </div>
        </div>

        {/* Business Solutions Section */}
        <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          {/* Section Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center animate-scale-in">
                <Lightbulb className="h-6 w-6 text-accent-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Business Solutions
              </h1>
            </div>
            <p className="text-lg text-muted-foreground mt-2 text-center">
              AI-generated innovative business ideas to solve this pain point
            </p>
          </div>

          {/* Business Ideas */}
          {isGeneratingIdeas ? (
            <div
              className="w-full bg-white rounded-3xl p-12 shadow-lg text-center"
              style={{ border: "1px solid rgba(0, 0, 0, 0.05)" }}
            >
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent/20 border-t-accent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lightbulb className="h-6 w-6 text-accent animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Generating Solutions...
                  </h3>
                  <p className="text-muted-foreground">
                    Our AI is analyzing the pain point and creating innovative
                    business ideas
                  </p>
                </div>
              </div>
            </div>
          ) : businessIdeas.length > 0 ? (
            <div className="space-y-8">
              {businessIdeas.slice(0, 3).map((businessIdea, index) => (
                <div
                  key={businessIdea.id}
                  className="w-full bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group animate-scale-in"
                  style={{
                    animationDelay: `${index * 150}ms`,
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <span className="text-xl font-bold text-accent-foreground">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {businessIdea.title}
                          </h3>
                          <p className="text-muted-foreground text-lg leading-relaxed">
                            {businessIdea.description}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="ml-4 px-3 py-1 text-sm"
                      >
                        {businessIdea.businessModel || "SaaS"}
                      </Badge>
                    </div>

                    {/* Problem Statement */}
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border border-red-100">
                      <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                        Problem Statement
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {businessIdea.problemStatement}
                      </p>
                    </div>

                    {/* Key Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100">
                        <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                          <Users className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                          Target Audience
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {businessIdea.targetAudience}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                        <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                          <Zap className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                          Key Differentiator
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {businessIdea.differentiator}
                        </p>
                      </div>
                    </div>

                    {/* Key Features */}
                    {businessIdea.keyFeatures &&
                      businessIdea.keyFeatures.length > 0 && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                            <Star className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                            Key Features
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {businessIdea.keyFeatures
                              .slice(0, 4)
                              .map((feature, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start space-x-3"
                                >
                                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-muted-foreground leading-relaxed">
                                    {feature}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* Use Case */}
                    {businessIdea.useCase && (
                      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-2xl border border-amber-100">
                        <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                          💡 Real-World Use Case
                        </h4>
                        <p className="text-muted-foreground leading-relaxed italic">
                          {businessIdea.useCase}
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-6 border-t border-border/30 text-sm">
                      <div className="flex items-center space-x-6">
                        <span className="flex items-center text-foreground font-medium">
                          <Star className="h-4 w-4 mr-2 text-yellow-500" />
                          AI Score: {businessIdea.score || "N/A"}
                        </span>
                        {businessIdea.keywords &&
                          businessIdea.keywords.length > 0 && (
                            <div className="flex items-center space-x-2">
                              <span className="text-muted-foreground">
                                Tags:
                              </span>
                              {businessIdea.keywords
                                .slice(0, 2)
                                .map((keyword, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs px-2 py-1"
                                  >
                                    {keyword}
                                  </Badge>
                                ))}
                            </div>
                          )}
                      </div>
                      <span className="text-muted-foreground">
                        Generated:{" "}
                        {new Date(businessIdea.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Landing Page Prompts Section */}
              {businessIdeas.length > 0 && (
                <div className="mt-12">
                  <div className="flex flex-col items-center mb-8">
                    <div className="mt-12 flex items-center space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6 text-purple-600"
                        >
                          <path d="M2 3h20"></path>
                          <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"></path>
                          <path d="m7 21 5-5 5 5"></path>
                        </svg>
                      </div>
                      <h1 className="text-2xl font-bold text-foreground">
                        Landing Page Prompts
                      </h1>
                    </div>
                    <p className="text-muted-foreground mt-2 text-center">
                      Copy and use these prompts to generate landing pages for
                      your business ideas
                    </p>
                  </div>

                  {businessIdeas.map((businessIdea) => (
                    <div
                      key={`prompt-${businessIdea.id || businessIdea._id}`}
                      className="mb-8"
                    >
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-slate-900">
                            Idea: {businessIdea.title}
                          </h4>
                          <Button
                            onClick={() => {
                              const landingPage =
                                landingPages[
                                  businessIdea.id || businessIdea._id
                                ];
                              copyToClipboard(
                                landingPage?.lovablePrompt ||
                                  "No prompt available",
                                businessIdea.id || businessIdea._id
                              );
                            }}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2"
                          >
                            {copiedPromptId ===
                            (businessIdea.id || businessIdea._id) ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            <span>
                              {copiedPromptId ===
                              (businessIdea.id || businessIdea._id)
                                ? "Copied!"
                                : "Copy Prompt"}
                            </span>
                          </Button>
                        </div>
                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm text-sm font-mono text-slate-700 max-h-64 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-left">
                            {(() => {
                              const landingPageData =
                                landingPages[
                                  businessIdea.id || businessIdea._id
                                ];
                              console.log(
                                "Rendering landing page data for",
                                businessIdea.id || businessIdea._id,
                                ":",
                                landingPageData
                              );

                              // Handle different possible response structures
                              const prompt =
                                landingPageData?.lovablePrompt ||
                                landingPageData?.landingPage?.lovablePrompt ||
                                "No prompt available";

                              console.log("Extracted prompt:", prompt);
                              return prompt;
                            })()}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              className="w-full bg-white rounded-3xl p-12 shadow-lg text-center"
              style={{ border: "1px solid rgba(0, 0, 0, 0.05)" }}
            >
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent/20 border-t-accent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lightbulb className="h-6 w-6 text-accent animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Loading Solutions...
                  </h3>
                  <p className="text-muted-foreground">
                    Please wait while we generate business ideas
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaDetailPage;
