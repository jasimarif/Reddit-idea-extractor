import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Modal } from "../components/ui/modal";
import { Eye, Loader2, ArrowLeft, ExternalLink, Sparkles, Zap, Star, Crown, Check, X } from "lucide-react";
import BackButton from "../components/BackButton";
import apiRequest from "../lib/apiRequest";
import { usePayment } from "../contexts/PaymentContext";

const TemplateSelector = () => {
    const { businessIdeaId } = useParams();
    const navigate = useNavigate();
    const { isModalOpen, setIsModalOpen, fetchLandingPageUsage, createPaymentSession } = usePayment();
    const [templates, setTemplates] = useState([]);
    const [businessIdea, setBusinessIdea] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [generatingTemplateId, setGeneratingTemplateId] = useState(null);
    const [previewingTemplateId, setPreviewingTemplateId] = useState(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [errorModal, setErrorModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        isLimitError: false
    });
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const handleDirectUpgrade = async () => {
        try {
            setIsProcessingPayment(true);
            setErrorModal(prev => ({ ...prev, isOpen: false }));

            const successUrl = `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
            const cancelUrl = `${window.location.origin}/templates/${businessIdeaId}`;

            await createPaymentSession(successUrl, cancelUrl);
        } catch (error) {
            console.error('Payment error:', error);
            alert('Failed to start payment process. Please try again.');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch templates
                const templatesResponse = await apiRequest.get('/landingpages/templates');
                console.log('Templates response:', templatesResponse.data);
                console.log('Templates array:', templatesResponse.data.templates);
                setTemplates(templatesResponse.data.templates || []);

                // Fetch business idea details for context (optional)
                try {
                    const ideaResponse = await apiRequest.get(`/ideas/${businessIdeaId}`);
                    setBusinessIdea(ideaResponse.data);
                } catch (ideaError) {
                    console.log('Could not fetch business idea details:', ideaError.message);
                    // This is optional, so we continue even if it fails
                }

            } catch (error) {
                console.error('Error fetching templates:', error);
                alert('Failed to load templates. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        if (businessIdeaId) {
            fetchData();
        }
    }, [businessIdeaId]);

  const handlePreview = async (templateId) => {
    try {
      console.log('Starting preview for template:', templateId);
      setPreviewingTemplateId(templateId);

      // Get the selected template
      const selectedTemplateData = templates.find(t => t.id === templateId);
      console.log('Selected template data:', selectedTemplateData);

      if (!selectedTemplateData) {
        console.error('Template not found for id:', templateId);
        alert('Template not found. Please try again.');
        return;
      }

      // Always use hardcoded placeholder content for preview (no dynamic data fetching)
      const placeholderContent = {
        TITLE: 'Your Amazing Product',
        HEADLINE: 'Transform Your Business Today',
        SUBHEADLINE: 'Discover how our solution can help you achieve your goals with cutting-edge technology and proven results.',
        KEY_FEATURES: [
          'Advanced Analytics Dashboard',
          'Real-time Collaboration Tools',
          'Seamless Integration',
          '24/7 Customer Support'
        ],
        FEATURE_DESCRIPTIONS: [
          'Get real-time insights with our powerful analytics dashboard',
          'Work together seamlessly with our collaboration tools',
          'Integrate with your existing workflow effortlessly',
          'Get help whenever you need it with our support team'
        ],
        CTA_TEXT: 'Get Started Now',
        FOUNDER_MESSAGE: 'We believe in creating solutions that make a real difference. Our mission is to empower businesses with innovative tools that drive growth and success.',
        PAIN_POINTS: [
          'Inefficient workflows slowing down productivity',
          'Lack of real-time collaboration tools',
          'Complex integration processes',
          'Limited customer support availability'
        ],
        OUTCOMES: [
          'Increased productivity by 300%',
          'Seamless team collaboration',
          'Easy integration with existing tools',
          '24/7 dedicated support'
        ]
      };

      console.log('Using placeholder content:', placeholderContent);

      // Use template HTML if available, otherwise create a simple preview
      const templateHtml = selectedTemplateData.html || `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; text-align: center;">
          <h1 style="color: #333; margin-bottom: 20px;">{{TITLE}}</h1>
          <h2 style="color: #666; margin-bottom: 30px;">{{HEADLINE}}</h2>
          <p style="color: #777; font-size: 18px; margin-bottom: 40px;">{{SUBHEADLINE}}</p>
          <div style="margin-bottom: 40px;">
            <h3 style="color: #333; margin-bottom: 20px;">Key Features</h3>
            <ul style="list-style: none; padding: 0;">
              {{#each KEY_FEATURES}}
              <li style="background: #f5f5f5; margin: 10px 0; padding: 15px; border-radius: 5px;">{{this}}</li>
              {{/each}}
            </ul>
          </div>
          <button style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border: none; border-radius: 25px; font-size: 18px; cursor: pointer;">{{CTA_TEXT}}</button>
        </div>
      `;

      console.log('Template HTML length:', templateHtml.length);

      // Populate template with placeholder content
      const populatedHtml = populateTemplateLocally(templateHtml, placeholderContent);
      console.log('Populated HTML length:', populatedHtml.length);

      const previewDataObj = {
        templateId,
        templateName: selectedTemplateData.name,
        content: placeholderContent,
        html: populatedHtml
      };

      console.log('Setting preview data:', previewDataObj);
      setPreviewData(previewDataObj);
      setIsPreviewModalOpen(true);

    } catch (error) {
      console.error('Error generating preview:', error);
      console.error('Error stack:', error.stack);
      alert('Failed to generate preview. Please try again.');
    } finally {
      setPreviewingTemplateId(null);
    }
  };    // Local template population function for preview
    const populateTemplateLocally = (templateHtml, content) => {
        let populatedHtml = templateHtml;

        // Replace simple placeholders
        Object.keys(content).forEach(key => {
            const placeholder = `{{${key}}}`;
            const value = content[key];

            if (Array.isArray(value)) {
                populatedHtml = populatedHtml.replace(new RegExp(`{{${key}}}`, 'g'), value.join(', '));
            } else {
                populatedHtml = populatedHtml.replace(new RegExp(placeholder, 'g'), value || '');
            }
        });

        // Handle simple Handlebars-style loops for preview
        const featureRegex = /{{#each KEY_FEATURES}}(.*?){{\/each}}/gs;
        populatedHtml = populatedHtml.replace(featureRegex, (match, template) => {
            return content.KEY_FEATURES.map((feature, index) => {
                let featureHtml = template;
                featureHtml = featureHtml.replace(/{{this}}/g, feature);
                featureHtml = featureHtml.replace(/{{\.\.\/FEATURE_DESCRIPTIONS\.\[{{@index}}\]}}/g, content.FEATURE_DESCRIPTIONS[index] || '');
                return featureHtml;
            }).join('');
        });

        const painPointRegex = /{{#each PAIN_POINTS}}(.*?){{\/each}}/gs;
        populatedHtml = populatedHtml.replace(painPointRegex, (match, template) => {
            return content.PAIN_POINTS.map(point => {
                return template.replace(/{{this}}/g, point);
            }).join('');
        });

        const outcomesRegex = /{{#each OUTCOMES}}(.*?){{\/each}}/gs;
        populatedHtml = populatedHtml.replace(outcomesRegex, (match, template) => {
            return content.OUTCOMES.map(outcome => {
                return template.replace(/{{this}}/g, outcome);
            }).join('');
        });

        return populatedHtml;
    };

    const handleGenerateLandingPage = async (templateId) => {
        try {
            setGeneratingTemplateId(templateId);
            console.log('Generating landing page with:', { businessIdeaId, templateId });

            const response = await apiRequest.post('/landingpages/generate-landing-page-with-template', {
                businessIdeaId,
                templateId
            });

            console.log('Generate response:', response.data);

            if (response.data.landingPage) {
                // Store the landing page data in localStorage for now
                const landingPageId = response.data.landingPage._id || `${businessIdeaId}-${templateId}-${Date.now()}`;
                localStorage.setItem(`landingPage-${landingPageId}`, JSON.stringify(response.data.landingPage));

                // Refresh landing page usage after successful creation
                fetchLandingPageUsage();

                // Navigate to the landing page view
                navigate(`/landing-page/${landingPageId}`);
            }

        } catch (error) {
            console.error('Error generating landing page:', error);
            console.error('Error response:', error.response?.data);
            
            // Check if it's a limit error
            if (error.response?.data?.limitReached) {
                setErrorModal({
                    isOpen: true,
                    title: 'Landing Page Limit Reached',
                    message: error.response.data.error || 'You have reached the maximum number of free landing pages.',
                    isLimitError: true
                });
            } else {
                alert(`Failed to generate landing page: ${error.response?.data?.error || error.message}`);
            }
        } finally {
            setGeneratingTemplateId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#e6ebef] via-[#f8fafc] to-[#e2e8f0] pt-16 sm:pt-20 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <div className="absolute inset-0 h-8 w-8 animate-ping rounded-full bg-blue-400 opacity-20"></div>
                    </div>
                    <span className="text-gray-700 font-medium">Loading templates...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e6ebef] via-[#f8fafc] to-[#e2e8f0] pt-16 sm:pt-20 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-400/5 to-cyan-400/5 rounded-full blur-3xl"></div>

            {/* Header */}
            <header className="mb-8 relative z-10">
                <div className="w-full max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-6">
                        <BackButton onClick={() => navigate(-1)} className="text-gray-600 cursor-pointer hover:text-gray-800 text-sm font-medium transition-colors duration-200">
                            Back to Ideas
                        </BackButton>
                    </div>
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4 animate-fade-in">
                            Choose Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">Landing Page</span> Template
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                            Select a template that best fits your business idea. We'll populate it with AI-generated content tailored to your specific needs.
                        </p>
                        {businessIdea && (
                            <div className="mt-6 inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium shadow-lg border border-blue-200/50 animate-bounce-in">
                                <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                                {businessIdea.ideaName || businessIdea.description?.substring(0, 50) + '...'}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full max-w-7xl mx-auto px-4 pb-12 relative z-10">
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {templates.map((template, index) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onPreview={() => handlePreview(template.id)}
                            onGenerate={() => handleGenerateLandingPage(template.id)}
                            isPreviewLoading={previewingTemplateId === template.id}
                            isGenerating={generatingTemplateId === template.id}
                            index={index}
                        />
                    ))}
                </div>

                {/* Preview Modal */}
                <Modal
                    isOpen={isPreviewModalOpen}
                    onClose={() => setIsPreviewModalOpen(false)}
                    title={previewData ? `${previewData.templateName} Preview` : "Template Preview"}
                    size="full"
                >
                    {previewData && (
                        <PreviewModalContent
                            previewData={previewData}
                            onGenerate={() => {
                                setIsPreviewModalOpen(false);
                                handleGenerateLandingPage(previewData.templateId);
                            }}
                            isGenerating={generatingTemplateId === previewData.templateId}
                        />
                    )}
                </Modal>

                {/* Error Modal */}
                {errorModal.isOpen && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 overflow-hidden" onClick={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}>
                        <div
                            className="bg-white rounded-2xl max-w-sm w-full max-h-[85vh] overflow-y-auto"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Crown className="h-5 w-5 text-yellow-500" fill="currentColor" />
                                        <h2 className="text-lg font-bold text-gray-900">
                                            {errorModal.title}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
                                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                {/* Hero Section */}
                                <div className="text-center mb-4">
                                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl mb-3">
                                        <Zap className="h-6 w-6 mx-auto mb-2" />
                                        <h3 className="text-base font-semibold">
                                            Landing Page Limit Reached
                                        </h3>
                                        <p className="text-xs opacity-90">
                                            You've created 2 landing pages with your free account
                                        </p>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="text-center mb-4">
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        {errorModal.message}
                                    </p>
                                </div>

                                {/* Features */}
                                <div className="space-y-2 mb-4">
                                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Upgrade to get:</h4>
                                    {[
                                        'Unlimited landing page creation',
                                        'Professional templates',
                                        'One-click deployment to Vercel',
                                        'Priority support'
                                    ].map((feature, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            <span className="text-gray-700 text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA Buttons */}
                                <div className="space-y-2">
                                    <Button
                                        onClick={handleDirectUpgrade}
                                        disabled={isProcessingPayment}
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 px-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isProcessingPayment ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Star className="h-4 w-4" />
                                                <span>Upgrade to Premium</span>
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
                                        className="w-full bg-gray-100 text-gray-700 py-2.5 px-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm cursor-pointer border-gray-300"
                                    >
                                        Maybe Later
                                    </Button>
                                </div>

                                {/* Trust Indicators */}
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                                        <div className="flex items-center space-x-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span>Secure Payment</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <span>30-day Guarantee</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const TemplateCard = ({ template, onPreview, onGenerate, isPreviewLoading, isGenerating, index }) => {
    const getTemplateIcon = (templateId) => {
        const icons = {
            'saas': '🚀',
            'corporate': '🏢',
            'ecommerce': '🛒',
            'startup': '💡'
        };
        return icons[templateId] || '🎨';
    };

    const getGradientClass = (templateId) => {
        const gradients = {
            'saas': 'from-blue-500 via-purple-600 to-indigo-700',
            'corporate': 'from-slate-600 via-gray-700 to-zinc-800',
            'ecommerce': 'from-emerald-500 via-green-600 to-teal-700',
            'startup': 'from-orange-500 via-red-600 to-pink-700'
        };
        return gradients[templateId] || 'from-blue-500 via-purple-600 to-indigo-700';
    };

    return (
        <Card className={`group transition-all duration-500 border-0 overflow-hidden bg-white `}
              style={{ animationDelay: `${index * 150}ms` }}>
            {/* Header with gradient background */}
            <div className={`h-36 bg-gradient-to-br ${getGradientClass(template.id)} relative overflow-hidden  transition-transform duration-500`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/25 text-white border-white/40 backdrop-blur-sm shadow-lg">
                        {template.id.toUpperCase()}
                    </Badge>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-4xl mb-1 group-hover:scale-110 transition-transform duration-300">{getTemplateIcon(template.id)}</div>
                    <div className="text-xs opacity-80 font-medium">Template</div>
                </div>
                {/* Enhanced decorative elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/15 rounded-full -translate-y-12 translate-x-12 group-hover:bg-white/20 transition-colors duration-300"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-full translate-y-10 translate-x-10 group-hover:bg-white/15 transition-colors duration-300"></div>
                <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:bg-white/10 transition-colors duration-300"></div>
            </div>

            <CardHeader className="pb-4 group-hover:bg-gray-50/50 transition-colors duration-300">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 mb-3 flex items-center group-hover:text-gray-800 transition-colors duration-300 text-left">
                            {template.name}
                            <Star className="h-4 w-4 ml-2 text-yellow-500 fill-current animate-pulse" />
                        </CardTitle>
                        <CardDescription className="text-gray-600 leading-relaxed text-sm text-left">
                            {template.description}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0 pb-6">
                {/* Features/Benefits */}
                <div className="mb-6">
                    <div className="flex items-center text-xs text-gray-500 mb-3 font-medium">
                        <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                        What's included
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['Responsive Design', 'SEO Optimized', 'Fast Loading', 'AI Content'].map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border-gray-200 hover:border-gray-300 transition-colors duration-200 animate-fade-in"
                                   style={{ animationDelay: `${(index * 150) + (idx * 100)}ms` }}>
                                {feature}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onPreview}
                        disabled={isPreviewLoading || isGenerating}
                        className="flex-1 border-gray-300 hover:border-blue-400 cursor-pointer hover:bg-blue-50/50 transition-all duration-300 group/btn"
                    >
                        {isPreviewLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-600" />
                                <span className="text-blue-600">Loading...</span>
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4 mr-2 group-hover/btn:text-blue-600 transition-colors duration-300" />
                                <span className="group-hover/btn:text-blue-600 transition-colors duration-300">Preview</span>
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={onGenerate}
                        disabled={isGenerating || isPreviewLoading}
                        className={`flex-1 bg-gradient-to-r ${getGradientClass(template.id)} text-white hover:opacity-90 cursor-pointer transition-all duration-300 border-0 s group/btn`}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                <span>Creating...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2 group-hover/btn:animate-bounce" />
                                <span className="font-semibold">Create</span>
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const PreviewModalContent = ({ previewData, onGenerate, isGenerating }) => {
    return (
        <div className="p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                <div className="animate-fade-in">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Template Preview</h3>
                    <p className="text-gray-600 text-lg">See how your landing page will look with AI-generated content</p>
                </div>
                <Button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="bg-gradient-to-r text-white from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 cursor-pointer duration-300  px-6 py-3"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                            <span className="font-semibold">Creating Landing Page...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-5 w-5 mr-3 animate-pulse" />
                            <span className="font-semibold">Create This Landing Page</span>
                        </>
                    )}
                </Button>
            </div>

            {/* Content */}
            <div className="grid lg:grid-cols-1 gap-8">
                {/* Live Preview - Full Panel */}
                <div className="lg:col-span-1 animate-slide-in-right">
                    <Card className="h-fit shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-lg">
                            <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                                <ExternalLink className="h-5 w-5 mr-3 text-blue-600" />
                                Live Preview
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 ml-8">
                                Interactive preview of your landing page
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="border rounded-lg overflow-hidden bg-gray-50 shadow-inner">
                                <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-3 border-b flex items-center space-x-3">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 bg-red-400 rounded-full hover:bg-red-500 transition-colors duration-200 cursor-pointer"></div>
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full hover:bg-yellow-500 transition-colors duration-200 cursor-pointer"></div>
                                        <div className="w-3 h-3 bg-green-400 rounded-full hover:bg-green-500 transition-colors duration-200 cursor-pointer"></div>
                                    </div>
                                    <div className="bg-white px-4 py-2 rounded-lg text-sm text-gray-600 flex-1 shadow-sm border">
                                        your-landing-page.com
                                    </div>
                                </div>
                                <div className="w-full h-[80vh] overflow-hidden bg-white">
                                    <iframe
                                        srcDoc={previewData.html}
                                        title="Landing Page Preview"
                                        className="w-full h-full border-0"
                                        sandbox="allow-scripts allow-same-origin"
                                        style={{
                                            transform: 'scale(0.9)',
                                            transformOrigin: 'top center',
                                            width: '111.11%',
                                            height: '111.11%'
                                        }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TemplateSelector;
