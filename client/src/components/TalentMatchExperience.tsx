// @ts-nocheck - Disable type checking due to framer-motion v11 type incompatibilities
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import i18n from "i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle, 
  FileText, 
  Brain, 
  Zap, 
  Target, 
  X, 
  Files,
  MessageSquare,
  Loader2,
  Home,
  RotateCcw,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

// Helper function for authenticated fetch calls to Mr. Blue AI
async function authenticatedFetch(url: string, options: RequestInit): Promise<Response> {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });
}
import { useTalentMatchSession, type StoredDocument } from "@/contexts/TalentMatchSessionContext";
import { TalentMatchInterviewChat, type PhaseConfig } from "@/components/mrBlue/advanced/TalentMatchInterviewChat";

interface TalentMatchExperienceProps {
  mode: "authenticated" | "guest";
  initialName?: string;
  initialEmail?: string;
  onClose?: () => void;
  showHero?: boolean;
  showBackLink?: boolean;
  embedMode?: boolean; // When true, keeps interview in-place instead of redirecting
}

interface UploadedDocument {
  file: File;
  text: string;
  base64Buffer: string;
  status: "pending" | "parsed" | "error";
}

// Total questions per phase (5 background + 5 platform = 10 total)
const TOTAL_BACKGROUND_QUESTIONS = 5;
const TOTAL_PLATFORM_QUESTIONS = 5;
const TOTAL_QUESTIONS = TOTAL_BACKGROUND_QUESTIONS + TOTAL_PLATFORM_QUESTIONS;

// Helper to get language instruction for Mr Blue responses
const getLanguageInstruction = () => {
  const userLanguage = i18n.language || 'en';
  return userLanguage !== 'en' 
    ? `IMPORTANT: You MUST respond entirely in ${userLanguage}. Do not use English unless the user writes in English.\n\n`
    : '';
};

// Fallback questions if AI generation fails
const FALLBACK_BACKGROUND_QUESTIONS = [
  "Tell me about your professional background and current role.",
  "What relevant skills do you have that could benefit a global tango community platform?",
  "Describe a project or achievement you're particularly proud of.",
  "How many hours per week could you realistically commit to volunteering?",
  "What is your preferred communication style and timezone availability?",
];

const FALLBACK_PLATFORM_QUESTIONS = [
  "What aspects of Mundo Tango's mission resonate most with you?",
  "How do you envision contributing to our global tango community?",
  "What specific areas of the platform would you like to help improve or develop?",
  "How would you handle working with a diverse, international team of volunteers?",
  "What would success look like for you after 3 months of volunteering with us?",
];

export function TalentMatchExperience({ 
  mode, 
  initialName, 
  initialEmail, 
  onClose,
  showHero = true,
  showBackLink = true,
  embedMode = false
}: TalentMatchExperienceProps) {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { session, createSession, updateSession, clearSession } = useTalentMatchSession();
  const { toast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Ref for accessing fresh uploadedDocuments state in async functions
  const uploadedDocumentsRef = useRef<UploadedDocument[]>([]);

  // State for authenticated mode
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Keep ref in sync with state
  useEffect(() => {
    uploadedDocumentsRef.current = uploadedDocuments;
  }, [uploadedDocuments]);
  
  // State for authenticated embed mode (for interview completion submission)
  const [embedVolunteerId, setEmbedVolunteerId] = useState<number | null>(null);
  const [embedClarifierId, setEmbedClarifierId] = useState<number | null>(null);
  const [embedSubmissionFailed, setEmbedSubmissionFailed] = useState(false);
  const [pendingFinalMessages, setPendingFinalMessages] = useState<Array<{role: "ai" | "user", content: string}> | null>(null);
  const [isRetryingStored, setIsRetryingStored] = useState(false);
  
  // Ref for concurrency control - persists across renders
  const isRetryingRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Rehydrate failure state and auto-retry stored transcripts with exponential backoff
  useEffect(() => {
    if (mode !== "authenticated" || !embedMode) return;
    
    const findStoredTranscripts = () => {
      return Object.keys(localStorage).filter(k => k.startsWith("talent-match-embed-"));
    };
    
    const calculateBackoff = (attemptCount: number): number => {
      // Exponential backoff: 30s, 60s, 120s, 240s, max 5 minutes
      const baseDelay = 30000;
      const maxDelay = 300000;
      return Math.min(baseDelay * Math.pow(2, attemptCount), maxDelay);
    };
    
    const processStoredTranscripts = async () => {
      if (isRetryingRef.current) return; // Prevent concurrent retries
      
      const storedKeys = findStoredTranscripts();
      if (storedKeys.length === 0) return;
      
      isRetryingRef.current = true;
      setIsRetryingStored(true);
      
      // Process transcripts sequentially to prevent API spam
      for (const key of storedKeys) {
        try {
          const stored = JSON.parse(localStorage.getItem(key) || "{}");
          if (!stored.clarifierId || !stored.messages) continue;
          
          // Check backoff - skip if not enough time has passed
          const attemptCount = stored.attemptCount || 0;
          const lastAttempt = stored.lastAttempt ? new Date(stored.lastAttempt).getTime() : 0;
          const backoffMs = calculateBackoff(attemptCount);
          const now = Date.now();
          
          if (lastAttempt && (now - lastAttempt) < backoffMs) {
            console.log(`[TalentMatch] Skipping ${key} - backoff (${Math.round((backoffMs - (now - lastAttempt)) / 1000)}s remaining)`);
            continue;
          }
          
          // Update attempt metadata before trying
          const updatedStored = {
            ...stored,
            attemptCount: attemptCount + 1,
            lastAttempt: new Date().toISOString()
          };
          localStorage.setItem(key, JSON.stringify(updatedStored));
          
          const response = await apiRequest("PATCH", `/api/v1/volunteers/clarifier/${stored.clarifierId}`, {
            interviewMessages: stored.messages.map((m: {role: string, content: string}) => ({
              role: m.role === "ai" ? "assistant" : "user",
              content: m.content
            })),
            status: "completed",
            completedAt: stored.timestamp || new Date().toISOString()
          });
          
          if (response.ok) {
            localStorage.removeItem(key);
            console.log(`[TalentMatch] Auto-retry succeeded: ${key} (attempt ${attemptCount + 1})`);
            setEmbedSubmissionFailed(false);
            setPendingFinalMessages(null);
            setStep("complete");
            toast({
              title: "Interview submitted",
              description: "Your pending interview was successfully delivered.",
            });
          }
        } catch (e) {
          console.warn(`[TalentMatch] Retry failed for ${key}:`, e);
        }
      }
      
      isRetryingRef.current = false;
      setIsRetryingStored(false);
      
      // Schedule next check based on remaining transcripts
      const remainingKeys = findStoredTranscripts();
      if (remainingKeys.length > 0) {
        retryTimeoutRef.current = setTimeout(processStoredTranscripts, 30000);
      }
    };
    
    // Rehydrate UI state from most recent stored transcript
    const rehydrateState = () => {
      const storedKeys = findStoredTranscripts();
      if (storedKeys.length === 0) return;
      
      const mostRecentKey = storedKeys.sort().pop();
      if (mostRecentKey) {
        try {
          const stored = JSON.parse(localStorage.getItem(mostRecentKey) || "{}");
          if (stored.messages && stored.clarifierId) {
            setPendingFinalMessages(stored.messages);
            setEmbedVolunteerId(stored.volunteerId || null);
            setEmbedClarifierId(stored.clarifierId);
            setEmbedSubmissionFailed(true);
            setInterviewMessages(stored.messages);
            setStep("interview");
            console.log(`[TalentMatch] Rehydrated failed submission (attempt ${stored.attemptCount || 0})`);
          }
        } catch (e) {
          console.warn("[TalentMatch] Failed to rehydrate:", e);
        }
      }
    };
    
    // Initial rehydration and retry
    rehydrateState();
    const initialTimer = setTimeout(processStoredTranscripts, 2000);
    
    return () => {
      clearTimeout(initialTimer);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      isRetryingRef.current = false;
    };
  }, [mode, embedMode]);

  // State for guest mode intake form (name/email collection)
  const [intakeName, setIntakeName] = useState(initialName || "");
  const [intakeEmail, setIntakeEmail] = useState(initialEmail || "");
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // State for guest mode interview - add "intake" as first step for anonymous users
  const [step, setStep] = useState<"intake" | "upload" | "interview" | "complete">(
    // Start at intake if guest mode with no session and no initial credentials
    (mode === "guest" && !session && !initialName && !initialEmail && !user) ? "intake" : "upload"
  );
  const [storedDocs, setStoredDocs] = useState<StoredDocument[]>([]);
  const [interviewMessages, setInterviewMessages] = useState<Array<{role: "ai" | "user", content: string}>>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);

  const totalQuestions = TOTAL_QUESTIONS;

  // Guest mode: Initialize session when initial credentials provided
  useEffect(() => {
    if (mode === "guest" && !session && initialName && initialEmail) {
      createSession(initialName, initialEmail);
    }
  }, [mode, session, initialName, initialEmail, createSession]);

  // Guest mode: Restore session state (skip intake if session exists)
  useEffect(() => {
    if (mode === "guest" && session && !hasRestoredSession) {
      // If we have a session, skip intake and go to the stored step
      const restoredStep = session.step || "upload";
      setStep(restoredStep);
      setIntakeName(session.name || "");
      setIntakeEmail(session.email || "");
      if (session.uploadedDocuments && session.uploadedDocuments.length > 0) {
        setStoredDocs(session.uploadedDocuments);
      }
      if (session.interviewMessages && session.interviewMessages.length > 0) {
        setInterviewMessages(session.interviewMessages);
        const userMessageCount = session.interviewMessages.filter(m => m.role === "user").length;
        setQuestionIndex(Math.min(userMessageCount, totalQuestions - 1));
      }
      setHasRestoredSession(true);
    }
  }, [mode, session, hasRestoredSession, totalQuestions]);

  // Guest mode: Handle intake form submission (collect name/email)
  const handleIntakeSubmit = async () => {
    const trimmedName = intakeName.trim();
    const trimmedEmail = intakeEmail.trim().toLowerCase();
    
    if (!trimmedName) {
      toast({
        title: "Name required",
        description: "Please enter your name to continue",
        variant: "destructive"
      });
      return;
    }
    
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      toast({
        title: "Valid email required",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    setIsCreatingSession(true);
    try {
      await createSession(trimmedName, trimmedEmail);
      // Persist the step to the session so it survives page reloads
      await updateSession({ step: "upload" });
      setStep("upload");
      toast({
        title: "Welcome!",
        description: "Now let's upload your resume to get started"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [interviewMessages, isAiTyping]);

  const interviewProgress = ((questionIndex + 1) / totalQuestions) * 100;

  // Authenticated mode: handle resume upload
  const handleAuthenticatedResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    const newDocuments: UploadedDocument[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid format. Please upload PDF, DOCX, or TXT files.`,
          variant: "destructive"
        });
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive"
        });
        continue;
      }

      const isDuplicate = uploadedDocuments.some(d => d.file.name === file.name && d.file.size === file.size);
      if (isDuplicate) {
        toast({
          title: "Duplicate file",
          description: `${file.name} has already been uploaded`,
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
        
        reader.onload = async (event) => {
          if (isBinaryFile) {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const uint8Array = new Uint8Array(arrayBuffer);
            let binaryString = '';
            for (let i = 0; i < uint8Array.length; i++) {
              binaryString += String.fromCharCode(uint8Array[i]);
            }
            const base64Buffer = btoa(binaryString);
            
            // Parse binary file on server (same as guest flow)
            let parsedText = `[Binary file - ${extension?.toUpperCase()}]`;
            try {
              const parseResponse = await fetch("/api/talent-match/parse-resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  filename: docName,
                  fileBuffer: base64Buffer,
                }),
              });
              
              if (parseResponse.ok) {
                const parseResult = await parseResponse.json();
                parsedText = parseResult.parsedText || parsedText;
                console.log(`[TalentMatch] Parsed ${docName}: ${parsedText.length} chars`);
              }
            } catch (parseError) {
              console.error("[TalentMatch] Parse request failed:", parseError);
            }
            
            // Check if parsing actually succeeded (not just placeholder text)
            const parsingFailed = !parsedText || parsedText.startsWith("[Binary file") || parsedText.length < 20;
            
            setUploadedDocuments(prev => 
              prev.map(d => (d.file.name === docName && d.file.size === docSize) 
                ? { ...d, base64Buffer, text: parsedText, status: parsingFailed ? "error" : "parsed" } 
                : d)
            );
            
            // Show warning if parsing failed
            if (parsingFailed) {
              toast({
                title: "PDF parsing issue",
                description: `Could not extract text from ${docName}. Try a TXT or DOCX file instead.`,
                variant: "destructive"
              });
            }
          } else {
            const text = event.target?.result as string;
            setUploadedDocuments(prev => 
              prev.map(d => (d.file.name === docName && d.file.size === docSize) 
                ? { ...d, text, base64Buffer: "", status: "parsed" } 
                : d)
            );
          }
        };
        reader.onerror = () => {
          setUploadedDocuments(prev => 
            prev.map(d => (d.file.name === docName && d.file.size === docSize) ? { ...d, status: "error" } : d)
          );
        };
        
        if (isBinaryFile) {
          reader.readAsArrayBuffer(doc.file);
        } else {
          reader.readAsText(doc.file);
        }
      }

      toast({
        title: `${newDocuments.length} document${newDocuments.length > 1 ? 's' : ''} added`,
        description: "Your career history is being processed"
      });
    }

    e.target.value = "";
  };

  // Guest mode: handle resume upload
  const handleGuestResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      reader.onload = async (event) => {
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
          
          // Call server to parse PDF/DOCX (same as authenticated flow)
          try {
            const parseResponse = await fetch("/api/talent-match/parse-resume", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                filename: file.name,
                fileBuffer: base64Buffer,
              }),
            });
            
            if (parseResponse.ok) {
              const parseResult = await parseResponse.json();
              parsedText = parseResult.parsedText || "";
              console.log(`[TalentMatch] Parsed ${file.name}: ${parsedText.length} chars`);
            } else {
              console.error("[TalentMatch] Server parse failed, using placeholder");
              parsedText = `[Binary - ${extension?.toUpperCase()}]`;
            }
          } catch (parseError) {
            console.error("[TalentMatch] Parse request failed:", parseError);
            parsedText = `[Binary - ${extension?.toUpperCase()}]`;
          }
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

  const removeAuthenticatedDocument = (fileName: string, fileSize: number) => {
    setUploadedDocuments(prev => prev.filter(d => !(d.file.name === fileName && d.file.size === fileSize)));
    toast({ title: "Document removed", description: fileName });
  };

  const removeGuestDocument = (fileName: string, fileSize: number) => {
    const updated = storedDocs.filter(d => !(d.fileName === fileName && d.fileSize === fileSize));
    setStoredDocs(updated);
    updateSession({ uploadedDocuments: updated });
    toast({ title: "Document removed", description: fileName });
  };

  // Authenticated mode: start clarifier
  const handleStartClarifier = async () => {
    const hasDocuments = uploadedDocuments.length > 0 && uploadedDocuments.some(d => d.status === "parsed");
    if (!hasDocuments) {
      toast({
        title: "Resume required",
        description: "Please upload at least one resume to continue",
        variant: "destructive"
      });
      return;
    }

    if (authLoading) {
      toast({ title: "Please wait", description: "Verifying authentication..." });
      return;
    }

    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to continue with talent matching",
        variant: "destructive"
      });
      setLocation("/login");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const volunteerResponse = await apiRequest("POST", "/api/v1/volunteers", {
        userId: user.id,
        profile: {
          hasDocuments: uploadedDocuments.length > 0,
          uploadedFileNames: uploadedDocuments.map(d => d.file.name)
        },
        skills: [],
        availability: "flexible",
        hoursPerWeek: 10
      });
      const volunteer = await volunteerResponse.json();

      for (const doc of uploadedDocuments) {
        const extension = doc.file.name.toLowerCase().split('.').pop();
        const isBinaryFile = extension === 'pdf' || extension === 'docx';
        
        // Always send parsedText if we have it - frontend already parsed the file
        // Also send fileBuffer for binary files as fallback for server-side parsing
        await apiRequest("POST", `/api/v1/volunteers/${volunteer.id}/resume`, {
          filename: doc.file.name,
          fileUrl: "",
          fileBuffer: isBinaryFile ? doc.base64Buffer : undefined,
          parsedText: doc.text || undefined,
          links: []
        });
      }

      const sessionResponse = await apiRequest("POST", `/api/v1/volunteers/${volunteer.id}/clarifier`);
      const clarifierSession = await sessionResponse.json();

      // In embed mode, use in-place interview (like guest flow) instead of redirecting
      if (embedMode) {
        // Store IDs for interview completion submission
        setEmbedVolunteerId(volunteer.id);
        setEmbedClarifierId(clarifierSession.id);
        
        // Wait for all documents to be fully parsed (not placeholder text)
        // Use ref to access fresh state in async context
        const waitForParsing = async (maxWaitMs = 10000): Promise<boolean> => {
          const startTime = Date.now();
          const checkInterval = 500;
          
          while (Date.now() - startTime < maxWaitMs) {
            const freshDocs = uploadedDocumentsRef.current;
            const allParsed = freshDocs.every(d => 
              d.status === "parsed" && d.text && !d.text.startsWith("[Binary file")
            );
            
            if (allParsed) return true;
            await new Promise(resolve => setTimeout(resolve, checkInterval));
          }
          
          // After timeout, check one more time
          const freshDocs = uploadedDocumentsRef.current;
          return freshDocs.every(d => 
            d.status === "parsed" && d.text && !d.text.startsWith("[Binary file")
          );
        };
        
        const parsingComplete = await waitForParsing();
        
        if (!parsingComplete) {
          // Hard block: Don't proceed without parsed resume content
          // Check what the actual issue is
          const freshDocs = uploadedDocumentsRef.current;
          const hasErrors = freshDocs.some(d => d.status === "error");
          const hasPending = freshDocs.some(d => d.status === "pending");
          
          toast({
            title: hasErrors ? "Resume parsing failed" : hasPending ? "Resume still processing" : "Resume processing incomplete",
            description: hasErrors 
              ? "Your PDF could not be read. Please try uploading a TXT or DOCX file instead, or a different PDF."
              : hasPending 
              ? "Please wait a moment for your documents to finish processing."
              : "Please wait for your documents to finish processing or try re-uploading.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        
        toast({
          title: "Profile created!",
          description: "Starting your AI interview now.",
        });
        
        // Get fresh documents from ref (not stale closure)
        const freshDocuments = uploadedDocumentsRef.current;
        
        // Convert authenticated docs to storedDocs format for the interview
        const convertedDocs: StoredDocument[] = freshDocuments.map(d => ({
          fileName: d.file.name,
          fileSize: d.file.size,
          parsedText: d.text,
          base64Buffer: d.base64Buffer,
          status: d.status
        }));
        setStoredDocs(convertedDocs);
        setStep("interview");
        
        // Start interview with AI greeting (use freshDocuments for parsed content)
        setIsAiTyping(true);
        const resumeContent = freshDocuments
          .filter(d => d.status === "parsed" && d.text && !d.text.startsWith("[Binary file"))
          .map(d => d.text)
          .join("\n\n")
          .substring(0, 3000);
        const candidateName = user?.name || initialName || "there";
        
        try {
          // DEBUG: Log the resume content length being sent
          console.log(`[TalentMatch] Sending interview request with ${resumeContent.length} chars of resume content`);
          
          const response = await authenticatedFetch("/api/mrblue/chat", {
            method: "POST",
            body: JSON.stringify({
              message: "Generate resume question 1",
              systemPrompt: `${getLanguageInstruction()}You are Mr. Blue, the AI interviewer for Mundo Tango's volunteer program. You're conducting Phase 1: Background Deep-Dive.

IMPORTANT: You MUST read the following resume content carefully and ask questions that DIRECTLY REFERENCE specific details from it. Do NOT ask generic background questions - reference their actual experience, companies, projects, or skills.

The volunteer ${candidateName} has uploaded this resume/profile:
${resumeContent}

Question 1 of ${TOTAL_BACKGROUND_QUESTIONS}.

Your goal: Start with a warm greeting that mentions 1-2 SPECIFIC things from their resume (company names, project titles, technologies, achievements), then ask ONE specific, insightful question about something concrete from their background.

Be conversational and warm. You MUST reference specific details from their resume.
Format: Start with a personalized greeting, then ask your question clearly marked as **Question 1 of 10 (Background):**

Keep the entire response concise (2-3 paragraphs max).`,
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            const welcomeMessage = {
              role: "ai" as const,
              content: data.message || data.response || `Hello ${candidateName}! I've reviewed your resume and I'm impressed. Let's begin!\n\n**Question 1 of 10 (Background):**\n${FALLBACK_BACKGROUND_QUESTIONS[0]}`
            };
            setInterviewMessages([welcomeMessage]);
          } else {
            throw new Error("API failed");
          }
        } catch {
          const welcomeMessage = {
            role: "ai" as const,
            content: `Hello ${candidateName}! I'm Mr. Blue, and I've reviewed your resume. I'm excited to learn more about you!\n\n**Question 1 of 10 (Background):**\n${FALLBACK_BACKGROUND_QUESTIONS[0]}`
          };
          setInterviewMessages([welcomeMessage]);
        }
        
        setIsAiTyping(false);
        setQuestionIndex(0);
      } else {
        toast({
          title: "Profile created!",
          description: "Starting AI interview. After completion, visit H2AC Dashboard for your agent assignments.",
        });

        setLocation(`/talent-match-interview?session=${clarifierSession.id}&volunteer=${volunteer.id}&returnTo=/h2ac-dashboard`);
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create volunteer profile",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guest mode: start interview
  const startGuestInterview = async () => {
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
      
      const parsedDocs = storedDocs.filter(d => d.status === "parsed" && d.parsedText);
      const resumeContent = parsedDocs.map(d => d.parsedText).join("\n\n").substring(0, 3000);
      const candidateName = session?.name || initialName || "there";
      
      // MB.MD Debug: Log resume content for guest interview
      console.log(`[TalentMatch Guest] Starting interview:`, {
        parsedDocsCount: parsedDocs.length,
        resumeContentLength: resumeContent.length,
        candidateName,
        hasResumeContent: resumeContent.length > 50
      });
      
      // MB.MD Fix: Determine which resume context to send
      let resumeToUse = "";
      if (mode === "authenticated") {
        resumeToUse = uploadedDocumentsRef.current.map(d => d.text).join("\n\n");
      } else {
        resumeToUse = storedDocs.map(d => d.parsedText).join("\n\n");
      }
      const currentResumeContent = resumeToUse || "";

      try {
        // Generate AI-driven first question based on resume (same as authenticated flow)
        const response = await authenticatedFetch("/api/mrblue/chat", {
          method: "POST",
          body: JSON.stringify({
            message: "Generate resume question 1",
            systemPrompt: `${getLanguageInstruction()}You are Mr. Blue, the AI interviewer for Mundo Tango's volunteer program. You're conducting Phase 1: Background Deep-Dive.

IMPORTANT: You MUST read the following resume content carefully and ask questions that DIRECTLY REFERENCE specific details from it. Do NOT ask generic background questions - reference their actual companies, project names, technologies, or achievements by name.

The volunteer ${candidateName} has uploaded this resume/profile:
${currentResumeContent.substring(0, 4000)}

Question 1 of ${TOTAL_BACKGROUND_QUESTIONS}.

Your goal: Start with a warm greeting that mentions 1-2 SPECIFIC things from their resume (company names, project titles, technologies, achievements), then ask ONE specific, insightful question about something concrete from their background.

Be conversational and warm. You MUST reference specific details from their resume.
Format: Start with a personalized greeting (mention their name and 1-2 specific things from their resume), then ask your question clearly marked as **Question 1 of 10 (Background):**

Keep the entire response concise (2-3 paragraphs max).`,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          const welcomeMessage = {
            role: "ai" as const,
            content: data.message || data.response || `Hello ${candidateName}! I've reviewed your resume and I'm impressed with your background. Let's begin the interview!\n\n**Question 1 of 10 (Background):**\n${FALLBACK_BACKGROUND_QUESTIONS[0]}`
          };
          setInterviewMessages([welcomeMessage]);
          updateSession({ interviewMessages: [welcomeMessage] });
        } else {
          throw new Error("API failed");
        }
      } catch {
        const welcomeMessage = {
          role: "ai" as const,
          content: `Hello ${candidateName}! I'm Mr. Blue, and I've reviewed your resume. I'm excited to learn more about you!\n\nI'll be asking you 10 questions - 5 about your background and 5 about how you'd like to contribute to our platform.\n\n**Question 1 of 10 (Background):**\n${FALLBACK_BACKGROUND_QUESTIONS[0]}`
        };
        setInterviewMessages([welcomeMessage]);
        updateSession({ interviewMessages: [welcomeMessage] });
      }
      
      setIsAiTyping(false);
      setQuestionIndex(0);
    }
    
    setIsSubmitting(false);
  };

  // Interview message handler (works for both guest and authenticated embed modes)
  const sendInterviewMessage = async () => {
    if (!currentMessage.trim()) return;
    
    const userMessage = { role: "user" as const, content: currentMessage };
    const updatedMessages = [...interviewMessages, userMessage];
    setCurrentMessage("");
    setInterviewMessages(updatedMessages);
    
    // Only update session for guest mode (authenticated embed mode doesn't use guest session)
    if (mode === "guest") {
      updateSession({ interviewMessages: updatedMessages });
    }
    setIsAiTyping(true);
    
    const nextIndex = questionIndex + 1;
    const parsedDocs = storedDocs.filter(d => d.status === "parsed" && d.parsedText);
    const resumeContent = parsedDocs.map(d => d.parsedText).join("\n\n").substring(0, 2000);
    
    // MB.MD Debug: Log resume content for follow-up questions
    console.log(`[TalentMatch Interview] Question ${nextIndex}:`, {
      parsedDocsCount: parsedDocs.length,
      resumeContentLength: resumeContent.length,
      hasResumeContent: resumeContent.length > 50,
      mode
    });
    
    // Get candidate name from user (authenticated) or session (guest)
    const candidateName = user?.name || session?.name || initialName || "there";
    const candidateEmail = user?.email || session?.email || initialEmail || "";
    
      // MB.MD Fix: Determine which resume context to send
      let resumeToUse = "";
      if (mode === "authenticated") {
        resumeToUse = uploadedDocumentsRef.current.map(d => d.text).join("\n\n");
      } else {
        resumeToUse = storedDocs.map(d => d.parsedText).join("\n\n");
      }
      const currentResumeContent = resumeToUse || "";

      if (nextIndex >= totalQuestions) {
        try {
          const response = await authenticatedFetch("/api/mrblue/chat", {
            method: "POST",
            body: JSON.stringify({
              message: "Generate interview completion message",
              systemPrompt: `${getLanguageInstruction()}You are Mr. Blue completing a volunteer interview for Mundo Tango.

The candidate ${candidateName} just answered all 10 questions. Their resume shows:
${currentResumeContent.substring(0, 4000)}

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
            content: `Thank you for completing all 10 questions, ${candidateName}! Your responses have been recorded and your application is being submitted.\n\nOur team will review your profile and get back to you soon. We appreciate your interest in volunteering with Mundo Tango!`
          };
        }
        
        const finalMessages = [...updatedMessages, completionMessage];
        setInterviewMessages(finalMessages);
        if (mode === "guest") {
          updateSession({ interviewMessages: finalMessages, step: "complete" });
        }
        setIsAiTyping(false);
        
        // Submit application (guest uses submitGuestApplication, authenticated embed submits to clarifier)
        let submissionSucceeded = true;
        if (mode === "guest") {
          await submitGuestApplication(finalMessages);
        } else if (mode === "authenticated" && embedMode) {
          submissionSucceeded = await submitEmbedInterview(finalMessages);
          if (!submissionSucceeded) {
            // Track failed submission for retry UI
            setEmbedSubmissionFailed(true);
            setPendingFinalMessages(finalMessages);
          }
        }
        
        // Only proceed to complete step if submission succeeded (or guest mode)
        if (submissionSucceeded || mode === "guest") {
          setEmbedSubmissionFailed(false);
          setPendingFinalMessages(null);
          setTimeout(() => setStep("complete"), 2000);
        }
        // If submission failed for authenticated embed, stay on interview step with retry UI
      } catch {
        const completionMessage = {
          role: "ai" as const,
          content: `Thank you for completing the interview, ${candidateName}! Your application is being submitted. We'll be in touch soon!`
        };
        const finalMessages = [...updatedMessages, completionMessage];
        setInterviewMessages(finalMessages);
        if (mode === "guest") {
          updateSession({ interviewMessages: finalMessages, step: "complete" });
        }
        setIsAiTyping(false);
        
        let submissionSucceeded = true;
        if (mode === "guest") {
          await submitGuestApplication(finalMessages);
        } else if (mode === "authenticated" && embedMode) {
          submissionSucceeded = await submitEmbedInterview(finalMessages);
          if (!submissionSucceeded) {
            setEmbedSubmissionFailed(true);
            setPendingFinalMessages(finalMessages);
          }
        }
        
        if (submissionSucceeded || mode === "guest") {
          setEmbedSubmissionFailed(false);
          setPendingFinalMessages(null);
          setTimeout(() => setStep("complete"), 2000);
        }
      }
    } else {
      const isBackground = nextIndex < TOTAL_BACKGROUND_QUESTIONS;
      const questionNumber = nextIndex + 1;
      const questionType = isBackground ? "Background" : "Platform";
      
      // Gather previous answers for context
      const previousAnswers = updatedMessages
        .filter(m => m.role === "user")
        .map(m => m.content)
        .slice(-3);
      
      // Generate AI-driven question based on resume and previous answers (same as authenticated flow)
      let systemPrompt: string;
      
      // MB.MD Fix: Determine which resume context to send
      let resumeToUse = "";
      if (mode === "authenticated") {
        resumeToUse = uploadedDocumentsRef.current.map(d => d.text).join("\n\n");
      } else {
        resumeToUse = storedDocs.map(d => d.parsedText).join("\n\n");
      }
      const currentResumeContent = resumeToUse || "";

      if (isBackground) {
        systemPrompt = `${getLanguageInstruction()}You are Mr. Blue, the AI interviewer for Mundo Tango's volunteer program. You're conducting Phase 1: Background Deep-Dive.

IMPORTANT: You MUST read the following resume content carefully and ask questions that DIRECTLY REFERENCE specific details from it. Do NOT ask generic background questions if specific details are available.

The volunteer ${candidateName} has uploaded this resume/profile:
${currentResumeContent.substring(0, 4000)}

Previous answers in this interview: ${previousAnswers.join(" | ")}

They just answered: "${currentMessage}"

Question ${questionNumber} of ${TOTAL_BACKGROUND_QUESTIONS} in Background phase.

Your goal: First briefly acknowledge their answer (1 sentence), then ask ONE specific, insightful question about a specific experience, skill, or project found in their resume to understand:
- Specific technical implementations they worked on
- Their actual role in projects mentioned
- Technologies they used in specific contexts
- How their specific past experience relates to Mundo Tango's mission

Be conversational and warm. Reference specific details from their resume and previous answers.
Format your question clearly as **Question ${questionNumber} of 10 (Background):**
Keep the entire response concise (2-3 sentences max).`;
      } else {
        systemPrompt = `${getLanguageInstruction()}You are Mr. Blue, the AI interviewer for Mundo Tango's volunteer program. You're conducting Phase 2: Platform Contribution Matching.

Based on the interview so far, here's what we learned about ${candidateName}:
Resume highlights: ${currentResumeContent.substring(0, 1500)}
Previous answers: ${previousAnswers.join(" | ")}

They just answered: "${currentMessage}"

Question ${questionNumber - TOTAL_BACKGROUND_QUESTIONS} of ${TOTAL_PLATFORM_QUESTIONS} in Platform phase.

Mundo Tango needs help with:
- Frontend development (React, TypeScript, Tailwind)
- Backend development (Node.js, Express, PostgreSQL)
- AI/ML integration (OpenAI, Anthropic, Groq)
- Event scraping and data collection
- Community management and moderation
- Documentation and technical writing
- UX/UI design and user research
- Testing and QA automation
- DevOps and infrastructure

Your goal: First briefly acknowledge their answer (1 sentence), then ask ONE question to understand:
- What type of work excites them most
- How much time they can commit
- Their preferred team dynamics
- Specific Mundo Tango features they'd like to work on

Be specific about Mundo Tango's needs. Format your question clearly as **Question ${questionNumber} of 10 (Platform):**
Keep the entire response concise (2-3 sentences max).`;
      }
      
      try {
        const response = await authenticatedFetch("/api/mrblue/chat", {
          method: "POST",
          body: JSON.stringify({
            message: `Generate ${isBackground ? "background" : "platform"} question ${questionNumber}`,
            systemPrompt,
          }),
        });
        
        let aiMessage: { role: "ai", content: string };
        if (response.ok) {
          const data = await response.json();
          aiMessage = { role: "ai" as const, content: data.message || data.response };
        } else {
          // Fallback to static questions if API fails
          const fallbackQuestion = isBackground 
            ? FALLBACK_BACKGROUND_QUESTIONS[Math.min(nextIndex, FALLBACK_BACKGROUND_QUESTIONS.length - 1)]
            : FALLBACK_PLATFORM_QUESTIONS[Math.min(nextIndex - TOTAL_BACKGROUND_QUESTIONS, FALLBACK_PLATFORM_QUESTIONS.length - 1)];
          aiMessage = {
            role: "ai" as const,
            content: `Great answer! Thank you for sharing.\n\n**Question ${questionNumber} of 10 (${questionType}):**\n${fallbackQuestion}`
          };
        }
        
        const finalMessages = [...updatedMessages, aiMessage];
        setInterviewMessages(finalMessages);
        if (mode === "guest") {
          updateSession({ interviewMessages: finalMessages });
        }
        setQuestionIndex(nextIndex);
        setIsAiTyping(false);
      } catch {
        // Fallback to static questions if API fails
        const fallbackQuestion = isBackground 
          ? FALLBACK_BACKGROUND_QUESTIONS[Math.min(nextIndex, FALLBACK_BACKGROUND_QUESTIONS.length - 1)]
          : FALLBACK_PLATFORM_QUESTIONS[Math.min(nextIndex - TOTAL_BACKGROUND_QUESTIONS, FALLBACK_PLATFORM_QUESTIONS.length - 1)];
        const aiMessage = {
          role: "ai" as const,
          content: `Thank you for that response!\n\n**Question ${questionNumber} of 10 (${questionType}):**\n${fallbackQuestion}`
        };
        const finalMessages = [...updatedMessages, aiMessage];
        setInterviewMessages(finalMessages);
        if (mode === "guest") {
          updateSession({ interviewMessages: finalMessages });
        }
        setQuestionIndex(nextIndex);
        setIsAiTyping(false);
      }
    }
  };

  const submitGuestApplication = async (messages: Array<{role: "ai" | "user", content: string}>) => {
    setIsSubmittingApplication(true);
    try {
      const response = await fetch("/api/talent-match/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: session?.name || initialName,
          email: session?.email || initialEmail,
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

  // Submit interview completion for authenticated embed mode
  // Returns true if submission succeeded, false if failed (so caller can block completion)
  const submitEmbedInterview = async (messages: Array<{role: "ai" | "user", content: string}>, retryCount = 0): Promise<boolean> => {
    // Always persist to localStorage first for durability
    const persistKey = `talent-match-embed-${embedVolunteerId || 'unknown'}-${Date.now()}`;
    try {
      localStorage.setItem(persistKey, JSON.stringify({
        volunteerId: embedVolunteerId,
        clarifierId: embedClarifierId,
        messages,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      console.warn("[TalentMatch] Failed to persist to localStorage:", e);
    }
    
    if (!embedVolunteerId || !embedClarifierId) {
      console.error("[TalentMatch] Missing volunteer or clarifier ID for submission");
      toast({
        title: "Submission issue",
        description: "Interview saved locally. Please contact support if your application doesn't appear.",
        variant: "destructive"
      });
      return false;
    }
    
    setIsSubmittingApplication(true);
    try {
      // Submit interview answers to the clarifier session
      const response = await apiRequest("PATCH", `/api/v1/volunteers/clarifier/${embedClarifierId}`, {
        interviewMessages: messages.map(m => ({
          role: m.role === "ai" ? "assistant" : "user",
          content: m.content
        })),
        status: "completed",
        completedAt: new Date().toISOString()
      });
      
      if (response.ok) {
        // Clear localStorage on successful submission
        try {
          localStorage.removeItem(persistKey);
        } catch (e) {
          console.warn("[TalentMatch] Failed to clear localStorage:", e);
        }
        toast({
          title: "Interview completed",
          description: "Your answers have been submitted for review!",
        });
        return true;
      } else if (retryCount < 2) {
        // Retry on failure (up to 2 retries)
        console.warn(`[TalentMatch] Submission failed, retrying (${retryCount + 1}/2)...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return submitEmbedInterview(messages, retryCount + 1);
      } else {
        throw new Error("Failed after retries");
      }
    } catch (error) {
      console.error("[TalentMatch] Embed interview submit error:", error);
      toast({
        title: "Submission failed",
        description: "Your responses were saved locally. Please try again or contact support.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  // Retry submission for failed embed interviews
  const retryEmbedSubmission = async () => {
    if (!pendingFinalMessages) {
      toast({
        title: "Nothing to retry",
        description: "No pending submission found.",
      });
      return;
    }
    
    const success = await submitEmbedInterview(pendingFinalMessages);
    if (success) {
      setEmbedSubmissionFailed(false);
      setPendingFinalMessages(null);
      setStep("complete");
    }
    // If still failed, state remains for another retry attempt
  };

  const startOver = () => {
    clearSession();
    setStoredDocs([]);
    setInterviewMessages([]);
    setQuestionIndex(0);
    setHasRestoredSession(false);
    setIntakeName("");
    setIntakeEmail("");
    // If no initial credentials provided, go back to intake; otherwise upload
    if (initialName && initialEmail) {
      setStep("upload");
      createSession(initialName, initialEmail);
    } else {
      setStep("intake");
    }
  };

  // Loading state for authenticated mode
  if (mode === "authenticated" && authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Guest mode: Intake step (collect name/email for anonymous visitors)
  if (mode === "guest" && step === "intake") {
    return (
      <div className="space-y-8">
        {showHero && (
          <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
            
            <div className="relative z-10 h-full flex items-center justify-center px-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-center max-w-4xl"
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  <Brain className="w-3 h-3 mr-1" />
                  AI-Powered Volunteer Matching
                </Badge>

                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 tracking-tight leading-tight">
                  Join Our Team
                </h1>

                <p className="text-lg md:text-xl text-white/90 mb-4 max-w-2xl mx-auto leading-relaxed">
                  Help build the platform connecting the global tango community
                </p>
              </motion.div>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-serif font-bold mb-2" data-testid="heading-intake">
                  Let's Get Started
                </h2>
                <p className="text-muted-foreground text-sm">
                  Tell us a bit about yourself to begin the volunteer application
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="intake-name">Your Name</Label>
                  <Input
                    id="intake-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={intakeName}
                    onChange={(e) => setIntakeName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleIntakeSubmit()}
                    disabled={isCreatingSession}
                    data-testid="input-intake-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intake-email">Email Address</Label>
                  <Input
                    id="intake-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={intakeEmail}
                    onChange={(e) => setIntakeEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleIntakeSubmit()}
                    disabled={isCreatingSession}
                    data-testid="input-intake-email"
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll use this to send you updates about your application
                  </p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleIntakeSubmit}
                disabled={isCreatingSession || !intakeName.trim() || !intakeEmail.trim()}
                data-testid="button-continue-intake"
              >
                {isCreatingSession ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              {showBackLink && (
                <div className="text-center">
                  <Link href="/volunteer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Learn more about volunteering
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Interview step (guest mode OR authenticated embed mode)
  if ((mode === "guest" || (mode === "authenticated" && embedMode)) && step === "interview") {
    const isBackgroundPhase = questionIndex < TOTAL_BACKGROUND_QUESTIONS;
    const backgroundProgress = Math.min(questionIndex, TOTAL_BACKGROUND_QUESTIONS);
    const platformProgress = Math.max(0, questionIndex - TOTAL_BACKGROUND_QUESTIONS);
    
    const guestPhases: PhaseConfig[] = [
      {
        name: "background",
        label: "Background",
        current: backgroundProgress,
        total: TOTAL_BACKGROUND_QUESTIONS,
        isActive: isBackgroundPhase,
        isComplete: backgroundProgress >= TOTAL_BACKGROUND_QUESTIONS
      },
      {
        name: "platform",
        label: "Platform",
        current: platformProgress,
        total: TOTAL_PLATFORM_QUESTIONS,
        isActive: !isBackgroundPhase && questionIndex < totalQuestions,
        isComplete: platformProgress >= TOTAL_PLATFORM_QUESTIONS
      }
    ];

    const backButton = (
      <Button variant="ghost" size="sm" onClick={() => { setStep("upload"); updateSession({ step: "upload" }); }} data-testid="button-back-upload">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Upload
      </Button>
    );

    return (
      <div className="h-[600px] flex flex-col">
        {/* Retry banner for failed embed submissions */}
        {embedSubmissionFailed && pendingFinalMessages && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium text-destructive">Submission Failed</p>
              <p className="text-sm text-muted-foreground">Your interview responses were saved locally. Please retry to submit them.</p>
            </div>
            <Button 
              onClick={retryEmbedSubmission} 
              disabled={isSubmittingApplication}
              variant="destructive"
              size="sm"
              data-testid="button-retry-submission"
            >
              {isSubmittingApplication ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry Submission
                </>
              )}
            </Button>
          </div>
        )}
        <div className="flex-1">
          <TalentMatchInterviewChat
            messages={interviewMessages.map((msg, idx) => ({
              id: String(idx),
              role: msg.role === "ai" ? "assistant" : "user",
              content: msg.content
            }))}
            isLoading={isAiTyping}
            isComplete={questionIndex >= totalQuestions}
            input={currentMessage}
            onInputChange={setCurrentMessage}
            onSend={sendInterviewMessage}
            progress={interviewProgress}
            phases={guestPhases}
            currentPhaseLabel={isBackgroundPhase ? "Phase 1: Background" : "Phase 2: Platform Skills"}
            questionDescription={`Question ${Math.min(questionIndex + 1, totalQuestions)} of ${totalQuestions}`}
            showTimestamps={false}
            backButton={backButton}
            useScrollArea={false}
            useTextarea={true}
            inputPlaceholder="Type your response..."
          />
        </div>
      </div>
    );
  }

  // Complete step (guest mode OR authenticated embed mode)
  if ((mode === "guest" || (mode === "authenticated" && embedMode)) && step === "complete") {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          {isSubmittingApplication ? (
            <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
          ) : (
            <CheckCircle className="w-10 h-10 text-green-500" />
          )}
        </div>
        <h2 className="text-3xl font-serif font-bold mb-3" data-testid="text-thank-you">
          Thank You, {user?.name || session?.name || initialName}!
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Your volunteer application has been submitted. We'll review your profile and get back to you at {user?.email || session?.email || initialEmail}.
        </p>
        
        <Badge variant="outline" className="mb-8">
          <Sparkles className="w-3 h-3 mr-1" />
          Application Submitted
        </Badge>

        <div className="flex justify-center gap-3">
          {onClose && (
            <Button variant="outline" onClick={onClose} data-testid="button-close-complete">
              <Home className="w-4 h-4 mr-2" />
              Close
            </Button>
          )}
          <Button variant="ghost" onClick={startOver} data-testid="button-start-over">
            <RotateCcw className="w-4 h-4 mr-2" />
            Start New Application
          </Button>
        </div>
      </div>
    );
  }

  // Main upload view (both modes)
  const docs = mode === "authenticated" ? uploadedDocuments : storedDocs;
  const handleUpload = mode === "authenticated" ? handleAuthenticatedResumeUpload : handleGuestResumeUpload;
  const handleRemove = mode === "authenticated" 
    ? (name: string, size: number) => removeAuthenticatedDocument(name, size)
    : (name: string, size: number) => removeGuestDocument(name, size);
  const handleSubmit = mode === "authenticated" ? handleStartClarifier : startGuestInterview;
  const hasDocuments = docs.length > 0;
  const hasParsedDocuments = mode === "authenticated" 
    ? uploadedDocuments.some(d => d.status === "parsed")
    : storedDocs.some(d => d.status === "parsed");

  return (
    <div className="space-y-8">
      {/* Hero Section - only show if enabled */}
      {showHero && (
        <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
          
          <div className="relative z-10 h-full flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-center max-w-4xl"
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-ai-powered">
                <Brain className="w-3 h-3 mr-1" />
                AI-Powered Matching
              </Badge>

              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 tracking-tight leading-tight" data-testid="heading-hero">
                Your Perfect Role Awaits
              </h1>

              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Our AI analyzes your experience and matches you with volunteer opportunities where you'll make the greatest impact
              </p>

              <div className="flex flex-wrap gap-6 justify-center text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Instant Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Perfect Matches</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Smart Recommendations</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* How It Works Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-center mb-4">How It Works</h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Three simple steps to find your perfect volunteer role
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Share Your Experience",
              description: "Upload your resumes and career documents. Our AI will analyze your skills and background.",
              icon: Upload
            },
            {
              step: "02",
              title: "AI Interview",
              description: "Have a brief conversation with Mr Blue AI to clarify your interests and availability.",
              icon: Brain
            },
            {
              step: "03",
              title: "Get Matched",
              description: "Receive personalized recommendations for volunteer roles that align with your talents.",
              icon: Target
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <Card className="h-full hover-elevate">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-3xl font-serif font-bold text-muted-foreground/30">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-serif font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Application Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">Start Your Journey</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Share your professional background and let our AI find the perfect match for you
          </p>
        </div>

        <Card className="overflow-hidden border-2">
          <CardContent className="p-6 md:p-8 space-y-5">
            {/* File Upload */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Files className="h-5 w-5 text-primary" />
                <Label htmlFor="resume-upload" className="text-base font-medium">Upload Your Resumes</Label>
              </div>
              
              {/* Compelling Messaging */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                <p className="text-sm leading-relaxed">
                  <strong>We want ALL of your resumes</strong> so we can truly understand who you are, what you have worked on, and what you want to do.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The paper resume should die. Your current job gets 12-15 bullets, your 2nd job 9-11, your 3rd 3-6. With each new resume you short-change yourself and forget what you've accomplished.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  In this AI age where both talent and companies use AI to match, why limit yourself to one page? We want you to be excited to partner with us and work on the things you really want to help the Tango community.
                </p>
              </div>

              <p className="text-sm text-muted-foreground">PDF, DOCX, or TXT • Maximum 5MB each • Select multiple files</p>
              <Input
                id="resume-upload"
                type="file"
                accept=".pdf,.docx,.txt"
                multiple
                onChange={handleUpload}
                data-testid="input-resume-upload"
                className="cursor-pointer"
              />
              
              {/* Uploaded Documents List */}
              <AnimatePresence mode="popLayout">
                {mode === "authenticated" ? (
                  uploadedDocuments.map((doc) => (
                    <motion.div
                      key={`${doc.file.name}-${doc.file.size}`}
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-lg"
                      data-testid={`document-${doc.file.name}-${doc.file.size}`}
                    >
                      <FileText className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium flex-1 truncate">{doc.file.name}</span>
                      {doc.status === "parsed" && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />}
                      {doc.status === "pending" && <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />}
                      {doc.status === "error" && <span className="text-xs text-destructive">Error</span>}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemove(doc.file.name, doc.file.size)}
                        data-testid={`button-remove-${doc.file.name}-${doc.file.size}`}
                        className="h-8 w-8 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))
                ) : (
                  storedDocs.map((doc, idx) => (
                    <motion.div
                      key={`${doc.fileName}-${doc.fileSize}`}
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-lg"
                      data-testid={`doc-item-${idx}`}
                    >
                      <FileText className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium flex-1 truncate">{doc.fileName}</span>
                      {doc.status === "parsed" && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />}
                      {doc.status === "pending" && <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />}
                      {doc.status === "error" && <span className="text-xs text-destructive">Error</span>}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemove(doc.fileName, doc.fileSize)}
                        data-testid={`button-remove-doc-${idx}`}
                        className="h-8 w-8 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
              
              {hasDocuments && (
                <p className="text-sm text-muted-foreground">
                  {docs.length} document{docs.length > 1 ? 's' : ''} uploaded • Click above to add more
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || (mode === "authenticated" && authLoading) || !hasDocuments || !hasParsedDocuments}
                size="lg"
                className="w-full gap-2 text-base"
                data-testid="button-start-clarifier"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="h-5 w-5 animate-pulse" />
                    {mode === "authenticated" ? "Creating Your Profile..." : "Starting Interview..."}
                  </>
                ) : (mode === "authenticated" && authLoading) ? (
                  "Verifying..."
                ) : (
                  <>
                    Begin AI Interview
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground mt-4">
                {mode === "authenticated" 
                  ? "You'll be redirected to chat with Mr Blue AI for a personalized interview"
                  : "You'll chat with Mr Blue AI for a personalized interview"}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>


      {/* Back Link */}
      {showBackLink && mode === "authenticated" && (
        <div className="text-center">
          <Link href="/volunteer" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2" data-testid="link-back">
            ← Back to Volunteer Opportunities
          </Link>
        </div>
      )}

      {/* Close button for guest mode */}
      {mode === "guest" && onClose && (
        <div className="text-center">
          <Button variant="ghost" onClick={onClose} data-testid="button-close-modal">
            Save & Continue Later
          </Button>
        </div>
      )}
    </div>
  );
}
