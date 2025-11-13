import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlatformCheckbox } from "./PlatformCheckbox";
import { Upload, X, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CrossPostComposerProps {
  onSubmit: (data: {
    content: string;
    platforms: string[];
    mediaUrls?: string[];
  }) => void;
  initialContent?: string;
  initialPlatforms?: string[];
}

export function CrossPostComposer({
  onSubmit,
  initialContent = "",
  initialPlatforms = [],
}: CrossPostComposerProps) {
  const { toast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(
    new Set(initialPlatforms)
  );
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

  const togglePlatform = (platform: string) => {
    const newSet = new Set(selectedPlatforms);
    if (newSet.has(platform)) {
      newSet.delete(platform);
    } else {
      newSet.add(platform);
    }
    setSelectedPlatforms(newSet);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setMediaFiles([...mediaFiles, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    setMediaPreviews(mediaPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter post content",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.size === 0) {
      toast({
        title: "Select Platform",
        description: "Please select at least one platform",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      content,
      platforms: Array.from(selectedPlatforms),
      mediaUrls: mediaPreviews,
    });
  };

  return (
    <div className="space-y-6">
      <Card
        style={{
          background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.9) 0%, rgba(64, 224, 208, 0.1) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <CardHeader>
          <CardTitle>Compose Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="post-content" className="mb-2 block">
              Content
            </Label>
            <Textarea
              id="post-content"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] bg-white/5 border-white/10 resize-none"
              data-testid="textarea-post-content"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {content.length} characters
            </p>
          </div>

          {mediaPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {mediaPreviews.map((preview, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={preview}
                    alt={`Upload ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeMedia(idx)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div>
            <input
              type="file"
              id="media-upload"
              className="hidden"
              accept="image/*,video/*"
              multiple
              onChange={handleMediaUpload}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById("media-upload")?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Add Media
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card
        style={{
          background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.9) 0%, rgba(64, 224, 208, 0.1) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <CardHeader>
          <CardTitle>Select Platforms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(["facebook", "instagram", "linkedin", "twitter"] as const).map((platform) => (
            <PlatformCheckbox
              key={platform}
              platform={platform}
              checked={selectedPlatforms.has(platform)}
              onCheckedChange={() => togglePlatform(platform)}
              currentLength={content.length}
            />
          ))}
        </CardContent>
      </Card>

      <Button
        className="w-full"
        size="lg"
        onClick={handleSubmit}
        data-testid="button-cross-post"
      >
        <Send className="w-4 h-4 mr-2" />
        Publish to {selectedPlatforms.size} Platform{selectedPlatforms.size !== 1 && "s"}
      </Button>
    </div>
  );
}
