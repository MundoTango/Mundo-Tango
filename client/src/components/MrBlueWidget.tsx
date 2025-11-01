import { useState } from "react";
import { MessageSquare, X, Send, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function MrBlueWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    // TODO: Integrate with Mr Blue AI backend
    console.log("Sending message to Mr Blue:", message);
    setMessage("");
  };

  return (
    <>
      {/* Floating Mr Blue Button - Fixed Bottom Right */}
      {!isExpanded && (
        <div 
          className="fixed bottom-6 right-6 z-50"
          data-testid="mr-blue-widget-collapsed"
        >
          <Button
            size="lg"
            className="h-14 px-6 rounded-full shadow-2xl bg-gradient-to-r from-primary to-secondary hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
            onClick={() => setIsExpanded(true)}
            data-testid="button-open-mr-blue"
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Ask Mr Blue
          </Button>
        </div>
      )}

      {/* Expanded Chat Interface */}
      {isExpanded && (
        <Card 
          className="fixed bottom-6 right-6 z-50 w-[380px] h-[500px] flex flex-col shadow-2xl"
          data-testid="mr-blue-widget-expanded"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-secondary">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarFallback className="bg-white text-primary font-bold">
                  MB
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-white">Mr Blue AI</h3>
                <p className="text-xs text-white/80">Your Tango Assistant</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsExpanded(false)}
                data-testid="button-minimize-mr-blue"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsExpanded(false)}
                data-testid="button-close-mr-blue"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4" data-testid="mr-blue-chat-messages">
            {/* Welcome Message */}
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-primary text-white text-xs">MB</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Card className="p-3 bg-muted">
                  <p className="text-sm">
                    👋 Hi! I'm Mr Blue, your personal tango assistant. I can help you find events, 
                    connect with dancers, get dance tips, and much more. How can I assist you today?
                  </p>
                </Card>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask Mr Blue anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="resize-none min-h-[44px] max-h-[120px]"
                data-testid="input-mr-blue-message"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!message.trim()}
                data-testid="button-send-mr-blue"
                className="h-11 w-11"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
