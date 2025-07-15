import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Save, Lightbulb } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const BusinessIdeaCard = ({ 
  title, 
  summary, 
  businessModel, 
  marketSegment, 
  differentiator 
}) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleCopy = () => {
    const text = `${title}\n\n${summary}\n\nBusiness Model: ${businessModel}\nMarket: ${marketSegment}\nDifferentiator: ${differentiator}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Business idea has been copied to your clipboard.",
    });
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from saved" : "Saved successfully",
      description: isSaved ? "Idea removed from your saved list." : "Idea saved to your collection.",
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 mb-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {businessModel}
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSave}
              className={isSaved ? 'text-blue-600' : 'text-slate-400'}
            >
              <Save className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
        <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-700 text-sm leading-relaxed">
          {summary}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">Market Segment:</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {marketSegment}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">Differentiator:</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {differentiator}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessIdeaCard;
