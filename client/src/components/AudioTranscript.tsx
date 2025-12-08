import { useRef, useEffect } from 'react';
import { Mic, Loader2, Volume2, Zap } from 'lucide-react';

interface TranscriptMessage {
  type: 'user' | 'assistant' | 'vibe-coding' | 'system';
  content: string;
  timestamp: Date;
}

interface AudioTranscriptProps {
  messages: TranscriptMessage[];
  isRecording: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
}

export function AudioTranscript({ 
  messages, 
  isRecording, 
  isProcessing, 
  isPlaying 
}: AudioTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex items-center gap-2 p-3 bg-gray-800 border-b border-gray-700">
        {isRecording && (
          <div className="flex items-center gap-2 text-red-500 animate-pulse">
            <Mic className="h-4 w-4" />
            <span className="text-sm font-medium">Recording...</span>
          </div>
        )}
        {isProcessing && (
          <div className="flex items-center gap-2 text-yellow-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Processing...</span>
          </div>
        )}
        {isPlaying && (
          <div className="flex items-center gap-2 text-green-500">
            <Volume2 className="h-4 w-4" />
            <span className="text-sm font-medium">Mr. Blue Speaking...</span>
          </div>
        )}
        {!isRecording && !isProcessing && !isPlaying && (
          <span className="text-sm text-gray-400">Ready to listen...</span>
        )}
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Mic className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Click the microphone to start speaking</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                msg.type === 'user' ? 'bg-blue-900/30 ml-8' :
                msg.type === 'assistant' ? 'bg-purple-900/30 mr-8' :
                msg.type === 'vibe-coding' ? 'bg-yellow-900/30 border-l-4 border-yellow-500' :
                'bg-gray-800/50'
              }`}
            >
              <div className="flex items-start gap-2">
                {msg.type === 'vibe-coding' && (
                  <Zap className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <span className="font-semibold text-sm">
                    {msg.type === 'user' ? 'You' :
                     msg.type === 'assistant' ? 'Mr. Blue' :
                     msg.type === 'vibe-coding' ? 'Vibe Coding' :
                     'System'}
                  </span>
                  <p className="mt-1">{msg.content}</p>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export type { TranscriptMessage };
