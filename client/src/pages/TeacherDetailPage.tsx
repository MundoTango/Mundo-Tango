import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Calendar, Award } from "lucide-react";

export default function TeacherDetailPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" />
                <AvatarFallback>CR</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">Carlos Rodriguez</h1>
                  <Badge>Verified</Badge>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Buenos Aires, Argentina
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    4.9 (342 reviews)
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button data-testid="button-follow">Follow</Button>
                  <Button variant="outline" data-testid="button-message">Message</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Teaching Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">15+ years</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Students Taught</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">5,000+</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Workshops</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">120+</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              Carlos Rodriguez is a world-renowned tango instructor with over 15 years of experience.
              He has taught workshops in over 30 countries and trained thousands of dancers worldwide.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Advanced Technique Workshop</p>
                      <p className="text-sm text-muted-foreground">Dec 15-17, 2025</p>
                    </div>
                  </div>
                  <Button size="sm">View Details</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
