import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, ArrowLeft, Mail } from "lucide-react";
import { useLocation } from "wouter";

export default function FeatureArchivedPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Archive className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Feature Temporarily Unavailable</CardTitle>
          <CardDescription className="text-base mt-2">
            This feature has been temporarily archived as part of our platform optimization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              We're focusing our development efforts on core features to provide you with the best possible experience.
              This feature may return in the future based on user demand and platform priorities.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="default"
              onClick={() => setLocation("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go to Home
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "mailto:support@mundotango.com?subject=Feature Request"}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Request Feature
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Need access to this feature? Contact us at{" "}
            <a href="mailto:support@mundotango.com" className="underline hover:text-foreground">
              support@mundotango.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
