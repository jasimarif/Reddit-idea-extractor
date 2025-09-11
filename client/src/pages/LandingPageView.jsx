import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, ExternalLink, Download, Eye } from "lucide-react";
import BackButton from "../components/BackButton";
import apiRequest from "../lib/apiRequest";

const LandingPageView = () => {
  const { landingPageId } = useParams();
  const navigate = useNavigate();
  const [landingPage, setLandingPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLandingPage = async () => {
      try {
        setIsLoading(true);
        // For now, we'll use the landingPageId from params
        // In the future, this would fetch from the API
        const storedLandingPage = localStorage.getItem(`landingPage-${landingPageId}`);
        if (storedLandingPage) {
          setLandingPage(JSON.parse(storedLandingPage));
        } else {
          setError("Landing page not found");
        }
      } catch (error) {
        console.error('Error fetching landing page:', error);
        setError('Failed to load landing page');
      } finally {
        setIsLoading(false);
      }
    };

    if (landingPageId) {
      fetchLandingPage();
    }
  }, [landingPageId]);

  const handleDownload = () => {
    // Download HTML file
    if (landingPage?.generatedHtml) {
      const blob = new Blob([landingPage.generatedHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `landing-page-${landingPage.templateId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const openInNewTab = () => {
    if (landingPage?.generatedHtml) {
      const newWindow = window.open();
      newWindow.document.write(landingPage.generatedHtml);
      newWindow.document.close();
    }
  };

  const handleBackToTemplates = () => {
    // Try to get business idea ID from landing page data
    const businessIdeaId = landingPage?.businessIdeaId || landingPage?.ideaId;
    
    if (businessIdeaId) {
      navigate(`/templates/${businessIdeaId}`);
    } else {
      // Fallback to dashboard if no business idea ID is available
      navigate('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#e6ebef] pt-16 sm:pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your landing page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#e6ebef] pt-16 sm:pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleBackToTemplates} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e6ebef] pt-16 sm:pt-20">
      {/* Header */}
      <header className="mb-6">
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <BackButton 
              onClick={handleBackToTemplates}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Back to Templates
            </BackButton>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownload} className="bg-green-500 text-white hover:bg-green-600 border-0">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button size="sm" onClick={openInNewTab} className="bg-btn text-white hover:bg-btn-hover">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">Landing Page</span> is Ready!</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your AI-generated landing page has been created successfully. You can preview it below, make edits, or deploy it.
            </p>
            {landingPage && (
              <div className="mt-4 flex items-center justify-center space-x-4">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ✅ Generated Successfully
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Template: {landingPage.templateId?.toUpperCase()}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 pb-8">
        <div className="w-full">
          {/* Landing Page Preview - Main Content */}
          <div className="w-full">
            <Card className="rounded border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center text-gray-800">
                      <Eye className="h-6 w-6 mr-2 text-blue-600" />
                      Live Preview
                    </CardTitle>
                    <CardDescription className="text-gray-600">Your generated landing page</CardDescription>
                  </div>
                  <Button size="sm" onClick={openInNewTab} className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-md">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Full Screen
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {landingPage?.generatedHtml ? (
                  <div className="rounded-lg overflow-hidden bg-white shadow-lg">
                    {/* Browser mockup header */}
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 flex items-center space-x-2">
                      <div className="flex space-x-1.5">
                        <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-md text-sm text-gray-600 flex-1 max-w-md shadow-sm">
                        https://your-landing-page.com
                      </div>
                    </div>
                    
                    {/* Landing page content */}
                    <div className="w-full" style={{ height: '80vh' }}>
                      <iframe
                        srcDoc={landingPage.generatedHtml}
                        title="Generated Landing Page"
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No content available to preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPageView;
