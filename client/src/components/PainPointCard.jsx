import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, Clock } from "lucide-react";

const PainPointCard = ({ quote, category, source, timestamp, upvotes }) => {
  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'pricing':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ux':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'features':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'support':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getSourceColor = (source) => {
    return source === 'Reddit' 
      ? 'bg-orange-100 text-orange-800' 
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={`${getCategoryColor(category)} border font-medium`}>
              {category}
            </Badge>
            <Badge variant="secondary" className={getSourceColor(source)}>
              {source}
            </Badge>
          </div>
          {upvotes && (
            <div className="flex items-center space-x-1 text-sm text-slate-500">
              <ArrowUp className="h-4 w-4" />
              <span>{upvotes}</span>
            </div>
          )}
        </div>

        {/* Quote */}
        <blockquote className="text-slate-700 italic border-l-4 border-blue-200 pl-4 py-2 bg-blue-50/50 rounded-r">
          "{quote}"
        </blockquote>

        {/* Timestamp */}
        <div className="flex items-center space-x-1 text-sm text-slate-500">
          <Clock className="h-4 w-4" />
          <span>{timestamp}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PainPointCard;
