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
  openChatWithError: (error: SelfHealErrorContext) => void;
  clearSelfHealError: () => void;
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

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => {
    setIsChatOpen(false);
    setCurrentExpression('idle');
    setSelfHealError(null); // Clear error context when closing
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
        openChatWithError,
        clearSelfHealError,
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
