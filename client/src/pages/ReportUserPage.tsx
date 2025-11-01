import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";

export default function ReportUserPage() {
  return (
    <PageLayout title="Report User" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        
          <p className="text-muted-foreground">
            Help us keep the community safe by reporting inappropriate behavior
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Reason for reporting</Label>
              <RadioGroup defaultValue="harassment">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="harassment" id="harassment" data-testid="radio-harassment" />
                  <Label htmlFor="harassment">Harassment or bullying</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spam" id="spam" data-testid="radio-spam" />
                  <Label htmlFor="spam">Spam or misleading</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inappropriate" id="inappropriate" data-testid="radio-inappropriate" />
                  <Label htmlFor="inappropriate">Inappropriate content</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="impersonation" id="impersonation" data-testid="radio-impersonation" />
                  <Label htmlFor="impersonation">Impersonation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" data-testid="radio-other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="details">Additional Details</Label>
              <Textarea
                id="details"
                rows={4}
                placeholder="Please provide any additional information that will help us investigate..."
                data-testid="input-details"
              />
            </div>

            <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
              <p>Your report will be reviewed by our moderation team. All reports are confidential.</p>
            </div>

            <Button className="w-full" data-testid="button-submit">
              Submit Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </PageLayout>);
}
