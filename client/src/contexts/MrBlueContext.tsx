import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';

interface MrBlueContextType {
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  currentExpression: 'idle' | 'happy' | 'listening' | 'speaking' | 'thinking' | 'excited' | 'surprised' | 'nodding';
  setExpression: (expression: MrBlueContextType['currentExpression']) => void;
  currentPage: string;
  pageHistory: string[];
  updatePageContext: (metadata?: Record<string, any>) => void;
}

const MrBlueContext = createContext<MrBlueContextType | undefined>(undefined);

export function MrBlueProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentExpression, setCurrentExpression] = useState<MrBlueContextType['currentExpression']>('idle');
  const [location] = useLocation();
  const [currentPage, setCurrentPage] = useState(location);
  const [pageHistory, setPageHistory] = useState<string[]>([location]);

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

  const setExpression = (expression: MrBlueContextType['currentExpression']) => {
    setCurrentExpression(expression);
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
