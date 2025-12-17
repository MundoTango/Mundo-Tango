import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Home, Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <SelfHealingErrorBoundary pageName="NotFound" fallbackRoute="/">
      <PageLayout title="404 Page Not Found" showBreadcrumbs>
        <>
          <SEO 
            title="Page Not Found - Mundo Tango"
            description="The page you're looking for doesn't exist"
          />

          {/* Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&auto=format&fit=crop')`
            }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  <AlertCircle className="w-3 h-3 mr-1.5" />
                  Page Not Found
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                  404
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  This page has wandered off the dance floor
                </p>
              </motion.div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-background py-12 px-6">
            <div className="container mx-auto max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="pt-12 pb-16 text-center">
                    <div className="mb-8">
                      <AlertCircle className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
                      <h2 className="text-3xl font-serif font-bold mb-4">
                        Oops! Page Not Found
                      </h2>
                      <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
                        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/">
                        <Button size="lg" className="gap-2" data-testid="button-home">
                          <Home className="h-4 w-4" />
                          Go Home
                        </Button>
                      </Link>
                      <Link href="/search">
                        <Button variant="outline" size="lg" className="gap-2" data-testid="button-search">
                          <Search className="h-4 w-4" />
                          Search
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="lg" 
                        className="gap-2" 
                        onClick={() => window.history.back()}
                        data-testid="button-back"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Helpful Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-8"
                >
                  <Card>
                    <CardContent className="p-8">
                      <h3 className="text-xl font-serif font-bold mb-6 text-center">
                        Popular Pages
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="/feed">
                          <Button variant="outline" className="w-full" data-testid="link-feed">
                            Feed
                          </Button>
                        </Link>
                        <Link href="/events">
                          <Button variant="outline" className="w-full" data-testid="link-events">
                            Events
                          </Button>
                        </Link>
                        <Link href="/groups">
                          <Button variant="outline" className="w-full" data-testid="link-groups">
                            Groups
                          </Button>
                        </Link>
                        <Link href="/profile">
                          <Button variant="outline" className="w-full" data-testid="link-profile">
                            Profile
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
