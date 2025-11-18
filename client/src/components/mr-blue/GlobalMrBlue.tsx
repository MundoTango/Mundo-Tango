import { useState, useEffect } from 'react';
import { Bot, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import MrBlueChat from '@/components/mrBlue/MrBlueChat';
import ComputerUseAutomation from '@/components/mr-blue/ComputerUseAutomation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * GLOBAL MR. BLUE - Floating AI Assistant
 * 
 * Accessible from any page for god-level users (roleLevel >= 8)
 * Features:
 * - Floating button in bottom-right corner
 * - Slide-out panel overlaying current page
 * - Full chat + computer use capabilities
 * - Keyboard shortcut: Ctrl+Shift+B
 */
export default function GlobalMrBlue() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'computer-use'>('chat');

  // Only show for admin users (roleLevel >= 8)
  if (!user || (user.roleLevel ?? 0) < 8) {
    return null;
  }

  // Keyboard shortcut: Ctrl+Shift+B
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        size="icon"
        data-testid="button-global-mrblue"
      >
        <Bot className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none"
      data-testid="global-mrblue-panel"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 pointer-events-auto"
        onClick={() => setIsOpen(false)}
      />

      {/* Panel */}
      <div 
        className={`absolute right-0 top-0 h-full bg-background border-l shadow-2xl pointer-events-auto transition-all duration-300 ${
          isMinimized ? 'w-16' : 'w-full sm:w-[500px] lg:w-[600px]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-white" />
            {!isMinimized && (
              <h2 className="font-semibold text-white">Mr. Blue AI</h2>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 text-white hover:bg-white/20"
              data-testid="button-minimize-mrblue"
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-white hover:bg-white/20"
              data-testid="button-close-mrblue"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="h-[calc(100%-65px)] overflow-hidden">
            <Tabs 
              value={activeTab} 
              onValueChange={(v) => setActiveTab(v as 'chat' | 'computer-use')}
              className="h-full flex flex-col"
            >
              <TabsList className="w-full justify-start rounded-none border-b px-4">
                <TabsTrigger 
                  value="chat" 
                  className="flex-1"
                  data-testid="tab-chat"
                >
                  Chat
                </TabsTrigger>
                <TabsTrigger 
                  value="computer-use" 
                  className="flex-1"
                  data-testid="tab-computer-use"
                >
                  Computer Use
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="flex-1 mt-0 p-0 overflow-hidden">
                <MrBlueChat 
                  enableComputerUse={true}
                  onComputerUseRequest={() => setActiveTab('computer-use')}
                />
              </TabsContent>

              <TabsContent value="computer-use" className="flex-1 mt-0 p-0 overflow-hidden">
                <ComputerUseAutomation />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
