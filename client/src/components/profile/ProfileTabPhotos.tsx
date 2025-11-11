import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";

export default function ProfileTabPhotos() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          Photos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Photo gallery will be displayed here.
        </p>
      </CardContent>
    </Card>
  );
}
