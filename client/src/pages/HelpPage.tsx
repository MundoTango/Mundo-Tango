import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Book, MessageCircle, Mail } from "lucide-react";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';
import { motion } from "framer-motion";
import tangoHeroImage from "@assets/tango-professional-1.jpg";

export default function HelpPage() {
  return (
    <PageLayout title="How Can We Help?" showBreadcrumbs>
<SelfHealingErrorBoundary pageName="Help Center" fallbackRoute="/">
<div className="min-h-screen bg-background">
      {/* Editorial Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden"
        data-testid="section-hero"
      >
        <div className="absolute inset-0 aspect-video">
          <img
            src={tangoHeroImage}
            alt="Help Center"
            className="w-full h-full object-cover"
            data-testid="img-hero"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4" data-testid="heading-page-title">
              How Can We Help?
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light" data-testid="text-hero-subtitle">
              Find answers and get support
            </p>
          </motion.div>
        </div>
      </motion.section>

      <div className="container mx-auto max-w-4xl px-4 py-16">
        
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Link href="/faq">
            <Card className="hover-elevate cursor-pointer" data-testid="card-faq">
              <CardHeader>
                <Book className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base">FAQ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Browse frequently asked questions</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/contact">
            <Card className="hover-elevate cursor-pointer" data-testid="card-contact">
              <CardHeader>
                <Mail className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base">Contact Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Get in touch with our team</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover-elevate cursor-pointer" data-testid="card-chat">
            <CardHeader>
              <MessageCircle className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-base">Live Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Chat with us in real-time</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Popular Topics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "How do I reset my password?",
              "How do I RSVP to an event?",
              "How do I find dancers in my area?",
              "How do I upgrade my account?",
              "How do I report inappropriate content?"
            ].map((topic, i) => (
              <Button
                key={i}
                variant="ghost"
                className="w-full justify-start"
                data-testid={`topic-${i}`}
              >
                {topic}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </SelfHealingErrorBoundary>
    </PageLayout>
  );
}
