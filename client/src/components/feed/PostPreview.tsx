import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Hash, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PostPreviewProps {
  content: string;
  richContent?: string;
  images?: Array<{ url: string }>;
  video?: { url: string; thumbnailUrl?: string };
  mentions?: string[];
  hashtags?: string[];
  location?: string;
  className?: string;
}

export function PostPreview({
  content,
  richContent,
  images = [],
  video,
  mentions = [],
  hashtags = [],
  location,
  className = ""
}: PostPreviewProps) {
  const { user } = useAuth();

  if (!content && !images.length && !video) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">
          Preview will appear as you create your post
        </p>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`} data-testid="card-post-preview">
      <div className="space-y-4">
        {/* User Header */}
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user?.profileImage || undefined} />
            <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user?.name || 'Your Name'}</p>
            <p className="text-sm text-muted-foreground">Just now</p>
          </div>
        </div>

        {/* Content */}
        {richContent ? (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: richContent }}
            data-testid="preview-rich-content"
          />
        ) : (
          <p className="whitespace-pre-wrap" data-testid="preview-content">
            {content}
          </p>
        )}

        {/* Mentions */}
        {mentions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {mentions.map((mention, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                @ {mention}
              </Badge>
            ))}
          </div>
        )}

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, index) => (
              <Badge key={index} variant="outline" className="gap-1">
                <Hash className="h-3 w-3" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Images */}
        {images.length > 0 && (
          <div
            className={`
              grid gap-2 rounded-md overflow-hidden
              ${images.length === 1 ? 'grid-cols-1' : ''}
              ${images.length === 2 ? 'grid-cols-2' : ''}
              ${images.length >= 3 ? 'grid-cols-2 md:grid-cols-3' : ''}
            `}
            data-testid="preview-images"
          >
            {images.slice(0, 6).map((img, index) => (
              <div
                key={index}
                className={`
                  relative aspect-square overflow-hidden bg-muted
                  ${images.length === 1 ? 'aspect-video' : ''}
                `}
              >
                <img
                  src={img.url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 5 && images.length > 6 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-2xl font-semibold">
                    +{images.length - 6}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Video */}
        {video && (
          <div className="relative aspect-video rounded-md overflow-hidden bg-black" data-testid="preview-video">
            <video
              src={video.url}
              poster={video.thumbnailUrl}
              controls
              className="w-full h-full"
            >
              <track kind="captions" />
            </video>
          </div>
        )}

        {/* Location */}
        {location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="preview-location">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
