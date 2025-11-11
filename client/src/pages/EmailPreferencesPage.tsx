import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Mail, Settings, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function EmailPreferencesPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  return (
    <SelfHealingErrorBoundary pageName="Email Preferences" fallbackRoute="/settings">
      <PageLayout title="Email Preferences" showBreadcrumbs>
        <div className="min-h-screen">
          {/* Hero Section - 16:9 */}
          <section className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=1600&h=900&fit=crop')`
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
                  <Settings className="w-3 h-3 mr-1.5" />
                  Settings
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  Email Preferences
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  Manage your email notifications and stay updated
                </p>
              </motion.div>
            </div>
          </section>

          <div className="bg-background py-12 px-6">
            <div className="container mx-auto max-w-2xl">
              <motion.div {...fadeInUp}>
                <Card className="overflow-hidden mb-8">
                  <CardHeader className="border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-2xl font-serif">Email Notifications</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="space-y-0.5 flex-1">
                        <Label htmlFor="events" className="text-base font-semibold">Event Updates</Label>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Get notified about upcoming events in your area
                        </p>
                      </div>
                      <Switch id="events" defaultChecked data-testid="switch-events" />
                    </motion.div>

                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="space-y-0.5 flex-1">
                        <Label htmlFor="messages" className="text-base font-semibold">Messages</Label>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Receive email notifications for new messages
                        </p>
                      </div>
                      <Switch id="messages" defaultChecked data-testid="switch-messages" />
                    </motion.div>

                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="space-y-0.5 flex-1">
                        <Label htmlFor="posts" className="text-base font-semibold">Posts & Mentions</Label>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          When someone mentions you or comments on your posts
                        </p>
                      </div>
                      <Switch id="posts" defaultChecked data-testid="switch-posts" />
                    </motion.div>

                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="space-y-0.5 flex-1">
                        <Label htmlFor="newsletter" className="text-base font-semibold">Weekly Newsletter</Label>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Get our weekly digest of tango news and tips
                        </p>
                      </div>
                      <Switch id="newsletter" defaultChecked data-testid="switch-newsletter" />
                    </motion.div>

                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="space-y-0.5 flex-1">
                        <Label htmlFor="promotions" className="text-base font-semibold">Promotions & Offers</Label>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Receive exclusive deals and special offers
                        </p>
                      </div>
                      <Switch id="promotions" data-testid="switch-promotions" />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                <Button className="w-full gap-2" size="lg" data-testid="button-save">
                  Save Preferences
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
