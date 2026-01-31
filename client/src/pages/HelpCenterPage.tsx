import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Book, 
  Video, 
  HelpCircle, 
  Users, 
  Calendar, 
  MapPin,
  Mail,
  FileText,
  Play,
  ExternalLink,
  Search,
  ChevronRight,
  MessageCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import heroImage from "@assets/stock_images/business_team_meetin_061b6626.jpg";
import { SEO } from "@/components/SEO";

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  icon: any;
  link: string;
  category: string;
}

const getHelpTopics = (t: any): HelpTopic[] => [
  {
    id: "1",
    title: t('pages:helpCenter.gettingStartedGuide', 'Getting Started Guide'),
    description: t('pages:helpCenter.gettingStartedDesc', 'Learn the basics of Mundo Tango in 5 minutes'),
    icon: Book,
    link: "/help/getting-started",
    category: t('pages:helpCenter.beginner', 'Beginner')
  },
  {
    id: "2",
    title: t('pages:helpCenter.findingEvents', 'Finding Events'),
    description: t('pages:helpCenter.findingEventsDesc', 'How to discover and RSVP to tango events near you'),
    icon: Calendar,
    link: "/help/events",
    category: t('pages:helpCenter.features', 'Features')
  },
  {
    id: "3",
    title: t('pages:helpCenter.connectingWithDancers', 'Connecting with Dancers'),
    description: t('pages:helpCenter.connectingWithDancersDesc', 'Send friend requests, join groups, and build your network'),
    icon: Users,
    link: "/help/community",
    category: t('pages:helpCenter.features', 'Features')
  },
  {
    id: "4",
    title: t('pages:helpCenter.findingTeachersVenues', 'Finding Teachers & Venues'),
    description: t('pages:helpCenter.findingTeachersVenuesDesc', 'Browse instructors and milongas in your area'),
    icon: MapPin,
    link: "/help/teachers-venues",
    category: t('pages:helpCenter.features', 'Features')
  },
  {
    id: "5",
    title: t('pages:helpCenter.videoTutorials', 'Video Tutorials'),
    description: t('pages:helpCenter.videoTutorialsDesc', 'Watch step-by-step guides for all platform features'),
    icon: Video,
    link: "/tutorials",
    category: t('pages:helpCenter.video', 'Video')
  },
  {
    id: "6",
    title: t('pages:helpCenter.accountSettings', 'Account Settings'),
    description: t('pages:helpCenter.accountSettingsDesc', 'Manage your profile, privacy, and notification preferences'),
    icon: FileText,
    link: "/help/account",
    category: t('pages:helpCenter.account', 'Account')
  },
  {
    id: "7",
    title: t('pages:helpCenter.subscriptionsBilling', 'Subscriptions & Billing'),
    description: t('pages:helpCenter.subscriptionsBillingDesc', 'Learn about premium features and payment options'),
    icon: FileText,
    link: "/help/subscriptions",
    category: t('pages:helpCenter.account', 'Account')
  },
  {
    id: "8",
    title: t('pages:helpCenter.hostingYourHome', 'Hosting Your Home'),
    description: t('pages:helpCenter.hostingYourHomeDesc', 'List your home for traveling tango dancers'),
    icon: MapPin,
    link: "/help/hosting",
    category: t('pages:helpCenter.advanced', 'Advanced')
  },
  {
    id: "9",
    title: t('pages:helpCenter.marketplace', 'Marketplace'),
    description: t('pages:helpCenter.marketplaceDesc', 'Buy and sell tango shoes, clothing, and merchandise'),
    icon: FileText,
    link: "/help/marketplace",
    category: t('pages:helpCenter.advanced', 'Advanced')
  },
  {
    id: "10",
    title: t('pages:helpCenter.safetyReporting', 'Safety & Reporting'),
    description: t('pages:helpCenter.safetyReportingDesc', 'How to report inappropriate content or users'),
    icon: HelpCircle,
    link: "/help/safety",
    category: t('pages:helpCenter.safety', 'Safety')
  }
];

const getVideoTutorials = (t: any) => [
  {
    id: "v1",
    title: t('pages:helpCenter.platformOverview', 'Platform Overview (3:24)'),
    thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=225",
    duration: "3:24"
  },
  {
    id: "v2",
    title: t('pages:helpCenter.creatingYourProfile', 'Creating Your Profile (2:15)'),
    thumbnail: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=225",
    duration: "2:15"
  },
  {
    id: "v3",
    title: t('pages:helpCenter.findingEventsNearYou', 'Finding Events Near You (4:10)'),
    thumbnail: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=225",
    duration: "4:10"
  },
  {
    id: "v4",
    title: t('pages:helpCenter.joiningGroups', 'Joining Groups (1:45)'),
    thumbnail: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=225",
    duration: "1:45"
  }
];

export default function HelpCenterPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const helpTopics = getHelpTopics(t);
  const videoTutorials = getVideoTutorials(t);
  const categories = [
    t('pages:helpCenter.categoryAll', 'All'),
    t('pages:helpCenter.beginner', 'Beginner'),
    t('pages:helpCenter.features', 'Features'),
    t('pages:helpCenter.account', 'Account'),
    t('pages:helpCenter.advanced', 'Advanced'),
    t('pages:helpCenter.safety', 'Safety'),
    t('pages:helpCenter.video', 'Video')
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  const filteredTopics = selectedCategory === t('pages:helpCenter.categoryAll', 'All')
    ? helpTopics 
    : helpTopics.filter(topic => topic.category === selectedCategory);

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Editorial Hero Section - 16:9 */}
        <section className="relative h-[60vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${heroImage})`}}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-help">
                {t('pages:helpCenter.supportCenter', 'Support Center')}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 tracking-tight" data-testid="text-help-center-title">
                {t('pages:helpCenter.heroTitle', 'How Can We Help?')}
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
                {t('pages:helpCenter.heroDescription', 'Everything you need to know about Mundo Tango - from getting started to advanced features')}
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl w-full mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('pages:helpCenter.searchPlaceholder', 'Search help articles...')}
                  className="w-full pl-12 pr-4 py-4 rounded-lg bg-white/95 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="input-search"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto max-w-7xl px-6 py-16">
          {/* Quick Links */}
          <motion.div {...fadeInUp} className="mb-20">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold mb-12 text-center">{t('pages:helpCenter.popularTopics', 'Popular Topics')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover-elevate cursor-pointer group" data-testid="card-browse-articles">
                <CardContent className="p-8 text-center">
                  <div className="mb-4 flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mx-auto group-hover:bg-primary/20 transition-colors">
                    <Book className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-serif font-bold text-xl mb-3">{t('pages:helpCenter.browseArticles', 'Browse Articles')}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {t('pages:helpCenter.browseArticlesDescription', 'Read detailed guides and tutorials')}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate cursor-pointer group" data-testid="card-video-tutorials">
                <CardContent className="p-8 text-center">
                  <div className="mb-4 flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mx-auto group-hover:bg-primary/20 transition-colors">
                    <Video className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-serif font-bold text-xl mb-3">{t('pages:helpCenter.videoTutorials', 'Video Tutorials')}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {t('pages:helpCenter.videoTutorialsDescription', 'Watch step-by-step video guides')}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate cursor-pointer group" data-testid="card-contact-support">
                <CardContent className="p-8 text-center">
                  <div className="mb-4 flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mx-auto group-hover:bg-primary/20 transition-colors">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-serif font-bold text-xl mb-3">{t('pages:helpCenter.contactSupport', 'Contact Support')}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {t('pages:helpCenter.contactSupportDescription', 'Get help from our team')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Categories Filter */}
          <motion.div {...fadeInUp} className="mb-12">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm hover-elevate"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Help Topics Grid */}
          <motion.div className="mb-20">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold mb-12 text-center">
              {selectedCategory === "All" ? t('pages:helpCenter.allHelpTopics', 'All Help Topics') : `${selectedCategory} ${t('pages:helpCenter.topics', 'Topics')}`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTopics.map((topic, index) => {
                const Icon = topic.icon;
                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Card className="hover-elevate cursor-pointer h-full group" data-testid={`help-topic-${topic.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h4 className="font-serif font-bold text-lg">{topic.title}</h4>
                              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                              {topic.description}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {topic.category}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Video Tutorials */}
          <motion.div {...fadeInUp} className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold mb-4">{t('pages:helpCenter.videoTutorialsTitle', 'Video Tutorials')}</h2>
              <p className="text-lg text-muted-foreground">{t('pages:helpCenter.watchGuides', 'Watch step-by-step guides')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {videoTutorials.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group cursor-pointer"
                  data-testid={`video-tutorial-${video.id}`}
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white rounded-full p-4">
                        <Play className="h-8 w-8 text-primary fill-primary" />
                      </div>
                    </div>
                    <Badge className="absolute bottom-3 right-3 bg-black/80 text-white border-none">
                      {video.duration}
                    </Badge>
                  </div>
                  <h4 className="font-serif font-bold text-base">{video.title}</h4>
                </motion.div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button variant="outline" size="lg" asChild>
                <a href="/tutorials" className="gap-2">
                  {t('pages:helpCenter.viewAllTutorials', 'View All Tutorials')}
                  <ChevronRight className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Still need help? CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-12 text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mx-auto mb-6">
                  <MessageCircle className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold mb-4">{t('pages:helpCenter.stillNeedHelp', 'Still Need Help?')}</h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  {t('pages:helpCenter.supportMessage', "Our support team is here to help. Send us a message and we'll get back to you within 24 hours.")}
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button size="lg" asChild data-testid="button-contact-support">
                    <a href="/contact" className="gap-2">
                      <Mail className="h-5 w-5" />
                      {t('pages:helpCenter.contactSupportButton', 'Contact Support')}
                      <ChevronRight className="h-5 w-5" />
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="/faq" className="gap-2">
                      <HelpCircle className="h-5 w-5" />
                      {t('pages:helpCenter.viewFaq', 'View FAQ')}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
