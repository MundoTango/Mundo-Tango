import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, User, ChevronRight, Shield } from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

export default function UserReportsPage() {
  return (
    <SelfHealingErrorBoundary pageName="User Reports" fallbackRoute="/admin">
      <>
        <SEO
          title="User Reports - Admin"
          description="Review and manage user reports. Monitor community safety and take appropriate moderation actions."
        />

        {/* Hero Section - 16:9 */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&auto=format&fit=crop&q=80')`
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </motion.div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                <Shield className="w-3 h-3 mr-1.5" />
                Admin Dashboard
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                User Reports
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Review and manage community safety reports
              </p>
            </motion.div>
          </div>
        </div>

        {/* Reports Section */}
        <div className="bg-background py-16 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="space-y-6">
              {[1, 2, 3].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="hover-elevate" data-testid={`report-${item}`}>
                    <CardHeader className="border-b">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-serif">User Report #{item}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Reported 2 hours ago</p>
                          </div>
                        </div>
                        <Badge variant="destructive" className="text-xs">High Priority</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-semibold text-base">Reason</p>
                          <p className="text-muted-foreground">Harassment and inappropriate behavior</p>
                        </div>
                      </div>

                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          User has been reported for sending threatening messages and harassing multiple community members. Multiple reports have been filed against this account.
                        </p>
                      </div>

                      <div className="flex gap-3 pt-4 border-t">
                        <Button className="gap-2" data-testid={`button-review-${item}`}>
                          Review Details
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" data-testid={`button-dismiss-${item}`}>
                          Dismiss
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
