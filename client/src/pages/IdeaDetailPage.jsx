import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Target,
  Clock,
  Lightbulb,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import apiRequest from "../lib/apiRequest";
import BackButton from "../components/BackButton";
import BusinessIdeasGrid from "../components/BusinessIdeasGrid";
import Footer from "../components/Footer";

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
        setIdea(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // First fetch the idea
        const response = await apiRequest.get(`/ideas/${id}`);

        if (!response || !response.data) {
          throw new Error("No response data received");
        }

        if (!response.data.data) {
          throw new Error("No idea data in response");
        }

        const ideaData = response.data.data;
        

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
        
        const response = await apiRequest.get(
          `/marketgaps/ideas/by-painpoint/${idea._id}`
        );
        
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
            <div className="h-8 w-24 bg-white/60 backdrop-blur-sm rounded-xl animate-pulse"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Pain Points Section Skeleton */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-white/60 backdrop-blur-sm rounded-xl animate-pulse"></div>
              <div className="h-6 bg-white/60 backdrop-blur-sm rounded-xl w-48 animate-pulse"></div>
            </div>

            {/* Main Card Skeleton */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/30 mb-6">
              <div className="space-y-6">
                {/* Title and Badges */}
                <div className="space-y-4">
                  <div className="h-7 bg-white/70 rounded-2xl w-3/4 animate-pulse"></div>
                  <div className="flex flex-wrap gap-3">
                    <div className="h-6 bg-white/70 rounded-full w-20 animate-pulse"></div>
                    <div className="h-6 bg-white/70 rounded-full w-32 animate-pulse"></div>
                    <div className="h-6 bg-white/70 rounded-full w-28 animate-pulse"></div>
                  </div>
                </div>

                {/* Problem Summary Skeleton */}
                <div className="bg-gradient-to-r from-white/70 to-gray-50/70 backdrop-blur-sm p-5 rounded-2xl space-y-3">
                  <div className="h-4 bg-white/80 rounded-xl w-32 mb-3 animate-pulse"></div>
                  <div className="h-3 bg-white/80 rounded-xl w-full animate-pulse"></div>
                  <div className="h-3 bg-white/80 rounded-xl w-5/6 animate-pulse"></div>
                  <div className="h-3 bg-white/80 rounded-xl w-4/6 animate-pulse"></div>
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-white/70 to-blue-50/50 backdrop-blur-sm p-4 rounded-2xl space-y-3">
                    <div className="h-3 bg-white/80 rounded-xl w-24 animate-pulse"></div>
                    <div className="h-4 bg-white/80 rounded-xl w-full animate-pulse"></div>
                  </div>
                  <div className="bg-gradient-to-r from-white/70 to-emerald-50/50 backdrop-blur-sm p-4 rounded-2xl space-y-3">
                    <div className="h-3 bg-white/80 rounded-xl w-28 animate-pulse"></div>
                    <div className="h-6 bg-white/80 rounded-xl w-24 animate-pulse"></div>
                  </div>
                </div>

                {/* Footer Skeleton */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                  <div className="h-4 bg-white/70 rounded-xl w-32 animate-pulse"></div>
                  <div className="h-6 bg-white/70 rounded-full w-48 animate-pulse"></div>
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
      <div className="min-h-screen bg-[#e6ebef] pt-16 sm:pt-20 momentum-scroll flex items-center justify-center px-4 sm:px-6">
        <div className="text-center bg-white/80 backdrop-blur-sm p-10 rounded-3xl max-w-lg w-full mx-4 border border-white/30">
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Idea not found
          </h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            The idea you're looking for doesn't exist or may have been removed.
          </p>
          <BackButton className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105">
            Go Back
          </BackButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e6ebef]">
      <div className="pt-16 sm:pt-18 px-4 sm:px-6">
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
            <div className="w-8 h-8 rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* 3D Pain Point Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-orange-500 to-pink-600 rounded-lg"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-red-300/30 to-transparent rounded-lg"></div>
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white/70 rounded-full"></div>
              <div className="relative z-10">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Pain Points</h2>
          </div>

          {/* Main Pain Point Card */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/20 transition-all duration-300">
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
                <div className="flex flex-col items-end space-y-1">
                  <div className="bg-blue-100  text-btn px-4 py-2 rounded-xl font-bold text-lg">
                    {idea.rankScore}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">AI Score</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-muted/30 to-muted/10 p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                  Problem Summary
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed text-left">
                  {idea.summary}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 backdrop-blur-sm p-4 rounded-2xl border border-blue-100/30 transition-all duration-200">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center text-left">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                    Discussion Topic
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed text-left">{idea.topic}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/60 backdrop-blur-sm p-4 rounded-2xl border border-emerald-100/30 transition-all duration-200">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                    Source Community
                  </h3>
                  <div className="text-left">
                    <a
                      href={idea.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 transform hover:scale-105"
                    >
                      r/{idea.subreddit}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 text-sm border-t border-gray-100/50">
                <div className="flex items-center text-muted-foreground bg-gray-50/50 px-3 py-2 rounded-lg">
                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium">
                    {new Date(idea.postDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center">
                  <Badge
                    variant={idea.potentialSolvability ? "default" : "outline"}
                    className={`px-3 py-2 text-sm font-medium ${
                      idea.potentialSolvability
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0"
                        : "bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border-orange-200"
                    }`}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Potential Solvability: {idea.businessPotential}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Solutions Section */}
        <div className="mt-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* 3D Bulb Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 rounded-lg"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-300/30 to-transparent rounded-lg"></div>
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/60 rounded-full"></div>
              <div className="relative z-10">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Business Solutions
            </h2>
          </div>

          <BusinessIdeasGrid businessIdeas={businessIdeas} isGeneratingIdeas={isGeneratingIdeas} />
        </div>
      </div>

      </div>

      <Footer />
    </div>
  );
};

export default IdeaDetailPage;
