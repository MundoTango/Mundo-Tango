import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Globe, Heart, Target, User } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import scottPhoto2 from "@assets/optimized/Skoot_16-optimized.jpg";
import scottNewAbout from "@assets/founder/scott_new_about.jpg";
import tangoHeroImage from "@assets/stock_images/argentine_tango_danc_cc9bdfab.jpg";

export default function AboutPage() {
  const { t } = useTranslation(['pages', 'common']);
  return (
    <SelfHealingErrorBoundary pageName="About" fallbackRoute="/">
      <PageLayout title="About Mundo Tango" showBreadcrumbs>
        <PublicLayout>
      <SEO
        title="About Us - Mundo Tango"
        description="Learn about Mundo Tango's mission to connect the global tango community. Discover our values, vision, and commitment to fostering authentic connections through Argentine tango."
      />
      
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url(${tangoHeroImage})`
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
              {t('pages:about.badge', 'About Us')}
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
              {t('pages:about.title', 'About Mundo Tango')}
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
              {t('pages:about.subtitle', 'Connecting the global tango community, one dance at a time')}
            </p>
          </motion.div>
        </div>
      </div>
    
    <div className="bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl space-y-8">

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Card className="hover-elevate" data-testid="card-mission">
            <CardHeader>
              <CardTitle className="text-2xl font-serif flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                {t('pages:about.missionTitle', 'Our Mission')}
              </CardTitle>
            </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('pages:about.missionDescription', 'Mundo Tango is dedicated to fostering connections within the global tango community. We believe in the power of dance to bring people together across cultures, languages, and borders. Our platform helps dancers discover events, connect with teachers, find practice partners, and immerse themselves in the rich traditions of Argentine tango.')}
            </p>
          </CardContent>
        </Card>
        </motion.div>

        {/* Values */}
        <div className="space-y-6">
          <h2 className="text-4xl md:text-5xl font-serif font-bold" data-testid="text-values-heading">{t('pages:about.valuesTitle', 'Our Values')}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="hover-elevate" data-testid="card-value-community">
                <CardContent className="p-8 space-y-3">
                  <Users className="h-10 w-10 text-primary" />
                  <h3 className="text-2xl font-serif font-bold">{t('pages:about.valueCommunityTitle', 'Community First')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('pages:about.valueCommunityDescription', 'We prioritize authentic connections and meaningful interactions within our community of dancers, teachers, and organizers.')}
                </p>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="hover-elevate" data-testid="card-value-global">
                <CardContent className="p-8 space-y-3">
                  <Globe className="h-10 w-10 text-primary" />
                  <h3 className="text-2xl font-serif font-bold">{t('pages:about.valueGlobalTitle', 'Global Reach')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('pages:about.valueGlobalDescription', 'From Buenos Aires to Tokyo, we connect tango communities across the globe, celebrating diversity and cultural exchange.')}
                </p>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="hover-elevate" data-testid="card-value-passion">
                <CardContent className="p-8 space-y-3">
                  <Heart className="h-10 w-10 text-primary" />
                  <h3 className="text-2xl font-serif font-bold">{t('pages:about.valuePassionTitle', 'Passion for Tango')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('pages:about.valuePassionDescription', "Our love for tango drives everything we do. We're dancers ourselves, building tools that we wish existed when we started our journey.")}
                </p>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="hover-elevate" data-testid="card-value-growth">
                <CardContent className="p-8 space-y-3">
                  <Target className="h-10 w-10 text-primary" />
                  <h3 className="text-2xl font-serif font-bold">{t('pages:about.valueGrowthTitle', 'Continuous Growth')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('pages:about.valueGrowthDescription', 'We believe in supporting dancers at every level, from complete beginners to professional performers, fostering lifelong learning.')}
                </p>
              </CardContent>
            </Card>
            </motion.div>
          </div>
        </div>

        {/* Founder Section - Scott */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="hover-elevate" data-testid="card-founder">
            <CardHeader>
              <CardTitle className="text-3xl font-serif flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                {t('pages:about.founderTitle', 'Meet the Founder')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="flex flex-col gap-4">
                    <img 
                      src={scottNewAbout} 
                      alt="Scott, Founder of Mundo Tango" 
                      className="w-48 h-64 md:w-64 md:h-80 rounded-lg object-cover shadow-lg"
                      data-testid="img-founder-1"
                    />
                    <img 
                      src={scottPhoto2} 
                      alt="Scott dancing tango" 
                      className="w-48 h-48 md:w-64 md:h-64 rounded-lg object-cover shadow-lg"
                      data-testid="img-founder-2"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Photos: <a href="https://www.facebook.com/aparotidis" target="_blank" rel="noopener noreferrer" className="hover:underline">Alexandros Parotidis</a>
                  </p>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    My name is Scott, and I've been dancing tango since 2007. I've traveled to over 100 cities for tango.
                  </p>
                  <p>
                    Over the years, I haven't just been a dancer — I've lived nearly every role in the tango ecosystem. I've organized events, taught classes, DJed milongas, helped build communities, and danced both leading and following. I've done this not from one city, but as a nomad, moving through tango communities across the world and experiencing firsthand how deeply local — and yet globally connected — tango really is.
                  </p>
                  <p>
                    That global perspective revealed a consistent problem: <strong className="text-foreground">tango lives everywhere, but its infrastructure lives nowhere.</strong>
                  </p>
                  <p>
                    Events are scattered across platforms. Community knowledge is passed by word of mouth. Memories disappear into private phones. Organizers and teachers rely on tools that were never designed for the way tango actually works.
                  </p>
                  <p>
                    At the same time, my professional background is in technology and systems design. I've spent years working in IT, identity and access management, security, and large-scale platform operations — designing systems that have to be reliable, ethical, and scalable. I understand how to build infrastructure that people can trust, and how small design decisions can shape entire communities.
                  </p>
                  <p>
                    <strong className="text-foreground">Mundo Tango exists at the intersection of those two worlds.</strong>
                  </p>
                  <p>
                    It's built by someone who understands tango from the inside — its roles, its rhythms, its relationships — and who also knows how to design modern, secure, human-centered technology. The goal isn't to replace the magic of tango, but to support it: helping people find events, travel with confidence, preserve shared memories, and strengthen the global community without losing its soul.
                  </p>
                  <p className="font-medium text-foreground">
                    This is not a side project. It's the platform I wish had existed for the last 15 years of my tango life.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="hover-elevate" data-testid="card-story">
            <CardHeader>
              <CardTitle className="text-3xl font-serif">Our Story</CardTitle>
            </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Mundo Tango was born from a simple observation: despite tango's global
              popularity, dancers struggled to find events, connect with partners, and
              navigate the community when traveling to new cities.
            </p>
            <p>
              What started as a small event directory has grown into a comprehensive
              platform serving dancers worldwide. Today, Mundo Tango helps discover
              events, connects dancers across the globe, and supports a growing
              community of passionate tango enthusiasts.
            </p>
            <p>
              We're proud to be dancer-owned and operated, with deep roots in the tango
              community. Every feature we build is informed by real experiences on the
              dance floor and feedback from dancers like you.
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
