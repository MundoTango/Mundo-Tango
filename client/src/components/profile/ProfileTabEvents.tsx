import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function ProfileTabEvents() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Upcoming and past events will be displayed here.
        </p>
      </CardContent>
    </Card>
  );
}
