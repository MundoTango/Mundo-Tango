import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Plane, Hotel, Music } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function TravelPlannerPage() {
  const [activeTab, setActiveTab] = useState("festivals");

  return (
    <SelfHealingErrorBoundary pageName="Tango Travel Planner" fallbackRoute="/feed">
    <PageLayout title="Tango Travel Planner" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 w-full">
                <TabsTrigger value="festivals" data-testid="tab-festivals">Festivals</TabsTrigger>
                <TabsTrigger value="workshops" data-testid="tab-workshops">Workshops</TabsTrigger>
                <TabsTrigger value="tours" data-testid="tab-tours">Tours</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <Card key={item} className="hover-elevate" data-testid={`event-${item}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>Buenos Aires Tango Festival</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">August 15-20, 2025</p>
                          </div>
                          <Music className="h-5 w-5 text-primary" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Buenos Aires, Argentina
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            6 days, 5 nights
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xl font-bold text-primary">$1,299</span>
                          <Button size="sm" data-testid={`button-view-${item}`}>View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Plan Your Trip</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <Input id="destination" placeholder="Where to?" data-testid="input-destination" />
                </div>
                <div>
                  <Label htmlFor="dates">Dates</Label>
                  <Input id="dates" type="date" data-testid="input-dates" />
                </div>
                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input id="budget" type="number" placeholder="$0" data-testid="input-budget" />
                </div>
                <Button className="w-full" data-testid="button-search">
                  <Plane className="h-4 w-4 mr-2" />
                  Search Trips
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Hotel className="h-4 w-4 mr-2" />
                  Recommended Hotels
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Event Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
