import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Shield, Lock, Eye, Database, Mail } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicyPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <SelfHealingErrorBoundary pageName="Privacy Policy" fallbackRoute="/">
    <PageLayout title={t('pages:privacyPolicy.pageTitle', 'Privacy Policy')} showBreadcrumbs>
      <SEO
        title={t('pages:privacyPolicy.seoTitle', 'Privacy Policy | Mundo Tango')}
        description={t('pages:privacyPolicy.seoDescription', 'Learn how we protect your personal information. Understand our data collection, usage, security measures, and your privacy rights on Mundo Tango.')}
      />
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
              {t('pages:privacyPolicy.badge', 'Your Privacy Matters')}
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
              {t('pages:privacyPolicy.heroTitle', 'Privacy Policy')}
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              {t('pages:privacyPolicy.heroSubtitle', 'How we protect and handle your personal information')}
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
                    {t('pages:privacyPolicy.informationWeCollect', 'Information We Collect')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 text-muted-foreground leading-relaxed">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-lg">{t('pages:privacyPolicy.accountInformation', 'Account Information')}:</h4>
                    <p>{t('pages:privacyPolicy.accountInfoDesc', 'Name, email address, username, password, profile photo, and bio')}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-lg">{t('pages:privacyPolicy.profileData', 'Profile Data')}:</h4>
                    <p>{t('pages:privacyPolicy.profileDataDesc', 'Dance level, location, preferences, social connections, and activity history')}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-lg">{t('pages:privacyPolicy.usageData', 'Usage Data')}:</h4>
                    <p>{t('pages:privacyPolicy.usageDataDesc', 'Pages visited, features used, search queries, and interaction patterns')}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-lg">{t('pages:privacyPolicy.technicalData', 'Technical Data')}:</h4>
                    <p>{t('pages:privacyPolicy.technicalDataDesc', 'IP address, browser type, device information, and cookies')}</p>
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
                    {t('pages:privacyPolicy.howWeUse', 'How We Use Your Information')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
                  <p>• {t('pages:privacyPolicy.use1', 'Provide and improve our services')}</p>
                  <p>• {t('pages:privacyPolicy.use2', 'Connect you with other dancers and events')}</p>
                  <p>• {t('pages:privacyPolicy.use3', 'Send notifications about your account and activity')}</p>
                  <p>• {t('pages:privacyPolicy.use4', 'Personalize your experience and recommendations')}</p>
                  <p>• {t('pages:privacyPolicy.use5', 'Ensure platform security and prevent fraud')}</p>
                  <p>• {t('pages:privacyPolicy.use6', 'Comply with legal obligations')}</p>
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
                    {t('pages:privacyPolicy.dataSharing', 'Data Sharing & Disclosure')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 text-muted-foreground leading-relaxed">
                  <p className="text-lg"><strong className="text-foreground">{t('pages:privacyPolicy.neverSellData', 'We never sell your personal data.')}</strong></p>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 text-lg">{t('pages:privacyPolicy.mayShareWith', 'We may share data with')}:</h4>
                    <div className="space-y-2">
                      <p>• <strong>{t('pages:privacyPolicy.otherUsers', 'Other users')}:</strong> {t('pages:privacyPolicy.otherUsersDesc', 'Profile information you choose to make public')}</p>
                      <p>• <strong>{t('pages:privacyPolicy.serviceProviders', 'Service providers')}:</strong> {t('pages:privacyPolicy.serviceProvidersDesc', 'Cloud hosting, analytics, and email services')}</p>
                      <p>• <strong>{t('pages:privacyPolicy.legalAuthorities', 'Legal authorities')}:</strong> {t('pages:privacyPolicy.legalAuthoritiesDesc', 'When required by law or to protect rights')}</p>
                      <p>• <strong>{t('pages:privacyPolicy.businessTransfers', 'Business transfers')}:</strong> {t('pages:privacyPolicy.businessTransfersDesc', 'In case of merger or acquisition')}</p>
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
                    {t('pages:privacyPolicy.dataSecurity', 'Data Security')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
                  <p>• {t('pages:privacyPolicy.security1', 'Industry-standard encryption (SSL/TLS)')}</p>
                  <p>• {t('pages:privacyPolicy.security2', 'Secure password hashing with bcrypt')}</p>
                  <p>• {t('pages:privacyPolicy.security3', 'Regular security audits and monitoring')}</p>
                  <p>• {t('pages:privacyPolicy.security4', 'Limited employee access to personal data')}</p>
                  <p>• {t('pages:privacyPolicy.security5', 'Two-factor authentication option')}</p>
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
                  <CardTitle className="text-2xl font-serif">{t('pages:privacyPolicy.yourRights', 'Your Rights')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
                  <p>• <strong>{t('pages:privacyPolicy.access', 'Access')}:</strong> {t('pages:privacyPolicy.accessDesc', 'Request a copy of your personal data')}</p>
                  <p>• <strong>{t('pages:privacyPolicy.correction', 'Correction')}:</strong> {t('pages:privacyPolicy.correctionDesc', 'Update inaccurate information')}</p>
                  <p>• <strong>{t('pages:privacyPolicy.deletion', 'Deletion')}:</strong> {t('pages:privacyPolicy.deletionDesc', 'Request account and data deletion')}</p>
                  <p>• <strong>{t('pages:privacyPolicy.portability', 'Portability')}:</strong> {t('pages:privacyPolicy.portabilityDesc', 'Export your data in a standard format')}</p>
                  <p>• <strong>{t('pages:privacyPolicy.optOut', 'Opt-out')}:</strong> {t('pages:privacyPolicy.optOutDesc', 'Unsubscribe from marketing emails')}</p>
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
                    {t('pages:privacyPolicy.contactUs', 'Contact Us')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed">
                  <p className="text-lg mb-3">{t('pages:privacyPolicy.questionsAboutPolicy', 'Questions about this Privacy Policy?')}</p>
                  <p className="text-lg">
                    {t('pages:privacyPolicy.email', 'Email')}: <a href="mailto:privacy@mundotango.com" className="text-primary hover:underline font-semibold">privacy@mundotango.com</a>
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
                <p className="mb-2">{t('pages:privacyPolicy.lastUpdated', 'Last updated')}: {t('pages:privacyPolicy.lastUpdatedDate', 'November 2025')}</p>
                <p>{t('pages:privacyPolicy.updateNotice', 'We may update this Privacy Policy from time to time. Continued use of Mundo Tango constitutes acceptance of the updated policy.')}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
