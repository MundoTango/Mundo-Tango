import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function FeatureDisabled() {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            Feature Not Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This feature is currently disabled in production. 
            It will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
