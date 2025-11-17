import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';

type AvatarState = 'idle' | 'happy' | 'listening' | 'speaking' | 'thinking' | 'excited' | 'surprised' | 'nodding';
type UnifiedMode = 'command-center' | 'the-plan' | 'visual-editor';

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

  useEffect(() => {
    if (location !== currentPage) {
      setCurrentPage(location);
      setPageHistory(prev => [...prev.slice(-9), location]);
    }
  }, [location, currentPage]);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => {
    setIsChatOpen(false);
    setCurrentExpression('idle');
  };
  const toggleChat = () => setIsChatOpen(prev => !prev);

  const setExpression = (expression: AvatarState) => {
    setCurrentExpression(expression);
    setAvatarState(expression); // Sync both states
  };

  const updatePageContext = (metadata?: Record<string, any>) => {
    console.log('Mr Blue Context Updated:', { currentPage, metadata });
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
