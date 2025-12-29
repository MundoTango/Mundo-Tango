import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Check,
  Sparkles,
  Globe,
  Users,
  Calendar,
  MapPin,
  MessageCircle,
  Heart,
  Music,
  Video,
  Home,
  Shield,
  Zap
} from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { Link } from "wouter";

const features = [
  { icon: Globe, text: "Access to global tango community" },
  { icon: Calendar, text: "Unlimited event discovery" },
  { icon: MapPin, text: "Interactive world map" },
  { icon: Users, text: "Connect with dancers worldwide" },
  { icon: MessageCircle, text: "Real-time messaging" },
  { icon: Heart, text: "Find dance partners" },
  { icon: Home, text: "Tango housing network" },
  { icon: Music, text: "Music library access" },
  { icon: Video, text: "Live streams and videos" },
  { icon: Sparkles, text: "Mr. Blue AI assistant" },
  { icon: Shield, text: "Safe, verified community" },
  { icon: Zap, text: "Priority support" },
];

const faqs = [
  {
    question: "How does the 7-day free trial work?",
    answer: "Start your free trial today with full access to all features. No credit card required to start. After 7 days, you can choose to continue with our Pro membership at just $4.99/month."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, absolutely! You can cancel your subscription at any time with no questions asked. Your access will continue until the end of your current billing period."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal through our secure Stripe payment system."
  },
  {
    question: "Is there a discount for annual billing?",
    answer: "Yes! Pay annually and get 2 months free - that's just $49.99/year instead of $59.88 (monthly rate)."
  },
  {
    question: "What happens if I don't subscribe after the trial?",
    answer: "No worries! You'll still have access to basic features like browsing events and viewing profiles. Premium features like unlimited messaging and AI assistance require a subscription."
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with your subscription, contact us within 30 days for a full refund."
  }
];

export default function PricingPage() {
  const { t } = useTranslation(["pages", "common"]);
  
  return (
    <SelfHealingErrorBoundary pageName="Pricing" fallbackRoute="/">
      <PageLayout title="Pricing" showBreadcrumbs>
        <PublicLayout>
          <SEO
            title="Pricing - Mundo Tango"
            description="Join Mundo Tango with a 7-day free trial. Then just $4.99/month for unlimited access to the global tango community, events, messaging, and more."
          />

          <div className="min-h-screen">
            <section className="relative py-20 md:py-32 overflow-hidden">
              <div className="absolute inset-0 ocean-gradient opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
              
              <div className="container mx-auto px-4 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center max-w-3xl mx-auto"
                >
                  <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
                    Simple, Transparent Pricing
                  </Badge>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                    Start Dancing Today
                  </h1>
                  <p className="text-xl text-white/90 mb-8">
                    Join the global tango community with a 7-day free trial.
                    <br />
                    No credit card required to start.
                  </p>
                </motion.div>
              </div>
            </section>

            <section className="py-16 -mt-20 relative z-20">
              <div className="container mx-auto px-4">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="max-w-lg mx-auto"
                >
                  <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 text-center">
                      <Badge className="bg-white text-primary font-bold">
                        MOST POPULAR
                      </Badge>
                    </div>
                    <CardHeader className="text-center pt-8">
                      <CardTitle className="text-3xl font-bold">Pro Membership</CardTitle>
                      <CardDescription className="text-lg">
                        Full access to everything
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center pb-8">
                      <div className="mb-6">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-5xl font-bold">$4.99</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          After 7-day free trial
                        </p>
                      </div>
                      
                      <div className="bg-primary/10 rounded-lg p-4 mb-6">
                        <p className="font-semibold text-primary flex items-center justify-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          7 Days Free - No Credit Card Required
                        </p>
                      </div>

                      <Link href="/register">
                        <Button 
                          size="lg" 
                          className="w-full text-lg py-6 mb-4"
                          data-testid="button-start-trial"
                        >
                          Start Free Trial
                        </Button>
                      </Link>

                      <p className="text-sm text-muted-foreground">
                        Cancel anytime. 30-day money-back guarantee.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </section>

            <section className="py-16 bg-muted/30">
              <div className="container mx-auto px-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
                  <p className="text-muted-foreground text-lg">
                    One simple plan with all features included
                  </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="flex items-center gap-3 p-4 rounded-lg bg-background border hover-elevate"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-16">
              <div className="container mx-auto px-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                  <p className="text-muted-foreground text-lg">
                    Got questions? We've got answers.
                  </p>
                </motion.div>

                <div className="max-w-2xl mx-auto">
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left" data-testid={`faq-question-${index}`}>
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </section>

            <section className="py-16 bg-muted/30">
              <div className="container mx-auto px-4 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                    Start your 7-day free trial today and become part of the world's largest tango community.
                  </p>
                  <Link href="/register">
                    <Button size="lg" className="text-lg px-8" data-testid="button-cta-register">
                      Start Your Free Trial
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </section>
          </div>
        </PublicLayout>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
