import { useState } from "react";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MrBlueChat } from "./MrBlueChat";

export function MrBlueFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  // Hide if URL has hideControls=true (for iframe embedding)
  const urlParams = new URLSearchParams(window.location.search);
  const hideControls = urlParams.get('hideControls') === 'true';
  
  if (hideControls) {
    return null;
  }

  return (
    <>
      {/* Chat Panel - Positioned higher z-index when open */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-card border rounded-lg shadow-2xl z-[60] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/50">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Mr. Blue AI</h3>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              data-testid="button-mr-blue-close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat Component */}
          <MrBlueChat />
        </div>
      )}
      {/* Floating Button - Always visible */}
      <Button
        size="icon"
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover-elevate active-elevate-2 text-primary-foreground border border-primary-border fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 transition-all duration-200 bg-primary hover:bg-primary/90 ml-[1380px] mr-[1380px] mt-[-40px] mb-[-40px]"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-mr-blue-open"
      >
        <Bot className="h-6 w-6" />
      </Button>
    </>
  );
}
