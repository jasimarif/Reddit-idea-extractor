import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Modal } from "../components/ui/modal";
import { Eye, Loader2, ArrowLeft, ExternalLink, Sparkles, Zap, Star } from "lucide-react";
import BackButton from "../components/BackButton";
import apiRequest from "../lib/apiRequest";

const TemplateSelector = () => {
    const { businessIdeaId } = useParams();
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [generatingTemplateId, setGeneratingTemplateId] = useState(null);
    const [previewingTemplateId, setPreviewingTemplateId] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [businessIdea, setBusinessIdea] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch templates
                const templatesResponse = await apiRequest.get('/landingpages/templates');
                console.log('Templates response:', templatesResponse.data);
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
      setPreviewingTemplateId(templateId);

      // Generate real content based on the business idea
      const response = await apiRequest.get(`/landingpages/preview/${businessIdeaId}/${templateId}`);

      if (response.data) {
        const selectedTemplateData = templates.find(t => t.id === templateId);
        if (selectedTemplateData) {
          setPreviewData({
            templateId,
            templateName: selectedTemplateData.name,
            content: response.data.content,
            html: response.data.html
          });
          setIsModalOpen(true);
        }
      }

    } catch (error) {
      console.error('Error generating preview:', error);
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

                // Navigate to the landing page view
                navigate(`/landing-page/${landingPageId}`);
            }

        } catch (error) {
            console.error('Error generating landing page:', error);
            console.error('Error response:', error.response?.data);
            alert(`Failed to generate landing page: ${error.response?.data?.error || error.message}`);
        } finally {
            setGeneratingTemplateId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#e6ebef] pt-16 sm:pt-20 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading templates...</span>
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
                        <BackButton className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                            Back to Ideasse
                        </BackButton>
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Landing Page Template</h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Select a template that best fits your business idea. We'll populate it with AI-generated content tailored to your specific needs.
                        </p>
                        {businessIdea && (
                            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                                <Sparkles className="h-4 w-4 mr-1" />
                                {businessIdea.ideaName || businessIdea.description?.substring(0, 50) + '...'}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full max-w-7xl mx-auto px-4 pb-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {templates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onPreview={() => handlePreview(template.id)}
                            onGenerate={() => handleGenerateLandingPage(template.id)}
                            isPreviewLoading={previewingTemplateId === template.id}
                            isGenerating={generatingTemplateId === template.id}
                        />
                    ))}
                </div>

                {/* Preview Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={previewData ? `${previewData.templateName} Preview` : "Template Preview"}
                    size="full"
                >
                    {previewData && (
                        <PreviewModalContent
                            previewData={previewData}
                            onGenerate={() => {
                                setIsModalOpen(false);
                                handleGenerateLandingPage(previewData.templateId);
                            }}
                            isGenerating={generatingTemplateId === previewData.templateId}
                        />
                    )}
                </Modal>
            </main>
        </div>
    );
};

const TemplateCard = ({ template, onPreview, onGenerate, isPreviewLoading, isGenerating }) => {
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
            'saas': 'from-blue-500 to-purple-600',
            'corporate': 'from-gray-600 to-gray-800',
            'ecommerce': 'from-green-500 to-emerald-600',
            'startup': 'from-orange-500 to-red-600'
        };
        return gradients[templateId] || 'from-blue-500 to-purple-600';
    };

    return (
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:scale-[1.02] overflow-hidden bg-white">
            {/* Header with gradient background */}
            <div className={`h-32 bg-gradient-to-br ${getGradientClass(template.id)} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {template.id.toUpperCase()}
                    </Badge>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-3xl mb-1">{getTemplateIcon(template.id)}</div>
                    <div className="text-xs opacity-80">Template</div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 translate-x-8"></div>
            </div>

            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                            {template.name}
                            <Star className="h-4 w-4 ml-2 text-yellow-500 fill-current" />
                        </CardTitle>
                        <CardDescription className="text-gray-600 leading-relaxed">
                            {template.description}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                {/* Features/Benefits */}
                <div className="mb-6">
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                        <Zap className="h-3 w-3 mr-1" />
                        What's included
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {['Responsive Design', 'SEO Optimized', 'Fast Loading'].map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
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
                        className="flex-1 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    >
                        {isPreviewLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={onGenerate}
                        disabled={isGenerating || isPreviewLoading}
                        className={`flex-1 bg-gradient-to-r ${getGradientClass(template.id)} hover:opacity-90 transition-opacity border-0 shadow-md`}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Create
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
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Template Preview</h3>
                    <p className="text-sm text-gray-600">See how your landing page will look with sample content</p>
                </div>
                <Button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating Landing Page...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Create This Landing Page
                        </>
                    )}
                </Button>
            </div>

            {/* Content */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Generated Content - Left Panel */}
                <div className="lg:col-span-1">
                    <Card className="h-fit">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Generated Content</CardTitle>
                            <CardDescription className="text-sm">AI-generated copy for your landing page</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-1">Title</h4>
                                <p className="text-gray-900 font-semibold">{previewData.content.TITLE}</p>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-700 mb-1">Headline</h4>
                                <p className="text-gray-900 font-semibold">{previewData.content.HEADLINE}</p>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-700 mb-1">Subheadline</h4>
                                <p className="text-gray-600">{previewData.content.SUBHEADLINE}</p>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-700 mb-1">Key Features</h4>
                                <ul className="space-y-1">
                                    {previewData.content.KEY_FEATURES.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-700 mb-1">Call to Action</h4>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {previewData.content.CTA_TEXT}
                                </Badge>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-700 mb-1">Founder Message</h4>
                                <p className="text-gray-600 text-xs leading-relaxed">{previewData.content.FOUNDER_MESSAGE}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Live Preview - Right Panel */}
                <div className="lg:col-span-2">
                    <Card className="h-fit">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Live Preview
                            </CardTitle>
                            <CardDescription className="text-sm">Interactive preview of your landing page</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="border rounded-lg overflow-hidden bg-gray-50">
                                <div className="bg-gray-100 px-4 py-2 border-b flex items-center space-x-2">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    </div>
                                    <div className="bg-white px-2 py-1 rounded text-xs text-gray-600 flex-1">
                                        your-landing-page.com
                                    </div>
                                </div>
                                <div className="w-full h-[60vh] overflow-hidden">
                                    <iframe
                                        srcDoc={previewData.html}
                                        title="Landing Page Preview"
                                        className="w-full h-full border-0"
                                        sandbox="allow-scripts allow-same-origin"
                                        style={{
                                            transform: 'scale(0.8)',
                                            transformOrigin: 'top left',
                                            width: '125%',
                                            height: '125%'
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
