import { useState } from 'react';
import { ModeSwitcher, type MrBlueMode } from './ModeSwitcher';
import { MrBlueChat } from './MrBlueChat';
import VisualEditorPage from '@/pages/VisualEditorPage';

export function UnifiedMrBlue() {
  const [mode, setMode] = useState<MrBlueMode>('text');
  const [continuousVoiceEnabled, setContinuousVoiceEnabled] = useState(false);
  const [vibecodingEnabled, setVibecodingEnabled] = useState(false);
  
  const handleModeChange = (newMode: MrBlueMode) => {
    setMode(newMode);
    
    // Auto-enable features based on mode
    if (newMode === 'voice') {
      setContinuousVoiceEnabled(true);
    }
    
    if (newMode === 'vibecoding' || newMode === 'visual_editor') {
      setVibecodingEnabled(true);
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Screen-reader-only h1 for accessibility */}
      <h1 className="sr-only">Mr. Blue AI Assistant</h1>
      
      {/* Mode switcher header */}
      <div className="p-4 border-b">
        <ModeSwitcher currentMode={mode} onModeChange={handleModeChange} />
      </div>
      
      {/* Content area - each child component handles its own main landmark */}
      <div className="flex-1 overflow-hidden">
        {mode === 'visual_editor' ? (
          <VisualEditorPage />
        ) : (
          <MrBlueChat
            enableVoice={mode === 'voice' || continuousVoiceEnabled}
            enableVibecoding={vibecodingEnabled}
            mode={mode}
          />
        )}
      </div>
    </div>
  );
}
