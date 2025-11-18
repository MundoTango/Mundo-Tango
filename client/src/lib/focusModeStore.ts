import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SessionDuration = 25 | 50 | 90;

export interface FocusSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: SessionDuration;
  editsCount: number;
  editsPerMinute: number;
  autoSaveCount: number;
}

interface FocusModeState {
  isActive: boolean;
  sessionDuration: SessionDuration;
  currentSession: FocusSession | null;
  sessionHistory: FocusSession[];
  timeRemaining: number;
  isPaused: boolean;
  editsThisSession: number;
  lastAutoSave: Date | null;
  
  startSession: (duration: SessionDuration) => void;
  endSession: () => FocusSession | null;
  pauseSession: () => void;
  resumeSession: () => void;
  updateTimeRemaining: (seconds: number) => void;
  incrementEdits: () => void;
  recordAutoSave: () => void;
  setSessionDuration: (duration: SessionDuration) => void;
  resetSession: () => void;
  getSessionSummary: () => FocusSession | null;
}

export const useFocusModeStore = create<FocusModeState>()(
  persist(
    (set, get) => ({
      isActive: false,
      sessionDuration: 25,
      currentSession: null,
      sessionHistory: [],
      timeRemaining: 25 * 60,
      isPaused: false,
      editsThisSession: 0,
      lastAutoSave: null,

      startSession: (duration: SessionDuration) => {
        const newSession: FocusSession = {
          id: `session-${Date.now()}`,
          startTime: new Date(),
          duration,
          editsCount: 0,
          editsPerMinute: 0,
          autoSaveCount: 0,
        };

        set({
          isActive: true,
          sessionDuration: duration,
          currentSession: newSession,
          timeRemaining: duration * 60,
          isPaused: false,
          editsThisSession: 0,
          lastAutoSave: null,
        });
      },

      endSession: () => {
        const state = get();
        if (!state.currentSession) return null;

        const endedSession: FocusSession = {
          ...state.currentSession,
          endTime: new Date(),
          editsCount: state.editsThisSession,
          editsPerMinute: state.currentSession.startTime
            ? state.editsThisSession / ((Date.now() - state.currentSession.startTime.getTime()) / 60000)
            : 0,
        };

        set((state) => ({
          isActive: false,
          currentSession: null,
          sessionHistory: [...state.sessionHistory, endedSession],
          editsThisSession: 0,
          isPaused: false,
        }));

        return endedSession;
      },

      pauseSession: () => set({ isPaused: true }),
      
      resumeSession: () => set({ isPaused: false }),

      updateTimeRemaining: (seconds: number) => set({ timeRemaining: seconds }),

      incrementEdits: () => {
        set((state) => ({
          editsThisSession: state.editsThisSession + 1,
        }));
      },

      recordAutoSave: () => {
        set((state) => ({
          lastAutoSave: new Date(),
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                autoSaveCount: state.currentSession.autoSaveCount + 1,
              }
            : null,
        }));
      },

      setSessionDuration: (duration: SessionDuration) => {
        set({
          sessionDuration: duration,
          timeRemaining: duration * 60,
        });
      },

      resetSession: () => {
        set({
          isActive: false,
          currentSession: null,
          timeRemaining: get().sessionDuration * 60,
          isPaused: false,
          editsThisSession: 0,
          lastAutoSave: null,
        });
      },

      getSessionSummary: () => {
        const state = get();
        if (!state.currentSession) return null;

        const elapsedMinutes = state.currentSession.startTime
          ? (Date.now() - state.currentSession.startTime.getTime()) / 60000
          : 0;

        return {
          ...state.currentSession,
          editsCount: state.editsThisSession,
          editsPerMinute: elapsedMinutes > 0 ? state.editsThisSession / elapsedMinutes : 0,
        };
      },
    }),
    {
      name: 'focus-mode-storage',
      partialize: (state) => ({
        sessionDuration: state.sessionDuration,
        sessionHistory: state.sessionHistory.slice(-10),
      }),
    }
  )
);
