import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, BookOpen, Clock, TrendingUp, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

export default function TutorialsPage() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: tutorials, isLoading } = useQuery({
    queryKey: ["/api/tutorials", activeTab],
  });

  return (
    <SelfHealingErrorBoundary pageName="Tutorials" fallbackRoute="/feed">
      <>
        <SEO
          title="Tango Tutorials"
          description="Step-by-step tango tutorials for all skill levels. Learn techniques, patterns, and musicality from beginner to advanced."
        />

        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&auto=format&fit=crop')`
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
                Step-by-Step Learning
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                Tango Tutorials
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                Master tango with comprehensive step-by-step guides
              </p>

              <Button size="lg" className="gap-2" data-testid="button-start-learning">
                <BookOpen className="h-5 w-5" />
                Start Learning
                <ChevronRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="all" data-testid="tab-all">
                All Tutorials
              </TabsTrigger>
              <TabsTrigger value="beginner" data-testid="tab-beginner">
                Beginner
              </TabsTrigger>
              <TabsTrigger value="intermediate" data-testid="tab-intermediate">
                Intermediate
              </TabsTrigger>
              <TabsTrigger value="advanced" data-testid="tab-advanced">
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground">Loading tutorials...</p>
                </div>
              ) : tutorials && Array.isArray(tutorials) && tutorials.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {tutorials.map((tutorial: any, index: number) => (
                    <motion.div
                      key={tutorial.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover-elevate" data-testid={`tutorial-card-${tutorial.id}`}>
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <motion.img
                            src={tutorial.thumbnail || "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&auto=format&fit=crop"}
                            alt={tutorial.title}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.6 }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          {tutorial.level && (
                            <Badge className="absolute top-4 right-4 bg-white/10 text-white border-white/30 backdrop-blur-sm">
                              {tutorial.level}
                            </Badge>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                              <Play className="h-8 w-8 text-white fill-white" />
                            </div>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <h3 className="text-xl font-serif font-bold line-clamp-2">
                              {tutorial.title}
                            </h3>
                          </div>
                        </div>

                        <CardContent className="p-6 space-y-3">
                          {tutorial.instructor && (
                            <p className="text-sm text-muted-foreground">
                              by {tutorial.instructor}
                            </p>
                          )}

                          {tutorial.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {tutorial.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {tutorial.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-primary" />
                                {tutorial.duration}
                              </div>
                            )}
                            {tutorial.views && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                {tutorial.views.toLocaleString()}
                              </div>
                            )}
                          </div>

                          <Link href={`/tutorials/${tutorial.id}`}>
                            <Button className="w-full gap-2" data-testid={`button-watch-${tutorial.id}`}>
                              <Play className="h-4 w-4" />
                              Watch Tutorial
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center text-muted-foreground">
                    <BookOpen className="mx-auto h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg">No tutorials available for this level</p>
                    <p className="text-sm mt-2">Check back soon for new content</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
