import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane } from "lucide-react";

export default function ProfileTabTravel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="w-5 h-5" />
          Travel Plans
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Travel plans and itineraries will be displayed here.
        </p>
      </CardContent>
    </Card>
  );
}
