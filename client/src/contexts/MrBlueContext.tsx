import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';

type AvatarState = 'idle' | 'happy' | 'listening' | 'speaking' | 'thinking' | 'excited' | 'surprised' | 'nodding';
type UnifiedMode = 'command-center' | 'the-plan' | 'visual-editor';

// Self-healing error context for god-level users (MB.MD Pattern 53)
interface SelfHealErrorContext {
  errorMessage: string;
  page: string;
  componentStack?: string;
  mbmdAnalysis?: {
    mbmdPattern: string;
    severity: string;
    rootCause: string;
    recommendedFix: string;
    autoFixable: boolean;
  };
}

// CTO welcome context for god-level login
interface CTOWelcomeContext {
  userName: string;
  userEmail: string;
  userRole: string;
}

// CTO walkthrough result for completion reporting
interface WalkthroughResult {
  success: boolean;
  testName: string;
  totalSteps: number;
  completedSteps: number;
  duration: number;
  steps: { description: string; status: 'success' | 'failed'; duration?: number; error?: string }[];
  timestamp: number;
}

interface MrBlueContextType {
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  currentExpression: AvatarState;
  setExpression: (expression: AvatarState) => void;
  currentPage: string;
  pageHistory: string[];
  updatePageContext: (metadata?: Record<string, any>) => void;
  
  // Unified Interface State
  unifiedMode: UnifiedMode;
  setUnifiedMode: (mode: UnifiedMode) => void;
  avatarState: AvatarState;
  setAvatarState: (state: AvatarState) => void;
  audioLevel: number;
  setAudioLevel: (level: number) => void;
  inCall: boolean;
  setInCall: (inCall: boolean) => void;
  
  // Self-healing for god-level users (MB.MD Pattern 53)
  selfHealError: SelfHealErrorContext | null;
  setSelfHealError: (error: SelfHealErrorContext | null) => void;
  openChatWithError: (error: SelfHealErrorContext) => void;
  clearSelfHealError: () => void;
  
  // CTO welcome for god-level login
  ctoWelcome: CTOWelcomeContext | null;
  clearCTOWelcome: () => void;
  
  // CTO Walkthrough preview
  isWalkthroughOpen: boolean;
  openWalkthrough: () => void;
  closeWalkthrough: () => void;
  
  // Walkthrough result reporting
  walkthroughResult: WalkthroughResult | null;
  setWalkthroughResult: (result: WalkthroughResult | null) => void;
  reportWalkthroughComplete: (result: WalkthroughResult) => void;
}

const MrBlueContext = createContext<MrBlueContextType | undefined>(undefined);

export function MrBlueProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentExpression, setCurrentExpression] = useState<AvatarState>('idle');
  const [location] = useLocation();
  const [currentPage, setCurrentPage] = useState(location);
  const [pageHistory, setPageHistory] = useState<string[]>([location]);
  
  // Unified Interface State
  const [unifiedMode, setUnifiedMode] = useState<UnifiedMode>('command-center');
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [inCall, setInCall] = useState(false);
  
  // Self-healing state for god-level users (MB.MD Pattern 53)
  const [selfHealError, setSelfHealError] = useState<SelfHealErrorContext | null>(null);
  
  // CTO welcome state for god-level login
  const [ctoWelcome, setCTOWelcome] = useState<CTOWelcomeContext | null>(null);
  
  // CTO Walkthrough preview state
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  
  // Walkthrough result state
  const [walkthroughResult, setWalkthroughResult] = useState<WalkthroughResult | null>(null);

  useEffect(() => {
    if (location !== currentPage) {
      setCurrentPage(location);
      setPageHistory(prev => [...prev.slice(-9), location]);
    }
  }, [location, currentPage]);
  
  // MB.MD Pattern 53: Listen for self-heal events from SelfHealingErrorBoundary
  useEffect(() => {
    const handleSelfHealEvent = (event: CustomEvent) => {
      const { errorMessage, page, componentStack, mbmdAnalysis } = event.detail;
      console.log('[MrBlue] Self-heal event received:', mbmdAnalysis?.mbmdPattern);
      
      openChatWithError({
        errorMessage,
        page,
        componentStack,
        mbmdAnalysis,
      });
    };
    
    window.addEventListener('mrblue:self-heal', handleSelfHealEvent as EventListener);
    return () => {
      window.removeEventListener('mrblue:self-heal', handleSelfHealEvent as EventListener);
    };
  }, []);
  
  // CTO Welcome: Check for pending welcome on mount (survives navigation)
  // Opens walkthrough panel DIRECTLY instead of Mr. Blue chat asking to start
  useEffect(() => {
    const checkPendingCTOWelcome = () => {
      const pendingWelcome = localStorage.getItem('mrblue:pending-cto-welcome');
      if (pendingWelcome) {
        try {
          const data = JSON.parse(pendingWelcome);
          // Only use if less than 30 seconds old (avoid stale data)
          if (Date.now() - data.timestamp < 30000) {
            console.log('[MrBlue] Processing pending CTO welcome - opening walkthrough directly:', data.userEmail, data.userRole);
            setCTOWelcome({ userName: data.userName, userEmail: data.userEmail, userRole: data.userRole });
            setCurrentExpression('excited');
            // Open walkthrough panel DIRECTLY instead of chat
            setIsWalkthroughOpen(true);
          }
        } catch (e) {
          console.error('[MrBlue] Failed to parse pending CTO welcome:', e);
        }
        // Clear the pending welcome after processing
        localStorage.removeItem('mrblue:pending-cto-welcome');
      }
    };
    
    // Small delay to ensure page is fully loaded and user state is ready
    const timer = setTimeout(checkPendingCTOWelcome, 500);
    return () => clearTimeout(timer);
  }, []);
  
  // CTO Welcome: Also listen for direct events (for in-page actions)
  // Opens walkthrough panel DIRECTLY instead of Mr. Blue chat asking to start
  useEffect(() => {
    const handleCTOLoginEvent = (event: CustomEvent) => {
      const { userName, userEmail, userRole } = event.detail;
      console.log('[MrBlue] CTO login event received - opening walkthrough directly:', userEmail, userRole);
      
      // Set CTO welcome context and open walkthrough panel DIRECTLY
      setCTOWelcome({ userName, userEmail, userRole });
      setCurrentExpression('excited');
      // Open walkthrough panel DIRECTLY instead of chat
      setIsWalkthroughOpen(true);
    };
    
    window.addEventListener('mrblue:cto-login', handleCTOLoginEvent as EventListener);
    return () => {
      window.removeEventListener('mrblue:cto-login', handleCTOLoginEvent as EventListener);
    };
  }, []);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => {
    setIsChatOpen(false);
    setCurrentExpression('idle');
    setSelfHealError(null); // Clear error context when closing
    setCTOWelcome(null); // Clear CTO welcome context when closing
  };
  const toggleChat = () => setIsChatOpen(prev => !prev);

  const setExpression = (expression: AvatarState) => {
    setCurrentExpression(expression);
    setAvatarState(expression); // Sync both states
  };

  const updatePageContext = (metadata?: Record<string, any>) => {
    console.log('Mr Blue Context Updated:', { currentPage, metadata });
  };
  
  // MB.MD Pattern 53: Auto-open chat with error context for god-level users
  const openChatWithError = (error: SelfHealErrorContext) => {
    console.log('[MrBlue] Self-heal triggered:', error.errorMessage.substring(0, 100));
    setSelfHealError(error);
    setCurrentExpression('thinking');
    setIsChatOpen(true);
  };
  
  const clearSelfHealError = () => {
    setSelfHealError(null);
  };
  
  const clearCTOWelcome = () => {
    setCTOWelcome(null);
  };
  
  // CTO Walkthrough controls
  const openWalkthrough = () => {
    console.log('[MrBlue] Opening CTO walkthrough preview');
    setIsWalkthroughOpen(true);
  };
  
  const closeWalkthrough = () => {
    console.log('[MrBlue] Closing CTO walkthrough preview');
    setIsWalkthroughOpen(false);
  };
  
  // Report walkthrough completion and open chat with results
  const reportWalkthroughComplete = (result: WalkthroughResult) => {
    console.log('[MrBlue] Walkthrough complete:', result.success ? 'SUCCESS' : 'FAILED', result.testName);
    setWalkthroughResult(result);
    setCurrentExpression(result.success ? 'happy' : 'thinking');
    setIsChatOpen(true);
  };

  return (
    <MrBlueContext.Provider
      value={{
        isChatOpen,
        openChat,
        closeChat,
        toggleChat,
        currentExpression,
        setExpression,
        currentPage,
        pageHistory,
        updatePageContext,
        unifiedMode,
        setUnifiedMode,
        avatarState,
        setAvatarState,
        audioLevel,
        setAudioLevel,
        inCall,
        setInCall,
        selfHealError,
        setSelfHealError,
        openChatWithError,
        clearSelfHealError,
        ctoWelcome,
        clearCTOWelcome,
        isWalkthroughOpen,
        openWalkthrough,
        closeWalkthrough,
        walkthroughResult,
        setWalkthroughResult,
        reportWalkthroughComplete,
      }}
    >
      {children}
    </MrBlueContext.Provider>
  );
}

export function useMrBlue() {
  const context = useContext(MrBlueContext);
  if (context === undefined) {
    throw new Error('useMrBlue must be used within a MrBlueProvider');
  }
  return context;
}

export type { AvatarState, UnifiedMode };
