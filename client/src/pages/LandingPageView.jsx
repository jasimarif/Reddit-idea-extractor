import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, ExternalLink, Edit, Share, Download, Eye } from "lucide-react";
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

  const handleEdit = () => {
    // Navigate back to template selector for editing
    navigate('/templates');
  };

  const handleShare = () => {
    // Copy link to clipboard
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

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
          <Button onClick={() => navigate('/templates')} variant="outline">
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
              onClick={() => navigate('/templates')}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Templates
            </BackButton>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button size="sm" onClick={openInNewTab}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Landing Page is Ready!</h1>
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
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Content Overview - Left Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Content Overview</CardTitle>
                <CardDescription>Generated content for your landing page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {landingPage?.templateContent && (
                  <>
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Title</h4>
                      <p className="text-sm text-gray-900">{landingPage.templateContent.TITLE}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Headline</h4>
                      <p className="text-sm font-medium text-gray-900">{landingPage.templateContent.HEADLINE}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Key Features</h4>
                      <ul className="text-sm space-y-1">
                        {landingPage.templateContent.KEY_FEATURES?.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">CTA</h4>
                      <Badge variant="outline" className="text-xs">
                        {landingPage.templateContent.CTA_TEXT}
                      </Badge>
                    </div>
                  </>
                )}
                
                <div className="pt-4 border-t">
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Created: {landingPage?.createdAt ? new Date(landingPage.createdAt).toLocaleDateString() : 'Today'}</p>
                    <p>Status: {landingPage?.status || 'Generated'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Landing Page Preview - Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <Eye className="h-5 w-5 mr-2" />
                      Live Preview
                    </CardTitle>
                    <CardDescription>Your generated landing page</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" onClick={openInNewTab}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Full Screen
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {landingPage?.generatedHtml ? (
                  <div className="border rounded-lg overflow-hidden bg-white">
                    {/* Browser mockup header */}
                    <div className="bg-gray-100 px-4 py-3 border-b flex items-center space-x-2">
                      <div className="flex space-x-1.5">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-md text-sm text-gray-600 flex-1 max-w-md">
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
