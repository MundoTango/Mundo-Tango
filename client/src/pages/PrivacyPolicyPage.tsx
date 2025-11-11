import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, Database, Mail } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
  return (
    <SelfHealingErrorBoundary pageName="Privacy Policy" fallbackRoute="/">
    <PageLayout title="Privacy Policy" showBreadcrumbs>
      {/* Hero Section */}
      <div className="relative h-[50vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&h=900&fit=crop&q=80')`
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
              <Shield className="w-3 h-3 mr-1.5" />
              Your Privacy Matters
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
              Privacy Policy
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              How we protect and handle your personal information
            </p>
          </motion.div>
        </div>
      </div>

      <div className="bg-background py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-serif">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Database className="h-6 w-6 text-primary" />
                    </div>
                    Information We Collect
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 text-muted-foreground leading-relaxed">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-lg">Account Information:</h4>
                    <p>Name, email address, username, password, profile photo, and bio</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-lg">Profile Data:</h4>
                    <p>Dance level, location, preferences, social connections, and activity history</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-lg">Usage Data:</h4>
                    <p>Pages visited, features used, search queries, and interaction patterns</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-lg">Technical Data:</h4>
                    <p>IP address, browser type, device information, and cookies</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-serif">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Eye className="h-6 w-6 text-primary" />
                    </div>
                    How We Use Your Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
                  <p>• Provide and improve our services</p>
                  <p>• Connect you with other dancers and events</p>
                  <p>• Send notifications about your account and activity</p>
                  <p>• Personalize your experience and recommendations</p>
                  <p>• Ensure platform security and prevent fraud</p>
                  <p>• Comply with legal obligations</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-serif">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    Data Sharing & Disclosure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 text-muted-foreground leading-relaxed">
                  <p className="text-lg"><strong className="text-foreground">We never sell your personal data.</strong></p>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 text-lg">We may share data with:</h4>
                    <div className="space-y-2">
                      <p>• <strong>Other users:</strong> Profile information you choose to make public</p>
                      <p>• <strong>Service providers:</strong> Cloud hosting, analytics, and email services</p>
                      <p>• <strong>Legal authorities:</strong> When required by law or to protect rights</p>
                      <p>• <strong>Business transfers:</strong> In case of merger or acquisition</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-serif">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    Data Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
                  <p>• Industry-standard encryption (SSL/TLS)</p>
                  <p>• Secure password hashing with bcrypt</p>
                  <p>• Regular security audits and monitoring</p>
                  <p>• Limited employee access to personal data</p>
                  <p>• Two-factor authentication option</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-serif">Your Rights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
                  <p>• <strong>Access:</strong> Request a copy of your personal data</p>
                  <p>• <strong>Correction:</strong> Update inaccurate information</p>
                  <p>• <strong>Deletion:</strong> Request account and data deletion</p>
                  <p>• <strong>Portability:</strong> Export your data in a standard format</p>
                  <p>• <strong>Opt-out:</strong> Unsubscribe from marketing emails</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-serif">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    Contact Us
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed">
                  <p className="text-lg mb-3">Questions about this Privacy Policy?</p>
                  <p className="text-lg">
                    Email: <a href="mailto:privacy@mundotango.com" className="text-primary hover:underline font-semibold">privacy@mundotango.com</a>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            className="mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-muted/50">
              <CardContent className="py-8 text-center text-muted-foreground">
                <p className="mb-2">Last updated: November 2025</p>
                <p>We may update this Privacy Policy from time to time. Continued use of Mundo Tango constitutes acceptance of the updated policy.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
