import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Hash, X, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface HashtagInputProps {
  hashtags: string[];
  onHashtagsChange: (hashtags: string[]) => void;
  content: string;
  className?: string;
}

export function HashtagInput({ hashtags, onHashtagsChange, content, className = "" }: HashtagInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch trending hashtags
  const { data: trending } = useQuery({
    queryKey: ['/api/posts/hashtags/trending'],
    enabled: showSuggestions,
  });

  // Fetch content-based suggestions
  const { data: contentBased } = useQuery({
    queryKey: ['/api/posts/hashtags/suggest', content],
    enabled: showSuggestions && content.length > 10,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addHashtag = (tag: string) => {
    const cleanTag = tag.replace(/^#/, '');
    if (!hashtags.includes(cleanTag)) {
      onHashtagsChange([...hashtags, cleanTag]);
    }
    setShowSuggestions(false);
  };

  const removeHashtag = (tag: string) => {
    onHashtagsChange(hashtags.filter(h => h !== tag));
  };

  const suggestions = [
    ...(contentBased || []),
    ...(trending || []),
  ].filter((item, index, self) => 
    index === self.findIndex((t) => t.hashtag === item.hashtag)
  ).slice(0, 10);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Selected Hashtags */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {hashtags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1"
              data-testid={`badge-hashtag-${tag}`}
            >
              <Hash className="h-3 w-3" />
              {tag}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeHashtag(tag)}
                className="h-4 w-4 p-0 hover:bg-transparent"
                data-testid={`button-remove-hashtag-${tag}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Hashtag Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowSuggestions(!showSuggestions)}
        data-testid="button-show-hashtags"
      >
        <Hash className="h-4 w-4 mr-2" />
        Add Hashtags
      </Button>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <Card className="absolute top-full mt-2 w-full max-w-md z-50 p-4" data-testid="card-hashtag-suggestions">
          <div className="space-y-3">
            {contentBased && contentBased.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Suggested for your post</p>
                <div className="flex flex-wrap gap-2">
                  {contentBased.slice(0, 5).map((item: any) => (
                    <Button
                      key={item.hashtag}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addHashtag(item.hashtag)}
                      className="gap-1"
                      data-testid={`button-add-hashtag-${item.hashtag}`}
                    >
                      <Hash className="h-3 w-3" />
                      {item.hashtag}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {trending && trending.length > 0 && (
              <div>
                <div className="flex items-center gap-1 text-sm font-medium mb-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </div>
                <div className="flex flex-wrap gap-2">
                  {trending.slice(0, 5).map((item: any) => (
                    <Button
                      key={item.hashtag}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addHashtag(item.hashtag)}
                      className="gap-1"
                      data-testid={`button-add-trending-${item.hashtag}`}
                    >
                      <Hash className="h-3 w-3" />
                      {item.hashtag}
                      <span className="text-xs text-muted-foreground ml-1">
                        {item.count}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {(!contentBased || contentBased.length === 0) && (!trending || trending.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hashtag suggestions available
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
