import { useState } from "react";
import { Bot, X, Mic, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MrBlueChat } from "./MrBlueChat";
import { AudioConversationButton } from "../AudioConversationButton";
import { useAuth } from "@/contexts/AuthContext";

export function MrBlueFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'chat' | 'voice'>('chat');
  const { user } = useAuth();

  // Hide if URL has hideControls=true (for iframe embedding)
  const urlParams = new URLSearchParams(window.location.search);
  const hideControls = urlParams.get('hideControls') === 'true';
  
  if (hideControls) {
    return null;
  }
  
  // RBAC: Only show Mr Blue to authenticated users
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Chat Panel - Positioned higher z-index when open */}
      {isOpen && mode === 'chat' && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-card border rounded-lg shadow-2xl z-[60] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/50">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Mr. Blue AI</h3>
            </div>
            <div className="flex items-center gap-2">
              {/* Mode Toggle Button */}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setMode('voice')}
                title="Switch to voice mode"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                data-testid="button-mr-blue-close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Component */}
          <MrBlueChat />
        </div>
      )}

      {/* Voice Mode - Use AudioConversationButton in inline mode when panel is open */}
      {isOpen && mode === 'voice' && (
        <div className="fixed bottom-6 right-6 w-96 bg-card border rounded-lg shadow-2xl z-[60] p-6 flex flex-col items-center gap-4">
          {/* Header */}
          <div className="flex items-center justify-between w-full pb-4 border-b">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Voice Chat</h3>
            </div>
            <div className="flex items-center gap-2">
              {/* Mode Toggle Button */}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setMode('chat')}
                title="Switch to chat mode"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Voice Instructions */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Click the microphone button below to start talking</p>
            <p className="mt-1">I can help you navigate the site and answer questions</p>
          </div>

          {/* Audio Conversation Button */}
          <AudioConversationButton
            variant="inline"
            onTranscription={(text) => console.log('Transcription:', text)}
            onResponse={(text, audioUrl) => console.log('Response:', text, audioUrl)}
          />
        </div>
      )}

      {/* Floating Button - Always visible */}
      <Button
        size="icon"
        className="!fixed !bottom-6 !right-6 h-14 w-14 rounded-full shadow-lg !z-50 transition-all duration-200 bg-primary hover:bg-primary/90"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-mr-blue-open"
      >
        {mode === 'voice' ? (
          <Mic className="h-6 w-6" />
        ) : (
          <Bot className="h-6 w-6" />
        )}
      </Button>
    </>
  );
}
