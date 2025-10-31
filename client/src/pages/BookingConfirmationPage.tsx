import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, MapPin, Users, Download } from "lucide-react";
import { Link } from "wouter";

export default function BookingConfirmationPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">
            Your reservation has been successfully confirmed
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Confirmation Number</p>
              <p className="font-mono text-lg font-bold">BKG-2025-001234</p>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3">Friday Night Milonga</h3>
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

        <Card className="mt-6 bg-muted">
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            <p>A confirmation email has been sent to your email address.</p>
            <p className="mt-2">Please show this confirmation at the door.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
