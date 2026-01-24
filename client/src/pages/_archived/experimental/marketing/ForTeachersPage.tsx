import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GraduationCap, Users, Calendar, Star, Video, Globe,
  DollarSign, BarChart3, MessageCircle, ArrowRight, Check, Sparkles
} from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";
import { PublicNavbar } from "@/components/PublicNavbar";
import { Link } from "wouter";

export default function ForTeachersPage() {
  const { t } = useTranslation(['pages', 'common']);
  const heroRef = useRef(null);
  
  const features = [
    {
      icon: Users,
      title: t('pages:teachers.features.studentManagement.title', 'Student Management'),
      description: t('pages:teachers.features.studentManagement.description', 'Track student progress, manage class rosters, and build lasting relationships with your dancers.')
    },
    {
      icon: Calendar,
      title: t('pages:teachers.features.classScheduling.title', 'Class Scheduling'),
      description: t('pages:teachers.features.classScheduling.description', 'Easy booking system for classes, privates, and workshops. Students book directly on your profile.')
    },
    {
      icon: Video,
      title: t('pages:teachers.features.videoLibrary.title', 'Video Library'),
      description: t('pages:teachers.features.videoLibrary.description', 'Upload and share instructional videos with your students. Build your teaching archive.')
    },
    {
      icon: DollarSign,
      title: t('pages:teachers.features.paymentProcessing.title', 'Payment Processing'),
      description: t('pages:teachers.features.paymentProcessing.description', 'Accept payments for classes, packages, and workshops. Integrated billing keeps it simple.')
    },
    {
      icon: BarChart3,
      title: t('pages:teachers.features.analyticsDashboard.title', 'Analytics Dashboard'),
      description: t('pages:teachers.features.analyticsDashboard.description', 'Track your growth, student retention, and revenue. Make data-driven decisions for your school.')
    },
    {
      icon: Globe,
      title: t('pages:teachers.features.globalVisibility.title', 'Global Visibility'),
      description: t('pages:teachers.features.globalVisibility.description', 'Get discovered by dancers worldwide. Your teaching profile reaches the global tango community.')
    }
  ];

  const benefits = [
    t('pages:teachers.benefits.freeTrial', 'Full access to Pro features'),
    t('pages:teachers.benefits.cancelAnytime', 'Cancel anytime'),
    t('pages:teachers.benefits.unlimitedListings', 'Unlimited class listings'),
    t('pages:teachers.benefits.studentTools', 'Student management tools'),
    t('pages:teachers.benefits.calendarSync', 'Integrated calendar sync'),
    t('pages:teachers.benefits.prioritySupport', 'Priority support')
  ];
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <SelfHealingErrorBoundary pageName={t('pages:teachers.pageName', 'For Teachers')} fallbackRoute="/">
      <SEO 
        title={t('pages:teachers.seo.title', 'For Teachers - Mundo Tango')}
        description={t('pages:teachers.seo.description', 'Grow your tango teaching business. Manage students, schedule classes, and reach dancers worldwide with Mundo Tango.')}
      />
      
      <div className="min-h-screen bg-background overflow-x-hidden">
        <PublicNavbar />
        <motion.section
          ref={heroRef}
          style={{ opacity: heroOpacity }}
          className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-accent/20 via-primary/10 to-background"
          data-testid="section-hero-teachers"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />

          <div className="relative z-10 text-center px-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <Badge 
                variant="outline" 
                className="mb-6 border-accent/30 bg-accent/10"
                data-testid="badge-teachers"
              >
                {t('pages:teachers.badge', 'FOR TEACHERS')}
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 tracking-tight leading-tight">
                {t('pages:teachers.hero.heading', 'Teach Tango')}{" "}
                <br />
                <span className="text-accent">{t('pages:teachers.hero.headingHighlight', 'Your Way')}</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              {t('pages:teachers.hero.paragraph', 'Build your teaching business with powerful tools for scheduling, payments, and student management. Reach dancers worldwide.')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link href="/register?redirect=/talent-match&role=teacher">
                <Button size="lg" className="text-lg px-8" data-testid="button-join-teachers">
                  {t('pages:teachers.hero.button', 'Start Teaching')}
                  <GraduationCap className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        <section className="py-20 px-8" data-testid="section-features-teachers">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                {t('pages:teachers.featuresSection.heading', 'Tools Built for Teachers')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('pages:teachers.featuresSection.paragraph', 'Everything you need to grow your tango teaching business.')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full hover-elevate" data-testid={`card-feature-teacher-${idx}`}>
                    <CardHeader>
                      <feature.icon className="h-10 w-10 text-accent mb-4" />
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-8" data-testid="section-cta-teachers">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                {t('pages:teachers.cta.heading', 'Ready to Grow?')}
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                {t('pages:teachers.cta.paragraph', 'Join hundreds of teachers who have built thriving tango businesses.')}
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                {benefits.map((benefit, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm">
                    <Check className="h-3 w-3 mr-1" />
                    {benefit}
                  </Badge>
                ))}
              </div>
              <Link href="/register?redirect=/talent-match&role=teacher">
                <Button size="lg" className="text-lg px-12" data-testid="button-cta-teachers">
                  {t('pages:teachers.cta.button', 'Join Now')}
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </SelfHealingErrorBoundary>
  );
}
