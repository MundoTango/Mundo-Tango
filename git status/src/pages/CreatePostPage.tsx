import { useLocation } from "wouter";
import { PostCreator } from "@/components/universal/PostCreator";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { PageLayout } from "@/components/PageLayout";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function CreatePostPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handlePostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    queryClient.invalidateQueries({ queryKey: ['/api/feed/home'] });
    
    toast({
      title: "Post created successfully!",
      description: "Your post has been shared with your community.",
    });

    // Redirect to feed after posting
    setTimeout(() => {
      setLocation('/feed');
    }, 1000);
  };

  return (
    <SelfHealingErrorBoundary pageName="Create Post" fallbackRoute="/feed">
      <SEO
        title="Create Post - Mundo Tango"
        description="Share your tango moments, memories, and thoughts with the community."
      />
      <PageLayout title="Create Post" showBreadcrumbs>
        <div className="min-h-screen bg-background">
          {/* Hero Header */}
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b">
            <div className="container mx-auto px-4 py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                  <h1 className="text-4xl font-bold" data-testid="text-page-title">
                    Create a Post
                  </h1>
                </div>
                <p className="text-muted-foreground">
                  Share your tango journey with the community
                </p>
              </motion.div>
            </div>
          </div>

          {/* Post Creator */}
          <div className="container mx-auto px-4 py-8 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <PostCreator
                onPostCreated={handlePostCreated}
                context={{ type: 'feed' }}
                showStoryToggle={true}
                className="shadow-lg"
              />
            </motion.div>

            {/* Tips Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 p-6 bg-muted/50 rounded-lg"
            >
              <h3 className="font-semibold mb-3">💡 Tips for great posts:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Share authentic moments from your tango journey</li>
                <li>• Tag friends to share memories together</li>
                <li>• Use location tags to help others discover places</li>
                <li>• Add relevant tags to make your post discoverable</li>
                <li>• Choose your audience wisely - public, friends, or private</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
