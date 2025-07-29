import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../components/ui/resizable";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  ArrowLeft, 
  ExternalLink, 
  TrendingUp, 
  MessageSquare, 
  Globe, 
  Calendar,
  AlertCircle
} from "lucide-react";

const IdeaViewerPage = () => {
  const { id } = useParams();
  const [idea, setIdea] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIdea = async () => {
      if (!id) {
        setIdea(null);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      // Mock data - replace with actual API call
      setTimeout(() => {
        const mockIdea = {
          id: id,
          title: "AI-Powered Home Repair Service Marketplace",
          description: "A comprehensive platform connecting homeowners with verified, skilled contractors through AI matching and transparent pricing.",
          painPoint: "Users struggle to find trustworthy, skilled, and reasonably priced home repair services, often leading to poor quality work, overcharging, or unreliable contractors.",
          sourcePlatform: "Reddit",
          category: "MarketPlace",
          upvotes: 342,
          date: "2024-01-15",
          status: "Active",
          tags: ["AI", "Marketplace", "Home Services", "B2C"],
          comments: 28,
          deploymentUrl: "https://landing-68838369a473051c5763b654-17.vercel.app/"
        };
        setIdea(mockIdea);
        setIsLoading(false);
      }, 1000);
    };

    fetchIdea();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 text-sm">Loading idea details...</p>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 border border-gray-300">
          <div className="flex flex-col items-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              Idea Not Found
            </h2>
          </div>
          <p className="text-gray-600 mb-6 text-sm">
            The startup idea you're looking for doesn't exist or may have been removed.
          </p>
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-md">
        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <a href={idea.deploymentUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Live
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-57px)]">
        {/* Desktop Layout */}
        <div className="hidden lg:block h-full">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
              <IdeaDetailCard idea={idea} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={65} minSize={50}>
              <LandingPageViewer deploymentUrl={idea.deploymentUrl} title={idea.title} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden h-full flex flex-col">
          <div className="flex-shrink-0 max-h-[40vh] overflow-y-auto border-b">
            <IdeaDetailCard idea={idea} />
          </div>
          <div className="flex-1 min-h-[60vh]">
            <LandingPageViewer deploymentUrl={idea.deploymentUrl} title={idea.title} />
          </div>
        </div>
      </main>
    </div>
  );
};

const IdeaDetailCard = ({ idea }) => {
  return (
    <div className="h-full bg-white shadow-lg rounded-lg overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Title Section */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-800 leading-tight">
            {idea.title}
          </h3>
          <div className="flex items-center flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5">
              {idea.category}
            </Badge>
            <Badge 
              variant={idea.status === 'Active' ? 'default' : 'secondary'} 
              className="text-xs font-medium px-2 py-0.5"
            >
              {idea.status}
            </Badge>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">{idea.upvotes}</div>
            <div className="text-xs text-gray-500 flex items-center justify-center mt-0.5">
              <TrendingUp className="h-3 w-3 mr-1" />
              Upvotes
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">{idea.comments}</div>
            <div className="text-xs text-gray-500 flex items-center justify-center mt-0.5">
              <MessageSquare className="h-3 w-3 mr-1" />
              Comments
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">{idea.sourcePlatform}</div>
            <div className="text-xs text-gray-500 flex items-center justify-center mt-0.5">
              <Globe className="h-3 w-3 mr-1" />
              Source
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-800 uppercase tracking-wider">
            Business Description
          </h3>
          <p className="text-gray-600 leading-relaxed text-sm">
            {idea.description}
          </p>
        </div>

        {/* Pain Point */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-800 uppercase tracking-wider">
            Problem Statement
          </h3>
          <div className="p-3 bg-gray-100 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-600 leading-relaxed text-sm">
              {idea.painPoint}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-800 uppercase tracking-wider">
            Tags
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {idea.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-3 border-t space-y-1">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1.5" />
            Created: {new Date(idea.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingPageViewer = ({ deploymentUrl, title }) => {
  return (
    <div className="h-full bg-white flex flex-col shadow-lg rounded-lg">
      {/* Viewer Header */}
      <div className="flex-shrink-0 px-3 py-2 border-b bg-gray-100 flex items-center justify-between">
        <h3 className="text-xs font-medium text-gray-800">
          Live Preview
        </h3>
        <div className="text-xs text-gray-500 truncate max-w-[180px]">
          {deploymentUrl.replace(/^https?:\/\//, '')}
        </div>
      </div>

      {/* Iframe Container */}
      <div className="flex-1 relative">
        <iframe
          src={deploymentUrl}
          title={`Landing page for ${title}`}
          className="absolute inset-0 w-full h-full border-0 rounded-lg"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  );
};

export default IdeaViewerPage;
