/**
 * Edit Controls
 * 4-tab interface (Position/Size/Style/Text) with glassmorphic design
 * Provides visual editing controls for selected components
 */

import { useState } from "react";
import { Move, Maximize, Palette, Type, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SelectedComponent } from "./ComponentSelector";

interface EditControlsProps {
  component: SelectedComponent | null;
  onClose: () => void;
  onChange: (updates: ComponentUpdates) => void;
}

export interface ComponentUpdates {
  type: 'position' | 'size' | 'style' | 'text';
  changes: Record<string, any>;
}

export function EditControls({ component, onClose, onChange }: EditControlsProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [textContent, setTextContent] = useState('');

  if (!component) return null;

  const handlePositionChange = () => {
    onChange({
      type: 'position',
      changes: { left: position.x, top: position.y }
    });
  };

  const handleSizeChange = () => {
    onChange({
      type: 'size',
      changes: { width: size.width, height: size.height }
    });
  };

  const handleTextChange = () => {
    onChange({
      type: 'text',
      changes: { text: textContent }
    });
  };

  const handleStyleChange = (property: string, value: string) => {
    onChange({
      type: 'style',
      changes: { [property]: value }
    });
  };

  return (
    <div 
      className="fixed right-6 top-20 w-80 glass-card rounded-xl shadow-2xl z-50"
      data-visual-editor="edit-controls"
      data-testid="panel-edit-controls"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-ocean-divider">
        <div>
          <h3 className="font-semibold text-sm">Edit Component</h3>
          <p className="text-xs text-muted-foreground">{component.tagName}</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          data-testid="button-close-edit-controls"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="position" className="p-4">
        <TabsList className="grid grid-cols-4 w-full mb-4">
          <TabsTrigger value="position" data-testid="tab-position">
            <Move className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="size" data-testid="tab-size">
            <Maximize className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="style" data-testid="tab-style">
            <Palette className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="text" data-testid="tab-text">
            <Type className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        {/* Position Tab */}
        <TabsContent value="position" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">X Position</Label>
              <Input
                type="number"
                value={position.x}
                onChange={(e) => setPosition({ ...position, x: Number(e.target.value) })}
                className="h-8"
                data-testid="input-position-x"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Y Position</Label>
              <Input
                type="number"
                value={position.y}
                onChange={(e) => setPosition({ ...position, y: Number(e.target.value) })}
                className="h-8"
                data-testid="input-position-y"
              />
            </div>
          </div>
          <Button 
            onClick={handlePositionChange} 
            className="w-full" 
            size="sm"
            data-testid="button-apply-position"
          >
            Apply Position
          </Button>
        </TabsContent>

        {/* Size Tab */}
        <TabsContent value="size" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Width</Label>
              <Input
                type="number"
                value={size.width}
                onChange={(e) => setSize({ ...size, width: Number(e.target.value) })}
                className="h-8"
                data-testid="input-size-width"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Height</Label>
              <Input
                type="number"
                value={size.height}
                onChange={(e) => setSize({ ...size, height: Number(e.target.value) })}
                className="h-8"
                data-testid="input-size-height"
              />
            </div>
          </div>
          <Button 
            onClick={handleSizeChange} 
            className="w-full" 
            size="sm"
            data-testid="button-apply-size"
          >
            Apply Size
          </Button>
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Background Color</Label>
              <Select onValueChange={(val) => handleStyleChange('backgroundColor', val)}>
                <SelectTrigger className="h-8" data-testid="select-bg-color">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hsl(var(--primary))">Primary</SelectItem>
                  <SelectItem value="hsl(var(--secondary))">Secondary</SelectItem>
                  <SelectItem value="hsl(var(--accent))">Accent</SelectItem>
                  <SelectItem value="hsl(var(--muted))">Muted</SelectItem>
                  <SelectItem value="transparent">Transparent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Text Color</Label>
              <Select onValueChange={(val) => handleStyleChange('color', val)}>
                <SelectTrigger className="h-8" data-testid="select-text-color">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hsl(var(--foreground))">Foreground</SelectItem>
                  <SelectItem value="hsl(var(--primary))">Primary</SelectItem>
                  <SelectItem value="hsl(var(--muted-foreground))">Muted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Border Radius</Label>
              <Select onValueChange={(val) => handleStyleChange('borderRadius', val)}>
                <SelectTrigger className="h-8" data-testid="select-border-radius">
                  <SelectValue placeholder="Select radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  <SelectItem value="var(--radius-sm)">Small</SelectItem>
                  <SelectItem value="var(--radius-md)">Medium</SelectItem>
                  <SelectItem value="var(--radius-lg)">Large</SelectItem>
                  <SelectItem value="var(--radius-full)">Full</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* Text Tab */}
        <TabsContent value="text" className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Text Content</Label>
            <Input
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Enter text..."
              className="h-8"
              data-testid="input-text-content"
            />
          </div>
          <Button 
            onClick={handleTextChange} 
            className="w-full" 
            size="sm"
            data-testid="button-apply-text"
          >
            Apply Text
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
