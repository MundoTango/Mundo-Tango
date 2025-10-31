import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EyeOff } from "lucide-react";

export default function BlockedContentPage() {
  const blockedContent = [
    { id: 1, type: "Post", author: "User 1", reason: "Spam" },
    { id: 2, type: "Comment", author: "User 2", reason: "Inappropriate" }
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Blocked Content</h1>
          <p className="text-muted-foreground">
            Content you've hidden or blocked
          </p>
        </div>

        {blockedContent.length > 0 ? (
          <div className="space-y-3">
            {blockedContent.map((content) => (
              <Card key={content.id} data-testid={`content-${content.id}`}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{content.type} by {content.author}</p>
                      <p className="text-sm text-muted-foreground">Reason: {content.reason}</p>
                    </div>
                    <Button variant="outline" size="sm" data-testid={`button-unblock-${content.id}`}>
                      Unblock
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <EyeOff className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No blocked content</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
