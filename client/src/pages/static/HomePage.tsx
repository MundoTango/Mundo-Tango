import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Calendar, MapPin, MessageCircle, Sparkles, 
  Play, Heart, Globe, Video, Music, Award, 
  Check, ChevronDown, Star, Quote, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import heroImage from "@assets/optimized/IMG_9414-optimized.jpg";
import featureImage1 from "@assets/stock_images/global_world_map_con_0c38d510.jpg";
import featureImage2 from "@assets/optimized/IMG_9422-optimized.jpg";

export default function HomePage() {
  const { t } = useTranslation(['pages', 'common']);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.1 } }
  };

  const testimonials = [
    {
      name: t('pages:home.testimonials.items.testimonial1.name', 'Maria Rodriguez'),
      location: t('pages:home.testimonials.items.testimonial1.location', 'Buenos Aires, Argentina'),
      rating: 5,
      text: t('pages:home.testimonials.items.testimonial1.text', 'Mundo Tango helped me find my dance family in a new city. The community is warm, welcoming, and truly passionate about tango.'),
      image: null
    },
    {
      name: t('pages:home.testimonials.items.testimonial2.name', 'James Chen'),
      location: t('pages:home.testimonials.items.testimonial2.location', 'San Francisco, USA'),
      rating: 5,
      text: t('pages:home.testimonials.items.testimonial2.text', "I've discovered amazing milongas and workshops through this platform. It's become essential to my tango journey."),
      image: null
    },
    {
      name: t('pages:home.testimonials.items.testimonial3.name', 'Elena Volkov'),
      location: t('pages:home.testimonials.items.testimonial3.location', 'Moscow, Russia'),
      rating: 5,
      text: t('pages:home.testimonials.items.testimonial3.text', 'The teachers directory helped me find incredible instructors. My dancing has improved tremendously!'),
      image: null
    }
  ];

  const faqs = [
    {
      question: t('pages:home.faq.items.q1.question', 'What is Mundo Tango?'),
      answer: t('pages:home.faq.items.q1.answer', 'Mundo Tango is a global platform connecting tango dancers, teachers, and organizers. We help you discover events, find dance partners, learn from top instructors, and immerse yourself in the vibrant tango community worldwide.')
    },
    {
      question: t('pages:home.faq.items.q2.question', 'Is Mundo Tango free to use?'),
      answer: t('pages:home.faq.items.q2.answer', 'Yes! We offer a free tier that includes basic profile creation, event discovery, and messaging. Premium features like unlimited messaging, AI dance partner matching, and priority event notifications are available with our Pro subscription.')
    },
    {
      question: t('pages:home.faq.items.q3.question', 'How do I find tango events near me?'),
      answer: t('pages:home.faq.items.q3.answer', 'Simply use our Events Calendar or Search features to filter by city, date, and event type. You can discover milongas, festivals, workshops, and practice sessions happening in your area or anywhere in the world.')
    },
    {
      question: t('pages:home.faq.items.q4.question', 'Can I connect with other dancers?'),
      answer: t('pages:home.faq.items.q4.answer', 'Absolutely! Follow dancers, join groups, send friend requests, and chat with the community. Our platform is designed to foster authentic connections within the tango world.')
    },
    {
      question: t('pages:home.faq.items.q5.question', 'How do I find tango teachers?'),
      answer: t('pages:home.faq.items.q5.answer', 'Visit our Teachers Directory to browse verified instructors worldwide. Filter by location, specialty, and experience level. Read reviews from other students and book private lessons directly through the platform.')
    },
    {
      question: t('pages:home.faq.items.q6.question', 'What makes Mundo Tango different?'),
      answer: t('pages:home.faq.items.q6.answer', "We're built by tango dancers, for tango dancers. Our focus is on authentic community building, quality event curation, and connecting you with the global tango family - not just another social network.")
    }
  ];

  const howItWorksSteps = [
    { 
      num: "1", 
      icon: Users, 
      title: t('pages:home.howItWorks.step1.title', 'Create Your Profile'), 
      desc: t('pages:home.howItWorks.step1.description', 'Join for free and tell us about your tango journey, experience level, and dance preferences')
    },
    { 
      num: "2", 
      icon: MapPin, 
      title: t('pages:home.howItWorks.step2.title', 'Discover & Connect'), 
      desc: t('pages:home.howItWorks.step2.description', 'Find events, teachers, and venues near you. Connect with dancers who share your passion')
    },
    { 
      num: "3", 
      icon: Heart, 
      title: t('pages:home.howItWorks.step3.title', 'Dance & Grow'), 
      desc: t('pages:home.howItWorks.step3.description', 'Attend events, take lessons, make friends, and become part of the global tango community')
    }
  ];

  const featureCards = [
    { 
      icon: Video, 
      title: t('pages:home.features.cards.liveStreaming.title', 'Live Streaming'), 
      desc: t('pages:home.features.cards.liveStreaming.description', 'Watch milongas worldwide in real-time')
    },
    { 
      icon: Music, 
      title: t('pages:home.features.cards.musicLibrary.title', 'Music Library'), 
      desc: t('pages:home.features.cards.musicLibrary.description', 'Curated tango playlists and guides')
    },
    { 
      icon: Award, 
      title: t('pages:home.features.cards.verifiedTeachers.title', 'Verified Teachers'), 
      desc: t('pages:home.features.cards.verifiedTeachers.description', 'Learn from certified instructors')
    },
    { 
      icon: Globe, 
      title: t('pages:home.features.cards.travelPlanner.title', 'Travel Planner'), 
      desc: t('pages:home.features.cards.travelPlanner.description', 'Plan trips and find hosts globally')
    }
  ];

  const communityFeatures = [
    t('pages:home.features.community.items.follow', 'Follow dancers and build your network'),
    t('pages:home.features.community.items.groups', 'Join groups based on interests and location'),
    t('pages:home.features.community.items.messaging', 'Real-time messaging and chat features'),
    t('pages:home.features.community.items.discover', 'Discover dancers visiting your city')
  ];

  const eventFeatures = [
    t('pages:home.features.events.items.calendar', 'Comprehensive event calendar'),
    t('pages:home.features.events.items.rsvp', 'RSVP and ticket booking'),
    t('pages:home.features.events.items.notifications', 'Event notifications and reminders'),
    t('pages:home.features.events.items.map', 'Interactive map of venues')
  ];

  return (
    <SelfHealingErrorBoundary pageName={t('pages:home.pageName', 'Home')} fallbackRoute="/">
      <PageLayout title={t('pages:home.pageLayoutTitle', 'Where Tango Meets Community')} showBreadcrumbs>
<PublicLayout>
      <SEO
        title={t('pages:home.seo.title', 'Mundo Tango - Connect with the Global Tango Community')}
        description={t('pages:home.seo.description', 'Join thousands of tango dancers worldwide. Discover events, find teachers, connect with dancers, and immerse yourself in the passionate world of Argentine tango.')}
      />
      <div className="min-h-screen">
      {/* Editorial Hero Section - 16:9 with Dramatic Tango Photography */}
      <section className="relative h-[70vh] w-full overflow-hidden" data-testid="section-hero">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${heroImage})`}}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
              {t('pages:home.hero.badge', 'Welcome to the Global Tango Community')}
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight leading-tight" data-testid="heading-hero">
              {t('pages:home.hero.heading', 'Where Tango Meets Community')}
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
              {t('pages:home.hero.paragraph', 'Share memories, find events, and help us build the future of tango tech. Join thousands of passionate dancers connecting worldwide.')}
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Link href="/register">
                <Button size="lg" className="gap-2 bg-white/20 border-white/30 backdrop-blur-sm hover-elevate" data-testid="button-get-started">
                  <Sparkles className="h-5 w-5" />
                  {t('pages:home.hero.getStarted', 'Get Started Free')}
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/volunteer">
                <Button size="lg" variant="outline" className="gap-2 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="button-volunteer">
                  <Heart className="h-5 w-5" />
                  {t('pages:home.hero.volunteer', 'Volunteer to Help Build MT')}
                </Button>
              </Link>
            </div>

          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeInUp} className="mb-16 text-center">
            <h2 className="mb-6 text-3xl md:text-4xl lg:text-5xl font-serif font-bold">
              {t('pages:home.howItWorks.heading', 'How It Works')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('pages:home.howItWorks.description', 'Start your tango journey in three simple steps')}
            </p>
          </motion.div>

          <motion.div 
            {...staggerContainer}
            className="grid gap-12 md:grid-cols-3"
          >
            {howItWorksSteps.map((step, idx) => (
              <motion.div key={idx} {...fadeInUp} className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary backdrop-blur-md border border-primary/20 text-4xl font-serif font-bold">
                  {step.num}
                </div>
                <step.icon className="mx-auto mb-6 h-14 w-14 text-primary" />
                <h3 className="mb-4 text-2xl md:text-3xl font-serif font-bold">{step.title}</h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-24 px-6" data-testid="section-features">
        <div className="container mx-auto max-w-7xl">
          <motion.div {...fadeInUp} className="mb-20 text-center">
            <h2 className="mb-6 text-3xl md:text-4xl lg:text-5xl font-serif font-bold">
              {t('pages:home.features.heading', 'Everything You Need')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('pages:home.features.description', 'Connect, discover, and grow your tango journey with powerful features')}
            </p>
          </motion.div>
          
          {/* Feature Grid with 16:9 Images */}
          <motion.div 
            {...staggerContainer}
            className="space-y-24"
          >
            {/* Feature 1 - Global Community */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="relative aspect-[16/9] overflow-hidden rounded-2xl"
              >
                <motion.img
                  src={featureImage1}
                  alt="Global community"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Badge className="mb-4">{t('pages:home.features.community.badge', 'Community')}</Badge>
                <h3 className="text-3xl md:text-4xl font-serif font-bold mb-6">
                  {t('pages:home.features.community.heading', 'Connect with Dancers Worldwide')}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  {t('pages:home.features.community.description', 'Join a vibrant global community of tango enthusiasts. Connect with dancers, teachers, and organizers from Buenos Aires to Tokyo.')}
                </p>
                <ul className="space-y-3">
                  {communityFeatures.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-1" />
                      <span className="text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Feature 2 - Events & Discovery */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="order-2 md:order-1"
              >
                <Badge className="mb-4">{t('pages:home.features.events.badge', 'Events')}</Badge>
                <h3 className="text-3xl md:text-4xl font-serif font-bold mb-6">
                  {t('pages:home.features.events.heading', 'Discover Events Everywhere')}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  {t('pages:home.features.events.description', 'Never miss a milonga, festival, or workshop. Our platform connects you to thousands of tango events happening globally.')}
                </p>
                <ul className="space-y-3">
                  {eventFeatures.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-1" />
                      <span className="text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="relative aspect-[16/9] overflow-hidden rounded-2xl order-1 md:order-2"
              >
                <motion.img
                  src={featureImage2}
                  alt="Tango events"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </motion.div>
            </div>

            {/* Additional Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 pt-12">
              {featureCards.map((feature, idx) => (
                <motion.div key={idx} {...fadeInUp} transition={{ delay: idx * 0.1 }}>
                  <Card className="h-full hover-elevate">
                    <CardContent className="pt-6 text-center">
                      <feature.icon className="mb-4 h-12 w-12 text-primary mx-auto" />
                      <h4 className="mb-2 text-xl font-serif font-bold">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeInUp} className="mb-20 text-center">
            <h2 className="mb-6 text-3xl md:text-4xl lg:text-5xl font-serif font-bold">
              {t('pages:home.testimonials.heading', 'What Dancers Say')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('pages:home.testimonials.description', 'Join thousands of satisfied dancers worldwide')}
            </p>
          </motion.div>

          <motion.div 
            {...staggerContainer}
            className="grid gap-8 md:grid-cols-3"
          >
            {testimonials.map((testimonial, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, duration: 0.6 }}
              >
                <Card className="hover-elevate backdrop-blur-lg bg-card/60 h-full border-primary/10" data-testid={`card-testimonial-${idx}`}>
                  <CardContent className="pt-8 pb-6">
                    <Quote className="mb-6 h-10 w-10 text-primary/30" />
                    <div className="mb-4 flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="mb-8 text-base md:text-lg leading-relaxed italic">"{testimonial.text}"</p>
                    <div className="flex items-center gap-4 pt-6 border-t border-primary/10">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-3xl">
                        {testimonial.image}
                      </div>
                      <div>
                        <div className="font-serif font-bold text-lg">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div {...fadeInUp} className="mb-16 text-center">
            <h2 className="mb-6 text-3xl md:text-4xl lg:text-5xl font-serif font-bold">
              {t('pages:home.faq.heading', 'Frequently Asked Questions')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {t('pages:home.faq.description', 'Everything you need to know about Mundo Tango')}
            </p>
          </motion.div>

          <motion.div {...staggerContainer} className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <Card className="overflow-hidden hover-elevate" data-testid={`faq-${idx}`}>
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left p-6 flex items-center justify-between active-elevate-2"
                  >
                    <h3 className="text-lg md:text-xl font-serif font-bold pr-4">{faq.question}</h3>
                    <ChevronDown 
                      className={`h-6 w-6 text-primary transition-transform shrink-0 ${
                        openFaq === idx ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-6 border-t">
                      <p className="pt-6 text-base md:text-lg text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary/10 via-accent/10 to-background">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container mx-auto max-w-4xl text-center"
        >
          <div className="backdrop-blur-md bg-card/80 p-12 md:p-16 border border-primary/20 rounded-2xl">
            <h2 className="mb-6 text-3xl md:text-4xl lg:text-5xl font-serif font-bold">
              {t('pages:home.cta.heading', 'Ready to Join the Community?')}
            </h2>
            <p className="mb-10 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('pages:home.cta.description', 'Create your free account today and start connecting with passionate tango dancers worldwide. No credit card required.')}
            </p>
            <Link href="/register">
              <Button size="lg" className="gap-2 mb-8 text-lg px-8 py-6" data-testid="button-cta-final">
                <Sparkles className="h-6 w-6" />
                {t('pages:home.cta.button', 'Join Mundo Tango Free')}
                <ChevronRight className="h-6 w-6" />
              </Button>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-8 text-base text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>{t('pages:home.cta.freeForever', 'Free forever')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>{t('pages:home.cta.noCreditCard', 'No credit card')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>{t('pages:home.cta.cancelAnytime', 'Cancel anytime')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
    </PublicLayout>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
