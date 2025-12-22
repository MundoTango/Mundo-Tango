import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Heart, AlertCircle, CheckCircle } from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function CommunityGuidelinesPage() {
  const { t } = useTranslation(['pages', 'common']);

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
                {t('pages:community.badge', 'Community Standards')}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4" data-testid="text-page-title">
                {t('pages:community.title', 'Community Guidelines')}
              </h1>
              
              <p className="text-lg text-white/80 max-w-2xl mx-auto" data-testid="text-page-description">
                {t('pages:community.subtitle', 'Building a respectful and inclusive tango community')}
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
                  {t('pages:community.values.title', 'Our Values')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>• <strong>{t('pages:community.values.respect.label', 'Respect')}:</strong> {t('pages:community.values.respect.description', 'Treat all community members with kindness and dignity')}</p>
                <p>• <strong>{t('pages:community.values.inclusivity.label', 'Inclusivity')}:</strong> {t('pages:community.values.inclusivity.description', 'Welcome dancers of all levels, backgrounds, and identities')}</p>
                <p>• <strong>{t('pages:community.values.authenticity.label', 'Authenticity')}:</strong> {t('pages:community.values.authenticity.description', 'Share genuine experiences and honest feedback')}</p>
                <p>• <strong>{t('pages:community.values.safety.label', 'Safety')}:</strong> {t('pages:community.values.safety.description', 'Create a secure environment for everyone')}</p>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="hover-elevate">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    {t('pages:community.dos.title', "Do's")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>✓ <strong>{t('pages:community.dos.respectful.label', 'Be respectful')}:</strong> {t('pages:community.dos.respectful.description', 'Use courteous language in all interactions')}</p>
                  <p>✓ <strong>{t('pages:community.dos.feedback.label', 'Give constructive feedback')}:</strong> {t('pages:community.dos.feedback.description', 'Help others improve with kindness')}</p>
                  <p>✓ <strong>{t('pages:community.dos.knowledge.label', 'Share knowledge')}:</strong> {t('pages:community.dos.knowledge.description', 'Contribute tips, experiences, and resources')}</p>
                  <p>✓ <strong>{t('pages:community.dos.embrace.label', 'Honor the embrace')}:</strong> {t('pages:community.dos.embrace.description', 'Respect personal boundaries and consent')}</p>
                  <p>✓ <strong>{t('pages:community.dos.events.label', 'Support events')}:</strong> {t('pages:community.dos.events.description', 'Promote local milongas and community gatherings')}</p>
                  <p>✓ <strong>{t('pages:community.dos.report.label', 'Report issues')}:</strong> {t('pages:community.dos.report.description', 'Help us maintain a safe environment')}</p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                    {t('pages:community.donts.title', "Don'ts")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>✗ <strong>{t('pages:community.donts.harassment.label', 'No harassment')}:</strong> {t('pages:community.donts.harassment.description', 'Zero tolerance for bullying, discrimination, or unwanted advances')}</p>
                  <p>✗ <strong>{t('pages:community.donts.spam.label', 'No spam')}:</strong> {t('pages:community.donts.spam.description', "Don't post promotional content without permission")}</p>
                  <p>✗ <strong>{t('pages:community.donts.misinformation.label', 'No misinformation')}:</strong> {t('pages:community.donts.misinformation.description', 'Share only accurate information about events and teachers')}</p>
                  <p>✗ <strong>{t('pages:community.donts.trolling.label', 'No trolling')}:</strong> {t('pages:community.donts.trolling.description', 'Avoid inflammatory or off-topic comments')}</p>
                  <p>✗ <strong>{t('pages:community.donts.inappropriate.label', 'No inappropriate content')}:</strong> {t('pages:community.donts.inappropriate.description', 'Keep all posts family-friendly')}</p>
                  <p>✗ <strong>{t('pages:community.donts.attacks.label', 'No personal attacks')}:</strong> {t('pages:community.donts.attacks.description', 'Criticize ideas, not individuals')}</p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                    <Shield className="h-6 w-6 text-primary" />
                    {t('pages:community.enforcement.title', 'Enforcement')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p><strong>{t('pages:community.enforcement.first.label', 'First violation')}:</strong> {t('pages:community.enforcement.first.description', 'Warning and content removal')}</p>
                  <p><strong>{t('pages:community.enforcement.second.label', 'Second violation')}:</strong> {t('pages:community.enforcement.second.description', 'Temporary suspension (7-30 days)')}</p>
                  <p><strong>{t('pages:community.enforcement.third.label', 'Third violation')}:</strong> {t('pages:community.enforcement.third.description', 'Permanent account ban')}</p>
                  <p><strong>{t('pages:community.enforcement.severe.label', 'Severe violations')}:</strong> {t('pages:community.enforcement.severe.description', 'Immediate permanent ban (harassment, threats, illegal content)')}</p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                    <Users className="h-6 w-6 text-primary" />
                    {t('pages:community.reporting.title', 'Reporting & Appeals')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p><strong>{t('pages:community.reporting.report.label', 'Report violations')}:</strong> {t('pages:community.reporting.report.description', 'Use the "Report" button on any post or profile')}</p>
                  <p><strong>{t('pages:community.reporting.appeal.label', 'Appeal a decision')}:</strong> {t('pages:community.reporting.appeal.description', 'Contact support@mundotango.com within 14 days')}</p>
                  <p><strong>{t('pages:community.reporting.response.label', 'Response time')}:</strong> {t('pages:community.reporting.response.description', 'We aim to review reports within 24-48 hours')}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted">
              <CardContent className="py-6 text-center text-muted-foreground">
                <p>{t('pages:community.footer.agreement', 'By using Mundo Tango, you agree to follow these guidelines.')}</p>
                <p className="text-sm mt-2">{t('pages:community.footer.lastUpdated', 'Last updated: October 31, 2025')}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
