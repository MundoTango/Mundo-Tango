import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Loader2, X, Image as ImageIcon, ChevronRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import heroImage from "@assets/stock_images/elegant_professional_0956f754.jpg";

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
          
          {/* Hero Section */}
          <div className="relative h-[50vh] w-full overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${heroImage}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-step-2">
                  Step 2 of 4
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-6">
                  Add Your Profile Photo
                </h1>
                
                <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                  Help others recognize you in the community
                </p>
              </motion.div>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-background">
            <div className="container mx-auto max-w-2xl px-6 py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-card p-8">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Camera className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-2xl font-serif font-bold">Your Profile Photo</CardTitle>
                    </div>
                    <p className="text-muted-foreground">
                      Help others recognize you (you can skip this step)
                    </p>
                  </CardHeader>

                  <CardContent className="p-8 space-y-6">
                    <div className="flex justify-center">
                      <Avatar className="h-40 w-40 border-4 border-primary/10">
                        <AvatarImage src={preview || undefined} />
                        <AvatarFallback className="text-5xl bg-primary/5">
                          {user?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div
                      className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                        isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/25"
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
                        <div className="space-y-6">
                          <div className="flex justify-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                              <Upload className="h-10 w-10 text-primary" />
                            </div>
                          </div>
                          <div>
                            <p className="text-lg font-medium mb-2">Drop your photo here</p>
                            <p className="text-muted-foreground mb-4">or</p>
                            <Button
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              data-testid="button-browse"
                            >
                              <ImageIcon className="mr-2 h-4 w-4" />
                              Browse Files
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center gap-2 text-primary">
                            <Camera className="h-5 w-5" />
                            <p className="font-medium">Photo selected!</p>
                          </div>
                          <Button
                            variant="outline"
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

                  <CardFooter className="p-8 bg-muted/20 flex justify-between">
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
                        className="gap-2"
                        data-testid="button-continue"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            Continue
                            <ChevronRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>

                {/* Progress Indicator */}
                <div className="flex justify-center gap-2 mt-8">
                  <div className="h-2 w-16 rounded-full bg-primary"></div>
                  <div className="h-2 w-16 rounded-full bg-primary"></div>
                  <div className="h-2 w-16 rounded-full bg-muted"></div>
                  <div className="h-2 w-16 rounded-full bg-muted"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
