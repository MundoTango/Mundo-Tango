import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Loader2, X } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function PhotoUploadPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.isOnboardingComplete) {
      navigate("/feed");
    }
  }, [user, navigate]);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!file) {
      navigate("/onboarding/step-3");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch("/api/users/me/photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload photo");

      const data = await response.json();
      
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          profileImage: data.imageUrl,
          formStatus: 2,
        }),
      });

      navigate("/onboarding/step-3");
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          formStatus: 2,
        }),
      });
      navigate("/onboarding/step-3");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to skip. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <SelfHealingErrorBoundary pageName="Photo Upload" fallbackRoute="/">
      <PageLayout title="PhotoUpload" showBreadcrumbs>
<>
      <SEO title="Add Profile Photo - Mundo Tango" description="Upload your profile photo" />
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Step 2 of 4</div>
              <div className="flex gap-1">
                <div className="h-2 w-8 rounded-full bg-primary"></div>
                <div className="h-2 w-8 rounded-full bg-primary"></div>
                <div className="h-2 w-8 rounded-full bg-muted"></div>
                <div className="h-2 w-8 rounded-full bg-muted"></div>
              </div>
            </div>
            <CardTitle className="text-2xl font-serif flex items-center gap-2">
              <Camera className="h-6 w-6 text-primary" />
              Add a profile photo
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Help others recognize you (you can skip this step)
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <Avatar className="h-32 w-32">
                <AvatarImage src={preview || undefined} />
                <AvatarFallback className="text-4xl">
                  {user?.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) handleFileSelect(selectedFile);
                }}
                data-testid="input-photo"
              />
              
              {!preview ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Drop your photo here or</p>
                    <Button
                      variant="ghost"
                      className="p-0 h-auto text-primary underline hover:text-primary/80"
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="button-browse"
                    >
                      browse files
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-primary">Photo selected!</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPreview(null);
                      setFile(null);
                    }}
                    data-testid="button-remove-photo"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate("/onboarding/step-1")}
              disabled={isLoading}
              data-testid="button-back"
            >
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={isLoading}
                data-testid="button-skip"
              >
                Skip
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isLoading}
                data-testid="button-continue"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
