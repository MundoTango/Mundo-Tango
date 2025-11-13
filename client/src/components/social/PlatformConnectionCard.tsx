import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiFacebook, SiInstagram, SiLinkedin, SiX } from "react-icons/si";

interface PlatformConnectionCardProps {
  platform: "facebook" | "instagram" | "linkedin" | "twitter";
  isConnected: boolean;
  username?: string;
  followerCount?: number;
  lastPostDate?: string;
  healthStatus?: "healthy" | "warning" | "error";
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const platformConfig = {
  facebook: {
    name: "Facebook",
    color: "#1877F2",
    icon: SiFacebook,
    testId: "facebook",
  },
  instagram: {
    name: "Instagram",
    color: "linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)",
    icon: SiInstagram,
    testId: "instagram",
  },
  linkedin: {
    name: "LinkedIn",
    color: "#0A66C2",
    icon: SiLinkedin,
    testId: "linkedin",
  },
  twitter: {
    name: "X (Twitter)",
    color: "#000000",
    icon: SiX,
    testId: "x",
  },
};

export function PlatformConnectionCard({
  platform,
  isConnected,
  username,
  followerCount,
  lastPostDate,
  healthStatus = "healthy",
  onConnect,
  onDisconnect,
}: PlatformConnectionCardProps) {
  const config = platformConfig[platform];
  const PlatformIcon = config.icon;

  const healthIcons = {
    healthy: <CheckCircle className="w-4 h-4 text-green-500" />,
    warning: <AlertCircle className="w-4 h-4 text-yellow-500" />,
    error: <XCircle className="w-4 h-4 text-red-500" />,
  };

  return (
    <Card
      className="hover-elevate transition-all"
      style={{
        background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.9) 0%, rgba(64, 224, 208, 0.1) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-md flex items-center justify-center"
              style={{
                background: config.color.includes('gradient') ? config.color : undefined,
                backgroundColor: !config.color.includes('gradient') ? config.color : undefined,
              }}
            >
              <PlatformIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{config.name}</CardTitle>
              {isConnected && username && (
                <p className="text-sm text-muted-foreground">@{username}</p>
              )}
            </div>
          </div>
          {isConnected && healthIcons[healthStatus]}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="default" className="bg-turquoise-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="w-3 h-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </div>

        {isConnected && (
          <div className="space-y-2 text-sm">
            {followerCount !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Followers</span>
                <span className="font-medium">{followerCount.toLocaleString()}</span>
              </div>
            )}
            {lastPostDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Post</span>
                <span className="font-medium">{new Date(lastPostDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}

        <Button
          className="w-full"
          variant={isConnected ? "outline" : "default"}
          onClick={isConnected ? onDisconnect : onConnect}
          data-testid={`button-connect-${config.testId}`}
        >
          {isConnected ? (
            <>
              <XCircle className="w-4 h-4 mr-2" />
              Disconnect
            </>
          ) : (
            <>
              <Link className="w-4 h-4 mr-2" />
              Connect {config.name}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
