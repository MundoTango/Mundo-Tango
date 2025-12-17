import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, Star } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "Mundo Tango transformed how I experience tango. I've traveled to 15 cities in the past year, and finding milongas used to be a struggle. Now I can show up in any city and immediately connect with the local community. It's like having friends everywhere.",
    author: "Sarah Chen",
    location: "San Francisco, USA",
    role: "Social Dancer, 5 years",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
  },
  {
    quote: "As a teacher, this platform has been a game-changer for my business. I've connected with students from around the world, and the video lesson feature lets me reach people who could never attend my in-person classes. My student base has grown 300%.",
    author: "Carlos Rodriguez",
    location: "Buenos Aires, Argentina",
    role: "Tango Maestro, 20 years",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
  },
  {
    quote: "I started tango three months ago, and Mundo Tango made everything so much easier. Finding beginner-friendly classes, understanding milonga etiquette, connecting with other beginners—it removed all the intimidation factors. I'm hooked now!",
    author: "Emma Thompson",
    location: "London, UK",
    role: "Beginner Dancer",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop"
  },
  {
    quote: "We organize one of Europe's largest tango marathons, and Mundo Tango has become essential for our operations. Registration, RSVPs, communications—everything runs smoothly. Plus, the global reach helps us attract dancers from 40+ countries.",
    author: "Isabella Marino",
    location: "Berlin, Germany",
    role: "Festival Organizer",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop"
  },
  {
    quote: "The community aspect is what sets this apart. I've made genuine friendships with dancers worldwide. When I visit their cities, I have dance partners waiting. When they visit mine, I return the favor. It's a global family.",
    author: "David Kim",
    location: "Seoul, South Korea",
    role: "Social Dancer, 8 years",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop"
  },
  {
    quote: "As someone who travels constantly for work, Mundo Tango lets me maintain my dance practice anywhere. I've danced tango in airports, hotel ballrooms, and local milongas from Tokyo to São Paulo. This app makes it possible.",
    author: "Ana Silva",
    location: "Lisbon, Portugal",
    role: "Travel Tango Dancer",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop"
  }
];

export default function TestimonialsPage() {
  return (
    <SelfHealingErrorBoundary pageName="Testimonials" fallbackRoute="/">
      <PageLayout title="Success Stories" showBreadcrumbs>
        <PublicLayout>
          <SEO
            title="Testimonials - Success Stories - Mundo Tango"
            description="Read real stories from dancers, teachers, and organizers in the Mundo Tango community. Discover how our platform is transforming the global tango experience."
          />
          
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&h=900&fit=crop')`
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
                  <Star className="w-3 h-3 mr-1.5" />
                  Success Stories
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  Real Stories, Real Impact
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
                  Hear from dancers who've transformed their tango journey with Mundo Tango
                </p>
              </motion.div>
            </div>
          </div>
        
          <div className="bg-background py-12 px-4">
            <div className="container mx-auto max-w-5xl space-y-8">

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-3xl mx-auto mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                  Join 10,000+ Happy Dancers
                </h2>
                <p className="text-lg text-muted-foreground">
                  From complete beginners to world-renowned maestros, Mundo Tango serves the entire 
                  tango community with tools that make connection, learning, and growth possible.
                </p>
              </motion.div>

              <div className="grid gap-8 md:grid-cols-2">
                {testimonials.map((testimonial, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                  >
                    <Card className="hover-elevate h-full" data-testid={`card-testimonial-${idx}`}>
                      <CardContent className="p-8 space-y-4">
                        <Quote className="h-10 w-10 text-primary/30" />
                        <p className="text-muted-foreground leading-relaxed italic">
                          "{testimonial.quote}"
                        </p>
                        <div className="flex items-center gap-4 pt-4">
                          <img 
                            src={testimonial.image}
                            alt={testimonial.author}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-semibold">{testimonial.author}</div>
                            <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                            <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                          </div>
                        </div>
                        <div className="flex gap-1 pt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="pt-8"
              >
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" data-testid="card-cta">
                  <CardContent className="py-16 text-center">
                    <h3 className="text-4xl font-serif font-bold mb-4">Start Your Story</h3>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                      Join thousands of dancers who've discovered a better way to experience tango
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                      <a 
                        href="/register"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-11 px-8 bg-primary text-primary-foreground hover-elevate active-elevate-2"
                        data-testid="button-join"
                      >
                        Join Free Today
                      </a>
                      <a 
                        href="/discover"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-11 px-8 border border-input bg-background hover-elevate active-elevate-2"
                        data-testid="button-explore"
                      >
                        Explore Without Signing Up
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
