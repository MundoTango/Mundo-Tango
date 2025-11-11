import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function ProfileTabFriends() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Friends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Friends list will be displayed here.
        </p>
      </CardContent>
    </Card>
  );
}
