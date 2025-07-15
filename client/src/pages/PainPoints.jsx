import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PainPointCard from "@/components/PainPointCard";
import { mockPainPoints } from "@/data/mockData";
import { Brain, Search, TrendingDown } from "lucide-react";

const PainPoints = () => {
  const categoryStats = [
    { category: "Pricing", count: 2, color: "text-red-600", bg: "bg-red-100" },
    { category: "UX", count: 2, color: "text-blue-600", bg: "bg-blue-100" },
    {
      category: "Features",
      count: 1,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      category: "Support",
      count: 1,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center space-x-3">
              <Brain className="h-8 w-8 text-purple-600" />
              <span>Pain Point Analyzer</span>
            </h1>
            <p className="text-slate-600 mt-2">
              Discover user frustrations and unmet needs from social media
              discussions
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`${stat.bg} p-3 rounded-lg`}>
                      <TrendingDown className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        {stat.category}
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {stat.count}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Button */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6 text-center">
              <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Analyze New Threads
              </h3>
              <p className="text-slate-600 mb-4">
                Scan recent discussions to identify emerging pain points and
                opportunities
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Search className="mr-2 h-4 w-4" />
                Analyze Threads
              </Button>
            </CardContent>
          </Card>

          {/* Pain Points Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Recent Pain Points ({mockPainPoints.length})
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {mockPainPoints.map((painPoint) => (
                <PainPointCard
                  key={painPoint.id}
                  quote={painPoint.quote}
                  category={painPoint.category}
                  source={painPoint.source}
                  timestamp={painPoint.timestamp}
                  upvotes={painPoint.upvotes}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PainPoints;
