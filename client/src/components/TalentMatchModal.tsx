import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useTalentMatchSession } from "@/contexts/TalentMatchSessionContext";
import { 
  Upload, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle, 
  FileText, 
  Brain, 
  Target, 
  X, 
  MessageSquare,
  Loader2,
  Home
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TalentMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName?: string;
  initialEmail?: string;
}

interface UploadedDocument {
  file: File;
  text: string;
  base64Buffer: string;
  status: "pending" | "parsed" | "error";
}

const STEPS = [
  { id: "upload", label: "Upload Resume", icon: Upload },
  { id: "interview", label: "AI Interview", icon: Brain },
  { id: "complete", label: "Complete", icon: CheckCircle },
] as const;

export function TalentMatchModal({ open, onOpenChange, initialName, initialEmail }: TalentMatchModalProps) {
  const { session, createSession, updateSession, clearSession } = useTalentMatchSession();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"upload" | "interview" | "complete">("upload");
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interviewMessages, setInterviewMessages] = useState<Array<{role: "ai" | "user", content: string}>>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  useEffect(() => {
    if (open && !session && initialName && initialEmail) {
      createSession(initialName, initialEmail);
    }
  }, [open, session, initialName, initialEmail, createSession]);

  useEffect(() => {
    if (session) {
      setStep(session.step);
      if (session.linkedinUrl) {
        setLinkedinUrl(session.linkedinUrl);
      }
    }
  }, [session]);

  const currentStepIndex = STEPS.findIndex(s => s.id === step);
  const progressPercent = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    const newDocuments: UploadedDocument[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not supported. Please upload PDF, DOCX, or TXT.`,
          variant: "destructive"
        });
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 5MB limit`,
          variant: "destructive"
        });
        continue;
      }

      newDocuments.push({ file, text: "", base64Buffer: "", status: "pending" });
    }

    if (newDocuments.length > 0) {
      setUploadedDocuments(prev => [...prev, ...newDocuments]);
      
      for (const doc of newDocuments) {
        const reader = new FileReader();
        const docName = doc.file.name;
        const docSize = doc.file.size;
        const extension = docName.toLowerCase().split('.').pop();
        const isBinaryFile = extension === 'pdf' || extension === 'docx';
        
        reader.onload = (event) => {
          if (isBinaryFile) {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const uint8Array = new Uint8Array(arrayBuffer);
            let binaryString = '';
            for (let i = 0; i < uint8Array.length; i++) {
              binaryString += String.fromCharCode(uint8Array[i]);
            }
            const base64Buffer = btoa(binaryString);
            setUploadedDocuments(prev => 
              prev.map(d => (d.file.name === docName && d.file.size === docSize) 
                ? { ...d, base64Buffer, text: `[Binary - ${extension?.toUpperCase()}]`, status: "parsed" } 
                : d)
            );
          } else {
            const text = event.target?.result as string;
            setUploadedDocuments(prev => 
              prev.map(d => (d.file.name === docName && d.file.size === docSize) 
                ? { ...d, text, status: "parsed" } 
                : d)
            );
          }
        };
        
        if (isBinaryFile) {
          reader.readAsArrayBuffer(doc.file);
        } else {
          reader.readAsText(doc.file);
        }
      }
      
      updateSession({
        uploadedDocuments: [...(session?.uploadedDocuments || []), ...newDocuments.map(d => ({
          fileName: d.file.name,
          fileSize: d.file.size,
        }))]
      });

      toast({
        title: `${newDocuments.length} document(s) added`,
        description: "Your career info is being processed"
      });
    }

    e.target.value = "";
  };

  const removeDocument = (fileName: string, fileSize: number) => {
    setUploadedDocuments(prev => prev.filter(d => !(d.file.name === fileName && d.file.size === fileSize)));
    updateSession({
      uploadedDocuments: session?.uploadedDocuments?.filter(d => d.fileName !== fileName || d.fileSize !== fileSize)
    });
  };

  const startInterview = async () => {
    const hasDocuments = uploadedDocuments.length > 0 && uploadedDocuments.some(d => d.status === "parsed");
    if (!hasDocuments && !linkedinUrl) {
      toast({
        title: "Information required",
        description: "Please upload a resume or provide your LinkedIn URL",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    updateSession({ step: "interview", linkedinUrl });
    setStep("interview");
    
    setIsAiTyping(true);
    setTimeout(() => {
      setInterviewMessages([{
        role: "ai",
        content: `Hello ${session?.name || "there"}! I'm Mr. Blue, your AI interviewer. I've reviewed your background and I'm excited to learn more about you. Let's start with a quick question: What aspects of the tango community would you most like to contribute to?`
      }]);
      setIsAiTyping(false);
    }, 1500);
    
    setIsSubmitting(false);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    const userMessage = currentMessage;
    setCurrentMessage("");
    setInterviewMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsAiTyping(true);
    
    try {
      const response = await fetch("/api/mrblue/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          systemPrompt: `You are Mr. Blue, an AI interviewer for Mundo Tango's volunteer program. The candidate's name is ${session?.name || "the candidate"} and email is ${session?.email || "unknown"}. 
          
You're conducting a brief volunteer interview. Keep responses concise (2-3 sentences). Ask about:
1. Their relevant skills and experience
2. Why they want to volunteer for a tango community platform
3. How many hours per week they could commit

After 3-4 exchanges, thank them warmly and tell them their information has been submitted for review. End with "Interview complete - thank you!"`
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.message || data.response || "Thank you for sharing! Let me consider that...";
        setInterviewMessages(prev => [...prev, { role: "ai", content: aiResponse }]);
        
        if (aiResponse.toLowerCase().includes("interview complete")) {
          updateSession({ step: "complete" });
          setTimeout(() => setStep("complete"), 2000);
        }
      } else {
        setInterviewMessages(prev => [...prev, { 
          role: "ai", 
          content: "Thank you for sharing that! Your responses have been noted. Is there anything else about your skills or availability you'd like to add?" 
        }]);
      }
    } catch {
      setInterviewMessages(prev => [...prev, { 
        role: "ai", 
        content: "I appreciate your input. Let's continue - could you tell me about your availability for volunteering?" 
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const completeInterview = () => {
    updateSession({ step: "complete" });
    setStep("complete");
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const startOver = () => {
    clearSession();
    setStep("upload");
    setUploadedDocuments([]);
    setLinkedinUrl("");
    setInterviewMessages([]);
    if (initialName && initialEmail) {
      createSession(initialName, initialEmail);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-talent-match">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Talent Match
          </DialogTitle>
        </DialogHeader>

        {/* Progress Breadcrumbs */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, idx) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  idx <= currentStepIndex ? "text-primary" : "text-muted-foreground"
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    idx < currentStepIndex ? "bg-primary text-primary-foreground" :
                    idx === currentStepIndex ? "bg-primary/20 border-2 border-primary" :
                    "bg-muted"
                  }`}>
                    {idx < currentStepIndex ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <s.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 ${
                    idx < currentStepIndex ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progressPercent} className="h-1" />
        </div>

        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Share Your Experience</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your resume or share your LinkedIn so we can match you with the perfect role
                </p>
              </div>

              {/* Resume Upload */}
              <Card>
                <CardContent className="p-4">
                  <Label className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4" />
                    Resume / CV
                  </Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover-elevate cursor-pointer">
                    <input
                      type="file"
                      id="resume-upload"
                      className="hidden"
                      accept=".pdf,.docx,.txt"
                      multiple
                      onChange={handleResumeUpload}
                      data-testid="input-resume-upload"
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload PDF, DOCX, or TXT
                      </p>
                    </label>
                  </div>

                  {uploadedDocuments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedDocuments.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm truncate max-w-[200px]">{doc.file.name}</span>
                            {doc.status === "parsed" && <CheckCircle className="w-4 h-4 text-green-500" />}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeDocument(doc.file.name, doc.file.size)}
                            data-testid={`button-remove-doc-${idx}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* LinkedIn URL */}
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile (optional)</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  data-testid="input-linkedin-url"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Save & Continue Later
                </Button>
                <Button onClick={startInterview} disabled={isSubmitting} data-testid="button-start-interview">
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  Start Interview
                </Button>
              </div>
            </motion.div>
          )}

          {step === "interview" && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Chat with Mr. Blue
                </h3>
                <p className="text-sm text-muted-foreground">
                  Answer a few questions to help us find your perfect role
                </p>
              </div>

              {/* Chat Messages */}
              <div className="h-[300px] overflow-y-auto border rounded-lg p-4 space-y-4" data-testid="chat-messages">
                {interviewMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type your response..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  disabled={isAiTyping}
                  data-testid="input-chat-message"
                />
                <Button onClick={sendMessage} disabled={isAiTyping || !currentMessage.trim()} data-testid="button-send-message">
                  Send
                </Button>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => { setStep("upload"); updateSession({ step: "upload" }); }}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button variant="outline" onClick={completeInterview}>
                  Skip & Complete
                </Button>
              </div>
            </motion.div>
          )}

          {step === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Thank You, {session?.name}!</h3>
              <p className="text-muted-foreground mb-6">
                Your application has been submitted. We'll review your profile and get back to you at {session?.email}.
              </p>
              
              <Badge variant="outline" className="mb-6">
                <Sparkles className="w-3 h-3 mr-1" />
                Application Submitted
              </Badge>

              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={handleClose} data-testid="button-close-complete">
                  <Home className="w-4 h-4 mr-2" />
                  Close
                </Button>
                <Button variant="ghost" onClick={startOver}>
                  Start New Application
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
