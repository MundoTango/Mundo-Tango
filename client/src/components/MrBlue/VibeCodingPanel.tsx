import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Brain, Code, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VibeCodingMessage {
  id: string;
  type: 'THOUGHT' | 'ACTION' | 'OBSERVATION' | 'RESULT' | 'ERROR';
  content: string;
  timestamp: Date;
}

interface VibeCodingPanelProps {
  className?: string;
}

export function VibeCodingPanel({ className }: VibeCodingPanelProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<VibeCodingMessage[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleExecute = async () => {
    if (!input.trim() || isExecuting) return;

    const userMessage: VibeCodingMessage = {
      id: Date.now().toString(),
      type: 'RESULT',
      content: `💬 User: ${input}`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsExecuting(true);
    setConnectionStatus('connecting');

    const userInput = input;
    setInput('');

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/mrblue/vibecoding/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: userInput }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      setConnectionStatus('connected');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              
              const message: VibeCodingMessage = {
                id: Date.now().toString() + Math.random(),
                type: parsed.type || 'RESULT',
                content: parsed.content || parsed.message || parsed.text || '',
                timestamp: new Date()
              };

              setMessages(prev => [...prev, message]);
            } catch (e) {
              console.warn('Failed to parse SSE data:', data);
            }
          }
        }
      }

      setConnectionStatus('idle');
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('VibeCoding execution error:', error);
        const errorMessage: VibeCodingMessage = {
          id: Date.now().toString(),
          type: 'ERROR',
          content: `❌ Error: ${error.message}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setConnectionStatus('error');
      }
    } finally {
      setIsExecuting(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleExecute();
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsExecuting(false);
      setConnectionStatus('idle');
    }
  };

  const getMessageIcon = (type: VibeCodingMessage['type']) => {
    switch (type) {
      case 'THOUGHT':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'ACTION':
        return <Code className="w-4 h-4 text-blue-500" />;
      case 'OBSERVATION':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'ERROR':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Brain className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMessageBgColor = (type: VibeCodingMessage['type']) => {
    switch (type) {
      case 'THOUGHT':
        return 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800';
      case 'ACTION':
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
      case 'OBSERVATION':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
      case 'ERROR':
        return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          VibeCoding Panel
          {connectionStatus !== 'idle' && (
            <span className={cn(
              'text-xs px-2 py-1 rounded-full',
              connectionStatus === 'connecting' && 'bg-yellow-100 text-yellow-800',
              connectionStatus === 'connected' && 'bg-green-100 text-green-800',
              connectionStatus === 'error' && 'bg-red-100 text-red-800'
            )}>
              {connectionStatus}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 gap-4 min-h-0">
        {/* Messages Display */}
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Enter a request and Mr. Blue will execute it with live streaming.</p>
                <p className="text-xs mt-2">Example: "Read the package.json file" or "Find all RSVP code"</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'p-3 rounded-lg border',
                  getMessageBgColor(message.type)
                )}
              >
                <div className="flex items-start gap-2">
                  {getMessageIcon(message.type)}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1">
                      {message.type}
                    </div>
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isExecuting && messages.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your VibeCoding request... (Cmd/Ctrl + Enter to execute)"
            className="min-h-[100px] resize-none"
            disabled={isExecuting}
          />
          
          <div className="flex gap-2">
            <Button
              onClick={handleExecute}
              disabled={!input.trim() || isExecuting}
              className="flex-1"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Execute VibeCoding
                </>
              )}
            </Button>
            
            {isExecuting && (
              <Button
                onClick={handleCancel}
                variant="outline"
              >
                Cancel
              </Button>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            Mr. Blue will execute your request autonomously and stream his thought process in real-time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
