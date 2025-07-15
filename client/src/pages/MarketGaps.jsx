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
import BusinessIdeaCard from "@/components/BusinessIdeaCard";
import { mockBusinessIdeas, mockPainPoints } from "@/data/mockData";
import { TrendingUp, Lightbulb, Zap } from "lucide-react";

const MarketGaps = () => {
  const [selectedPainPoints, setSelectedPainPoints] = useState([]);
  const [generatedIdeas, setGeneratedIdeas] = useState(mockBusinessIdeas);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateIdeas = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setGeneratedIdeas(mockBusinessIdeas);
      setIsGenerating(false);
    }, 2000);
  };

  const stats = [
    {
      title: "Pain Points",
      value: mockPainPoints.length.toString(),
      icon: TrendingUp,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      title: "Generated Ideas",
      value: generatedIdeas.length.toString(),
      icon: Lightbulb,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Market Opportunities",
      value: "8",
      icon: Zap,
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <span>Market Gap Generator</span>
            </h1>
            <p className="text-slate-600 mt-2">
              Transform identified pain points into actionable business
              opportunities
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
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-green-600" />
                <span>Business Idea Generator</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Select Pain Points to Address
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose pain points..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPainPoints.map((painPoint) => (
                        <SelectItem key={painPoint.id} value={painPoint.id}>
                          {painPoint.category}:{" "}
                          {painPoint.quote.substring(0, 50)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Target Market Segment
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select market..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="freelancers">
                        Freelancers & Solo Entrepreneurs
                      </SelectItem>
                      <SelectItem value="saas">SaaS Companies</SelectItem>
                      <SelectItem value="support">
                        Customer Support Teams
                      </SelectItem>
                      <SelectItem value="product">Product Teams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-center">
                <Button
                  onClick={handleGenerateIdeas}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Ideas...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Generate Business Ideas
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Ideas */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Generated Business Ideas ({generatedIdeas.length})
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {generatedIdeas.map((idea) => (
                <BusinessIdeaCard
                  key={idea.id}
                  title={idea.title}
                  summary={idea.summary}
                  businessModel={idea.businessModel}
                  marketSegment={idea.marketSegment}
                  differentiator={idea.differentiator}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketGaps;
