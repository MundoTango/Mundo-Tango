/**
 * Streaming Status Panel
 * Shows real-time "Mr. Blue is working..." messages
 * Displays streaming AI responses and visual change progress
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Zap, CheckCircle, X } from "lucide-react";

interface StreamingStatusPanelProps {
  currentStatus: string;
  isStreaming: boolean;
  streamingMessages: Array<{
    type: string;
    message?: string;
    status?: string;
  }>;
  onStop?: () => void;
}

export function StreamingStatusPanel({ 
  currentStatus, 
  isStreaming,
  streamingMessages,
  onStop
}: StreamingStatusPanelProps) {
  const [displayMessages, setDisplayMessages] = useState<string[]>([]);

  // Accumulate streaming messages for display
  useEffect(() => {
    if (streamingMessages.length > 0) {
      const latest = streamingMessages[streamingMessages.length - 1];
      
      if (latest.type === 'progress' && latest.message) {
        setDisplayMessages(prev => [...prev, latest.message!]);
      } else if (latest.type === 'completion' && latest.message) {
        // Replace all progress messages with final message
        setDisplayMessages([latest.message]);
      }
    }
  }, [streamingMessages]);

  // Clear messages when streaming stops
  useEffect(() => {
    if (!isStreaming && streamingMessages.length === 0) {
      setTimeout(() => setDisplayMessages([]), 2000);
    }
  }, [isStreaming, streamingMessages]);

  if (!isStreaming && displayMessages.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute top-4 left-4 right-4 z-10 pointer-events-none"
      >
        <Card className="bg-primary/95 text-primary-foreground backdrop-blur-sm border-primary pointer-events-auto">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Animated Icon */}
              <div className="flex-shrink-0">
                {isStreaming ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Mr. Blue
                    </Badge>
                    {isStreaming && (
                      <span className="text-xs opacity-80 animate-pulse">
                        is working...
                      </span>
                    )}
                  </div>
                  {isStreaming && onStop && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={onStop}
                      className="h-6 px-2"
                      data-testid="button-stop-streaming"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Stop
                    </Button>
                  )}
                </div>

                {/* Display streaming messages */}
                <div className="space-y-1">
                  {displayMessages.slice(-3).map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="text-sm font-medium"
                    >
                      {msg}
                    </motion.div>
                  ))}
                </div>

                {/* Current status badge */}
                {currentStatus && isStreaming && (
                  <div className="flex items-center gap-2 text-xs opacity-80">
                    <Zap className="h-3 w-3" />
                    <span>{currentStatus}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
