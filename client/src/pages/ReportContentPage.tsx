import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Flag } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function ReportContentPage() {
  return (
    <SelfHealingErrorBoundary pageName="Report Content" fallbackRoute="/feed">
      <PageLayout title="Report Content" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        
          <p className="text-muted-foreground">
            Report content that violates our community guidelines
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>What's wrong with this content?</Label>
              <RadioGroup defaultValue="inappropriate">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inappropriate" id="inappropriate" data-testid="radio-inappropriate" />
                  <Label htmlFor="inappropriate">Inappropriate or offensive</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spam" id="spam" data-testid="radio-spam" />
                  <Label htmlFor="spam">Spam or scam</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" data-testid="radio-false" />
                  <Label htmlFor="false">False information</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="copyright" id="copyright" data-testid="radio-copyright" />
                  <Label htmlFor="copyright">Copyright violation</Label>
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
                placeholder="Please provide specific details about why you're reporting this content..."
                data-testid="input-details"
              />
            </div>

            <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
              <p>Thank you for helping keep our community safe. We'll review this report and take appropriate action.</p>
            </div>

            <Button className="w-full" data-testid="button-submit">
              Submit Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
