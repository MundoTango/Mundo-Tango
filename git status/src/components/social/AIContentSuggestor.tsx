import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, RefreshCw, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AIContentSuggestorProps {
  onSelectSuggestion: (content: string) => void;
  context?: string;
  platforms?: string[];
}

interface AISuggestion {
  content: string;
  hashtags?: string[];
  optimalTime?: string;
  confidence: number;
}

export function AIContentSuggestor({
  onSelectSuggestion,
  context = "",
  platforms = [],
}: AIContentSuggestorProps) {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest<{ suggestions: AISuggestion[] }>({
        url: "/api/social/ai-content",
        method: "POST",
        data: { context, platforms },
      });
      return response;
    },
    onSuccess: (data) => {
      setSuggestions(data.suggestions || []);
      toast({
        title: "Content Generated",
        description: `Generated ${data.suggestions?.length || 0} suggestions`,
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI suggestions",
        variant: "destructive",
      });
    },
  });

  const handleCopySuggestion = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to Clipboard",
      description: "Suggestion copied to clipboard",
    });
  };

  return (
    <Card
      style={{
        background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.9) 0%, rgba(64, 224, 208, 0.1) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-turquoise-500" />
            <CardTitle>AI Content Suggestions</CardTitle>
          </div>
          <Button
            size="sm"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            data-testid="button-ai-generate"
          >
            {generateMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Click "Generate" to create AI-powered content suggestions</p>
            <p className="text-xs mt-1">Tailored to your selected platforms</p>
          </div>
        ) : (
          suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="p-4 rounded-md border border-white/10 bg-white/5 space-y-3"
            >
              <p className="text-sm">{suggestion.content}</p>
              
              {suggestion.hashtags && suggestion.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {suggestion.hashtags.map((tag, tagIdx) => (
                    <Badge key={tagIdx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {suggestion.optimalTime && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Best time: {suggestion.optimalTime}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Badge variant="secondary" className="text-xs">
                  {Math.round(suggestion.confidence * 100)}% confidence
                </Badge>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopySuggestion(suggestion.content)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onSelectSuggestion(suggestion.content)}
                  >
                    Use This
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
