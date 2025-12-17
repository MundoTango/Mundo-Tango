import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Users, Calendar, Settings, Heart, Star } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

const sections = [
  {
    id: "profile",
    icon: Users,
    title: "Managing Your Profile",
    items: [
      { q: "How do I edit my profile?", a: "Go to Settings > Profile to update your photo, bio, dance preferences, and more." },
      { q: "Can I make my profile private?", a: "Yes! In Privacy Settings, you can control who sees your profile and activity." },
      { q: "How do I add my dance experience?", a: "In your profile, you can list your experience level, preferred roles, and dance styles." }
    ]
  },
  {
    id: "events",
    icon: Calendar,
    title: "Events & RSVPs",
    items: [
      { q: "How do I RSVP to an event?", a: "Click on any event card and press the 'RSVP' button. You'll receive confirmation and reminders." },
      { q: "Can I create my own event?", a: "Yes! Teachers and organizers can create events. Click 'Create Event' and fill in the details." },
      { q: "How do I cancel an RSVP?", a: "Visit the event page and click 'Cancel RSVP'. Please do this early so others can plan." }
    ]
  },
  {
    id: "connections",
    icon: Heart,
    title: "Connecting with Dancers",
    items: [
      { q: "How do I send a friend request?", a: "Visit any dancer's profile and click 'Add Friend'. They'll receive a notification." },
      { q: "Can I message other dancers?", a: "Yes! Once you're connected, you can send messages directly." },
      { q: "What are groups?", a: "Groups are communities centered around locations or interests. Join groups to connect with like-minded dancers." }
    ]
  },
  {
    id: "teachers",
    icon: Star,
    title: "For Teachers",
    items: [
      { q: "How do I set up a teacher profile?", a: "Complete your profile and add teaching experience, specialties, and availability." },
      { q: "Can I post video lessons?", a: "Yes! Upload video lessons to share with the community and build your following." },
      { q: "How does booking work?", a: "Students can message you directly or use your booking link if you've set one up." }
    ]
  },
  {
    id: "organizers",
    icon: Calendar,
    title: "For Organizers",
    items: [
      { q: "How do I promote my event?", a: "Create a detailed event listing with photos, date, location, and description. Share the link on social media." },
      { q: "Can I charge for events?", a: "Yes! Set up ticketing through our integrated checkout system." },
      { q: "How do I manage RSVPs?", a: "View all RSVPs in your event dashboard. Export lists or send updates to attendees." }
    ]
  },
  {
    id: "settings",
    icon: Settings,
    title: "Settings & Privacy",
    items: [
      { q: "How do I change my password?", a: "Go to Settings > Security > Change Password." },
      { q: "Can I control email notifications?", a: "Yes! In Settings > Notifications, customize which emails you receive." },
      { q: "How do I delete my account?", a: "Contact support@mundotango.com. We're sad to see you go but will process your request within 48 hours." }
    ]
  }
];

export default function UserGuidePage() {
  return (
    <SelfHealingErrorBoundary pageName="User Guide" fallbackRoute="/">
      <PageLayout title="User Guide" showBreadcrumbs>
        <PublicLayout>
          <SEO
            title="User Guide - Mundo Tango"
            description="Complete guide to using Mundo Tango. Learn how to manage your profile, find events, connect with dancers, and make the most of our platform features."
          />
          
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&h=900&fit=crop')`
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
                  <BookOpen className="w-3 h-3 mr-1.5" />
                  User Guide
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  Complete User Guide
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
                  Everything you need to know about using Mundo Tango
                </p>
              </motion.div>
            </div>
          </div>
        
          <div className="bg-background py-12 px-4">
            <div className="container mx-auto max-w-4xl space-y-8">

              {sections.map((section, idx) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Card data-testid={`card-section-${section.id}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl font-serif">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <section.icon className="h-6 w-6 text-primary" />
                        </div>
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {section.items.map((item, itemIdx) => (
                          <AccordionItem key={itemIdx} value={`item-${idx}-${itemIdx}`}>
                            <AccordionTrigger 
                              className="text-left font-semibold"
                              data-testid={`guide-question-${section.id}-${itemIdx}`}
                            >
                              {item.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                              {item.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" data-testid="card-help">
                  <CardContent className="py-12 text-center">
                    <h3 className="text-3xl font-serif font-bold mb-3">Still Have Questions?</h3>
                    <p className="text-muted-foreground mb-6 text-lg max-w-lg mx-auto">
                      Check our FAQ or contact our support team for personalized help
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                      <a 
                        href="/faq" 
                        className="text-primary hover:underline text-lg font-semibold"
                        data-testid="link-faq"
                      >
                        View FAQ
                      </a>
                      <span className="text-muted-foreground">·</span>
                      <a 
                        href="mailto:support@mundotango.com" 
                        className="text-primary hover:underline text-lg font-semibold"
                        data-testid="link-support"
                      >
                        Email Support
                      </a>
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
