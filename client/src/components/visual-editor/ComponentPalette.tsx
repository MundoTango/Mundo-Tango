/**
 * Component Palette
 * Draggable component library (Heading, Text, Image, Button, Container)
 */

import { Type, AlignLeft, Image, Square, Package } from "lucide-react";
import type { ComponentType } from "./types";

interface ComponentPaletteProps {
  onDragStart: (type: ComponentType) => void;
}

interface PaletteItem {
  type: ComponentType;
  icon: React.ElementType;
  label: string;
}

const paletteItems: PaletteItem[] = [
  { type: 'heading', icon: Type, label: 'Heading' },
  { type: 'text', icon: AlignLeft, label: 'Text' },
  { type: 'image', icon: Image, label: 'Image' },
  { type: 'button', icon: Square, label: 'Button' },
  { type: 'container', icon: Package, label: 'Container' },
];

export function ComponentPalette({ onDragStart }: ComponentPaletteProps) {
  const handleDragStart = (type: ComponentType) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('componentType', type);
    onDragStart(type);
  };

  return (
    <div className="w-64 border-r border-ocean-divider bg-card p-4" data-testid="component-palette">
      <h3 className="text-sm font-semibold mb-4">Components</h3>
      
      <div className="space-y-2">
        {paletteItems.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.type}
              draggable
              onDragStart={handleDragStart(item.type)}
              className="flex items-center gap-3 p-3 rounded-md border border-ocean-divider bg-card hover-elevate cursor-move"
              data-testid={`palette-${item.type}`}
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-3 rounded-md bg-muted/50 border border-ocean-divider">
        <p className="text-xs text-muted-foreground">
          Drag components onto the canvas to start building your page
        </p>
      </div>
    </div>
  );
}
