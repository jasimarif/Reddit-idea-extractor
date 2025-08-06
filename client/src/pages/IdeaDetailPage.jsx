import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Target,
  Clock,
  Lightbulb,
  Brain,
  Eye,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
} from "lucide-react";
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
    <div className="min-h-screen bg-[#e6ebef] pt-16 sm:pt-18 px-4 sm:px-6">
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
                  <div
                    key={index}
                    className="bg-white rounded-xl p-5 shadow-sm border"
                  >
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
      <footer className="border-t border-gray-200 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1300px]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="h-8 w-8 rounded-lg bg-gray-900 flex items-center justify-center mr-3">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Reddit Idea Extractor
              </span>
            </div>

            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <Youtube size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          <div className="border-t border-gray-900 pt-6 mb-6">
            <nav className="flex flex-wrap gap-4 md:gap-8">
              {[
                "Features",
                "Pricing",
                "Faqs",
                "Contact",
                "Privacy",
                "Terms",
              ].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-2">
            <p>© 2025 Reddit Idea Extractor</p>
            <a
              href="mailto:ideaextractor@support.com"
              className="hover:text-gray-700 transition-colors"
            >
              ideaextractor@support.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IdeaDetailPage;
