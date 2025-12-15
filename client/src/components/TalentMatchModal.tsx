import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useTalentMatchSession, type StoredDocument } from "@/contexts/TalentMatchSessionContext";
import { 
  Upload, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle, 
  FileText, 
  Brain, 
  X, 
  MessageSquare,
  Loader2,
  Home,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TalentMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName?: string;
  initialEmail?: string;
}

const STEPS = [
  { id: "upload", label: "Upload Resume", icon: Upload },
  { id: "interview", label: "AI Interview", icon: Brain },
  { id: "complete", label: "Complete", icon: CheckCircle },
] as const;

const BACKGROUND_QUESTIONS = [
  "Tell me about your professional background and current role.",
  "What relevant skills do you have that could benefit a global tango community platform?",
  "Describe a project or achievement you're particularly proud of.",
  "How many hours per week could you realistically commit to volunteering?",
  "What is your preferred communication style and timezone availability?",
];

const PLATFORM_QUESTIONS = [
  "What aspects of Mundo Tango's mission resonate most with you?",
  "How do you envision contributing to our global tango community?",
  "What specific areas of the platform would you like to help improve or develop?",
  "How would you handle working with a diverse, international team of volunteers?",
  "What would success look like for you after 3 months of volunteering with us?",
];

export function TalentMatchModal({ open, onOpenChange, initialName, initialEmail }: TalentMatchModalProps) {
  const { session, createSession, updateSession, clearSession } = useTalentMatchSession();
  const { toast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const [step, setStep] = useState<"upload" | "interview" | "complete">("upload");
  const [storedDocs, setStoredDocs] = useState<StoredDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interviewMessages, setInterviewMessages] = useState<Array<{role: "ai" | "user", content: string}>>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);

  const allQuestions = [...BACKGROUND_QUESTIONS, ...PLATFORM_QUESTIONS];
  const totalQuestions = allQuestions.length;

  useEffect(() => {
    if (open && !session && initialName && initialEmail) {
      createSession(initialName, initialEmail);
    }
  }, [open, session, initialName, initialEmail, createSession]);

  useEffect(() => {
    if (session && !hasRestoredSession) {
      setStep(session.step);
      if (session.uploadedDocuments && session.uploadedDocuments.length > 0) {
        setStoredDocs(session.uploadedDocuments);
        if (session.step === "upload") {
          toast({
            title: "Session restored",
            description: `Found ${session.uploadedDocuments.length} previously uploaded document(s)`,
          });
        }
      }
      if (session.interviewMessages && session.interviewMessages.length > 0) {
        setInterviewMessages(session.interviewMessages);
        const userMessageCount = session.interviewMessages.filter(m => m.role === "user").length;
        setQuestionIndex(Math.min(userMessageCount, totalQuestions - 1));
      }
      setHasRestoredSession(true);
    }
  }, [session, hasRestoredSession, toast, totalQuestions]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [interviewMessages, isAiTyping]);

  const currentStepIndex = STEPS.findIndex(s => s.id === step);
  const progressPercent = ((currentStepIndex + 1) / STEPS.length) * 100;
  const interviewProgress = ((questionIndex + 1) / totalQuestions) * 100;

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    
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

      const isDuplicate = storedDocs.some(d => d.fileName === file.name && d.fileSize === file.size);
      if (isDuplicate) {
        toast({
          title: "Duplicate file",
          description: `${file.name} has already been uploaded`,
        });
        continue;
      }

      const newDoc: StoredDocument = {
        fileName: file.name,
        fileSize: file.size,
        status: "pending"
      };
      
      const updatedDocs = [...storedDocs, newDoc];
      setStoredDocs(updatedDocs);
      
      const reader = new FileReader();
      const extension = file.name.toLowerCase().split('.').pop();
      const isBinaryFile = extension === 'pdf' || extension === 'docx';
      
      reader.onload = (event) => {
        let parsedText = "";
        let base64Buffer: string | undefined;
        
        if (isBinaryFile) {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          let binaryString = '';
          for (let j = 0; j < uint8Array.length; j++) {
            binaryString += String.fromCharCode(uint8Array[j]);
          }
          base64Buffer = btoa(binaryString);
          parsedText = `[Binary - ${extension?.toUpperCase()}]`;
        } else {
          parsedText = event.target?.result as string;
        }
        
        setStoredDocs(prev => {
          const updated = prev.map(d => 
            (d.fileName === file.name && d.fileSize === file.size) 
              ? { ...d, parsedText, base64Buffer, status: "parsed" as const }
              : d
          );
          updateSession({ uploadedDocuments: updated });
          return updated;
        });
      };
      
      reader.onerror = () => {
        setStoredDocs(prev => {
          const updated = prev.map(d => 
            (d.fileName === file.name && d.fileSize === file.size) 
              ? { ...d, status: "error" as const }
              : d
          );
          updateSession({ uploadedDocuments: updated });
          return updated;
        });
      };
      
      if (isBinaryFile) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    }

    e.target.value = "";
    
    toast({
      title: "Document(s) added",
      description: "Your career info is being processed and saved"
    });
  };

  const removeDocument = (fileName: string, fileSize: number) => {
    const updated = storedDocs.filter(d => !(d.fileName === fileName && d.fileSize === fileSize));
    setStoredDocs(updated);
    updateSession({ uploadedDocuments: updated });
    toast({
      title: "Document removed",
      description: fileName
    });
  };

  const startInterview = async () => {
    const hasDocuments = storedDocs.length > 0 && storedDocs.some(d => d.status === "parsed");
    if (!hasDocuments) {
      toast({
        title: "Resume required",
        description: "Please upload your resume to continue",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    updateSession({ step: "interview" });
    setStep("interview");
    
    if (interviewMessages.length === 0) {
      setIsAiTyping(true);
      
      // Extract resume content for personalized interview
      const parsedDocs = storedDocs.filter(d => d.status === "parsed" && d.parsedText);
      const resumeContent = parsedDocs.map(d => d.parsedText).join("\n\n").substring(0, 3000);
      
      // Call Mr. Blue API to generate personalized greeting based on resume
      try {
        const response = await fetch("/api/mrblue/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            message: "Generate an interview greeting for this volunteer candidate",
            systemPrompt: `You are Mr. Blue, a friendly AI interviewer for Mundo Tango's volunteer program. 

The candidate just uploaded their resume. Here is what you learned about them:

${resumeContent}

Generate a warm, personalized greeting that:
1. Addresses them by name (${session?.name || "the candidate"})
2. Briefly acknowledges 2-3 specific things from their resume (skills, experience, or achievements)
3. Explains you'll ask 10 questions (5 background, 5 platform-specific)
4. Asks the first question: "${BACKGROUND_QUESTIONS[0]}"

Keep the greeting concise (3-4 paragraphs max). Use a friendly, professional tone.`,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          const welcomeMessage = {
            role: "ai" as const,
            content: data.message || `Hello ${session?.name}! I've reviewed your resume and I'm impressed with your background. Let's begin the interview!\n\n**Question 1 of 10 (Background):**\n${BACKGROUND_QUESTIONS[0]}`
          };
          setInterviewMessages([welcomeMessage]);
          updateSession({ interviewMessages: [welcomeMessage] });
        } else {
          throw new Error("API failed");
        }
      } catch (error) {
        // Fallback to static greeting if API fails
        const welcomeMessage = {
          role: "ai" as const,
          content: `Hello ${session?.name || "there"}! I'm Mr. Blue, and I've reviewed your resume. I'm excited to learn more about you!\n\nI'll be asking you 10 questions - 5 about your background and 5 about how you'd like to contribute to our platform.\n\nLet's begin!\n\n**Question 1 of 10 (Background):**\n${BACKGROUND_QUESTIONS[0]}`
        };
        setInterviewMessages([welcomeMessage]);
        updateSession({ interviewMessages: [welcomeMessage] });
      }
      
      setIsAiTyping(false);
      setQuestionIndex(0);
    }
    
    setIsSubmitting(false);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    const userMessage = { role: "user" as const, content: currentMessage };
    const updatedMessages = [...interviewMessages, userMessage];
    setCurrentMessage("");
    setInterviewMessages(updatedMessages);
    updateSession({ interviewMessages: updatedMessages });
    setIsAiTyping(true);
    
    const nextIndex = questionIndex + 1;
    
    // Get resume content for context
    const parsedDocs = storedDocs.filter(d => d.status === "parsed" && d.parsedText);
    const resumeContent = parsedDocs.map(d => d.parsedText).join("\n\n").substring(0, 2000);
    
    if (nextIndex >= totalQuestions) {
      // Final message - use AI to summarize
      try {
        const response = await fetch("/api/mrblue/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            message: "Generate interview completion message",
            systemPrompt: `You are Mr. Blue completing a volunteer interview for Mundo Tango.

The candidate ${session?.name} just answered all 10 questions. Their resume shows:
${resumeContent.substring(0, 1000)}

Their interview answers were:
${updatedMessages.filter(m => m.role === "user").map(m => m.content).join("\n---\n").substring(0, 1500)}

Generate a warm completion message that:
1. Thanks them by name
2. Mentions 1-2 specific strengths you noticed from their answers or resume
3. Explains next steps (team will review and get back to them)

Keep it to 2-3 paragraphs.`,
          }),
        });
        
        let completionMessage: { role: "ai", content: string };
        if (response.ok) {
          const data = await response.json();
          completionMessage = { role: "ai" as const, content: data.message };
        } else {
          completionMessage = {
            role: "ai" as const,
            content: `Thank you for completing all 10 questions, ${session?.name}! Your responses have been recorded and your application is being submitted.\n\nOur team will review your profile and get back to you soon. We appreciate your interest in volunteering with Mundo Tango!`
          };
        }
        
        const finalMessages = [...updatedMessages, completionMessage];
        setInterviewMessages(finalMessages);
        updateSession({ interviewMessages: finalMessages, step: "complete" });
        setIsAiTyping(false);
        
        await submitApplication(finalMessages);
        setTimeout(() => setStep("complete"), 2000);
      } catch {
        const completionMessage = {
          role: "ai" as const,
          content: `Thank you for completing the interview, ${session?.name}! Your application is being submitted. We'll be in touch soon!`
        };
        const finalMessages = [...updatedMessages, completionMessage];
        setInterviewMessages(finalMessages);
        updateSession({ interviewMessages: finalMessages, step: "complete" });
        setIsAiTyping(false);
        
        await submitApplication(finalMessages);
        setTimeout(() => setStep("complete"), 2000);
      }
    } else {
      // Generate contextual follow-up question
      const isBackground = nextIndex < BACKGROUND_QUESTIONS.length;
      const questionNumber = nextIndex + 1;
      const questionType = isBackground ? "Background" : "Platform";
      const nextQuestion = allQuestions[nextIndex];
      
      try {
        const response = await fetch("/api/mrblue/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            message: "Generate follow-up transition",
            systemPrompt: `You are Mr. Blue conducting a volunteer interview for Mundo Tango.

Candidate: ${session?.name}
Their resume highlights: ${resumeContent.substring(0, 800)}

They just answered: "${currentMessage}"

Generate a brief (1-2 sentences) acknowledgment of their answer, then ask:
**Question ${questionNumber} of 10 (${questionType}):**
${nextQuestion}

Be warm and specific - reference something from their answer if relevant.`,
          }),
        });
        
        let aiMessage: { role: "ai", content: string };
        if (response.ok) {
          const data = await response.json();
          aiMessage = { role: "ai" as const, content: data.message };
        } else {
          aiMessage = {
            role: "ai" as const,
            content: `Great answer! Thank you for sharing.\n\n**Question ${questionNumber} of 10 (${questionType}):**\n${nextQuestion}`
          };
        }
        
        const finalMessages = [...updatedMessages, aiMessage];
        setInterviewMessages(finalMessages);
        updateSession({ interviewMessages: finalMessages });
        setQuestionIndex(nextIndex);
        setIsAiTyping(false);
      } catch {
        const aiMessage = {
          role: "ai" as const,
          content: `Thank you for that response!\n\n**Question ${questionNumber} of 10 (${questionType}):**\n${nextQuestion}`
        };
        const finalMessages = [...updatedMessages, aiMessage];
        setInterviewMessages(finalMessages);
        updateSession({ interviewMessages: finalMessages });
        setQuestionIndex(nextIndex);
        setIsAiTyping(false);
      }
    }
  };

  const submitApplication = async (messages: Array<{role: "ai" | "user", content: string}>) => {
    setIsSubmittingApplication(true);
    try {
      const response = await fetch("/api/talent-match/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: session?.name,
          email: session?.email,
          documents: storedDocs.map(d => ({
            fileName: d.fileName,
            fileSize: d.fileSize,
            parsedText: d.parsedText?.substring(0, 50000),
          })),
          interviewMessages: messages,
        }),
      });
      
      if (response.ok) {
        toast({
          title: "Application submitted",
          description: "Your volunteer application has been received!",
        });
      }
    } catch (error) {
      console.error("[TalentMatch] Submit error:", error);
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const startOver = () => {
    clearSession();
    setStep("upload");
    setStoredDocs([]);
    setInterviewMessages([]);
    setQuestionIndex(0);
    setHasRestoredSession(false);
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
                  }`} data-testid={`step-indicator-${s.id}`}>
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
                <h3 className="text-lg font-semibold">Start Your Journey</h3>
                <p className="text-sm text-muted-foreground">
                  Share your professional background and let our AI find the perfect match for you
                </p>
              </div>

              <Card>
                <CardContent className="p-4 space-y-4">
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Upload Your Resumes
                  </Label>
                  
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                    <p className="text-sm leading-relaxed">
                      <strong>We want ALL of your resumes</strong> so we can truly understand who you are, what you have worked on, and what you want to do.
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The paper resume should die. In this AI age, why limit yourself to one page? We want you to be excited to partner with us and work on the things you really want to help the Tango community.
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT • Maximum 5MB each • Select multiple files</p>
                  
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover-elevate cursor-pointer">
                    <input
                      type="file"
                      id="resume-upload-modal"
                      className="hidden"
                      accept=".pdf,.docx,.txt"
                      multiple
                      onChange={handleResumeUpload}
                      data-testid="input-resume-upload"
                    />
                    <label htmlFor="resume-upload-modal" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                    </label>
                  </div>

                  {storedDocs.length > 0 && (
                    <div className="space-y-2">
                      {storedDocs.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/20 rounded-lg" data-testid={`doc-item-${idx}`}>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-green-500" />
                            <span className="text-sm truncate max-w-[200px]">{doc.fileName}</span>
                            {doc.status === "parsed" && <CheckCircle className="w-4 h-4 text-green-500" />}
                            {doc.status === "pending" && <Loader2 className="w-4 h-4 animate-spin" />}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeDocument(doc.fileName, doc.fileSize)}
                            data-testid={`button-remove-doc-${idx}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground">
                        {storedDocs.length} document{storedDocs.length > 1 ? 's' : ''} uploaded • Click above to add more
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose} data-testid="button-save-later">
                  Save & Continue Later
                </Button>
                <Button onClick={startInterview} disabled={isSubmitting || storedDocs.length === 0} data-testid="button-start-interview">
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Begin AI Interview
                </Button>
              </div>
              
              <p className="text-xs text-center text-muted-foreground">
                You'll chat with Mr Blue AI for a personalized interview
              </p>
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
                  Interview with Mr. Blue
                </h3>
                <p className="text-sm text-muted-foreground">
                  Question {Math.min(questionIndex + 1, totalQuestions)} of {totalQuestions}
                </p>
                <Progress value={interviewProgress} className="h-1 mt-2" />
              </div>

              <div 
                ref={chatContainerRef}
                className="h-[300px] overflow-y-auto border rounded-lg p-4 space-y-4 bg-background" 
                data-testid="chat-messages"
              >
                {interviewMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg whitespace-pre-wrap ${
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-foreground"
                    }`} data-testid={`chat-message-${idx}`}>
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

              <div className="flex gap-2">
                <textarea
                  placeholder="Type your response..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={isAiTyping || questionIndex >= totalQuestions}
                  className="flex-1 min-h-[60px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  data-testid="input-chat-message"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={isAiTyping || !currentMessage.trim() || questionIndex >= totalQuestions} 
                  data-testid="button-send-message"
                >
                  Send
                </Button>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => { setStep("upload"); updateSession({ step: "upload" }); }} data-testid="button-back-upload">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
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
                {isSubmittingApplication ? (
                  <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2" data-testid="text-thank-you">Thank You, {session?.name}!</h3>
              <p className="text-muted-foreground mb-6">
                Your volunteer application has been submitted. We'll review your profile and get back to you at {session?.email}.
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
                <Button variant="ghost" onClick={startOver} data-testid="button-start-over">
                  <RotateCcw className="w-4 h-4 mr-2" />
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
