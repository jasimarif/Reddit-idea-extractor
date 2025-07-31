import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../components/ui/resizable";
import { Button } from "../components/ui/button";
import { ExternalLink, Calendar, AlertCircle } from "lucide-react";
import BackButton from "../components/BackButton";
import apiRequest from "../lib/apiRequest";

const IdeaViewerPage = () => {
  const { businessIdeaId } = useParams();
  const [idea, setIdea] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIdea = async () => {
      console.log("Fetching landing page with businessIdeaId:", businessIdeaId);

      if (!businessIdeaId) {
        console.error("No businessIdeaId provided for landing page");
        setIdea(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await apiRequest.get(
          `/landingpages/landing-page/${businessIdeaId}`
        );
        console.log("Landing page response:", response);

        if (response.data && response.data.landingPage) {
          const landingPage = response.data.landingPage;
          console.log("Landing page data:", landingPage);

          setIdea({
            landingPageUrl: landingPage.landingPageUrl || "#",
            headline: landingPage.headline || "",
            subheadline: landingPage.subheadline || "",
            outcomeSection: landingPage.outcomeSection || [],
            painPointsSection: landingPage.painPointsSection || [],
            bulletPoints: landingPage.bulletPoints || [],
            founderMessage: landingPage.founderMessage || "",
            date: landingPage.createdAt || "",
            businessIdeaId: landingPage.businessIdeaId || "",
          });
        } else {
          console.error("No landing page data in response");
          setIdea(null);
        }
      } catch (error) {
        console.error("Error fetching landing page:", error);
        // Set error state to show to user
        setError("Failed to load landing page. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (businessIdeaId) {
      fetchIdea();
    }
  }, [businessIdeaId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-6 w-6 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 text-xs">Loading idea details...</p>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white p-6 rounded-lg shadow-lg max-w-sm w-full border border-gray-300">
          <div className="flex flex-col items-center mb-3">
            <AlertCircle className="h-6 w-6 text-red-500 mb-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              Idea Not Found
            </h2>
          </div>
          <p className="text-gray-600 mb-4 text-xs">
            The startup idea you're looking for doesn't exist or may have been
            removed.
          </p>
          <BackButton>Back</BackButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-sm">
        <div className="w-full max-w-[1800px] mx-auto px-4 py-1.5">
          <div className="flex items-center justify-between">
            <BackButton className="text-gray-600 hover:text-gray-800 text-sm font-medium">
              Back
            </BackButton>
            <Button variant="outline" size="sm" asChild className="h-7">
              <a
                href={idea.landingPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                <span className="text-xs">View Live</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-40px)] p-2 max-w-[1800px] mx-auto w-full">
        {/* Desktop Layout */}
        <div className="hidden lg:flex h-full rounded-lg overflow-hidden bg-white shadow-sm border border-gray-200">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
              defaultSize={30}
              minSize={20}
              maxSize={45}
              className="relative bg-white border-r border-gray-200 flex flex-col"
            >
              <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                <IdeaDetailCard idea={idea} />
              </div>
            </ResizablePanel>
            <ResizableHandle
              withHandle
              className="w-[1px] bg-gray-200 hover:bg-blue-400 hover:w-1.5 transition-all duration-200 relative group"
            >
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 h-20 bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-1 h-10 bg-gray-400 rounded-full"></div>
              </div>
            </ResizableHandle>
            <ResizablePanel defaultSize={70} minSize={55} className="relative">
              <div className="absolute inset-0 overflow-auto hide-scrollbar">
                <LandingPageViewer
                  landingPageUrl={idea.landingPageUrl}
                  title={idea.headline}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden h-full flex flex-col gap-1.5">
          <div className="flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <IdeaDetailCard idea={idea} />
          </div>
          <div className="flex-1 min-h-[50vh] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hide-scrollbar">
            <LandingPageViewer
              landingPageUrl={idea.landingPageUrl}
              title={idea.headline}
            />
          </div>
        </div>
      </main>

      {/* Global Styles */}
      <style jsx global>{`
        /* Custom scrollbar styles */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        /* Hide scrollbar but keep functionality */
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
        /* Custom scrollbar for specific containers */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #e2e8f0 transparent;
        }
      `}</style>
    </div>
  );
};

const IdeaDetailCard = ({ idea }) => {
  return (
    <div className="h-full">
      <div className="p-3 space-y-3">
        {/* Title Section */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-gray-800 leading-tight">
            {idea.headline}
          </h3>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
            Business Description
          </h3>
          <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-gray-700 leading-snug text-xs">
              {idea.subheadline}
            </p>
          </div>
        </div>

        {/* Pain Point */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
            Problem Statement
          </h3>
          <div className="p-2.5 bg-gray-100 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-600 leading-relaxed text-xs">
              {idea.painPointsSection.map((painPoint, index) => (
                <span key={index}>{painPoint}</span>
              ))}
            </p>
          </div>
        </div>

        {/* Bullet Points */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
            Key Features
          </h3>
          <div className="p-2.5 bg-gray-100 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-600 leading-relaxed text-xs">
              {idea.bulletPoints.join(", ")}
            </p>
          </div>
        </div>

        {/* Founders Message */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
            Solution Use Case
          </h3>
          <div className="p-2.5 bg-gray-100 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-600 leading-relaxed text-xs">
              {idea.outcomeSection.join(", ")}
            </p>
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-2 border-t border-gray-400">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            Created:{" "}
            {new Date(idea.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingPageViewer = ({ landingPageUrl, title }) => {
  // Ensure landingPageUrl is a string and has a default value
  const safeUrl = landingPageUrl || "";

  // Function to safely format the URL for display
  const formatUrlForDisplay = (safeUrl) => {
    if (!safeUrl) return "No URL provided";
    return safeUrl.replace(/^https?:\/\//, "");
  };

  return (
    <div className="h-full bg-white flex flex-col shadow-lg rounded-lg">
      {/* Viewer Header */}
      <div className="flex-shrink-0 px-3 py-1.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h3 className="text-xs font-medium text-gray-800">Live Preview</h3>
        <div className="text-xs text-gray-500 truncate max-w-[180px]">
          {formatUrlForDisplay(safeUrl)}
        </div>
      </div>

      {/* Iframe Container - Only show iframe if we have a valid URL */}
      <div className="flex-1 relative overflow-hidden">
        {safeUrl ? (
          <div className="absolute inset-0 overflow-hidden">
            <iframe
              src={safeUrl}
              title={`Landing page for ${title || "untitled"}`}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              style={{
                overflow: 'hidden',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <p className="text-sm text-gray-500">No preview available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaViewerPage;
