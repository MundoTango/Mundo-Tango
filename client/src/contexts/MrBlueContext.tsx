import { createContext, useContext, useState, ReactNode } from 'react';

interface MrBlueContextType {
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  currentExpression: 'idle' | 'happy' | 'listening' | 'speaking' | 'thinking' | 'excited' | 'surprised' | 'nodding';
  setExpression: (expression: MrBlueContextType['currentExpression']) => void;
}

const MrBlueContext = createContext<MrBlueContextType | undefined>(undefined);

export function MrBlueProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentExpression, setCurrentExpression] = useState<MrBlueContextType['currentExpression']>('idle');

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => {
    setIsChatOpen(false);
    setCurrentExpression('idle');
  };
  const toggleChat = () => setIsChatOpen(prev => !prev);

  const setExpression = (expression: MrBlueContextType['currentExpression']) => {
    setCurrentExpression(expression);
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
