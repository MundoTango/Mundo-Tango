import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, HelpCircle, MessageCircle } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How do I create an account?",
        a: "Click the 'Sign Up' button in the top right corner, fill in your details, and verify your email address. It's free to join!"
      },
      {
        q: "Is Mundo Tango free to use?",
        a: "Yes! Creating an account and using the basic features is completely free. We also offer premium features for dedicated dancers."
      },
      {
        q: "How do I find events near me?",
        a: "Go to the Events page and use the location filter to see milongas and classes in your area. You can also view the calendar to see what's coming up."
      }
    ]
  },
  {
    category: "Events & Classes",
    questions: [
      {
        q: "How do I RSVP to an event?",
        a: "Click on any event to view details, then click the 'RSVP' button. You'll receive a confirmation and reminder before the event."
      },
      {
        q: "Can I create my own events?",
        a: "Yes! Teachers and organizers can create events. Click 'Create Event' from the Events page and fill in the details."
      },
      {
        q: "What's the difference between a milonga and a practica?",
        a: "A milonga is a social dance event with traditional codes, while a practica is a practice session where dancers work on technique and try new moves."
      }
    ]
  },
  {
    category: "Finding Teachers",
    questions: [
      {
        q: "How do I find a tango teacher?",
        a: "Visit the Teachers page to browse instructors by location, style, and experience level. You can read reviews and book lessons directly."
      },
      {
        q: "What should I look for in a teacher?",
        a: "Consider their teaching style, experience level, specialties (salon, nuevo, vals, etc.), and student reviews. Many teachers offer a trial class."
      }
    ]
  },
  {
    category: "Community",
    questions: [
      {
        q: "How do I connect with other dancers?",
        a: "Use the Search feature to find dancers in your area, join groups, and attend events. You can also send friend requests and messages."
      },
      {
        q: "What are groups and how do I join one?",
        a: "Groups are communities centered around locations, dance styles, or interests. Browse the Groups page and click 'Join' on any that interest you."
      }
    ]
  },
  {
    category: "Technical Support",
    questions: [
      {
        q: "I forgot my password, what do I do?",
        a: "Click 'Forgot Password' on the login page, enter your email, and we'll send you a reset link."
      },
      {
        q: "How do I update my profile?",
        a: "Go to Settings > Profile to update your information, photo, bio, and dancing preferences."
      },
      {
        q: "Is my data secure?",
        a: "Yes! We use industry-standard encryption and never share your personal information with third parties without your consent."
      }
    ]
  }
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      qa =>
        qa.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qa.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <SelfHealingErrorBoundary pageName="FAQ" fallbackRoute="/">
      <PageLayout title="Frequently Asked Questions" showBreadcrumbs>
      <SEO
        title="FAQ - Mundo Tango"
        description="Find answers to common questions about Mundo Tango. Learn how to get started, find events, connect with dancers, and make the most of our platform."
      />

      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&h=900&fit=crop&q=80')`
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
              <HelpCircle className="w-3 h-3 mr-1.5" />
              Help Center
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
              Frequently Asked Questions
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Find answers to your questions about Mundo Tango
            </p>
          </motion.div>
        </div>
      </div>

      <div className="bg-background py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Search */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
                data-testid="input-search-faq"
              />
            </div>
          </motion.div>

          {/* FAQs */}
          {filteredFaqs.length > 0 ? (
            <div className="space-y-8">
              {filteredFaqs.map((category, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Card data-testid={`faq-category-${idx}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl font-serif">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <HelpCircle className="h-6 w-6 text-primary" />
                        </div>
                        {category.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((qa, qIdx) => (
                          <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                            <AccordionTrigger 
                              className="text-left font-semibold"
                              data-testid={`faq-question-${idx}-${qIdx}`}
                            >
                              {qa.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                              {qa.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Search className="mx-auto h-16 w-16 mb-6 opacity-30" />
                <h3 className="text-xl font-serif font-bold mb-2">No Results Found</h3>
                <p className="text-muted-foreground">Try a different search term</p>
              </CardContent>
            </Card>
          )}

          {/* Contact CTA */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="py-12 text-center">
                <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6">
                  <MessageCircle className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-3xl font-serif font-bold mb-3">Still need help?</h3>
                <p className="text-muted-foreground mb-6 text-lg max-w-lg mx-auto">
                  Can't find what you're looking for? Our support team is here to help
                </p>
                <a 
                  href="mailto:support@mundotango.com" 
                  className="inline-block text-primary hover:underline text-lg font-semibold"
                >
                  support@mundotango.com
                </a>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
