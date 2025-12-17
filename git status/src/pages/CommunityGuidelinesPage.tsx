import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Heart, AlertCircle, CheckCircle } from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

export default function CommunityGuidelinesPage() {
  return (
    <SelfHealingErrorBoundary pageName="Community Guidelines" fallbackRoute="/">
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1511795267836-f0e1baf4daed?w=1600&h=900&fit=crop&q=80')`
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
                Community Standards
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4" data-testid="text-page-title">
                Community Guidelines
              </h1>
              
              <p className="text-lg text-white/80 max-w-2xl mx-auto" data-testid="text-page-description">
                Building a respectful and inclusive tango community
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <Card className="bg-primary/5 border-primary/20 hover-elevate">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                  <Heart className="h-6 w-6 text-primary" />
                  Our Values
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>• <strong>Respect:</strong> Treat all community members with kindness and dignity</p>
                <p>• <strong>Inclusivity:</strong> Welcome dancers of all levels, backgrounds, and identities</p>
                <p>• <strong>Authenticity:</strong> Share genuine experiences and honest feedback</p>
                <p>• <strong>Safety:</strong> Create a secure environment for everyone</p>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="hover-elevate">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    Do's
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>✓ <strong>Be respectful:</strong> Use courteous language in all interactions</p>
                  <p>✓ <strong>Give constructive feedback:</strong> Help others improve with kindness</p>
                  <p>✓ <strong>Share knowledge:</strong> Contribute tips, experiences, and resources</p>
                  <p>✓ <strong>Honor the embrace:</strong> Respect personal boundaries and consent</p>
                  <p>✓ <strong>Support events:</strong> Promote local milongas and community gatherings</p>
                  <p>✓ <strong>Report issues:</strong> Help us maintain a safe environment</p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                    Don'ts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>✗ <strong>No harassment:</strong> Zero tolerance for bullying, discrimination, or unwanted advances</p>
                  <p>✗ <strong>No spam:</strong> Don't post promotional content without permission</p>
                  <p>✗ <strong>No misinformation:</strong> Share only accurate information about events and teachers</p>
                  <p>✗ <strong>No trolling:</strong> Avoid inflammatory or off-topic comments</p>
                  <p>✗ <strong>No inappropriate content:</strong> Keep all posts family-friendly</p>
                  <p>✗ <strong>No personal attacks:</strong> Criticize ideas, not individuals</p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                    <Shield className="h-6 w-6 text-primary" />
                    Enforcement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p><strong>First violation:</strong> Warning and content removal</p>
                  <p><strong>Second violation:</strong> Temporary suspension (7-30 days)</p>
                  <p><strong>Third violation:</strong> Permanent account ban</p>
                  <p><strong>Severe violations:</strong> Immediate permanent ban (harassment, threats, illegal content)</p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                    <Users className="h-6 w-6 text-primary" />
                    Reporting & Appeals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p><strong>Report violations:</strong> Use the "Report" button on any post or profile</p>
                  <p><strong>Appeal a decision:</strong> Contact support@mundotango.com within 14 days</p>
                  <p><strong>Response time:</strong> We aim to review reports within 24-48 hours</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted">
              <CardContent className="py-6 text-center text-muted-foreground">
                <p>By using Mundo Tango, you agree to follow these guidelines.</p>
                <p className="text-sm mt-2">Last updated: October 31, 2025</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
