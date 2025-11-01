import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, Calendar, MapPin, MessageCircle, Sparkles, 
  Play, Heart, Globe, Video, Music, Award, 
  Check, ChevronDown, Star, Quote
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";

export default function HomePage() {
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
      name: "Maria Rodriguez",
      location: "Buenos Aires, Argentina",
      rating: 5,
      text: "Mundo Tango helped me find my dance family in a new city. The community is warm, welcoming, and truly passionate about tango.",
      image: "👤"
    },
    {
      name: "James Chen",
      location: "San Francisco, USA",
      rating: 5,
      text: "I've discovered amazing milongas and workshops through this platform. It's become essential to my tango journey.",
      image: "👤"
    },
    {
      name: "Elena Volkov",
      location: "Moscow, Russia",
      rating: 5,
      text: "The teachers directory helped me find incredible instructors. My dancing has improved tremendously!",
      image: "👤"
    }
  ];

  const faqs = [
    {
      question: "What is Mundo Tango?",
      answer: "Mundo Tango is a global platform connecting tango dancers, teachers, and organizers. We help you discover events, find dance partners, learn from top instructors, and immerse yourself in the vibrant tango community worldwide."
    },
    {
      question: "Is Mundo Tango free to use?",
      answer: "Yes! We offer a free tier that includes basic profile creation, event discovery, and messaging. Premium features like unlimited messaging, AI dance partner matching, and priority event notifications are available with our Pro subscription."
    },
    {
      question: "How do I find tango events near me?",
      answer: "Simply use our Events Calendar or Search features to filter by city, date, and event type. You can discover milongas, festivals, workshops, and practice sessions happening in your area or anywhere in the world."
    },
    {
      question: "Can I connect with other dancers?",
      answer: "Absolutely! Follow dancers, join groups, send friend requests, and chat with the community. Our platform is designed to foster authentic connections within the tango world."
    },
    {
      question: "How do I find tango teachers?",
      answer: "Visit our Teachers Directory to browse verified instructors worldwide. Filter by location, specialty, and experience level. Read reviews from other students and book private lessons directly through the platform."
    },
    {
      question: "What makes Mundo Tango different?",
      answer: "We're built by tango dancers, for tango dancers. Our focus is on authentic community building, quality event curation, and connecting you with the global tango family - not just another social network."
    }
  ];

  return (
    <PageLayout title="Where Tango Meets Community" showBreadcrumbs>
<PublicLayout>
      <SEO
        title="Mundo Tango - Connect with the Global Tango Community"
        description="Join thousands of tango dancers worldwide. Discover events, find teachers, connect with dancers, and immerse yourself in the passionate world of Argentine tango."
      />
      <div className="min-h-screen">
      {/* Hero Section with Video Background */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
        {/* Video Background Placeholder */}
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-primary/20 via-accent/10 to-background" />
        <div className="absolute inset-0 -z-10 bg-ocean-gradient opacity-10 blur-3xl" />
        
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="backdrop-blur-md bg-background/60 rounded-3xl p-8 md:p-12 border border-primary/20"
          >
            <div className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Welcome to the Global Tango Community
            </div>
            
            
            
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Share memories, find events, and help us build the future of tango tech.
              Join thousands of passionate dancers connecting worldwide.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Link href="/register">
                <Button size="lg" className="gap-2" data-testid="button-get-started">
                  <Sparkles className="h-5 w-5" />
                  Get Started Free
                </Button>
              </Link>
              <Link href="/volunteer">
                <Button size="lg" variant="outline" className="gap-2" data-testid="button-volunteer">
                  <Heart className="h-5 w-5" />
                  Volunteer to Help Build MT
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-primary/20">
              <div>
                <div className="text-3xl font-bold text-primary">10,000+</div>
                <div className="text-sm text-muted-foreground">Active Dancers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Cities</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">2,000+</div>
                <div className="text-sm text-muted-foreground">Monthly Events</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">1,200+</div>
                <div className="text-sm text-muted-foreground">Teachers</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeInUp} className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start your tango journey in three simple steps
            </p>
          </motion.div>

          <motion.div 
            {...staggerContainer}
            className="grid gap-12 md:grid-cols-3"
          >
            {[
              { num: "1", icon: Users, title: "Create Your Profile", desc: "Join for free and tell us about your tango journey, experience level, and dance preferences" },
              { num: "2", icon: MapPin, title: "Discover & Connect", desc: "Find events, teachers, and venues near you. Connect with dancers who share your passion" },
              { num: "3", icon: Heart, title: "Dance & Grow", desc: "Attend events, take lessons, make friends, and become part of the global tango community" }
            ].map((step, idx) => (
              <motion.div key={idx} {...fadeInUp} className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary backdrop-blur-md border border-primary/20">
                  {step.num}
                </div>
                <step.icon className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Showcase - Expanded */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeInUp} className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Everything You Need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect, discover, and grow your tango journey with powerful features
            </p>
          </motion.div>
          
          <motion.div 
            {...staggerContainer}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {[
              { icon: Users, title: "Global Community", desc: "Connect with dancers, teachers, and organizers from around the world", testId: "card-feature-community" },
              { icon: Calendar, title: "Event Discovery", desc: "Find milongas, festivals, and workshops in your city and beyond", testId: "card-feature-events" },
              { icon: MapPin, title: "Venue Directory", desc: "Discover the best tango venues and dance studios near you", testId: "card-feature-venues" },
              { icon: MessageCircle, title: "Real-time Chat", desc: "Message friends, join groups, and coordinate dance plans", testId: "card-feature-connect" },
              { icon: Video, title: "Live Streaming", desc: "Watch live milongas and workshops from anywhere in the world", testId: "card-feature-streaming" },
              { icon: Music, title: "Music Library", desc: "Access curated tango playlists and learn about the music", testId: "card-feature-music" },
              { icon: Award, title: "Verified Teachers", desc: "Learn from certified instructors with verified credentials", testId: "card-feature-teachers" },
              { icon: Globe, title: "Travel Planner", desc: "Plan your tango trips and find hosts in cities worldwide", testId: "card-feature-travel" }
            ].map((feature, idx) => (
              <motion.div key={idx} {...fadeInUp}>
                <Card className="hover-elevate h-full" data-testid={feature.testId}>
                  <CardContent className="pt-6">
                    <feature.icon className="mb-4 h-12 w-12 text-primary" />
                    <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-primary">
                      <Check className="h-4 w-4" />
                      <span>Available now</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeInUp} className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">What Dancers Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied dancers worldwide
            </p>
          </motion.div>

          <motion.div 
            {...staggerContainer}
            className="grid gap-8 md:grid-cols-3"
          >
            {testimonials.map((testimonial, idx) => (
              <motion.div key={idx} {...fadeInUp}>
                <Card className="hover-elevate backdrop-blur-lg bg-background/80 h-full" data-testid={`card-testimonial-${idx}`}>
                  <CardContent className="pt-6">
                    <Quote className="mb-4 h-8 w-8 text-primary/40" />
                    <div className="mb-4 flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="mb-6 text-muted-foreground italic">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
                        {testimonial.image}
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
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
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div {...fadeInUp} className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Mundo Tango
            </p>
          </motion.div>

          <motion.div {...staggerContainer} className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div key={idx} {...fadeInUp}>
                <Card className="overflow-hidden" data-testid={`faq-${idx}`}>
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left p-6 flex items-center justify-between hover-elevate"
                  >
                    <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                    <ChevronDown 
                      className={`h-5 w-5 text-primary transition-transform ${
                        openFaq === idx ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-6 border-t">
                      <p className="pt-4 text-muted-foreground">{faq.answer}</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <motion.div {...fadeInUp} className="container mx-auto max-w-4xl text-center">
          <div className="backdrop-blur-md bg-background/60 rounded-3xl p-8 md:p-12 border border-primary/20">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Join the Community?</h2>
            <p className="mb-8 text-lg text-muted-foreground max-w-2xl mx-auto">
              Create your free account today and start connecting with passionate tango dancers worldwide. 
              No credit card required.
            </p>
            <Link href="/register">
              <Button size="lg" className="gap-2 mb-6" data-testid="button-cta-final">
                <Sparkles className="h-5 w-5" />
                Join Mundo Tango Free
              </Button>
            </Link>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
    </PublicLayout>
    </PageLayout>);
}
