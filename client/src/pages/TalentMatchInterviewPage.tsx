import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Home, Upload, RefreshCw } from "lucide-react";
import { TalentMatchInterviewChat, type PhaseConfig } from "@/components/mr-blue/TalentMatchInterviewChat";
import { apiRequest } from "@/lib/queryClient";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  phase?: "resume" | "work" | "complete";
}

interface InterviewState {
  phase: "resume" | "work" | "complete";
  resumeQuestionsAsked: number;
  workQuestionsAsked: number;
  resumeAnswers: string[];
  workAnswers: string[];
}

const TOTAL_RESUME_QUESTIONS = 2;
const TOTAL_WORK_QUESTIONS = 2;

export default function TalentMatchInterviewPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use window.location.search directly since wouter's useLocation doesn't include query params
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session');
  const volunteerId = params.get('volunteer');
  const returnTo = params.get('returnTo') || '/h2ac-dashboard';

  const [interviewState, setInterviewState] = useState<InterviewState>({
    phase: "resume",
    resumeQuestionsAsked: 0,
    workQuestionsAsked: 0,
    resumeAnswers: [],
    workAnswers: []
  });

  const [messages, setMessages] = useState<Message[]>([]);

  const { data: volunteer } = useQuery({
    queryKey: ['/api/v1/volunteers', volunteerId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/volunteers/${volunteerId}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch volunteer');
      return response.json();
    },
    enabled: !!volunteerId
  });

  const { data: resume } = useQuery({
    queryKey: ['/api/v1/volunteers', volunteerId, 'resume'],
    queryFn: async () => {
      const response = await fetch(`/api/v1/volunteers/${volunteerId}/resume`, { credentials: 'include' });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!volunteerId
  });

  const { data: user } = useQuery({
    queryKey: ['/api/auth/me']
  });

  const totalProgress = () => {
    const resumeProgress = Math.min(interviewState.resumeQuestionsAsked, TOTAL_RESUME_QUESTIONS);
    const workProgress = Math.min(interviewState.workQuestionsAsked, TOTAL_WORK_QUESTIONS);
    return ((resumeProgress + workProgress) / (TOTAL_RESUME_QUESTIONS + TOTAL_WORK_QUESTIONS)) * 100;
  };

  // MB.MD Fix: Handle resume re-upload for parsing
  const handleResumeReupload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !volunteerId) return;
    
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!validTypes.includes(file.type)) {
      toast({ 
        title: t("pages:talentMatch.interview.toast.invalidFileType.title"), 
        description: t("pages:talentMatch.interview.toast.invalidFileType.description"), 
        variant: "destructive" 
      });
      return;
    }
    
    setIsUploadingResume(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        let binaryString = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binaryString += String.fromCharCode(uint8Array[i]);
        }
        const base64Buffer = btoa(binaryString);
        
        await apiRequest("POST", `/api/v1/volunteers/${volunteerId}/resume`, {
          filename: file.name,
          fileBuffer: base64Buffer,
          fileUrl: "",
          links: []
        });
        
        await queryClient.invalidateQueries({ queryKey: ['/api/v1/volunteers', volunteerId, 'resume'] });
        toast({ 
          title: t("pages:talentMatch.interview.toast.resumeParsed.title"), 
          description: t("pages:talentMatch.interview.toast.resumeParsed.description") 
        });
        setIsUploadingResume(false);
      };
      reader.onerror = () => {
        toast({ 
          title: t("pages:talentMatch.interview.toast.uploadFailed.title"), 
          description: t("pages:talentMatch.interview.toast.uploadFailed.description"), 
          variant: "destructive" 
        });
        setIsUploadingResume(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      toast({ 
        title: t("pages:talentMatch.interview.toast.uploadFailed.title"), 
        description: t("pages:talentMatch.interview.toast.uploadFailed.description"), 
        variant: "destructive" 
      });
      setIsUploadingResume(false);
    }
  };

  // Check if resume needs re-upload
  const needsResumeReupload = resume?.filename && (!resume?.parsedText || resume.parsedText.trim().length === 0);

  const generateResumeQuestion = useCallback(async (questionNumber: number, previousAnswers: string[]) => {
    // MB.MD Fix: Handle empty parsedText - use filename as context if available
    const hasResumeFile = resume?.filename && resume.filename.length > 0;
    const hasParsedText = resume?.parsedText && resume.parsedText.trim().length > 0;
    
    let resumeContext = "";
    if (hasParsedText) {
      resumeContext = `The volunteer has uploaded this resume/profile:\n${resume.parsedText.slice(0, 3000)}`;
    } else if (hasResumeFile) {
      resumeContext = `The volunteer has uploaded a resume file: "${resume.filename}". The content couldn't be parsed, so please ask them to describe their background and experience directly.`;
    } else {
      resumeContext = `The volunteer hasn't uploaded a resume yet. Please ask them to describe their background, skills, and experience.`;
    }
    
    // Get user's preferred language for Mr Blue to respond in
    const userLanguage = i18n.language || 'en';
    const languageInstruction = userLanguage !== 'en' 
      ? `IMPORTANT: You MUST respond entirely in ${userLanguage}. Do not use English unless the user writes in English.`
      : '';
    
    const systemPrompt = `You are Mr Blue, the AI interviewer for Mundo Tango's volunteer program. You're conducting Phase 1: Resume Deep-Dive.
${languageInstruction}

${resumeContext}

Previous answers in this interview: ${previousAnswers.slice(-3).join(" | ")}

Question ${questionNumber} of ${TOTAL_RESUME_QUESTIONS}.

Your goal: Ask ONE specific, insightful question about their resume to understand:
- Their actual experience level and expertise areas
- Projects they're most proud of
- Technologies/skills they want to use more
- Any gaps or areas they want to develop

Be conversational and warm. Reference specific details from their resume when possible.
Keep questions concise (1-2 sentences).
If this is question 1, start with a warm greeting acknowledging their resume.
If this is question ${TOTAL_RESUME_QUESTIONS}, make it a summary/transition question.`;

    try {
      const response = await fetch("/api/mrblue/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: `Generate resume question ${questionNumber}`,
          systemPrompt,
          context: { sessionId, volunteerId, phase: "resume", questionNumber }
        })
      });

      if (!response.ok) throw new Error("Failed to generate question");
      const data = await response.json();
      return data.response;
    } catch {
      const fallbackQuestions = [
        "Hi there! I've reviewed your background. What would you say is the technical skill you're most confident in?",
        "I noticed some interesting experience. What project from your background are you most proud of?",
        "What technologies or tools do you enjoy working with the most?",
        "Are there any skills on your resume you'd like to use more in volunteer work?",
        "What areas of software development interest you the most right now?",
        "Have you worked on any open source projects or community initiatives before?",
        "What's your preferred working style - do you like independent work or collaboration?",
        "How do you typically approach learning new technologies?",
        "What kind of impact do you hope to make through volunteer work?",
        "Great! Before we move to discussing specific opportunities, is there anything else about your background you'd like to highlight?"
      ];
      return fallbackQuestions[Math.min(questionNumber - 1, fallbackQuestions.length - 1)];
    }
  }, [resume, sessionId, volunteerId]);

  const generateWorkQuestion = useCallback(async (questionNumber: number, previousAnswers: string[], resumeAnswers: string[]) => {
    const resumeContext = resumeAnswers.join(" | ");
    
    // Get user's preferred language for Mr Blue to respond in
    const userLanguage = i18n.language || 'en';
    const languageInstruction = userLanguage !== 'en' 
      ? `IMPORTANT: You MUST respond entirely in ${userLanguage}. Do not use English unless the user writes in English.`
      : '';
    
    const systemPrompt = `You are Mr Blue, the AI interviewer for Mundo Tango's volunteer program. You're conducting Phase 2: Work Assignment Matching.
${languageInstruction}

Based on the resume interview, here's what we learned about the volunteer:
${resumeContext}

Previous Phase 2 answers: ${previousAnswers.slice(-3).join(" | ")}

Question ${questionNumber} of ${TOTAL_WORK_QUESTIONS}.

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

Your goal: Ask ONE question to understand:
- What type of work excites them most
- How much time they can commit
- Their preferred team dynamics
- Specific Mundo Tango features they'd like to work on

Be specific about Mundo Tango's needs. Keep questions concise.
If question ${TOTAL_WORK_QUESTIONS}, ask about their availability and preferred communication.`;

    try {
      const response = await fetch("/api/mrblue/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: `Generate work assignment question ${questionNumber}`,
          systemPrompt,
          context: { sessionId, volunteerId, phase: "work", questionNumber }
        })
      });

      if (!response.ok) throw new Error("Failed to generate question");
      const data = await response.json();
      return data.response;
    } catch {
      const fallbackQuestions = [
        "Now let's talk about how you can contribute to Mundo Tango! Which area interests you most: frontend, backend, AI/ML, or something else?",
        "Mundo Tango connects the global tango community. What features would you be excited to help build?",
        "We have both technical and non-technical volunteer opportunities. What type of work energizes you most?",
        "How much time per week could you realistically commit to volunteer work?",
        "Do you prefer working independently or as part of a team?",
        "Are you comfortable with pair programming or code reviews?",
        "What's your experience with agile/sprint-based development?",
        "We use GitHub for collaboration. Are you comfortable with Git workflows?",
        "Would you prefer to work on new features, bug fixes, or documentation?",
        "Finally, what's the best way to communicate with you - Slack, email, or our platform messaging?"
      ];
      return fallbackQuestions[Math.min(questionNumber - 1, fallbackQuestions.length - 1)];
    }
  }, [sessionId, volunteerId]);

  useEffect(() => {
    if (!sessionId || !volunteerId) {
      toast({
        title: t("pages:talentMatch.interview.toast.missingSession.title"),
        description: t("pages:talentMatch.interview.toast.missingSession.description"),
        variant: "destructive"
      });
      setLocation("/talent-match");
      return;
    }

    // Wait for resume data to load before starting interview
    // resume can be null (no resume uploaded) or object (resume data)
    // We check resume !== undefined to ensure the query has completed
    if (!isInitialized && messages.length === 0 && resume !== undefined) {
      setIsInitialized(true);
      (async () => {
        setIsLoading(true);
        const firstQuestion = await generateResumeQuestion(1, []);
        setMessages([{
          id: "1",
          role: "assistant",
          content: firstQuestion,
          timestamp: new Date(),
          phase: "resume"
        }]);
        setInterviewState(prev => ({ ...prev, resumeQuestionsAsked: 1 }));
        setIsLoading(false);
      })();
    }
  }, [sessionId, volunteerId, isInitialized, messages.length, resume, generateResumeQuestion, setLocation, toast]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (interviewState.phase === "complete") {
      const timer = setTimeout(() => {
        setLocation("/volunteer/thank-you");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [interviewState.phase, setLocation]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      phase: interviewState.phase
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await apiRequest("POST", `/api/v1/clarifier/${sessionId}/message`, {
        role: "user",
        message: input
      });

      if (interviewState.phase === "resume") {
        const newAnswers = [...interviewState.resumeAnswers, input];
        const newQuestionCount = interviewState.resumeQuestionsAsked + 1;

        if (newQuestionCount > TOTAL_RESUME_QUESTIONS) {
          const transitionMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Excellent! I now have a great understanding of your background and experience. Let's move to Phase 2 where we'll discuss specific ways you can contribute to Mundo Tango.",
            timestamp: new Date(),
            phase: "work"
          };
          setMessages(prev => [...prev, transitionMessage]);

          setInterviewState(prev => ({
            ...prev,
            phase: "work",
            resumeAnswers: newAnswers
          }));

          const workQuestion = await generateWorkQuestion(1, [], newAnswers);
          const workMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: workQuestion,
            timestamp: new Date(),
            phase: "work"
          };
          setMessages(prev => [...prev, workMessage]);
          setInterviewState(prev => ({ ...prev, workQuestionsAsked: 1 }));
        } else {
          setInterviewState(prev => ({
            ...prev,
            resumeAnswers: newAnswers,
            resumeQuestionsAsked: newQuestionCount
          }));

          const nextQuestion = await generateResumeQuestion(newQuestionCount, newAnswers);
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: nextQuestion,
            timestamp: new Date(),
            phase: "resume"
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      } else if (interviewState.phase === "work") {
        const newAnswers = [...interviewState.workAnswers, input];
        const newQuestionCount = interviewState.workQuestionsAsked + 1;

        if (newQuestionCount > TOTAL_WORK_QUESTIONS) {
          await apiRequest("POST", `/api/v1/clarifier/${sessionId}/complete`);

          setInterviewState(prev => ({
            ...prev,
            phase: "complete",
            workAnswers: newAnswers
          }));

          const userName = user?.name || user?.username || "there";
          
          const generateCompletionMessage = async (): Promise<string> => {
            const summaryContext = `
Resume interview highlights: ${interviewState.resumeAnswers.slice(-5).join(" | ")}
Work preferences discussed: ${newAnswers.slice(-5).join(" | ")}
Volunteer name: ${userName}
`;
            // Get user's preferred language for Mr Blue to respond in
            const userLanguage = i18n.language || 'en';
            const langInstruction = userLanguage !== 'en' 
              ? `IMPORTANT: You MUST respond entirely in ${userLanguage}. Do not use English.`
              : '';
            
            const systemPrompt = `You are Mr Blue, the AI interviewer for Mundo Tango's volunteer program. Generate a warm, personalized completion message.
${langInstruction}

Based on the interview:
${summaryContext}

Write a personalized completion message that:
1. Thanks them warmly by name
2. Mentions 2-3 specific skills or interests they shared during the interview
3. Briefly explains next steps (profile review, matching, notification)
4. Welcomes them to the Mundo Tango volunteer community

Keep it concise (3-4 short paragraphs). Be warm and specific - reference actual things they mentioned.`;

            try {
              const response = await fetch("/api/mrblue/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  message: "Generate personalized interview completion summary",
                  systemPrompt
                })
              });
              if (!response.ok) throw new Error("Failed to generate completion");
              const data = await response.json();
              return data.response || data.content;
            } catch {
              return `Thank you so much, ${userName}! 

Your interview is complete! Here's what happens next:

- Your profile has been submitted to our admin team for review
- AI has matched your skills with open volunteer opportunities
- You'll receive a notification when your assignments are approved

Based on our conversation, I've identified several great opportunities that match your background and interests. You can view your matched assignments in the Volunteer Dashboard.

Welcome to the Mundo Tango volunteer community! We're excited to have you contribute to connecting the global tango community.`;
            }
          };

          const completionContent = await generateCompletionMessage();
          const completionMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: completionContent,
            timestamp: new Date(),
            phase: "complete"
          };
          setMessages(prev => [...prev, completionMessage]);
        } else {
          setInterviewState(prev => ({
            ...prev,
            workAnswers: newAnswers,
            workQuestionsAsked: newQuestionCount
          }));

          const nextQuestion = await generateWorkQuestion(newQuestionCount, newAnswers, interviewState.resumeAnswers);
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: nextQuestion,
            timestamp: new Date(),
            phase: "work"
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      }
    } catch (error: any) {
      toast({
        title: t("pages:talentMatch.interview.toast.error.title"),
        description: error.message || t("pages:talentMatch.interview.toast.error.description"),
        variant: "destructive"
      });

      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: t("pages:talentMatch.interview.fallbackQuestions.processingError"),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPhaseLabel = () => {
    switch (interviewState.phase) {
      case "resume": return t("pages:talentMatch.interview.phases.resume");
      case "work": return t("pages:talentMatch.interview.phases.work");
      case "complete": return t("pages:talentMatch.interview.phases.complete");
    }
  };

  const getPhaseDescription = () => {
    switch (interviewState.phase) {
      case "resume": return t("pages:talentMatch.interview.progress.questionOf", { 
        current: Math.min(interviewState.resumeQuestionsAsked, TOTAL_RESUME_QUESTIONS), 
        total: TOTAL_RESUME_QUESTIONS 
      });
      case "work": return t("pages:talentMatch.interview.progress.questionOf", { 
        current: Math.min(interviewState.workQuestionsAsked, TOTAL_WORK_QUESTIONS), 
        total: TOTAL_WORK_QUESTIONS 
      });
      case "complete": return t("pages:talentMatch.interview.progress.allQuestionsAnswered");
    }
  };

  const phases: PhaseConfig[] = [
    {
      name: "resume",
      label: t("pages:talentMatch.interview.phaseLabels.resume"),
      current: Math.min(interviewState.resumeQuestionsAsked, TOTAL_RESUME_QUESTIONS),
      total: TOTAL_RESUME_QUESTIONS,
      isActive: interviewState.phase === "resume",
      isComplete: interviewState.resumeQuestionsAsked >= TOTAL_RESUME_QUESTIONS
    },
    {
      name: "work",
      label: t("pages:talentMatch.interview.phaseLabels.workAssignment"),
      current: Math.min(interviewState.workQuestionsAsked, TOTAL_WORK_QUESTIONS),
      total: TOTAL_WORK_QUESTIONS,
      isActive: interviewState.phase === "work",
      isComplete: interviewState.workQuestionsAsked >= TOTAL_WORK_QUESTIONS
    }
  ];

  const resumeReuploadBanner = needsResumeReupload ? (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mx-4 mt-2">
      <div className="flex items-center gap-3">
        <Upload className="h-5 w-5 text-amber-500" />
        <div className="flex-1">
          <p className="text-sm font-medium">{t("pages:talentMatch.interview.resumeBanner.title")}</p>
          <p className="text-xs text-muted-foreground">{t("pages:talentMatch.interview.resumeBanner.description")}</p>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleResumeReupload} 
          accept=".pdf,.docx,.txt" 
          className="hidden" 
          data-testid="input-resume-reupload"
        />
        <Button 
          size="sm" 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isUploadingResume}
          data-testid="button-resume-reupload"
        >
          {isUploadingResume ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
          {isUploadingResume ? t("pages:talentMatch.interview.resumeBanner.parsing") : t("pages:talentMatch.interview.resumeBanner.reupload")}
        </Button>
      </div>
    </div>
  ) : null;

  const completeCTA = (
    <div className="flex gap-3 justify-center">
      <Button
        onClick={() => setLocation(returnTo)}
        className="gap-2"
        data-testid="button-view-dashboard"
      >
        {t("pages:talentMatch.interview.buttons.viewDashboard")}
        <ArrowRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        onClick={() => setLocation("/")}
        className="gap-2"
        data-testid="button-go-home"
      >
        <Home className="h-4 w-4" />
        {t("pages:talentMatch.interview.buttons.goHome")}
      </Button>
    </div>
  );

  return (
    <SelfHealingErrorBoundary pageName="Talent Match Interview" fallbackRoute="/talent-match">
      <PageLayout title={t("pages:talentMatch.interview.pageTitle")} showBreadcrumbs>
        <SEO
          title={t("pages:talentMatch.interview.seo.title")}
          description={t("pages:talentMatch.interview.seo.description")}
        />

        <div className="h-full flex flex-col" data-testid="page-talent-match-interview">
          <TalentMatchInterviewChat
            messages={messages}
            isLoading={isLoading}
            isComplete={interviewState.phase === "complete"}
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            progress={totalProgress()}
            phases={phases}
            currentPhaseLabel={getPhaseLabel()}
            questionDescription={getPhaseDescription()}
            showTimestamps={true}
            headerBanner={resumeReuploadBanner}
            completeCTA={completeCTA}
            useScrollArea={true}
          />
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
