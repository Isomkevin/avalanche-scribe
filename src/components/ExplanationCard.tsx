
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Code } from 'lucide-react';
import { ExplanationWithRange, CodeRange } from '@/hooks/useMonacoDecorations';

interface ExplanationCardProps {
  explanation: ExplanationWithRange;
  isActive: boolean;
  onClick: (range: CodeRange) => void;
}

const ExplanationCard: React.FC<ExplanationCardProps> = ({
  explanation,
  isActive,
  onClick,
}) => {
  const handleClick = () => {
    onClick(explanation.range);
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isActive 
          ? 'border-yellow-400 bg-yellow-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge 
            variant="outline" 
            className={`text-xs ${
              isActive 
                ? 'border-yellow-500 text-yellow-700' 
                : 'border-gray-400 text-gray-600'
            }`}
          >
            <Code className="h-3 w-3 mr-1" />
            Lines {explanation.range.startLine}-{explanation.range.endLine}
          </Badge>
          {isActive && (
            <Eye className="h-4 w-4 text-yellow-600" />
          )}
        </div>
        <div className="text-sm text-gray-700 whitespace-pre-wrap">
          {explanation.explanation}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Click to highlight in editor
        </div>
      </CardContent>
    </Card>
  );
};

export default ExplanationCard;
