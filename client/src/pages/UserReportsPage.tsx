import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, User } from "lucide-react";

export default function UserReportsPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">User Reports</h1>

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <Card key={item} data-testid={`report-${item}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-base">User Report #{item}</CardTitle>
                      <p className="text-sm text-muted-foreground">Reported 2 hours ago</p>
                    </div>
                  </div>
                  <Badge variant="destructive">High Priority</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">
                    Reason: Harassment and inappropriate behavior
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" data-testid={`button-review-${item}`}>Review</Button>
                  <Button variant="outline" size="sm" data-testid={`button-dismiss-${item}`}>Dismiss</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
