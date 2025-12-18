import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Smile,
  Sparkles,
  ThumbsUp,
  Brain,
  MessageCircle,
  Circle,
} from "lucide-react";

type EmotionType =
  | "idle"
  | "happy"
  | "surprised"
  | "nodding"
  | "thinking"
  | "speaking";

const emotionButtons: Array<{
  emotion: EmotionType;
  label: string;
  icon: typeof Smile;
}> = [
  { emotion: "idle", label: "Idle", icon: Circle },
  { emotion: "happy", label: "Happy", icon: Smile },
  { emotion: "surprised", label: "Surprised", icon: Sparkles },
  { emotion: "nodding", label: "Nodding", icon: ThumbsUp },
  { emotion: "thinking", label: "Thinking", icon: Brain },
  { emotion: "speaking", label: "Speaking", icon: MessageCircle },
];

export default function MrBlueAvatar3DPage() {
  const [emotion, setEmotion] = useState<EmotionType>("idle");
  const [autoDetect, setAutoDetect] = useState(false);

  const handleEmotionChange = useCallback(
    (detected: EmotionType) => {
      if (autoDetect) {
        setEmotion(detected);
      }
    },
    [autoDetect],
  );

  // useEmotionDetection(handleEmotionChange, 3000);

  return (
    <div className="min-h-screen p-4 md:p-8" data-testid="mr-blue-avatar-page">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold" data-testid="page-title">
            Mr. Blue 3D Avatar
          </h1>
          <p className="text-muted-foreground">
            Interactive AI companion with expressive emotions
          </p>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="h-[400px] md:h-[500px] bg-gradient-to-b from-background to-muted/20">
              <div className="w-full h-full bg-blue-500 rounded-lg flex flex-col items-center justify-center text-white text-2xl font-bold" data-testid="avatar-3d-container">
                <span>Mr. Blue 3D Avatar</span>
                <span className="text-sm mt-2">(Emotion: {emotion})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Emotion Controls</CardTitle>
            <CardDescription>
              Click to change Mr. Blue's emotional state
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="flex flex-wrap gap-2"
              data-testid="emotion-controls"
            >
              {emotionButtons.map(
                ({ emotion: emotionType, label, icon: Icon }) => (
                  <Button
                    key={emotionType}
                    variant={emotion === emotionType ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEmotion(emotionType)}
                    data-testid={`button-emotion-${emotionType}`}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                ),
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto-detect Emotions</p>
                  <p className="text-xs text-muted-foreground">
                    Enable AI emotion detection (coming soon)
                  </p>
                </div>
                <Button
                  variant={autoDetect ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAutoDetect(!autoDetect)}
                  data-testid="button-auto-detect"
                >
                  {autoDetect ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About Mr. Blue</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Mr. Blue is your AI companion in Mundo Tango. This 3D avatar
              represents the intelligent assistant that helps you navigate the
              platform, discover events, and connect with the global tango
              community.
            </p>
            <p>
              The avatar responds to emotions and can speak using text-to-speech
              technology. Future versions will include face detection for
              real-time emotion mirroring and personalized interactions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
