import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, XCircle, Shield } from "lucide-react";
import { useState } from "react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

export default function ContentModerationPage() {
  const [activeTab, setActiveTab] = useState("pending");

  return (
    <SelfHealingErrorBoundary pageName="Content Moderation" fallbackRoute="/admin">
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1600&h=900&fit=crop&q=80')`
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
                Admin Tools
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4" data-testid="text-page-title">
                Content Moderation
              </h1>
              
              <p className="text-lg text-white/80 max-w-2xl mx-auto" data-testid="text-page-description">
                Review and manage reported content
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="pending" data-testid="tab-pending">Pending (23)</TabsTrigger>
                <TabsTrigger value="approved" data-testid="tab-approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected" data-testid="tab-rejected">Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                <div className="space-y-4">
                  {[1, 2, 3].map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card data-testid={`content-${item}`} className="hover-elevate">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg font-serif">Reported Post</CardTitle>
                              <p className="text-sm text-muted-foreground">Posted by @user{item} • 2 hours ago</p>
                            </div>
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              3 reports
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-muted-foreground">
                            This is the content that was reported for moderation review...
                          </p>
                          <div className="flex gap-2">
                            <Button variant="default" size="sm" data-testid={`button-approve-${item}`}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button variant="destructive" size="sm" data-testid={`button-reject-${item}`}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
