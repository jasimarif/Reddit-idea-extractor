import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LandingPageBlock from "@/components/LandingPageBlock";
import { mockBusinessIdeas } from "@/data/mockData";
import { Globe, Wand2, FileText } from "lucide-react";

const LandingPages = () => {
  const [selectedIdea, setSelectedIdea] = useState("");
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const mockLandingPageContent = {
    hero: "Stop Overpaying for Your Bills - We'll Negotiate for You",
    subheading:
      "Automatically reduce your monthly expenses with our AI-powered bill negotiation service. We only get paid when we save you money.",
    features: [
      "Automatic bill analysis and negotiation with providers",
      "No upfront costs - we only charge a percentage of savings",
      "Works with internet, phone, insurance, and subscription services",
      "Average savings of $300+ per year per customer",
      "Secure, encrypted handling of your account information",
    ],
    cta: "Start Saving Money Today",
  };

  const handleGenerate = () => {
    if (!selectedIdea) return;

    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setGeneratedContent(mockLandingPageContent);
      setIsGenerating(false);
    }, 2000);
  };

  const stats = [
    {
      title: "Available Ideas",
      value: mockBusinessIdeas.length.toString(),
      icon: Globe,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Generated Pages",
      value: "12",
      icon: FileText,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      icon: Wand2,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center space-x-3">
              <Globe className="h-8 w-8 text-blue-600" />
              <span>Landing Page Generator</span>
            </h1>
            <p className="text-slate-600 mt-2">
              Create compelling landing pages for your startup ideas in seconds
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`${stat.bg} p-3 rounded-lg`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Generator Section */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wand2 className="h-6 w-6 text-blue-600" />
                <span>Generate Landing Page</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Select Business Idea
                  </label>
                  <Select value={selectedIdea} onValueChange={setSelectedIdea}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an idea..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBusinessIdeas.map((idea) => (
                        <SelectItem key={idea.id} value={idea.id}>
                          {idea.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Page Template
                  </label>
                  <Select defaultValue="saas">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saas">SaaS Landing Page</SelectItem>
                      <SelectItem value="product">Product Launch</SelectItem>
                      <SelectItem value="service">Service Business</SelectItem>
                      <SelectItem value="app">Mobile App</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-center">
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedIdea || isGenerating}
                  className="text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Page...
                    </>
                  ) : (
                    <>
                      <Wand2 className="text-white mr-2 h-4 w-4" />
                      Generate Landing Page
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Content */}
          {generatedContent && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Generated Landing Page
              </h2>
              <LandingPageBlock
                hero={generatedContent.hero}
                subheading={generatedContent.subheading}
                features={generatedContent.features}
                cta={generatedContent.cta}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPages;
