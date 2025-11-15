import { Button } from '@/components/ui/button';
import { MessageSquare, Mic, Code, Layout } from 'lucide-react';

export type MrBlueMode = 'text' | 'voice' | 'vibecoding' | 'visual_editor';

export function ModeSwitcher({ currentMode, onModeChange }: ModeSwitcherProps) {
  const modes = [
    { id: 'text' as MrBlueMode, icon: MessageSquare, label: 'Text Chat' },
    { id: 'voice' as MrBlueMode, icon: Mic, label: 'Voice Chat' },
    { id: 'vibecoding' as MrBlueMode, icon: Code, label: 'Vibecoding' },
    { id: 'visual_editor' as MrBlueMode, icon: Layout, label: 'Visual Editor' },
  ];
  
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {modes.map((mode) => (
        <Button
          key={mode.id}
          size="sm"
          variant={currentMode === mode.id ? 'default' : 'ghost'}
          onClick={() => onModeChange(mode.id)}
          className="flex items-center gap-2"
          data-testid={`button-mode-${mode.id}`}
        >
          <mode.icon className="w-4 h-4" />
          <span className="hidden md:inline">{mode.label}</span>
        </Button>
      ))}
    </div>
  );
}

interface ModeSwitcherProps {
  currentMode: MrBlueMode;
  onModeChange: (mode: MrBlueMode) => void;
}
