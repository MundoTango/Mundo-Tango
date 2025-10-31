import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, DollarSign } from "lucide-react";

export default function WorkshopDetailPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="aspect-video bg-muted mb-8 overflow-hidden rounded-lg">
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-primary/5">
            <p className="text-muted-foreground">Workshop Cover Image</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>3-Day Intensive</Badge>
                <Badge variant="destructive">Only 5 spots left</Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4">Advanced Tango Technique Workshop</h1>
              <p className="text-lg text-muted-foreground">
                with Maestro Carlos Rodriguez & Maria Santos
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Workshop Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5" />
                  <span>December 15-17, 2025</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5" />
                  <span>9:00 AM - 5:00 PM daily</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5" />
                  <span>Tango Studio Buenos Aires, Argentina</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <span>25/30 registered</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About This Workshop</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Join us for an immersive 3-day workshop focused on advanced tango technique. 
                  You'll learn from two of the most renowned tango instructors in the world.
                </p>
                <p>
                  This workshop covers musicality, embrace technique, complex sequences, and improvisation.
                  Perfect for intermediate to advanced dancers looking to elevate their skills.
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <CardTitle>Registration</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-primary">$299</p>
                  <p className="text-sm text-muted-foreground">per person</p>
                </div>
                <Button className="w-full" size="lg" data-testid="button-register">
                  Register Now
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  30-day money back guarantee
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
