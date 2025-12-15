import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface TalentMatchSessionData {
  sessionId: string;
  name: string;
  email: string;
  step: "upload" | "interview" | "complete";
  linkedinUrl?: string;
  uploadedDocuments?: Array<{
    fileName: string;
    fileSize: number;
    parsedText?: string;
  }>;
  volunteerId?: number;
  clarifierSessionId?: number;
  createdAt: number;
  lastUpdatedAt: number;
}

interface TalentMatchSessionContextType {
  session: TalentMatchSessionData | null;
  isSessionActive: boolean;
  createSession: (name: string, email: string) => void;
  updateSession: (updates: Partial<TalentMatchSessionData>) => void;
  clearSession: () => void;
  resumeSession: () => boolean;
}

const STORAGE_KEY = "talentMatchSession";
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const TalentMatchSessionContext = createContext<TalentMatchSessionContextType | undefined>(undefined);

export function TalentMatchSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<TalentMatchSessionData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TalentMatchSessionData;
        const now = Date.now();
        if (now - parsed.createdAt < SESSION_EXPIRY_MS) {
          setSession(parsed);
          document.cookie = `talentMatchSessionId=${parsed.sessionId}; path=/; max-age=86400; SameSite=Lax`;
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const createSession = (name: string, email: string) => {
    const sessionId = `tm_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const now = Date.now();
    
    const newSession: TalentMatchSessionData = {
      sessionId,
      name,
      email,
      step: "upload",
      createdAt: now,
      lastUpdatedAt: now,
    };
    
    setSession(newSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    document.cookie = `talentMatchSessionId=${sessionId}; path=/; max-age=86400; SameSite=Lax`;
  };

  const updateSession = (updates: Partial<TalentMatchSessionData>) => {
    if (!session) return;
    
    const updated: TalentMatchSessionData = {
      ...session,
      ...updates,
      lastUpdatedAt: Date.now(),
    };
    
    setSession(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearSession = () => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = "talentMatchSessionId=; path=/; max-age=0";
  };

  const resumeSession = (): boolean => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TalentMatchSessionData;
        const now = Date.now();
        if (now - parsed.createdAt < SESSION_EXPIRY_MS) {
          setSession(parsed);
          return true;
        }
      } catch {
        // Invalid session
      }
    }
    return false;
  };

  return (
    <TalentMatchSessionContext.Provider
      value={{
        session,
        isSessionActive: !!session,
        createSession,
        updateSession,
        clearSession,
        resumeSession,
      }}
    >
      {children}
    </TalentMatchSessionContext.Provider>
  );
}

export function useTalentMatchSession() {
  const context = useContext(TalentMatchSessionContext);
  if (context === undefined) {
    throw new Error("useTalentMatchSession must be used within a TalentMatchSessionProvider");
  }
  return context;
}
