import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface StoredDocument {
  fileName: string;
  fileSize: number;
  parsedText?: string;
  base64Buffer?: string;
  status: "pending" | "parsed" | "error";
}

interface TalentMatchSessionData {
  sessionId: string;
  name: string;
  email: string;
  step: "upload" | "interview" | "complete";
  linkedinUrl?: string;
  uploadedDocuments?: StoredDocument[];
  interviewMessages?: Array<{role: "ai" | "user", content: string}>;
  volunteerId?: number;
  clarifierSessionId?: number;
  createdAt: number;
  lastUpdatedAt: number;
}

interface TalentMatchSessionContextType {
  session: TalentMatchSessionData | null;
  isSessionActive: boolean;
  isLoading: boolean;
  createSession: (name: string, email: string) => Promise<void>;
  updateSession: (updates: Partial<TalentMatchSessionData>) => Promise<void>;
  clearSession: () => Promise<void>;
  resumeSession: () => Promise<boolean>;
}

const STORAGE_KEY = "talentMatchSession";
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const TalentMatchSessionContext = createContext<TalentMatchSessionContextType | undefined>(undefined);

export function TalentMatchSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<TalentMatchSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try to restore session on mount - first from API, then from localStorage
  useEffect(() => {
    const restoreSession = async () => {
      setIsLoading(true);
      try {
        // First try to get session from API using cookie
        const response = await fetch("/api/talent-match/session", {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.session) {
            setSession(data.session as TalentMatchSessionData);
            // Sync to localStorage as backup
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.session));
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // API failed, try localStorage
      }
      
      // Fallback to localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as TalentMatchSessionData;
          const now = Date.now();
          if (now - parsed.createdAt < SESSION_EXPIRY_MS) {
            setSession(parsed);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setIsLoading(false);
    };
    
    restoreSession();
  }, []);

  const createSession = useCallback(async (name: string, email: string) => {
    try {
      const response = await fetch("/api/talent-match/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.session) {
          const sessionData = data.session as TalentMatchSessionData;
          setSession(sessionData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
          return;
        }
      }
    } catch {
      // API failed, create locally
    }
    
    // Fallback: create session locally
    const sessionId = `tm_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const now = Date.now();
    
    const newSession: TalentMatchSessionData = {
      sessionId,
      name,
      email,
      step: "upload",
      uploadedDocuments: [],
      interviewMessages: [],
      createdAt: now,
      lastUpdatedAt: now,
    };
    
    setSession(newSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    document.cookie = `talentMatchSessionId=${sessionId}; path=/; max-age=86400; SameSite=Lax`;
  }, []);

  const updateSession = useCallback(async (updates: Partial<TalentMatchSessionData>) => {
    if (!session) return;
    
    const updated: TalentMatchSessionData = {
      ...session,
      ...updates,
      lastUpdatedAt: Date.now(),
    };
    
    // Update local state immediately for responsiveness
    setSession(updated);
    
    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage full - store minimal version
      const minimal = {
        ...updated,
        uploadedDocuments: updated.uploadedDocuments?.map(d => ({
          fileName: d.fileName,
          fileSize: d.fileSize,
          status: d.status,
        })),
        interviewMessages: updated.interviewMessages?.slice(-10),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
    }
    
    // Persist to API (fire and forget for responsiveness)
    try {
      await fetch("/api/talent-match/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sessionId: session.sessionId,
          step: updates.step,
          linkedinUrl: updates.linkedinUrl,
          uploadedDocuments: updates.uploadedDocuments?.map(d => ({
            fileName: d.fileName,
            fileSize: d.fileSize,
            parsedText: d.parsedText?.substring(0, 10000), // Limit text size for API
          })),
          interviewMessages: updates.interviewMessages,
        }),
      });
    } catch {
      // API update failed, localStorage still has the data
    }
  }, [session]);

  const clearSession = useCallback(async () => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
    
    try {
      await fetch("/api/talent-match/session", {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      // API delete failed, but local is cleared
    }
    
    document.cookie = "talentMatchSessionId=; path=/; max-age=0";
  }, []);

  const resumeSession = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Try API first
      const response = await fetch("/api/talent-match/session", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.session) {
          setSession(data.session as TalentMatchSessionData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.session));
          setIsLoading(false);
          return true;
        }
      }
    } catch {
      // API failed
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TalentMatchSessionData;
        const now = Date.now();
        if (now - parsed.createdAt < SESSION_EXPIRY_MS) {
          setSession(parsed);
          setIsLoading(false);
          return true;
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    
    setIsLoading(false);
    return false;
  }, []);

  return (
    <TalentMatchSessionContext.Provider
      value={{
        session,
        isSessionActive: !!session,
        isLoading,
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

export type { TalentMatchSessionData, StoredDocument };
