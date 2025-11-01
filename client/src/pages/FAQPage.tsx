import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";

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
    <PageLayout title="Frequently Asked Questions" showBreadcrumbs>
      <SEO
        title="FAQ - Mundo Tango"
        description="Find answers to common questions about Mundo Tango. Learn how to get started, find events, connect with dancers, and make the most of our platform."
      />
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-faq"
              />
            </div>
          </div>

          {/* FAQs */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-8">
            {filteredFaqs.map((category, idx) => (
              <Card key={idx} data-testid={`faq-category-${idx}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((qa, qIdx) => (
                      <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                        <AccordionTrigger data-testid={`faq-question-${idx}-${qIdx}`}>
                          {qa.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {qa.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No FAQs match your search</p>
            </CardContent>
          </Card>
        )}

        {/* Still need help */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="py-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Contact our support team
            </p>
            <a href="mailto:support@mundotango.com" className="text-primary hover:underline">
              support@mundotango.com
            </a>
          </CardContent>
        </Card>
        </div>
      </div>
    </PageLayout>
  );
}
