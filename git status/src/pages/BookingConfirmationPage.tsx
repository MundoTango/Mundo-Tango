import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, MapPin, Users, Download } from "lucide-react";
import { Link } from "wouter";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

export default function BookingConfirmationPage() {
  return (
    <SelfHealingErrorBoundary pageName="Booking Confirmation" fallbackRoute="/events">
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1485518882345-15568b7c2b82?w=1600&h=900&fit=crop&q=80')`
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
                <CheckCircle className="w-3 h-3 mr-1.5" />
                Confirmation
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4" data-testid="text-page-title">
                Booking Confirmed!
              </h1>
              
              <p className="text-lg text-white/80 max-w-2xl mx-auto" data-testid="text-page-description">
                Your reservation is confirmed
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto max-w-2xl px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="mb-6 hover-elevate">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Confirmation Number</p>
                  <p className="font-mono text-lg font-bold" data-testid="text-confirmation-number">BKG-2025-001234</p>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold font-serif text-lg mb-3">Friday Night Milonga</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      December 15, 2025 at 8:00 PM
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      La Catedral Tango, Buenos Aires
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      2 guests
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Tickets (2x $25)</span>
                    <span>$50.00</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span>$2.50</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total Paid</span>
                    <span className="text-primary">$52.50</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button className="w-full" data-testid="button-download">
                <Download className="h-4 w-4 mr-2" />
                Download Ticket
              </Button>
              <Link href="/events">
                <Button variant="outline" className="w-full" data-testid="button-events">
                  View All Events
                </Button>
              </Link>
            </div>

            <Card className="bg-muted">
              <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                <p>A confirmation email has been sent to your email address.</p>
                <p className="mt-2">Please show this confirmation at the door.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
