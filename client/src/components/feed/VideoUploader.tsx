import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { VideoIcon, X, Upload, Play, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface VideoData {
  file: File;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
}

interface VideoUploaderProps {
  video: VideoData | null;
  onVideoChange: (video: VideoData | null) => void;
  onUploadComplete?: (videoUrl: string, thumbnailUrl: string) => void;
  className?: string;
}

export function VideoUploader({ 
  video, 
  onVideoChange, 
  onUploadComplete,
  className = "" 
}: VideoUploaderProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file (MP4, WebM, or MOV)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video size must be less than 100MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const url = URL.createObjectURL(file);
    onVideoChange({ file, url });

    // Upload to server
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('video', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await apiRequest('/api/posts/videos', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      onVideoChange({
        file,
        url: response.videoUrl,
        thumbnailUrl: response.thumbnailUrl,
        duration: response.duration,
      });

      if (onUploadComplete) {
        onUploadComplete(response.videoUrl, response.thumbnailUrl);
      }

      toast({
        title: "Video uploaded",
        description: "Your video has been uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
      onVideoChange(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    onVideoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {!video ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/mov"
            onChange={handleFileSelect}
            className="hidden"
            data-testid="input-video-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
            data-testid="button-video-upload"
          >
            <VideoIcon className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
        </div>
      ) : (
        <Card className="p-4" data-testid="card-video-preview">
          <div className="relative aspect-video bg-black rounded-md overflow-hidden">
            <video
              src={video.url}
              controls
              className="w-full h-full"
              data-testid="video-preview"
            >
              <track kind="captions" />
            </video>
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <div className="w-3/4">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-white text-sm mt-2 text-center">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Play className="h-4 w-4" />
              <span>{(video.file.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              disabled={isUploading}
              data-testid="button-remove-video"
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
