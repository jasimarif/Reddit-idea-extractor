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
      <div className="px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Ideas</span>
          </Link>
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
                      className={`${getCategoryColor(idea.category)} px-2 py-1 text-xs`}
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
                  <p className="text-muted-foreground text-sm text-left ml-4">r/{idea.category}</p>
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
            <h2 className="text-2xl font-bold text-foreground">Business Solutions</h2>
          </div>

          {isGeneratingIdeas ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent/20 border-t-accent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-accent animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Generating Solutions...
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Creating innovative business ideas for this pain point
                  </p>
                </div>
              </div>
            </div>
          ) : businessIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businessIdeas.map((businessIdea, index) => (
                <div
                  key={businessIdea.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all duration-300 group"
                >
                  <div className="space-y-4">
                    {/* Header with ID and Scores */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      {/* <span className="bg-gray-100 px-2 py-0.5 rounded">ID: {businessIdea._id?.substring(0, 8)}...</span> */}
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Score: {businessIdea.feasibilityScore || businessIdea.score || "N/A"}</span>
                        {/* <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">Feasibility: {businessIdea.feasibilityScore || "N/A"}</span> */}
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
                        {businessIdea.description || businessIdea.solutionOverview}
                      </p>

                      {/* Problem & Solution */}
                      {/* <div className="space-y-2">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="text-xs font-semibold text-foreground mb-1">Problem</h4>
                          <p className="text-muted-foreground text-xs">{businessIdea.problemDescription || "N/A"}</p>
                        </div>
                      </div> */}

                      {/* Key Details Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Target Audience */}
                        <div className="bg-gray-50 p-2 rounded">
                          <h4 className="text-[10px] font-semibold text-foreground">Target Audience</h4>
                          <p className="text-muted-foreground text-xs">{businessIdea.targetAudience || "N/A"}</p>
                        </div>
                        
                        {/* Revenue Streams */}
                        <div className="bg-green-50 p-2 rounded">
                          <h4 className="text-[10px] font-semibold text-foreground">Revenue Streams</h4>
                          <p className="text-muted-foreground text-xs">
                            {businessIdea.revenueStreams?.join(", ") || "N/A"}
                          </p>
                        </div>
                      </div>

                     
                      {/* Key Features */}
                      {businessIdea.keyFeatures?.length > 0 && (
                        <div className="bg-amber-50 p-3 rounded-lg">
                          <h4 className="text-xs font-semibold text-foreground mb-1">Key Features</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {businessIdea.keyFeatures.slice(0, 3).map((feature, idx) => (
                              <li key={idx} className="text-left text-muted-foreground text-xs">
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Implementation & Challenges */}
                      {businessIdea.implementationSteps?.length > 0 && (
                        <div className="bg-amber-50 p-3 rounded-lg">
                          <h4 className="text-xs font-semibold text-foreground mb-1">Implementation Steps</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {businessIdea.implementationSteps.slice(0, 3).map((step, idx) => (
                              <li key={idx} className="text-left text-muted-foreground text-xs">
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {businessIdea.potentialChallenges?.length > 0 && (
                        <div className="bg-amber-50 p-3 rounded-lg">
                          <h4 className="text-xs font-semibold text-foreground mb-1">Potential Challenges</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {businessIdea.potentialChallenges.slice(0, 3).map((feature, idx) => (
                              <li key={idx} className="text-left text-muted-foreground text-xs">
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}


                      {/* Use Case */}
                      <div className="space-y-2">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="text-xs font-semibold text-foreground mb-1">Use Case</h4>
                          <p className="text-muted-foreground text-xs">{businessIdea.useCase || "N/A"}</p>
                        </div>
                      </div>

                      {/* Keywords and Metadata */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {businessIdea.keywords?.slice(0, 3).map((keyword, idx) => (
                          <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
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
                        {new Date(businessIdea.updatedAt || businessIdea.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
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
    </div>
  );
};

export default IdeaDetailPage;