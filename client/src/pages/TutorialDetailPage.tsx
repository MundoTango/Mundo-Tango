import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Users, Star, ChevronRight, BookOpen } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

export default function TutorialDetailPage() {
  return (
    <SelfHealingErrorBoundary pageName="Tutorial Details" fallbackRoute="/tutorials">
      <>
        <SEO
          title="Mastering the Embrace - Tutorial"
          description="Learn the fundamentals of tango embrace with detailed step-by-step instructions and video demonstrations."
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
              className="max-w-4xl w-full"
            >
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  Tutorial
                </Badge>
                <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  Intermediate
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-6">
                Mastering the Embrace
              </h1>
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/90 mb-8">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>45 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>1,234 students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-white" />
                  <span>4.8</span>
                </div>
              </div>

              <Button size="lg" className="gap-2" data-testid="button-start">
                <Play className="h-5 w-5" />
                Start Tutorial
                <ChevronRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="mb-8">
              <CardHeader className="border-b">
                <CardTitle className="text-2xl font-serif">What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    "Proper posture and frame",
                    "Connection and communication",
                    "Close embrace vs. open embrace",
                    "Following the leader's movements",
                    "Weight distribution",
                    "Breathing and relaxation"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader className="border-b">
                <CardTitle className="text-2xl font-serif">About This Tutorial</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  The embrace is the foundation of tango. In this comprehensive tutorial, you'll learn the fundamentals
                  of creating and maintaining a proper connection with your dance partner.
                </p>
                <p>
                  We'll cover both close and open embrace styles, explore the differences between them, and help you
                  understand when to use each one. You'll also learn about weight distribution, posture, and how to
                  communicate effectively through your embrace.
                </p>
                <p>
                  This tutorial is perfect for intermediate dancers looking to refine their technique and deepen their
                  understanding of one of tango's most essential elements.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-2xl font-serif">Tutorial Instructor</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Users className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Maria Rodriguez</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Maria has been teaching tango for over 15 years and has performed at venues across Buenos Aires.
                      She specializes in traditional embrace techniques and musicality.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
