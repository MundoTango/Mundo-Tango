import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Heart, Lock } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

export default function SafetyCenterPage() {
  return (
    <SelfHealingErrorBoundary pageName="Safety Center" fallbackRoute="/">
      <PageLayout title="Safety Center" showBreadcrumbs>
        <PublicLayout>
          <SEO
            title="Safety Center - Mundo Tango"
            description="Your safety is our priority. Learn about our community safety features, reporting tools, privacy protections, and resources for a secure tango experience."
          />
          
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=1600&h=900&fit=crop')`
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
                  Safety Center
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  Your Safety Matters
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
                  Building a safe, respectful community for all dancers
                </p>
              </motion.div>
            </div>
          </div>
        
          <div className="bg-background py-12 px-4">
            <div className="container mx-auto max-w-4xl space-y-12">

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="hover-elevate" data-testid="card-commitment">
                  <CardHeader>
                    <CardTitle className="text-3xl font-serif flex items-center gap-2">
                      <Shield className="h-8 w-8 text-primary" />
                      Our Safety Commitment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                      Mundo Tango is committed to creating a safe, welcoming environment for all members 
                      of our community. We believe everyone deserves to enjoy tango free from harassment, 
                      discrimination, or unsafe behavior.
                    </p>
                    <p>
                      We've implemented comprehensive safety features, clear community guidelines, and 
                      responsive support systems to protect our users and maintain the positive culture 
                      that makes tango special.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Card className="hover-elevate h-full" data-testid="card-reporting">
                    <CardContent className="p-8 space-y-3">
                      <AlertTriangle className="h-10 w-10 text-primary" />
                      <h3 className="text-2xl font-serif font-bold">Report Concerns</h3>
                      <p className="text-sm text-muted-foreground">
                        Easily report inappropriate behavior, harassment, or safety concerns. Our team 
                        reviews all reports within 24 hours and takes appropriate action.
                      </p>
                      <Button variant="outline" size="sm" asChild className="mt-4">
                        <a href="/report-content">Report an Issue</a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="hover-elevate h-full" data-testid="card-privacy">
                    <CardContent className="p-8 space-y-3">
                      <Lock className="h-10 w-10 text-primary" />
                      <h3 className="text-2xl font-serif font-bold">Privacy Controls</h3>
                      <p className="text-sm text-muted-foreground">
                        Control who sees your profile, activity, and location. Block users, hide your 
                        online status, and manage your visibility with granular privacy settings.
                      </p>
                      <Button variant="outline" size="sm" asChild className="mt-4">
                        <a href="/settings/privacy">Privacy Settings</a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="hover-elevate h-full" data-testid="card-guidelines">
                    <CardContent className="p-8 space-y-3">
                      <Heart className="h-10 w-10 text-primary" />
                      <h3 className="text-2xl font-serif font-bold">Community Guidelines</h3>
                      <p className="text-sm text-muted-foreground">
                        Our guidelines ensure respectful interactions. We expect all members to treat 
                        each other with kindness, respect boundaries, and contribute positively.
                      </p>
                      <Button variant="outline" size="sm" asChild className="mt-4">
                        <a href="/community-guidelines">Read Guidelines</a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card className="hover-elevate h-full" data-testid="card-support">
                    <CardContent className="p-8 space-y-3">
                      <Shield className="h-10 w-10 text-primary" />
                      <h3 className="text-2xl font-serif font-bold">24/7 Support</h3>
                      <p className="text-sm text-muted-foreground">
                        Our safety team is available around the clock. Contact us immediately if you 
                        experience or witness concerning behavior.
                      </p>
                      <Button variant="outline" size="sm" asChild className="mt-4">
                        <a href="mailto:safety@mundotango.com">Contact Safety Team</a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" data-testid="card-emergency">
                  <CardHeader>
                    <CardTitle className="text-3xl font-serif">In Case of Emergency</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p className="font-semibold text-foreground">
                      If you are in immediate danger, contact local emergency services first.
                    </p>
                    <p>
                      For urgent safety concerns related to the platform, email safety@mundotango.com 
                      or use our emergency reporting feature. Include as much detail as possible: 
                      usernames, screenshots, dates, and descriptions of incidents.
                    </p>
                    <p>
                      We take all reports seriously and will investigate promptly. Your safety and 
                      well-being are our top priority.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </PublicLayout>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
