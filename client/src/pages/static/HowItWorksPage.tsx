import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, Search, Calendar, Users, MapPin, Heart } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

const getSteps = (t: any) => [
  {
    icon: UserPlus,
    title: t('pages:howItWorks.step1Title', 'Create Your Profile'),
    description: t('pages:howItWorks.step1Description', "Sign up in seconds and tell us about your tango journey. Share your experience level, favorite styles, and what you're looking for in the community."),
    details: [
      t('pages:howItWorks.step1Detail1', 'Free account creation'),
      t('pages:howItWorks.step1Detail2', 'Complete your dancer profile'),
      t('pages:howItWorks.step1Detail3', 'Upload photos and videos'),
      t('pages:howItWorks.step1Detail4', 'Set your dance preferences')
    ]
  },
  {
    icon: Search,
    title: t('pages:howItWorks.step2Title', 'Discover Your Community'),
    description: t('pages:howItWorks.step2Description', "Explore events, teachers, and dancers in your area. Use our smart filters to find exactly what you're looking for."),
    details: [
      t('pages:howItWorks.step2Detail1', 'Browse milongas and classes'),
      t('pages:howItWorks.step2Detail2', 'Find teachers by style and level'),
      t('pages:howItWorks.step2Detail3', 'Connect with local dancers'),
      t('pages:howItWorks.step2Detail4', 'Join groups and communities')
    ]
  },
  {
    icon: Calendar,
    title: t('pages:howItWorks.step3Title', 'Attend Events'),
    description: t('pages:howItWorks.step3Description', 'RSVP to events, get reminders, and never miss a milonga. Check in at venues and share your experiences.'),
    details: [
      t('pages:howItWorks.step3Detail1', 'One-click RSVP'),
      t('pages:howItWorks.step3Detail2', 'Calendar integration'),
      t('pages:howItWorks.step3Detail3', 'Event reminders'),
      t('pages:howItWorks.step3Detail4', 'Check-in and reviews')
    ]
  },
  {
    icon: Users,
    title: t('pages:howItWorks.step4Title', 'Connect & Grow'),
    description: t('pages:howItWorks.step4Description', 'Build your tango network, practice with partners, and learn from the community. Share your journey and celebrate milestones.'),
    details: [
      t('pages:howItWorks.step4Detail1', 'Message other dancers'),
      t('pages:howItWorks.step4Detail2', 'Find practice partners'),
      t('pages:howItWorks.step4Detail3', 'Share photos and videos'),
      t('pages:howItWorks.step4Detail4', 'Track your progress')
    ]
  }
];

export default function HowItWorksPage() {
  const { t } = useTranslation(["pages", "common"]);
  const steps = getSteps(t);
  return (
    <SelfHealingErrorBoundary pageName={t('pages:howItWorks.pageName', 'How It Works')} fallbackRoute="/">
      <PageLayout title={t('pages:howItWorks.title', 'How It Works')} showBreadcrumbs>
        <PublicLayout>
          <SEO
            title={t('pages:howItWorks.seoTitle', 'How It Works - Mundo Tango')}
            description={t('pages:howItWorks.seoDescription', 'Learn how Mundo Tango works. Discover how easy it is to find events, connect with dancers, book lessons, and immerse yourself in the global tango community.')}
          />
          
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&h=900&fit=crop')`
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
                  {t('pages:howItWorks.badge', 'How It Works')}
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  {t('pages:howItWorks.heroTitle', 'Your Tango Journey Starts Here')}
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
                  {t('pages:howItWorks.heroSubtitle', 'Four simple steps to connect with the global tango community')}
                </p>
              </motion.div>
            </div>
          </div>
        
          <div className="bg-background py-12 px-4">
            <div className="container mx-auto max-w-5xl space-y-16">

              {/* Steps */}
              <div className="space-y-12">
                {steps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                  >
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className={`order-2 ${idx % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                        <Card className="hover-elevate" data-testid={`card-step-${idx}`}>
                          <CardHeader>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                                <span className="text-2xl font-bold text-primary">{idx + 1}</span>
                              </div>
                              <step.icon className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-serif">{step.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                              {step.description}
                            </p>
                            <ul className="space-y-2">
                              {step.details.map((detail, detailIdx) => (
                                <li key={detailIdx} className="flex items-start gap-2 text-sm">
                                  <Heart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                  <span className="text-muted-foreground">{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                      <div className={`order-1 ${idx % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                        <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                          <img 
                            src={`https://images.unsplash.com/photo-${
                              idx === 0 ? '1522071820081-009f0129c71c' :
                              idx === 1 ? '1516450360452-9312f5e86fc7' :
                              idx === 2 ? '1492684223066-81342ee5ff30' :
                              '1504609813442-a8924e83f76e'
                            }?w=800&h=800&fit=crop`}
                            alt={step.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" data-testid="card-cta">
                  <CardContent className="py-16 text-center">
                    <MapPin className="h-16 w-16 text-primary mx-auto mb-6" />
                    <h3 className="text-4xl font-serif font-bold mb-4">{t('pages:howItWorks.readyToStart', 'Ready to Get Started?')}</h3>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                      {t('pages:howItWorks.ctaDescription', 'Join thousands of dancers worldwide and discover your next favorite milonga, teacher, or dance partner today.')}
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                      <Button size="lg" asChild data-testid="button-get-started">
                        <a href="/register">{t('pages:howItWorks.createAccount', 'Create Free Account')}</a>
                      </Button>
                      <Button size="lg" variant="outline" asChild data-testid="button-explore">
                        <a href="/discover">{t('pages:howItWorks.exploreWithoutSignup', 'Explore Without Signing Up')}</a>
                      </Button>
                    </div>
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
