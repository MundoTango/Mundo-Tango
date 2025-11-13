import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiFacebook, SiInstagram, SiLinkedin, SiX } from "react-icons/si";
import { Calendar, Eye, Heart, MessageCircle, Share2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialPostCardProps {
  id: number;
  content: string;
  platforms: string[];
  status: "draft" | "scheduled" | "publishing" | "published" | "failed";
  scheduledFor?: Date;
  publishedAt?: Date;
  engagement?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  mediaUrls?: string[];
  onEdit?: () => void;
  onDelete?: () => void;
}

const platformIcons = {
  facebook: SiFacebook,
  instagram: SiInstagram,
  linkedin: SiLinkedin,
  twitter: SiX,
};

const statusConfig = {
  draft: { label: "Draft", className: "bg-gray-500/20 text-gray-500" },
  scheduled: { label: "Scheduled", className: "bg-blue-500/20 text-blue-500" },
  publishing: { label: "Publishing", className: "bg-yellow-500/20 text-yellow-500" },
  published: { label: "Published", className: "bg-green-500/20 text-green-500" },
  failed: { label: "Failed", className: "bg-red-500/20 text-red-500" },
};

export function SocialPostCard({
  id,
  content,
  platforms,
  status,
  scheduledFor,
  publishedAt,
  engagement,
  mediaUrls,
  onEdit,
  onDelete,
}: SocialPostCardProps) {
  return (
    <Card
      className="hover-elevate transition-all"
      style={{
        background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.9) 0%, rgba(64, 224, 208, 0.1) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
      data-testid={`card-social-post-${id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap gap-2">
            {platforms.map((platform) => {
              const Icon = platformIcons[platform as keyof typeof platformIcons];
              return Icon ? (
                <div
                  key={platform}
                  className="w-8 h-8 rounded-md flex items-center justify-center bg-white/10"
                >
                  <Icon className="w-4 h-4" />
                </div>
              ) : null;
            })}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={statusConfig[status].className}>
              {statusConfig[status].label}
            </Badge>
            <Button size="icon" variant="ghost" onClick={onEdit}>
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm line-clamp-3">{content}</p>

        {mediaUrls && mediaUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {mediaUrls.slice(0, 4).map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Media ${idx + 1}`}
                className="w-full h-24 object-cover rounded-md"
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {scheduledFor && <span>Scheduled: {new Date(scheduledFor).toLocaleDateString()}</span>}
            {publishedAt && <span>Published: {new Date(publishedAt).toLocaleDateString()}</span>}
          </div>
        </div>

        {engagement && status === "published" && (
          <div className="grid grid-cols-4 gap-4 pt-3 border-t border-white/10">
            {engagement.views !== undefined && (
              <div className="text-center">
                <Eye className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs font-medium">{engagement.views}</p>
              </div>
            )}
            {engagement.likes !== undefined && (
              <div className="text-center">
                <Heart className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs font-medium">{engagement.likes}</p>
              </div>
            )}
            {engagement.comments !== undefined && (
              <div className="text-center">
                <MessageCircle className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs font-medium">{engagement.comments}</p>
              </div>
            )}
            {engagement.shares !== undefined && (
              <div className="text-center">
                <Share2 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs font-medium">{engagement.shares}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
