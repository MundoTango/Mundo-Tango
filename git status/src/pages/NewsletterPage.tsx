import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Check, Sparkles, Calendar, Star } from "lucide-react";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";

export default function NewsletterPage() {
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
  };

  return (
    <SelfHealingErrorBoundary pageName="Newsletter" fallbackRoute="/">
      <PageLayout title="Stay Connected with Tango" showBreadcrumbs>
        <>
          <SEO 
            title="Newsletter - Mundo Tango"
            description="Stay connected with the global tango community. Get weekly updates, exclusive content, and early access to events."
          />

          {/* Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1526558228-5ddec55e580e?w=1600&auto=format&fit=crop')`
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
                  <Mail className="w-3 h-3 mr-1.5" />
                  Stay Informed
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                  Join Our Newsletter
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  Get exclusive updates, event highlights, and tango stories delivered to your inbox
                </p>
              </motion.div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-background py-12 px-6">
            <div className="container mx-auto max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid gap-8 md:grid-cols-2"
              >
                {/* Subscription Form Card */}
                <Card className="overflow-hidden hover-elevate">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-center text-2xl font-serif">
                      {subscribed ? "You're Subscribed!" : "Subscribe to Our Newsletter"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {subscribed ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center space-y-4"
                      >
                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                          <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          Thank you for subscribing! Check your email to confirm your subscription.
                        </p>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" required data-testid="input-name" className="h-12" />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" type="email" required data-testid="input-email" className="h-12" />
                        </div>
                        <Button type="submit" className="w-full gap-2" data-testid="button-subscribe">
                          <Mail className="h-4 w-4" />
                          Subscribe Now
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>

                {/* Benefits Cards */}
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-serif">
                          <Sparkles className="h-5 w-5 text-primary" />
                          What You'll Receive
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                        <p>✓ Weekly event roundups in your city</p>
                        <p>✓ Exclusive interviews with tango maestros</p>
                        <p>✓ Tips and techniques to improve your dance</p>
                        <p>✓ Early access to workshop registrations</p>
                        <p>✓ Special discounts and offers</p>
                        <p>✓ Community highlights and success stories</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <Card className="bg-primary/5 border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-serif">
                          <Star className="h-5 w-5 text-primary" />
                          Privacy Promise
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground leading-relaxed">
                        <p>We respect your privacy. Your email will never be shared with third parties, and you can unsubscribe at any time with one click.</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-serif">
                          <Calendar className="h-5 w-5 text-primary" />
                          Frequency
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground leading-relaxed">
                        <p>We send newsletters every Tuesday and Friday. You can adjust your preferences or unsubscribe at any time from your account settings.</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
