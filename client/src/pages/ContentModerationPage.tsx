import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";

export default function ContentModerationPage() {
  const [activeTab, setActiveTab] = useState("pending");

  return (
    <PageLayout title="Content Moderation" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending" data-testid="tab-pending">Pending (23)</TabsTrigger>
            <TabsTrigger value="approved" data-testid="tab-approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected" data-testid="tab-rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <Card key={item} data-testid={`content-${item}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">Reported Post</CardTitle>
                        <p className="text-sm text-muted-foreground">Posted by @user{item} • 2 hours ago</p>
                      </div>
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        3 reports
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      This is the content that was reported for moderation review...
                    </p>
                    <div className="flex gap-2">
                      <Button variant="default" size="sm" data-testid={`button-approve-${item}`}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button variant="destructive" size="sm" data-testid={`button-reject-${item}`}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </PageLayout>);
}
