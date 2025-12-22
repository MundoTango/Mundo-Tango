import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Mail, Send, Users, TrendingUp, MousePointerClick, Eye, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { Link } from "wouter";
import emailHeroImg from "@assets/stock_images/tango_dancers_in_ele_9f76090c.jpg";
import emailImg1 from "@assets/stock_images/milonga_dance_hall,__ffbc0d71.jpg";
import emailImg2 from "@assets/stock_images/milonga_dance_hall,__8449cbb5.jpg";

export default function EmailAgentPage() {
  const { t } = useTranslation(['pages', 'common']);

  const metrics = [
    { label: t('pages:emailAgent.metrics.subscribers', 'Subscribers'), value: "18,234", change: "+456", icon: Users, color: "text-blue-500" },
    { label: t('pages:emailAgent.metrics.openRate', 'Open Rate'), value: "24.5%", change: "+2.1%", icon: Eye, color: "text-green-500" },
    { label: t('pages:emailAgent.metrics.clickRate', 'Click Rate'), value: "8.2%", change: "+0.9%", icon: MousePointerClick, color: "text-purple-500" },
    { label: t('pages:emailAgent.metrics.sent', 'Sent This Month'), value: "12", change: "+2", icon: Send, color: "text-orange-500" }
  ];

  const campaigns = [
    { name: t('pages:emailAgent.campaigns.weekly', 'Weekly Tango Newsletter'), status: "sent", sent: "2,450", opens: "612", clicks: "234", date: "Oct 28" },
    { name: t('pages:emailAgent.campaigns.workshop', 'New Workshop Announcement'), status: "scheduled", sent: "-", opens: "-", clicks: "-", date: "Nov 2" },
    { name: t('pages:emailAgent.campaigns.spotlight', 'Teacher Spotlight: Carlos'), status: "draft", sent: "-", opens: "-", clicks: "-", date: "-" }
  ];

  const segments = [
    { name: t('pages:emailAgent.segments.active', 'Active Dancers'), count: 8450, growth: "+12%" },
    { name: t('pages:emailAgent.segments.beginners', 'Beginners'), count: 5230, growth: "+23%" },
    { name: t('pages:emailAgent.segments.teachers', 'Teachers'), count: 1240, growth: "+8%" },
    { name: t('pages:emailAgent.segments.organizers', 'Event Organizers'), count: 890, growth: "+15%" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Email Agent" fallbackRoute="/platform">
    <PageLayout title={t('pages:emailAgent.title', 'Email Agent')} showBreadcrumbs>
<>
      <SEO
        title={t('pages:emailAgent.seo.title', 'Email Agent - Marketing Dashboard')}
        description={t('pages:emailAgent.seo.description', 'Manage email campaigns, automation, and subscriber analytics with AI-powered insights.')}
      />

      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('${emailHeroImg}')`
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-marketing">
              {t('pages:emailAgent.badge', 'Marketing AI')}
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
              {t('pages:emailAgent.hero.title', 'Email Agent')}
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              {t('pages:emailAgent.hero.subtitle', 'Intelligent email marketing - create campaigns, automate workflows, and maximize conversions')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Preview Notice */}
        <div className="flex justify-center mb-8">
          <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
            {t('pages:emailAgent.previewNotice', 'Preview Data - Connect your email provider to see real metrics')}
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-8 md:grid-cols-4 mb-16">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <metric.icon className={`h-8 w-8 ${metric.color}`} />
                    <span className="text-xs text-green-500 font-medium">{metric.change}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-3xl font-serif font-bold mt-2">{metric.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Featured Email Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8">{t('pages:emailAgent.sections.campaigns', 'Email Campaigns')}</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Campaigns Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={emailImg1}
                  alt={t('pages:emailAgent.recentCampaigns.title', 'Email Campaigns')}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">{t('pages:emailAgent.recentCampaigns.title', 'Recent Campaigns')}</h3>
                  <p className="text-white/80 text-sm mt-1">{t('pages:emailAgent.recentCampaigns.subtitle', 'Performance across all sends')}</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {campaigns.map((campaign, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate" data-testid={`campaign-${idx}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{campaign.name}</h4>
                      <Badge className={
                        campaign.status === "sent" ? "bg-green-500"
                        : campaign.status === "scheduled" ? "bg-blue-500"
                        : ""
                      }>
                        {t(`pages:emailAgent.status.${campaign.status}`, campaign.status)}
                      </Badge>
                    </div>
                    {campaign.status === "sent" ? (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">{t('pages:emailAgent.labels.sent', 'Sent')}</p>
                          <p className="font-medium">{campaign.sent}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t('pages:emailAgent.labels.opens', 'Opens')}</p>
                          <p className="font-medium">{campaign.opens}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t('pages:emailAgent.labels.clicks', 'Clicks')}</p>
                          <p className="font-medium">{campaign.clicks}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {campaign.status === "scheduled" 
                          ? t('pages:emailAgent.scheduled', 'Scheduled: {{date}}', { date: campaign.date })
                          : t('pages:emailAgent.draft', 'Draft - Not sent yet')}
                      </p>
                    )}
                  </div>
                ))}
                <Link href="/admin/email/create">
                  <Button className="w-full gap-2" variant="outline" data-testid="button-create-campaign">
                    <Sparkles className="w-4 h-4" />
                    {t('pages:emailAgent.cta.createCampaign', 'Create Campaign')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Segments Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={emailImg2}
                  alt={t('pages:emailAgent.subscriberSegments.title', 'Subscriber Segments')}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">{t('pages:emailAgent.subscriberSegments.title', 'Subscriber Segments')}</h3>
                  <p className="text-white/80 text-sm mt-1">{t('pages:emailAgent.subscriberSegments.subtitle', 'Audience breakdown and growth')}</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {segments.map((segment, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-muted/50" data-testid={`segment-${idx}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{segment.name}</h4>
                      <span className="text-xs text-green-500 font-medium">{segment.growth}</span>
                    </div>
                    <p className="text-2xl font-serif font-bold">{segment.count.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{t('pages:emailAgent.labels.subscribers', 'subscribers')}</p>
                  </div>
                ))}
                <Link href="/admin/email/segments">
                  <Button className="w-full gap-2" data-testid="button-manage-segments">
                    <Users className="w-4 h-4" />
                    {t('pages:emailAgent.cta.manageSegments', 'Manage Segments')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
