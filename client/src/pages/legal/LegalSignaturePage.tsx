import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  XCircle,
  FileText,
  PenTool,
  Download,
  AlertCircle,
} from "lucide-react";
import { SignaturePad } from "@/components/legal/SignaturePad";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function LegalSignaturePage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [signatureData, setSignatureData] = useState<string>("");
  const [signatureMethod, setSignatureMethod] = useState<'draw' | 'type' | 'upload'>('draw');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const { data: document, isLoading } = useQuery({
    queryKey: ['/api/legal/sign', id],
  });

  const signMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/legal/signatures`, 'POST', {
        documentInstanceId: Number(id),
        signatureData,
        signatureMethod,
        agreedToTerms,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/legal/signatures', id] });
      setShowSignatureModal(false);
      setShowSuccessModal(true);
    },
  });

  const declineMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/legal/documents/${id}/decline`, 'POST', {
        reason: declineReason,
      });
    },
    onSuccess: () => {
      toast({
        title: "Document declined",
        description: "You have declined to sign this document",
      });
      navigate("/legal");
    },
  });

  // Mock data
  const mockDocument = {
    id: Number(id),
    title: "Event Liability Waiver - Tango Festival 2024",
    type: "Waiver",
    content: `
      <h1>Event Liability Waiver</h1>
      <h2>Tango Festival 2024</h2>
      
      <p><strong>Please read carefully before signing.</strong></p>
      
      <p>This Liability Waiver and Release Agreement ("Agreement") is entered into by and between the participant and the Event Organizer.</p>
      
      <h3>1. Acknowledgment of Risk</h3>
      <p>I acknowledge that tango dancing involves physical activity and carries inherent risks including but not limited to injury from physical contact, falls, collisions, or other accidents that may occur during dance activities.</p>
      
      <h3>2. Assumption of Risk</h3>
      <p>I voluntarily assume all risks associated with participation in the Tango Festival 2024, including any workshops, classes, demonstrations, and social dancing events.</p>
      
      <h3>3. Release and Waiver</h3>
      <p>I hereby release, waive, and discharge the Event Organizer, its officers, employees, volunteers, and agents from any and all liability, claims, demands, or causes of action for injury, illness, death, or property damage arising from my participation.</p>
      
      <h3>4. Medical Treatment</h3>
      <p>I authorize the Event Organizer to secure emergency medical treatment if necessary and agree to be financially responsible for any medical costs incurred.</p>
      
      <h3>5. Photography and Video</h3>
      <p>I grant permission for photographs and videos taken during the event to be used for promotional purposes without compensation.</p>
      
      <h3>6. Compliance with Rules</h3>
      <p>I agree to comply with all event rules, regulations, and instructions from organizers and instructors.</p>
    `,
    organizer: "Tango Festival Organizers",
    eventDate: new Date("2024-03-15"),
    requiredFields: ["signature", "agreement"],
  };

  const requiredItems = [
    {
      id: "read",
      label: "Read the entire document",
      completed: true,
    },
    {
      id: "understand",
      label: "Understand all terms and conditions",
      completed: agreedToTerms,
    },
    {
      id: "signature",
      label: "Provide your signature",
      completed: !!signatureData,
    },
  ];

  const completedCount = requiredItems.filter(item => item.completed).length;
  const totalCount = requiredItems.length;
  const progress = (completedCount / totalCount) * 100;

  const handleSaveSignature = (data: string, method: 'draw' | 'type' | 'upload') => {
    setSignatureData(data);
    setSignatureMethod(method);
    toast({
      title: "Signature captured",
      description: "Your signature has been saved",
    });
  };

  const handleSign = async () => {
    if (!signatureData) {
      toast({
        title: "Signature required",
        description: "Please provide your signature before continuing",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Agreement required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    await signMutation.mutateAsync();
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for declining",
        variant: "destructive",
      });
      return;
    }

    await declineMutation.mutateAsync();
  };

  const handleDownloadSigned = () => {
    toast({
      title: "Download started",
      description: "Your signed document is being downloaded",
    });
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-serif">{mockDocument.title}</h1>
        <p className="text-muted-foreground">
          From {mockDocument.organizer} • Event: {safeDateFormat(mockDocument.eventDate, "MMMM d, yyyy", "TBD")}
        </p>
        <Badge variant="secondary">{mockDocument.type}</Badge>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Signature Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{completedCount} of {totalCount} completed</span>
            <span>{Math.round(progress)}%</span>
          </div>

          <div className="space-y-2">
            {requiredItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                )}
                <span className={item.completed ? "text-foreground" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Content */}
      <Card>
        <CardHeader>
          <CardTitle>Document Content</CardTitle>
          <p className="text-sm text-muted-foreground">
            Please read the document carefully before signing
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] rounded-lg border p-6">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: mockDocument.content }}
            />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Signature Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {signatureData ? (
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Signature captured</span>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              {signatureMethod === 'type' ? (
                <p className="font-serif text-3xl">{signatureData}</p>
              ) : (
                <img src={signatureData} alt="Signature" className="max-h-24" />
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSignatureModal(true)}
                className="mt-2"
              >
                Change Signature
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setShowSignatureModal(true)}
              className="w-full"
              data-testid="button-sign-document"
            >
              <PenTool className="w-4 h-4 mr-2" />
              Add Signature
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Agreement Checkbox */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I agree to the terms and conditions
              </Label>
              <p className="text-sm text-muted-foreground">
                By checking this box, I confirm that I have read, understood, and agree to all terms and conditions outlined in this document.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setShowDeclineModal(true)}
          className="flex-1"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Decline to Sign
        </Button>
        <Button
          onClick={handleSign}
          disabled={!signatureData || !agreedToTerms || signMutation.isPending}
          className="flex-1"
        >
          {signMutation.isPending ? "Processing..." : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Review & Sign
            </>
          )}
        </Button>
      </div>

      {/* Signature Modal */}
      <Dialog open={showSignatureModal} onOpenChange={setShowSignatureModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Your Signature</DialogTitle>
            <DialogDescription>
              Choose how you'd like to sign this document
            </DialogDescription>
          </DialogHeader>
          <SignaturePad onSave={handleSaveSignature} />
        </DialogContent>
      </Dialog>

      {/* Decline Modal */}
      <Dialog open={showDeclineModal} onOpenChange={setShowDeclineModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline to Sign</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining to sign this document
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your reason..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeclineModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDecline}
              disabled={!declineReason.trim() || declineMutation.isPending}
            >
              {declineMutation.isPending ? "Processing..." : "Decline Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 rounded-full bg-green-100">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Document Signed Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              Your signature has been recorded and the document has been finalized.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm font-medium">Document Details:</p>
              <p className="text-sm text-muted-foreground">{mockDocument.title}</p>
              <p className="text-xs text-muted-foreground">
                Signed on {safeDateFormat(new Date(), "MMMM d, yyyy 'at' h:mm a", "now")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDownloadSigned}>
              <Download className="w-4 h-4 mr-2" />
              Download Copy
            </Button>
            <Button onClick={() => navigate("/legal")}>
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
