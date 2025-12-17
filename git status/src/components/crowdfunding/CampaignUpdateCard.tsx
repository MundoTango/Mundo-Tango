import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface CampaignUpdateCardProps {
  update: {
    id: number;
    title: string;
    content: string;
    imageUrls?: string[];
    videoUrl?: string;
    postedAt: Date | string;
  };
  creator: {
    name: string;
    profileImage?: string;
  };
}

export function CampaignUpdateCard({ update, creator }: CampaignUpdateCardProps) {
  const postedDate = typeof update.postedAt === 'string' ? new Date(update.postedAt) : update.postedAt;

  return (
    <Card 
      className="border-white/10"
      style={{
        background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.6) 0%, rgba(30, 144, 255, 0.1) 100%)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <CardHeader className="space-y-4">
        {/* Creator & Timestamp */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={creator.profileImage} />
              <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{creator.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(postedDate, { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        {/* Update Title */}
        <h3 className="text-xl font-semibold text-foreground">
          {update.title}
        </h3>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Update Content */}
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-foreground whitespace-pre-wrap">
            {update.content}
          </p>
        </div>

        {/* Images */}
        {update.imageUrls && update.imageUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {update.imageUrls.map((url, index) => (
              <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                <img 
                  src={url} 
                  alt={`Update image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Video */}
        {update.videoUrl && (
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <video 
              src={update.videoUrl}
              controls
              className="w-full h-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
