/**
 * Facebook Test Workflow
 * Guided step-by-step workflow for testing FB message sending
 * Records actions for Mr. Blue computer use learning
 */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Sparkles, 
  AlertCircle,
  Brain,
  User,
  MessageSquare,
  LogOut,
  LogIn,
  MousePointerClick
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: any;
  actionUrl?: string;
  actionLabel?: string;
  instructions: string[];
  recordingType: string;
}

const WORKFLOW_STEPS: Step[] = [
  {
    id: 1,
    title: "Login as Admin",
    description: "Login to Facebook as admin@mundotango.life",
    icon: LogIn,
    actionUrl: "https://www.facebook.com/login",
    actionLabel: "Open Facebook Login",
    instructions: [
      "Click 'Open Facebook Login' below",
      "Enter email: admin@mundotango.life",
      "Enter password (from secrets)",
      "Complete login",
      "Click 'Mark Complete' when logged in"
    ],
    recordingType: "facebook_login_admin"
  },
  {
    id: 2,
    title: "Send Message to Scott",
    description: "Navigate to Messenger and send invitation to Scott Boddye",
    icon: MessageSquare,
    actionUrl: "https://www.facebook.com/messages",
    actionLabel: "Open Messenger",
    instructions: [
      "Click 'Open Messenger' below",
      "Search for 'Scott Boddye' or 'sboddye@gmail.com'",
      "Paste the generated message (shown below)",
      "Send the message",
      "Click 'Mark Complete' after sending"
    ],
    recordingType: "facebook_send_message"
  },
  {
    id: 3,
    title: "Logout from Admin Account",
    description: "Logout from admin@mundotango.life",
    icon: LogOut,
    actionUrl: "https://www.facebook.com/",
    actionLabel: "Open Facebook",
    instructions: [
      "Click 'Open Facebook' below",
      "Click your profile icon (top right)",
      "Click 'Log Out'",
      "Wait for logout to complete",
      "Click 'Mark Complete' when logged out"
    ],
    recordingType: "facebook_logout_admin"
  },
  {
    id: 4,
    title: "Login as Scott",
    description: "Login to Facebook as sboddye@gmail.com",
    icon: User,
    actionUrl: "https://www.facebook.com/login",
    actionLabel: "Open Facebook Login",
    instructions: [
      "Click 'Open Facebook Login' below",
      "Enter email: sboddye@gmail.com",
      "Enter password (from secrets)",
      "Complete login",
      "Click 'Mark Complete' when logged in"
    ],
    recordingType: "facebook_login_scott"
  },
  {
    id: 5,
    title: "Check Message Received",
    description: "Verify Scott received the invitation message",
    icon: MessageSquare,
    actionUrl: "https://www.facebook.com/messages",
    actionLabel: "Open Messenger",
    instructions: [
      "Click 'Open Messenger' below",
      "Look for message from admin account",
      "Verify message contains the invitation",
      "Note the invite link in the message",
      "Click 'Mark Complete' after verifying"
    ],
    recordingType: "facebook_verify_message"
  },
  {
    id: 6,
    title: "Click Invite Link",
    description: "Click the invite link and verify MT onboarding",
    icon: MousePointerClick,
    actionLabel: "Check MT Onboarding",
    instructions: [
      "In the Facebook message, click the invite link",
      "Verify it opens Mundo Tango website",
      "Verify it shows the onboarding/signup page",
      "Check URL contains /invite/[code]",
      "Click 'Mark Complete' if onboarding loads"
    ],
    recordingType: "facebook_verify_onboarding"
  }
];

export default function FacebookTestWorkflow() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [testMessage, setTestMessage] = useState("");
  const [notes, setNotes] = useState("");

  const progress = (completedSteps.length / WORKFLOW_STEPS.length) * 100;

  // Generate test message mutation
  const generateMessageMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/facebook/generate-invite', {
        method: 'POST',
        body: JSON.stringify({
          friendName: 'Scott Boddye',
          friendEmail: 'sboddye@gmail.com',
          relationship: 'friend',
          sharedInterests: ['tango', 'community']
        })
      });
    },
    onSuccess: (data) => {
      setTestMessage(data.message);
      toast({
        title: "Message Generated",
        description: "Test message ready for sending",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Record step completion mutation
  const recordStepMutation = useMutation({
    mutationFn: async (data: { stepId: number; recordingType: string; notes: string }) => {
      return apiRequest('/api/facebook/record-manual-action', {
        method: 'POST',
        body: JSON.stringify({
          recipientName: 'Scott Boddye',
          recipientEmail: 'sboddye@gmail.com',
          message: testMessage || 'Test workflow step',
          actionType: data.recordingType,
          completedAt: new Date().toISOString(),
          notes: data.notes
        })
      });
    },
    onSuccess: (_, variables) => {
      setCompletedSteps([...completedSteps, variables.stepId]);
      if (variables.stepId < WORKFLOW_STEPS.length) {
        setCurrentStep(variables.stepId + 1);
      }
      setNotes("");
      toast({
        title: "Step Recorded!",
        description: "Mr. Blue has learned from this action",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Recording Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleStepComplete = (step: Step) => {
    recordStepMutation.mutate({
      stepId: step.id,
      recordingType: step.recordingType,
      notes: notes
    });
  };

  const currentStepData = WORKFLOW_STEPS.find(s => s.id === currentStep);

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl" data-testid="page-facebook-test-workflow">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="w-8 h-8 text-primary" />
          Facebook Test Workflow
        </h1>
        <p className="text-muted-foreground">
          Complete this guided workflow to test Facebook messaging and train Mr. Blue's computer use feature
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workflow Progress</CardTitle>
          <CardDescription>
            {completedSteps.length} of {WORKFLOW_STEPS.length} steps completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Learning Alert */}
      <Alert>
        <Sparkles className="w-4 h-4" />
        <AlertDescription>
          <strong>🧠 Mr. Blue is Learning:</strong> Each step you complete is recorded and stored as training data 
          for future automation using computer vision and browser control.
        </AlertDescription>
      </Alert>

      {/* Generate Message (Step 0) */}
      {!testMessage && (
        <Card>
          <CardHeader>
            <CardTitle>Step 0: Generate Test Message</CardTitle>
            <CardDescription>Generate an AI invitation message to send to Scott</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => generateMessageMutation.mutate()}
              disabled={generateMessageMutation.isPending}
              data-testid="button-generate-message"
            >
              {generateMessageMutation.isPending ? "Generating..." : "Generate Test Message"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Test Message Display */}
      {testMessage && (
        <Card>
          <CardHeader>
            <CardTitle>Test Message (Copy This)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg text-sm mb-4 max-h-40 overflow-y-auto">
              {testMessage}
            </div>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(testMessage);
                toast({ title: "Copied!", description: "Message copied to clipboard" });
              }}
              variant="outline"
              size="sm"
            >
              Copy Message
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Steps List */}
      <div className="space-y-4">
        {WORKFLOW_STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const StepIcon = step.icon;

          return (
            <Card
              key={step.id}
              className={
                isCurrent 
                  ? "border-primary shadow-md" 
                  : isCompleted 
                  ? "border-green-500" 
                  : "opacity-60"
              }
              data-testid={`step-${step.id}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : isCurrent ? (
                      <Circle className="w-6 h-6 text-primary" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <StepIcon className="w-5 h-5" />
                        {step.title}
                      </CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={isCompleted ? "default" : isCurrent ? "secondary" : "outline"}>
                    {isCompleted ? "Complete" : isCurrent ? "Current" : "Pending"}
                  </Badge>
                </div>
              </CardHeader>

              {isCurrent && (
                <CardContent className="space-y-4">
                  {/* Instructions */}
                  <div className="space-y-2">
                    <p className="font-medium">Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      {step.instructions.map((instruction, idx) => (
                        <li key={idx}>{instruction}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Action Button */}
                  {step.actionUrl && (
                    <Button
                      onClick={() => window.open(step.actionUrl, '_blank')}
                      variant="outline"
                      className="w-full"
                      data-testid={`button-action-${step.id}`}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {step.actionLabel}
                    </Button>
                  )}

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes (optional)</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any observations or issues encountered..."
                      rows={3}
                      data-testid={`textarea-notes-${step.id}`}
                    />
                  </div>

                  {/* Complete Button */}
                  <Button
                    onClick={() => handleStepComplete(step)}
                    disabled={recordStepMutation.isPending}
                    className="w-full"
                    data-testid={`button-complete-${step.id}`}
                  >
                    {recordStepMutation.isPending ? (
                      "Recording..."
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark Complete & Record
                      </>
                    )}
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Completion */}
      {completedSteps.length === WORKFLOW_STEPS.length && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              Workflow Complete!
            </CardTitle>
            <CardDescription>
              All steps recorded successfully. Mr. Blue has learned the complete Facebook messaging workflow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Brain className="w-4 h-4" />
              <AlertDescription>
                <strong>Next Steps:</strong> This training data will be used to develop automated Facebook 
                messaging using computer vision and browser automation in future iterations.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
