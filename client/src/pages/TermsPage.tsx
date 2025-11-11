import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, Scale, UserX } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function TermsPage() {
  return (
    <SelfHealingErrorBoundary pageName="Terms of Service" fallbackRoute="/">
    <PageLayout title="Terms of Service" showBreadcrumbs>
      <div className="min-h-screen bg-background">
        {/* Editorial Hero Section - 16:9 */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2670&auto=format&fit=crop')`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                Legal
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                Terms of Service
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Understanding your rights and responsibilities on Mundo Tango
              </p>
            </motion.div>
          </div>
        </div>

        {/* Editorial Content Layout */}
        <div className="container mx-auto max-w-4xl px-6 py-16">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
          <Card className="hover-elevate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                <FileText className="h-6 w-6 text-primary" />
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-lg leading-relaxed">
              <p>By accessing or using Mundo Tango, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you may not use our services.</p>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
          <Card className="hover-elevate">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">2. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground text-lg leading-relaxed">
              <p><strong>Eligibility:</strong> You must be at least 13 years old to create an account.</p>
              <p><strong>Accuracy:</strong> You must provide accurate and complete information.</p>
              <p><strong>Security:</strong> You are responsible for maintaining the security of your account.</p>
              <p><strong>One Account:</strong> You may only maintain one active account.</p>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
          <Card className="hover-elevate">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">3. User Conduct</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground text-lg leading-relaxed">
              <p>You agree NOT to:</p>
              <p>• Violate any laws or regulations</p>
              <p>• Infringe on intellectual property rights</p>
              <p>• Harass, bully, or threaten other users</p>
              <p>• Post spam or misleading content</p>
              <p>• Impersonate others or misrepresent affiliations</p>
              <p>• Attempt to hack or compromise platform security</p>
              <p>• Use automated tools to access the platform</p>
            </CardContent>
          </Card>
          </motion.div>

          {[
            { id: 4, title: "4. Content Ownership", icon: null, content: (
              <div className="space-y-3">
                <p><strong>Your Content:</strong> You retain ownership of content you post.</p>
                <p><strong>License to Us:</strong> By posting, you grant us a worldwide, non-exclusive license to use, display, and distribute your content on the platform.</p>
                <p><strong>Our Content:</strong> All Mundo Tango branding, design, and features are our property.</p>
              </div>
            )},
            { id: 5, title: "5. Payments & Subscriptions", icon: null, content: (
              <div className="space-y-2">
                <p>• Subscription fees are billed in advance</p>
                <p>• All fees are non-refundable unless required by law</p>
                <p>• We may change pricing with 30 days notice</p>
                <p>• Cancellation takes effect at the end of the billing period</p>
              </div>
            )},
            { id: 6, title: "6. Disclaimers", icon: <AlertTriangle className="h-6 w-6 text-orange-500" />, content: (
              <div className="space-y-3">
                <p><strong>AS-IS Service:</strong> The platform is provided "as is" without warranties of any kind.</p>
                <p><strong>No Guarantees:</strong> We don't guarantee uninterrupted or error-free service.</p>
                <p><strong>User Interactions:</strong> We are not responsible for interactions between users.</p>
                <p><strong>Third-Party Content:</strong> We don't endorse or verify user-generated content.</p>
              </div>
            )},
            { id: 7, title: "7. Limitation of Liability", icon: <Scale className="h-6 w-6 text-primary" />, content: (
              <p>To the maximum extent permitted by law, Mundo Tango shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.</p>
            )},
            { id: 8, title: "8. Indemnification", icon: null, content: (
              <p>You agree to indemnify and hold harmless Mundo Tango from any claims, damages, or expenses arising from your use of the platform or violation of these terms.</p>
            )},
            { id: 9, title: "9. Termination", icon: <UserX className="h-6 w-6 text-red-500" />, content: (
              <div className="space-y-2">
                <p><strong>By You:</strong> You may delete your account at any time.</p>
                <p><strong>By Us:</strong> We may suspend or terminate accounts that violate these terms.</p>
                <p><strong>Effect:</strong> Upon termination, your access ends and content may be deleted.</p>
              </div>
            )},
            { id: 10, title: "10. Dispute Resolution", icon: null, content: (
              <div className="space-y-2">
                <p><strong>Governing Law:</strong> These terms are governed by the laws of [Jurisdiction].</p>
                <p><strong>Arbitration:</strong> Disputes shall be resolved through binding arbitration.</p>
                <p><strong>Class Action Waiver:</strong> You waive the right to participate in class actions.</p>
              </div>
            )},
            { id: 11, title: "11. Changes to Terms", icon: null, content: (
              <p>We may modify these terms at any time. Continued use after changes constitutes acceptance. We'll notify users of material changes via email or platform notification.</p>
            )},
            { id: 12, title: "12. Contact", icon: null, content: (
              <div>
                <p>Questions about these Terms of Service?</p>
                <p className="mt-2">Email: <a href="mailto:legal@mundotango.com" className="text-primary hover:underline">legal@mundotango.com</a></p>
              </div>
            )},
          ].map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <Card className="hover-elevate">
                <CardHeader>
                  <CardTitle className={`text-2xl font-serif ${section.icon ? 'flex items-center gap-2' : ''}`}>
                    {section.icon}
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-lg leading-relaxed">
                  {section.content}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="py-6 text-center text-muted-foreground">
            <p className="font-semibold text-lg">By using Mundo Tango, you acknowledge that you have read, understood, and agree to these Terms of Service.</p>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </div>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
