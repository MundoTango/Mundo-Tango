import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { EyeOff, Shield } from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

export default function BlockedContentPage() {
  const blockedContent = [
    { id: 1, type: "Post", author: "User 1", reason: "Spam" },
    { id: 2, type: "Comment", author: "User 2", reason: "Inappropriate" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Blocked Content" fallbackRoute="/settings">
      <SEO
        title="Blocked Content | Mundo Tango"
        description="Manage content you've hidden from your feed. Review and unblock posts or comments you previously blocked on Mundo Tango."
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1600&h=900&fit=crop&q=80')`
          }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                <Shield className="w-3 h-3 mr-1.5" />
                Content Management
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4" data-testid="text-page-title">
                Blocked Content
              </h1>
              
              <p className="text-lg text-white/80 max-w-2xl mx-auto" data-testid="text-page-description">
                Manage content you've hidden from your feed
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto max-w-2xl px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {blockedContent.length > 0 ? (
              <div className="space-y-3">
                {blockedContent.map((content, index) => (
                  <motion.div
                    key={content.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card data-testid={`content-${content.id}`} className="hover-elevate">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{content.type} by {content.author}</p>
                            <p className="text-sm text-muted-foreground">Reason: {content.reason}</p>
                          </div>
                          <Button variant="outline" size="sm" data-testid={`button-unblock-${content.id}`}>
                            Unblock
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <EyeOff className="mx-auto h-16 w-16 mb-6 opacity-30" />
                  <h3 className="text-xl font-serif font-bold mb-2">No blocked content</h3>
                  <p>You haven't blocked any content yet</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
