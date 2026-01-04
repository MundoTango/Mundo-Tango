/**
 * MR. BLUE VIBECODING PANEL
 * MB.MD Pattern 97 - Visual ReAct Protocol UI
 * 
 * Real-time streaming display of THOUGHT/ACTION/OBSERVATION
 * for god-level users to watch Mr. Blue vibe code.
 */

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  Play, Pause, Square, Terminal, Brain, Search, 
  Code, TestTube, FileText, Loader2, CheckCircle, 
  XCircle, ChevronRight, Sparkles
} from "lucide-react";

type VibePhase = 'clarify' | 'plan' | 'research' | 'execute' | 'verify' | 'report' | 'idle';

interface VibeStreamEvent {
  type: 'thought' | 'action' | 'observation' | 'phase' | 'tool' | 'file' | 'test' | 'complete' | 'error';
  phase?: VibePhase;
  content: string;
  metadata?: {
    tool?: string;
    file?: string;
    lineCount?: number;
    testsPassed?: number;
    testsFailed?: number;
    timestamp?: number;
  };
}

interface VibeCodingPanelProps {
  onClose?: () => void;
  initialTask?: string;
}

const PHASES: { id: VibePhase; label: string; icon: typeof Brain }[] = [
  { id: 'clarify', label: 'Clarify', icon: Brain },
  { id: 'plan', label: 'Plan', icon: FileText },
  { id: 'research', label: 'Research', icon: Search },
  { id: 'execute', label: 'Execute', icon: Code },
  { id: 'verify', label: 'Verify', icon: TestTube },
  { id: 'report', label: 'Report', icon: CheckCircle },
];

export function VibeCodingPanel({ onClose, initialTask = '' }: VibeCodingPanelProps) {
  const [task, setTask] = useState(initialTask);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<VibePhase>('idle');
  const [events, setEvents] = useState<VibeStreamEvent[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const startVibeSession = async () => {
    if (!task.trim()) return;

    // Abort any existing session
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsRunning(true);
    setIsComplete(false);
    setError(null);
    setEvents([]);
    setCurrentPhase('clarify');

    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('/api/mrblue/vibestream/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ task }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to start VibeCoding session');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream');
      }

      readerRef.current = reader;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: VibeStreamEvent = JSON.parse(line.slice(6));
              
              if (event.phase) {
                setCurrentPhase(event.phase);
              }

              if (event.type === 'complete') {
                setIsComplete(true);
                setIsRunning(false);
              } else if (event.type === 'error') {
                setError(event.content);
                setIsRunning(false);
              }

              setEvents(prev => [...prev, event]);
            } catch (e) {
              console.warn('[VibeCoding] Failed to parse event:', line);
            }
          }
        }
      }
      
      setIsRunning(false);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('[VibeCoding] Session aborted by user');
        // Don't add events after abort - just reset state
      } else {
        setError(err.message);
      }
      setIsRunning(false);
    } finally {
      readerRef.current = null;
      abortControllerRef.current = null;
    }
  };

  const stopVibeSession = () => {
    // Cancel the reader first
    if (readerRef.current) {
      readerRef.current.cancel().catch(() => {});
      readerRef.current = null;
    }
    // Then abort the fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsRunning(false);
    setCurrentPhase('idle');
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'thought': return <Brain className="w-4 h-4 text-purple-500" />;
      case 'action': return <Terminal className="w-4 h-4 text-blue-500" />;
      case 'observation': return <Search className="w-4 h-4 text-green-500" />;
      case 'tool': return <Code className="w-4 h-4 text-cyan-500" />;
      case 'file': return <FileText className="w-4 h-4 text-orange-500" />;
      case 'test': return <TestTube className="w-4 h-4 text-yellow-500" />;
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <ChevronRight className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'thought': return 'THOUGHT';
      case 'action': return 'ACTION';
      case 'observation': return 'OBSERVATION';
      case 'tool': return 'TOOL';
      case 'file': return 'FILE';
      case 'test': return 'TEST';
      case 'complete': return 'COMPLETE';
      case 'error': return 'ERROR';
      case 'phase': return 'PHASE';
      default: return type.toUpperCase();
    }
  };

  return (
    <Card className="flex flex-col h-full bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30 overflow-hidden" data-testid="vibecoding-panel">
      {/* Header with Phase Timeline */}
      <div className="p-4 border-b border-cyan-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">VibeCoding Session</h2>
          </div>
          {onClose && (
            <Button size="icon" variant="ghost" onClick={onClose} className="text-white/60 hover:text-white">
              <XCircle className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Phase Timeline */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {PHASES.map((phase, idx) => {
            const PhaseIcon = phase.icon;
            const isActive = currentPhase === phase.id;
            const isPast = PHASES.findIndex(p => p.id === currentPhase) > idx;
            
            return (
              <div key={phase.id} className="flex items-center">
                <div className={`
                  flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all
                  ${isActive ? 'bg-cyan-500 text-white' : ''}
                  ${isPast ? 'bg-green-500/20 text-green-400' : ''}
                  ${!isActive && !isPast ? 'bg-slate-700/50 text-slate-400' : ''}
                `}>
                  <PhaseIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{phase.label}</span>
                </div>
                {idx < PHASES.length - 1 && (
                  <ChevronRight className={`w-4 h-4 mx-1 ${isPast ? 'text-green-400' : 'text-slate-600'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Input */}
      <div className="p-4 border-b border-cyan-500/20">
        <div className="flex gap-2">
          <Textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Describe your coding task... e.g., 'Fix RSVP cache so updates propagate to all event views'"
            className="flex-1 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 min-h-[60px] resize-none"
            disabled={isRunning}
            data-testid="input-vibe-task"
          />
          <div className="flex flex-col gap-2">
            {!isRunning ? (
              <Button 
                onClick={startVibeSession} 
                disabled={!task.trim()}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                data-testid="button-start-vibe"
              >
                <Play className="w-4 h-4 mr-1" />
                Start
              </Button>
            ) : (
              <Button 
                onClick={stopVibeSession}
                variant="destructive"
                data-testid="button-stop-vibe"
              >
                <Square className="w-4 h-4 mr-1" />
                Stop
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Event Stream */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {events.length === 0 && !isRunning && (
            <div className="text-center text-slate-400 py-8">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Enter a task and click Start to begin VibeCoding</p>
              <p className="text-sm mt-1">Watch Mr. Blue think, plan, and execute in real-time</p>
            </div>
          )}

          {events.map((event, idx) => (
            <div 
              key={idx} 
              className={`
                flex gap-3 p-3 rounded-lg transition-all
                ${event.type === 'thought' ? 'bg-purple-500/10 border border-purple-500/20' : ''}
                ${event.type === 'action' ? 'bg-blue-500/10 border border-blue-500/20' : ''}
                ${event.type === 'observation' ? 'bg-green-500/10 border border-green-500/20' : ''}
                ${event.type === 'phase' ? 'bg-cyan-500/10 border border-cyan-500/20' : ''}
                ${event.type === 'tool' || event.type === 'file' ? 'bg-orange-500/10 border border-orange-500/20' : ''}
                ${event.type === 'test' ? 'bg-yellow-500/10 border border-yellow-500/20' : ''}
                ${event.type === 'complete' ? 'bg-green-500/20 border border-green-500/30' : ''}
                ${event.type === 'error' ? 'bg-red-500/20 border border-red-500/30' : ''}
              `}
              data-testid={`event-${event.type}-${idx}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    {getEventLabel(event.type)}
                  </Badge>
                  {event.metadata?.tool && (
                    <Badge variant="secondary" className="text-xs">
                      {event.metadata.tool}
                    </Badge>
                  )}
                  {event.metadata?.file && (
                    <code className="text-xs text-slate-400 truncate">
                      {event.metadata.file}
                    </code>
                  )}
                </div>
                <pre className="text-sm text-slate-200 whitespace-pre-wrap break-words font-mono">
                  {event.content}
                </pre>
                {event.metadata?.testsPassed !== undefined && (
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className="text-green-400">Passed: {event.metadata.testsPassed}</span>
                    <span className="text-red-400">Failed: {event.metadata.testsFailed || 0}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isRunning && (
            <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Mr. Blue is thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Status Bar */}
      <div className="p-3 border-t border-cyan-500/20 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {isComplete && <CheckCircle className="w-4 h-4 text-green-500" />}
          {error && <XCircle className="w-4 h-4 text-red-500" />}
          <span>
            {isComplete ? 'Session completed' : error ? 'Session failed' : isRunning ? 'Running...' : 'Ready'}
          </span>
        </div>
        <div>
          {events.length} events
        </div>
      </div>
    </Card>
  );
}

export default VibeCodingPanel;
