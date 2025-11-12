import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

const team = [
  {
    name: "Sofia Martinez",
    role: "Founder & CEO",
    bio: "Professional tango dancer with 15+ years of experience. Former software engineer turned entrepreneur.",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    linkedin: "#",
    email: "sofia@mundotango.com"
  },
  {
    name: "Carlos Rodriguez",
    role: "CTO",
    bio: "Full-stack developer and tango enthusiast. Building scalable platforms for global communities.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    linkedin: "#",
    email: "carlos@mundotango.com"
  },
  {
    name: "Isabella Chen",
    role: "Head of Community",
    bio: "Passionate about connecting dancers worldwide. Organizer of international tango festivals.",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    linkedin: "#",
    email: "isabella@mundotango.com"
  },
  {
    name: "Marco Lombardi",
    role: "Product Designer",
    bio: "UX designer with a love for elegant interfaces and smooth user experiences.",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    linkedin: "#",
    email: "marco@mundotango.com"
  },
  {
    name: "Ana Silva",
    role: "Head of Content",
    bio: "Tango journalist and cultural historian. Documenting the global tango movement.",
    imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
    linkedin: "#",
    email: "ana@mundotango.com"
  },
  {
    name: "David Kim",
    role: "Lead Developer",
    bio: "Backend specialist focused on performance and reliability. Weekend milonga regular.",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    linkedin: "#",
    email: "david@mundotango.com"
  }
];

export default function TeamPage() {
  return (
    <SelfHealingErrorBoundary pageName="Team" fallbackRoute="/">
      <PageLayout title="Our Team" showBreadcrumbs>
        <PublicLayout>
          <SEO
            title="Meet Our Team - Mundo Tango"
            description="Get to know the passionate team behind Mundo Tango—dancers, developers, and community builders dedicated to connecting the global tango community."
          />
          
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&h=900&fit=crop')`
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
                  <Users className="w-3 h-3 mr-1.5" />
                  Our Team
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  Meet the Team
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
                  Dancers, developers, and dreamers building the future of tango
                </p>
              </motion.div>
            </div>
          </div>
        
          <div className="bg-background py-12 px-4">
            <div className="container mx-auto max-w-6xl space-y-12">

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-3xl mx-auto"
              >
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                  We're Dancers First, Technologists Second
                </h2>
                <p className="text-lg text-muted-foreground">
                  Every member of our team shares a deep passion for tango. We're building tools we 
                  wish existed when we started dancing, and we're committed to serving the global 
                  tango community with authenticity and care.
                </p>
              </motion.div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {team.map((member, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                  >
                    <Card className="hover-elevate h-full" data-testid={`card-team-member-${idx}`}>
                      <CardContent className="p-6 space-y-4">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <img 
                            src={member.imageUrl} 
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-serif font-bold">{member.name}</h3>
                          <Badge variant="secondary" className="font-normal">{member.role}</Badge>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {member.bio}
                          </p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="icon" asChild>
                            <a href={member.linkedin} aria-label={`${member.name} LinkedIn`}>
                              <Linkedin className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="outline" size="icon" asChild>
                            <a href={`mailto:${member.email}`} aria-label={`Email ${member.name}`}>
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
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
              >
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" data-testid="card-join">
                  <CardContent className="py-12 text-center">
                    <h3 className="text-3xl font-serif font-bold mb-3">Join Our Team</h3>
                    <p className="text-muted-foreground mb-6 text-lg max-w-lg mx-auto">
                      We're always looking for passionate dancers and talented professionals to join our mission
                    </p>
                    <Button size="lg" asChild data-testid="button-view-careers">
                      <a href="/careers">View Open Positions</a>
                    </Button>
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
