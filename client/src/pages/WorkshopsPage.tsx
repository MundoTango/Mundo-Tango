import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, ChevronRight, Plus } from "lucide-react";
import { Link } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

export default function WorkshopsPage() {
  const { data: workshops, isLoading } = useQuery({
    queryKey: ["/api/workshops"],
  });

  return (
    <AppLayout>
      <>
        <SEO
          title="Tango Workshops"
          description="Learn from world-class instructors in intensive tango workshops. Improve your technique, musicality, and connection."
        />

        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1504609513326-fafc6f24c556?w=1600&auto=format&fit=crop')`
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </motion.div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                Intensive Learning
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                Tango Workshops
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                Learn from world-class instructors in intensive workshops
              </p>

              <Button size="lg" className="gap-2" data-testid="button-create-workshop">
                <Plus className="h-5 w-5" />
                Host a Workshop
                <ChevronRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-6 py-12">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading workshops...</p>
            </div>
          ) : workshops && Array.isArray(workshops) && workshops.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {workshops.map((workshop: any, index: number) => (
                <motion.div
                  key={workshop.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover-elevate" data-testid={`workshop-${workshop.id}`}>
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <motion.img
                        src={workshop.image || "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop"}
                        alt={workshop.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      {workshop.spotsLeft && workshop.spotsLeft < 5 && (
                        <Badge className="absolute top-4 right-4 bg-red-500 text-white">
                          Few spots left
                        </Badge>
                      )}
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-2xl font-serif font-bold line-clamp-2 mb-1">
                          {workshop.title}
                        </h3>
                        {workshop.instructor && (
                          <p className="text-sm text-white/80">with {workshop.instructor}</p>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-6 space-y-3">
                      {workshop.date && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{workshop.date}</span>
                        </div>
                      )}
                      {workshop.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{workshop.location}</span>
                        </div>
                      )}
                      {workshop.duration && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{workshop.duration}</span>
                        </div>
                      )}
                      {workshop.capacity && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{workshop.registered || 0}/{workshop.capacity} registered</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <span className="text-2xl font-bold text-primary">${workshop.price}</span>
                        </div>
                        <Link href={`/workshops/${workshop.id}`}>
                          <Button className="gap-2" data-testid={`button-register-${workshop.id}`}>
                            Register
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <Calendar className="mx-auto h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg">No workshops available at the moment</p>
                <p className="text-sm mt-2">Check back soon for upcoming workshops</p>
              </CardContent>
            </Card>
          )}
        </div>
      </>
    </AppLayout>
  );
}
