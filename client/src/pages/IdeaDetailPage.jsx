import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Target, Clock, Lightbulb, Brain, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import apiRequest from "../lib/apiRequest";
import BackButton from "../components/BackButton";

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
  const [businessIdeas, setBusinessIdeas] = useState([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  // const [landingPages, setLandingPages] = useState({});
  // const [copiedPromptId, setCopiedPromptId] = useState(null);

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

  // const copyToClipboard = (text, promptId) => {
  //   navigator.clipboard.writeText(text);
  //   setCopiedPromptId(promptId);
  //   setTimeout(() => setCopiedPromptId(null), 2000);
  // };

  // const fetchLandingPage = async (businessIdeaId) => {
  //   console.log(
  //     `Fetching landing page for business idea ID: ${businessIdeaId}`
  //   );
  //   try {
  //     // First, try to get the landing page
  //     let response = await apiRequest.get(
  //       `/landingpage/landing-page/${businessIdeaId}`
  //     );
  //     console.log("Landing page response:", response);

  //     let landingPageData = null;

  //     // Handle different possible response structures
  //     if (response.data?.landingPage) {
  //       landingPageData = response.data.landingPage;
  //     } else if (response.data) {
  //       landingPageData = response.data;
  //     }

  //     // If no landing page exists, generate one
  //     if (!landingPageData) {
  //       console.log("No landing page found, generating a new one...");
  //       const generateResponse = await apiRequest.post(
  //         "/generate-landing-page",
  //         { businessIdeaId }
  //       );
  //       console.log("Generate landing page response:", generateResponse);

  //       if (generateResponse.data?.landingPage) {
  //         landingPageData = generateResponse.data.landingPage;
  //       } else if (generateResponse.data) {
  //         landingPageData = generateResponse.data;
  //       }

  //       if (!landingPageData) {
  //         console.warn("Failed to generate landing page");
  //         return null;
  //       }
  //     }

  //     console.log("Landing page data:", landingPageData);

  //     // Store the landing page data in state
  //     setLandingPages((prev) => ({
  //       ...prev,
  //       [businessIdeaId]: landingPageData,
  //     }));

  //     return landingPageData;
  //   } catch (error) {
  //     console.error("Failed to fetch landing page data:", error);
  //     if (error.response) {
  //       // The request was made and the server responded with a status code
  //       // that falls out of the range of 2xx
  //       console.error("Error response data:", error.response.data);
  //       console.error("Error status:", error.response.status);
  //       console.error("Error headers:", error.response.headers);
  //     } else if (error.request) {
  //       // The request was made but no response was received
  //       console.error("No response received. Request config:", error.config);
  //     } else {
  //       // Something happened in setting up the request that triggered an Error
  //       console.error("Error message:", error.message);
  //     }
  //     return null;
  //   }
  // };

  // // Fetch landing page data when business ideas are loaded
  // useEffect(() => {
  //   if (businessIdeas.length > 0) {
  //     businessIdeas.forEach((idea) => {
  //       fetchLandingPage(idea.id || idea._id);
  //     });
  //   }
  // }, [businessIdeas]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#e6ebef] pt-16 sm:pt-20 px-4 sm:px-6">
        {/* Header Skeleton */}
        <div className="px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Pain Points Section Skeleton */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>

            {/* Main Card Skeleton */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
              <div className="space-y-6">
                {/* Title and Badges */}
                <div className="space-y-4">
                  <div className="h-7 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="flex flex-wrap gap-2">
                    <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-32 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-28 animate-pulse"></div>
                  </div>
                </div>

                {/* Problem Summary Skeleton */}
                <div className="bg-gray-100 p-4 rounded-xl space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-28 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                </div>

                {/* Footer Skeleton */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-48 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Ideas Section Skeleton */}
          
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-[#e6ebef] pt-16 sm:pt-20 momentum-scroll flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Idea not found
          </h2>
          <p className="text-gray-600 mb-6">
            The idea you're looking for doesn't exist.
          </p>
          <BackButton className="text-gray-600 hover:text-gray-800 text-sm font-medium">
            Back
          </BackButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e6ebef] pt-16 sm:pt-20 px-4 sm:px-6">
      {/* Header */}
      <div className="px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <BackButton className="text-gray-600 hover:text-gray-800 text-sm font-medium">
            Back
          </BackButton>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Pain Points Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Pain Points</h2>
          </div>

          {/* Main Pain Point Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground mb-2 text-left">
                    {idea.title}
                  </h2>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge
                      className={`${getCategoryColor(
                        idea.category
                      )} px-2 py-1 text-xs`}
                      variant="outline"
                    >
                      {idea.category}
                    </Badge>
                    <Badge
                      className={`${getBadgeVariant(idea.intensity).bg} ${
                        getBadgeVariant(idea.intensity).text
                      } border-0 px-2 py-1 text-xs`}
                    >
                      Intensity: 🔥 {idea.intensity}
                    </Badge>
                    <Badge
                      className={`${getBadgeVariant(idea.urgency).bg} ${
                        getBadgeVariant(idea.urgency).text
                      } border-0 px-2 py-1 text-xs`}
                    >
                      Urgency: ⚡ {idea.urgency}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {idea.rankScore}
                  </div>
                  <div className="text-xs text-muted-foreground">AI Score</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-muted/30 to-muted/10 p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-primary" />
                  Problem Summary
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {idea.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-xs font-semibold text-foreground mb-1 flex items-center">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                    Discussion Topic
                  </h3>
                  <p className="text-muted-foreground text-sm">{idea.topic}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-xs font-semibold text-foreground mb-1 flex items-center">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                    Source Community
                  </h3>
                  <div className="text-left">
                    <a
                      href={idea.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors hover:underline"
                    >
                      r/{idea.subreddit}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 text-xs border-t">
                <span className="flex items-center text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(idea.postDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>

                <Badge
                  variant={idea.potentialSolvability ? "default" : "outline"}
                  className="px-2 py-1 text-xs"
                >
                  Potential Solvability: {idea.businessPotential}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Business Solutions Section */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Business Solutions
            </h2>
          </div>

          {isGeneratingIdeas ? (
            <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-9 bg-gray-200 rounded-lg w-36 animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl p-5 shadow-sm border">
                  <div className="space-y-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <div className="h-5 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                      <div className="h-5 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                    </div>
                    <div className="h-9 bg-gray-200 rounded-lg w-full mt-4 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          ) : businessIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businessIdeas.map((businessIdea, index) => {
                console.log("Business Idea:", businessIdea); // Debug log
                return (
                  <div
                    key={businessIdea.id}
                    className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all duration-300 group relative"
                  >
                    {/* Eye icon for redirection to landing page */}
                    <Link
                      to={`/landingPage/${businessIdea.id || businessIdea._id}`}
                      className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                      title="View landing page"
                    >
                      <Eye className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                    </Link>

                    <div className="space-y-4">
                      {/* Header with ID and Scores */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pr-8">
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                            Score:{" "}
                            {businessIdea.feasibilityScore ||
                              businessIdea.score ||
                              "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-foreground mb-1">
                              {businessIdea.ideaName || businessIdea.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {businessIdea.businessModel || "SaaS"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-muted-foreground text-sm">
                          {businessIdea.description ||
                            businessIdea.solutionOverview}
                        </p>

                        {/* Key Details Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          {/* Target Audience */}
                          <div className="bg-gray-50 p-2 rounded">
                            <h4 className="text-[10px] font-semibold text-foreground">
                              Target Audience
                            </h4>
                            <p className="text-muted-foreground text-xs">
                              {businessIdea.targetAudience || "N/A"}
                            </p>
                          </div>

                          {/* Revenue Streams */}
                          <div className="bg-green-50 p-2 rounded">
                            <h4 className="text-[10px] font-semibold text-foreground">
                              Revenue Streams
                            </h4>
                            <p className="text-muted-foreground text-xs">
                              {businessIdea.revenueStreams?.join(", ") || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Key Features */}
                        {businessIdea.keyFeatures?.length > 0 && (
                          <div className="bg-amber-50 p-3 rounded-lg">
                            <h4 className="text-xs font-semibold text-foreground mb-1">
                              Key Features
                            </h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {businessIdea.keyFeatures
                                .slice(0, 3)
                                .map((feature, idx) => (
                                  <li
                                    key={idx}
                                    className="text-left text-muted-foreground text-xs"
                                  >
                                    {feature}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}

                        {/* Implementation & Challenges */}
                        {businessIdea.implementationSteps?.length > 0 && (
                          <div className="bg-amber-50 p-3 rounded-lg">
                            <h4 className="text-xs font-semibold text-foreground mb-1">
                              Implementation Steps
                            </h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {businessIdea.implementationSteps
                                .slice(0, 3)
                                .map((step, idx) => (
                                  <li
                                    key={idx}
                                    className="text-left text-muted-foreground text-xs"
                                  >
                                    {step}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}

                        {businessIdea.potentialChallenges?.length > 0 && (
                          <div className="bg-amber-50 p-3 rounded-lg">
                            <h4 className="text-xs font-semibold text-foreground mb-1">
                              Potential Challenges
                            </h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {businessIdea.potentialChallenges
                                .slice(0, 3)
                                .map((feature, idx) => (
                                  <li
                                    key={idx}
                                    className="text-left text-muted-foreground text-xs"
                                  >
                                    {feature}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          {/* Target Audience */}
                          <div className="bg-gray-50 p-2 rounded">
                            <h4 className="text-[10px] font-semibold text-foreground">
                              Success Metrics
                            </h4>
                            <p className="text-muted-foreground text-xs">
                              {businessIdea.successMetrics?.join(", ") || "N/A"}
                            </p>
                          </div>

                          {/* Revenue Streams */}
                          <div className="bg-green-50 p-2 rounded">
                            <h4 className="text-[10px] font-semibold text-foreground">
                              Unique Value Proposition
                            </h4>
                            <p className="text-muted-foreground text-xs">
                              {businessIdea.uniqueValueProposition?.join(
                                ", "
                              ) || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Use Case */}
                        <div className="space-y-2">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h4 className="text-xs font-semibold text-foreground mb-1">
                              Use Case
                            </h4>
                            <p className="text-muted-foreground text-xs">
                              {businessIdea.useCase || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h4 className="text-xs font-semibold text-foreground mb-1">
                              Differentiator
                            </h4>
                            <p className="text-muted-foreground text-xs">
                              {businessIdea.differentiator || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Keywords and Metadata */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {businessIdea.keywords
                            ?.slice(0, 3)
                            .map((keyword, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                              >
                                {keyword}
                              </span>
                            ))}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t text-[11px] text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          {/* <span>Source: {businessIdea.source || "ai-generated"}</span> */}
                          {/* <span>{businessIdea.status}</span> */}
                        </div>
                        <span>
                          {new Date(
                            businessIdea.updatedAt || businessIdea.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl p-8 shadow-sm border text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent/20 border-t-accent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-accent animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Loading Solutions...
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Please wait while fetching business ideas
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className=" border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 max-w-7xl mx-auto">
            {/* Brand Column - Full width on mobile, 4 columns on desktop */}
            <div className="md:col-span-4 lg:col-span-3">
              <div className="flex flex-col h-full">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text ">
                    IdeaExtractor
                  </span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Transforming ideas into actionable business opportunities with AI-powered insights.
                </p>
                <div className="flex space-x-4 mt-auto">
                  {[
                    { name: 'twitter', icon: (
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    )},
                    { name: 'github', icon: (
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    )},
                    { name: 'linkedin', icon: (
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    )}
                  ].map((social) => (
                    <a
                      key={social.name}
                      href="#"
                      className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-y-0.5"
                      aria-label={social.name}
                    >
                      <div className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          {social.icon}
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Links - 2 columns on mobile, 4 columns on desktop */}
            <div className="md:col-span-8 lg:col-span-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm -ml-20 font-semibold text-foreground uppercase tracking-wider mb-4">Product</h3>
                  <ul className="space-y-3">
                    {['Features', 'Pricing', 'Testimonials', 'Updates'].map((item) => (
                      <li key={item}>
                        <a 
                          href="#" 
                          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-start group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary mt-2 mr-2 transition-all duration-200"></span>
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm -ml-20 font-semibold text-foreground uppercase tracking-wider mb-4">Company</h3>
                  <ul className="space-y-3">
                    {['About', 'Careers', 'Blog', 'Press'].map((item) => (
                      <li key={item}>
                        <a 
                          href="#" 
                          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-start group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary mt-2 mr-2 transition-all duration-200"></span>
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 sm:mt-0">
                  <h3 className="text-sm -ml-20 font-semibold text-foreground uppercase tracking-wider mb-4">Support</h3>
                  <ul className="space-y-3">
                    {['Help Center', 'Documentation', 'Status', 'Contact'].map((item) => (
                      <li key={item}>
                        <a 
                          href="#" 
                          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-start group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary mt-2 mr-2 transition-all duration-200"></span>
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Newsletter - Full width on mobile, 3 columns on desktop */}
            <div className="md:col-span-12 lg:col-span-3 mt-8 lg:mt-0">
              <div className="bg-muted/30 rounded-xl p-6 h-full">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Newsletter</h3>
                <p className="text-muted-foreground text-sm mb-4">Subscribe to get updates and product announcements</p>
                <form className="space-y-3">
                  <div>
                    <input
                      type="email"
                      placeholder="Your email"
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
                <p className="text-xs text-muted-foreground mt-3">We respect your privacy. Unsubscribe at any time.</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border/30 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} IdeaExtractor. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                  <a 
                    key={item}
                    href="#" 
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IdeaDetailPage;
