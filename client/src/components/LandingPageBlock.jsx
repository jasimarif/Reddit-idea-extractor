import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const LandingPageBlock = ({ hero, subheading, features, cta }) => {
  const handleCopy = () => {
    const content = `${hero}\n\n${subheading}\n\nFeatures:\n${features.map(f => `• ${f}`).join('\n')}\n\n${cta}`;
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Landing page content has been copied to your clipboard.",
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Landing Page Preview</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
          <h1 className="text-3xl font-bold">{hero}</h1>
          <p className="text-xl opacity-90">{subheading}</p>
          <Button className="bg-white text-blue-600 hover:bg-blue-50">
            {cta}
          </Button>
        </div>

        {/* Features Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Key Features</h3>
          <div className="grid gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span className="text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center p-4 bg-slate-100 rounded-lg">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            {cta}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LandingPageBlock;
