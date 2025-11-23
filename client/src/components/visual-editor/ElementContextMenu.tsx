/**
 * Element Context Menu
 * Appears when user clicks an element in the Visual Editor iframe
 * Actions: Move, Edit Text, Change Colors, Delete
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Move, 
  Type, 
  Palette, 
  Trash2, 
  Copy,
  X
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ElementInfo {
  tagName: string;
  id?: string;
  className?: string;
  textContent?: string;
  testId?: string;
  selector: string;
}

interface ElementContextMenuProps {
  element: ElementInfo | null;
  position: { x: number; y: number } | null;
  visible: boolean;
  onMove: () => void;
  onEditText: () => void;
  onChangeColor: (color: 'brand' | 'accent' | 'muted') => void;
  onDelete: () => void;
  onCopy: () => void;
  onClose: () => void;
}

export function ElementContextMenu({
  element,
  position,
  visible,
  onMove,
  onEditText,
  onChangeColor,
  onDelete,
  onCopy,
  onClose
}: ElementContextMenuProps) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  if (!visible || !element || !position) {
    return null;
  }

  // Brand color options (MT Ocean Theme)
  const brandColors = [
    { name: 'Brand Blue', value: 'brand', color: 'hsl(var(--primary))' },
    { name: 'Accent Teal', value: 'accent', color: 'hsl(var(--accent))' },
    { name: 'Muted Gray', value: 'muted', color: 'hsl(var(--muted))' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
      }}
      data-testid="element-context-menu"
    >
      <Card className="p-2 shadow-lg border-2 min-w-[200px]">
        {/* Element Info Header */}
        <div className="flex items-center justify-between mb-2 px-2">
          <div className="flex flex-col">
            <span className="text-xs font-mono text-muted-foreground">
              {element.tagName.toLowerCase()}
            </span>
            {element.testId && (
              <span className="text-xs text-muted-foreground">
                [{element.testId}]
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
            data-testid="button-close-context-menu"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <Separator className="mb-2" />

        {/* Action Buttons */}
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={onMove}
            data-testid="button-move-element"
          >
            <Move className="h-4 w-4 mr-2" />
            Move Element
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={onEditText}
            data-testid="button-edit-text"
          >
            <Type className="h-4 w-4 mr-2" />
            Edit Text
          </Button>

          <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                data-testid="button-change-color"
              >
                <Palette className="h-4 w-4 mr-2" />
                Change Colors
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2" side="right">
              <div className="text-xs font-medium mb-2">Brand Colors</div>
              <div className="flex flex-col gap-1">
                {brandColors.map((brandColor) => (
                  <Button
                    key={brandColor.value}
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => {
                      onChangeColor(brandColor.value as any);
                      setColorPickerOpen(false);
                    }}
                    data-testid={`button-color-${brandColor.value}`}
                  >
                    <div
                      className="h-4 w-4 rounded border mr-2"
                      style={{ backgroundColor: brandColor.color }}
                    />
                    {brandColor.name}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={onCopy}
            data-testid="button-copy-element"
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>

          <Separator className="my-1" />

          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
            data-testid="button-delete-element"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Element
          </Button>
        </div>
      </Card>
    </div>
  );
}
