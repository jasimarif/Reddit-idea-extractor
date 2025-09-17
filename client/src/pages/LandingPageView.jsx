import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, ExternalLink, Download, Eye, Rocket, Loader2 } from "lucide-react";
import BackButton from "../components/BackButton";
import apiRequest from "../lib/apiRequest";
import { usePayment } from "../contexts/PaymentContext";

const LandingPageView = () => {
  const { landingPageId } = useParams();
  const navigate = useNavigate();
  const { isPremium, setIsModalOpen } = usePayment();
  const [landingPage, setLandingPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState(null);
  const [deploymentStatus, setDeploymentStatus] = useState(''); // New state for deployment status messages

  useEffect(() => {
    const fetchLandingPage = async () => {
      try {
        setIsLoading(true);
        // For now, we'll use the landingPageId from params
        // In the future, this would fetch from the API
        const storedLandingPage = localStorage.getItem(`landingPage-${landingPageId}`);
        if (storedLandingPage) {
          const parsed = JSON.parse(storedLandingPage);
          setLandingPage(parsed);
          
          // Check if deployment is in progress or recently completed
          if (parsed.deploymentStatus === 'deployed' && parsed.landingPageUrl) {
            setDeploymentUrl(parsed.landingPageUrl);
          } else if (parsed.vercelDeploymentId && parsed.landingPageUrl) {
            // Check current deployment status via API
            checkCurrentDeploymentStatus();
          }
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

    const checkCurrentDeploymentStatus = async () => {
      try {
        const statusResponse = await apiRequest.get(`/landingpages/deployment-status/${landingPageId}`);
        const { status, url, isLive } = statusResponse.data;
        
        if (status === 'deployed' && isLive && url) {
          setDeploymentUrl(url);
          // Get the current landing page data from state instead of undefined landingPage
          const storedLandingPage = localStorage.getItem(`landingPage-${landingPageId}`);
          if (storedLandingPage) {
            const currentLandingPage = JSON.parse(storedLandingPage);
            const updatedLandingPage = { ...currentLandingPage, deploymentStatus: 'deployed', landingPageUrl: url };
            localStorage.setItem(`landingPage-${landingPageId}`, JSON.stringify(updatedLandingPage));
            setLandingPage(updatedLandingPage);
          }
        }
      } catch (error) {
        console.error('Error checking deployment status on load:', error);
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

  const handleDeploy = async () => {
    try {
      setIsDeploying(true);
      setDeploymentStatus('Initializing deployment...');
      
      const response = await apiRequest.post(`/landingpages/deploy-landing-page/${landingPageId}`, {
        target: 'vercel'
      });
      
      setDeploymentStatus('Deployment started successfully!');
      
      // Check if we got a URL immediately
      const deploymentUrl = response.data?.deployment?.url || response.data?.landingPage?.landingPageUrl;
      
      if (deploymentUrl) {
        // Update localStorage with deployment info
        const updatedLandingPage = { 
          ...landingPage, 
          deploymentStatus: 'building', 
          landingPageUrl: deploymentUrl,
          vercelDeploymentId: response.data?.deployment?.id 
        };
        localStorage.setItem(`landingPage-${landingPageId}`, JSON.stringify(updatedLandingPage));
        setLandingPage(updatedLandingPage);
        
        // Start polling for completion
        setDeploymentStatus('Building and deploying your site...');
        pollForDeploymentStatus();
      } else {
        // No URL returned, something went wrong
        setIsDeploying(false);
        setDeploymentStatus('');
        console.error('Deployment initiated but no URL received');
      }
    } catch (error) {
      console.error('Deployment error:', error);
      setIsDeploying(false);
      setDeploymentStatus('');
      if (error.response?.status === 403) {
        setIsModalOpen(true);
      } else {
        console.error(`Failed to deploy landing page: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Poll for deployment status to get the live URL when it's ready
  const pollForDeploymentStatus = async () => {
    const maxAttempts = 15; // Maximum 1.5 minutes (15 * 6 seconds)
    let attempts = 0;
    
    const checkStatus = async () => {
      try {
        attempts++;
        setDeploymentStatus(`Checking deployment status... (${attempts}/${maxAttempts})`);
        
        // Use the new backend endpoint to check deployment status
        const statusResponse = await apiRequest.get(`/landingpages/deployment-status/${landingPageId}`);
        const { status, url, isLive } = statusResponse.data;
        
        console.log(`Deployment check ${attempts}: status=${status}, isLive=${isLive}, url=${url}`);
        
        if (status === 'deployed' && isLive && url) {
          setDeploymentUrl(url);
          const updatedLandingPage = { ...landingPage, deploymentStatus: 'deployed', landingPageUrl: url };
          localStorage.setItem(`landingPage-${landingPageId}`, JSON.stringify(updatedLandingPage));
          setLandingPage(updatedLandingPage);
          setIsDeploying(false);
          setDeploymentStatus('');
          console.log(`🎉 Landing page is now live: ${url}`);
          return;
        }
        
        if (status === 'failed') {
          setIsDeploying(false);
          setDeploymentStatus('');
          console.error('Deployment failed');
          return;
        }
        
        // If still not ready and we haven't exceeded max attempts, continue polling
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 6000); // Check every 6 seconds
        } else {
          // Max attempts reached - stop loading state but show message
          setIsDeploying(false);
          setDeploymentStatus('');
          console.log('Deployment is taking longer than expected. Your site should be live shortly. Please check back in a few minutes.');
        }
      } catch (error) {
        console.error('Error checking deployment status:', error);
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 6000);
        } else {
          setIsDeploying(false);
          setDeploymentStatus('');
        }
      }
    };
    
    // Start polling after 15 seconds (give deployment time to start)
    setTimeout(checkStatus, 15000);
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
          <Button onClick={handleBackToTemplates} variant="outline" className="cursor-pointer">
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
      <header className="mb-8">
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <BackButton
              onClick={handleBackToTemplates}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium cursor-pointer transition-colors duration-200"
            >
              Back to Templates
            </BackButton>
          </div>

          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">Landing Page</span> is Ready!
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Your AI-generated landing page has been created successfully. You can preview it below, make edits, or deploy it live with one click.
              </p>
            </div>

            {landingPage && (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 px-4 py-2 text-sm font-medium ">
                  <span className="mr-1">✅</span> Generated Successfully
                </Badge>
                <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 px-4 py-2 text-sm font-medium ">
                  <span className="mr-1">🎨</span> Template: {landingPage.templateId?.toUpperCase()}
                </Badge>
                {landingPage.deploymentStatus === 'deployed' && (
                  <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border-purple-200 px-4 py-2 text-sm font-medium ">
                    <span className="mr-1">🚀</span> Deployed to GitHub
                  </Badge>
                )}
                {deploymentUrl && (
                  <Badge variant="outline" className="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200 px-4 py-2 text-sm font-medium ">
                    <span className="mr-1">🌐</span> Live Site Ready
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 pb-12">
        <div className="w-full">
          {/* Landing Page Preview - Main Content */}
          <div className="w-full">
            <Card className="rounded-xl border-0  bg-gradient-to-br from-white via-gray-50 to-blue-50/30 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-6 bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/30 border-b border-slate-200/60">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl flex items-center text-slate-800 font-semibold">
                      <div className="p-2 bg-blue-100 rounded-lg mr-5">
                        <Eye className="h-5 w-5 text-blue-600" />
                      </div>
                      Live Preview
                    </CardTitle>
                    <CardDescription className="text-slate-600 ml-14">Your beautifully generated landing page</CardDescription>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="bg-green-500 cursor-pointer text-white hover:bg-green-600 border-0  transition-all duration-300 "
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      onClick={openInNewTab}
                      className="bg-indigo-500 cursor-pointer text-white hover:bg-indigo-600  transition-all duration-300 "
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                    {/* Single button that transforms based on deployment state */}
                    {!deploymentUrl && (
                      <Button
                        size="sm"
                        onClick={handleDeploy}
                        disabled={isDeploying}
                        className={` transition-all duration-300  disabled:opacity-50 cursor-pointer bg-purple-500 text-white hover:bg-purple-600`}
                      >
                        {isDeploying ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deploying...
                          </>
                        ) : (
                          <>
                            <Rocket className="h-4 w-4 mr-2" />
                            Deploy
                          </>
                        )}
                      </Button>
                    )}
                    {deploymentUrl && (
                      <Button
                        size="sm"
                        onClick={() => window.open(deploymentUrl, '_blank')}
                        className="bg-emerald-500 text-white hover:bg-emerald-600  transition-all duration-300  cursor-pointer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Live Site
                      </Button>
                    )}
                  </div>
                </div>
                {/* Deployment status indicator */}
                {isDeploying && deploymentStatus && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl ">
                    <div className="flex items-center text-blue-800">
                      <div className="p-1 bg-blue-100 rounded-full mr-3">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">{deploymentStatus}</span>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {landingPage?.generatedHtml ? (
                  <div className="rounded-b-xl overflow-hidden bg-white  border-t border-slate-100">
                    {/* Browser mockup header */}
                    <div className="bg-gradient-to-r from-slate-100 via-gray-50 to-slate-100 px-6 py-4 flex items-center space-x-3 border-b border-slate-200/60">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full  hover:bg-red-500 transition-colors cursor-pointer"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full  hover:bg-yellow-500 transition-colors cursor-pointer"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full  hover:bg-green-500 transition-colors cursor-pointer"></div>
                      </div>
                      <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-slate-700 flex-1  border border-slate-200/50 font-mono">
                        {deploymentUrl || 'https://your-landing-page.com'}
                      </div>
                    </div>

                    {/* Landing page content */}
                    <div className="w-full bg-slate-50/30" style={{ height: '85vh' }}>
                      <iframe
                        srcDoc={landingPage.generatedHtml}
                        title="Generated Landing Page"
                        className="w-full h-full border-0 bg-white"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-blue-50/30">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Eye className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-700 mb-2">No Preview Available</h3>
                      <p className="text-slate-500">Your landing page content will appear here once generated</p>
                    </div>
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
