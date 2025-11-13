import { useState } from "react";
import { useNavigate } from "wouter";
import { useMutation, queryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CrossPostComposer } from "@/components/social/CrossPostComposer";
import { AIContentSuggestor } from "@/components/social/AIContentSuggestor";
import { SchedulePostCalendar } from "@/components/social/SchedulePostCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Send, Calendar } from "lucide-react";
import type { InsertSocialPost } from "@shared/schema";

export default function SocialMediaComposerPage() {
  const [, navigate] = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"compose" | "schedule">("compose");
  const [postData, setPostData] = useState<{
    content: string;
    platforms: string[];
    mediaUrls?: string[];
  } | null>(null);

  const createPostMutation = useMutation({
    mutationFn: async (data: Omit<InsertSocialPost, "userId">) => {
      return apiRequest<any>({
        url: "/api/social/posts",
        method: "POST",
        data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Post Created",
        description: "Your post has been successfully created",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social/posts"] });
      navigate("/social");
    },
    onError: () => {
      toast({
        title: "Failed to Create Post",
        description: "There was an error creating your post",
        variant: "destructive",
      });
    },
  });

  const handleComposerSubmit = (data: {
    content: string;
    platforms: string[];
    mediaUrls?: string[];
  }) => {
    setPostData(data);
    createPostMutation.mutate({
      content: data.content,
      platforms: data.platforms,
      mediaUrls: data.mediaUrls,
      status: "draft",
    });
  };

  const handleSchedule = (scheduledDate: Date) => {
    if (!postData) {
      toast({
        title: "No Post Data",
        description: "Please compose a post first",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      content: postData.content,
      platforms: postData.platforms,
      mediaUrls: postData.mediaUrls,
      scheduledFor: scheduledDate,
      status: "scheduled",
    });
  };

  const handleAISuggestion = (content: string) => {
    setPostData((prev) => prev ? { ...prev, content } : { content, platforms: [] });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/social")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1
                className="text-4xl font-serif font-bold"
                style={{
                  background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 50%, #0047AB 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Compose Post
              </h1>
              <p className="text-muted-foreground">
                Create cross-platform posts with AI assistance
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="compose">
              <Send className="w-4 h-4 mr-2" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CrossPostComposer
                  onSubmit={handleComposerSubmit}
                  initialContent={postData?.content}
                  initialPlatforms={postData?.platforms}
                />
              </div>
              <div>
                <AIContentSuggestor
                  onSelectSuggestion={handleAISuggestion}
                  context={postData?.content}
                  platforms={postData?.platforms}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <div className="max-w-md mx-auto">
              <SchedulePostCalendar onSchedule={handleSchedule} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
