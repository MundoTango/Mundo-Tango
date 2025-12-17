/**
 * Element Properties Popup - Replit-style
 * Shows when clicking an element in Visual Editor
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Trash2, AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ElementPropertiesPopupProps {
  element: {
    tagName: string;
    testId: string;
    styles: {
      fontSize?: string;
      fontWeight?: string;
      textAlign?: string;
      color?: string;
      backgroundColor?: string;
      margin?: string;
      padding?: string;
    };
    text?: string;
  } | null;
  position: { x: number; y: number };
  onClose: () => void;
  onSave: (changes: any) => void;
  onDelete: () => void;
}

export function ElementPropertiesPopup({
  element,
  position,
  onClose,
  onSave,
  onDelete
}: ElementPropertiesPopupProps) {
  const { toast } = useToast();
  const [fontSize, setFontSize] = useState(element?.styles?.fontSize || "16px");
  const [fontWeight, setFontWeight] = useState(element?.styles?.fontWeight || "Regular");
  const [textAlign, setTextAlign] = useState(element?.styles?.textAlign || "left");
  const [textColor, setTextColor] = useState(element?.styles?.color || "#000000");
  const [backgroundColor, setBackgroundColor] = useState(element?.styles?.backgroundColor || "transparent");
  const [margin, setMargin] = useState(element?.styles?.margin || "0");
  const [padding, setPadding] = useState(element?.styles?.padding || "0");

  useEffect(() => {
    if (element) {
      setFontSize(element.styles?.fontSize || "16px");
      setFontWeight(element.styles?.fontWeight || "Regular");
      setTextAlign(element.styles?.textAlign || "left");
      setTextColor(element.styles?.color || "#000000");
      setBackgroundColor(element.styles?.backgroundColor || "transparent");
      setMargin(element.styles?.margin || "0");
      setPadding(element.styles?.padding || "0");
    }
  }, [element]);

  if (!element) return null;

  const handleSave = () => {
    const changes = {
      fontSize,
      fontWeight,
      textAlign,
      color: textColor,
      backgroundColor,
      margin,
      padding
    };
    
    onSave(changes);
    toast({
      title: "Changes saved",
      description: `Updated ${element.tagName} properties`
    });
  };

  const handleDelete = () => {
    onDelete();
    toast({
      title: "Element deleted",
      description: `Removed ${element.tagName} from page`,
      variant: "destructive"
    });
  };

  return (
    <div
      className="fixed bg-card border rounded-lg shadow-2xl z-[9999] w-[700px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      data-testid="popup-element-properties"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-mono">
            {element.tagName}
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          data-testid="button-close-popup"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
        {/* Text Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Text</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fontSize" className="text-xs">Font size</Label>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger id="fontSize" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12px">12px</SelectItem>
                  <SelectItem value="14px">14px</SelectItem>
                  <SelectItem value="16px">16px</SelectItem>
                  <SelectItem value="18px">18px</SelectItem>
                  <SelectItem value="20px">20px</SelectItem>
                  <SelectItem value="24px">24px</SelectItem>
                  <SelectItem value="32px">32px</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontWeight" className="text-xs">Font weight</Label>
              <Select value={fontWeight} onValueChange={setFontWeight}>
                <SelectTrigger id="fontWeight" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Light">Light</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Semibold">Semibold</SelectItem>
                  <SelectItem value="Bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Alignment</Label>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant={textAlign === 'left' ? 'default' : 'outline'}
                onClick={() => setTextAlign('left')}
                className="h-9 w-9"
                data-testid="button-align-left"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant={textAlign === 'center' ? 'default' : 'outline'}
                onClick={() => setTextAlign('center')}
                className="h-9 w-9"
                data-testid="button-align-center"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant={textAlign === 'right' ? 'default' : 'outline'}
                onClick={() => setTextAlign('right')}
                className="h-9 w-9"
                data-testid="button-align-right"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant={textAlign === 'justify' ? 'default' : 'outline'}
                onClick={() => setTextAlign('justify')}
                className="h-9 w-9"
                data-testid="button-align-justify"
              >
                <AlignJustify className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Appearance</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="textColor" className="text-xs">Text Color</Label>
              <div className="flex gap-2">
                <div className="h-9 w-9 rounded border flex-shrink-0" style={{ backgroundColor: textColor }} />
                <Input
                  id="textColor"
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-9 font-mono text-xs"
                  data-testid="input-text-color"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bgColor" className="text-xs">Background Color</Label>
              <div className="flex gap-2">
                <div 
                  className="h-9 w-9 rounded border flex-shrink-0"
                  style={{ 
                    backgroundColor: backgroundColor === 'transparent' ? '#fff' : backgroundColor,
                    backgroundImage: backgroundColor === 'transparent' ? 
                      'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 
                      'none',
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                  }}
                />
                <Input
                  id="bgColor"
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-9 font-mono text-xs"
                  data-testid="input-bg-color"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Layout Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Layout</h3>
          
          <div className="space-y-2">
            <Label htmlFor="margin" className="text-xs">Margin</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                id="margin"
                type="text"
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                placeholder="0"
                className="h-9 font-mono text-xs"
                data-testid="input-margin"
              />
              <Input
                type="text"
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                placeholder="0"
                className="h-9 font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="padding" className="text-xs">Padding</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                id="padding"
                type="text"
                value={padding}
                onChange={(e) => setPadding(e.target.value)}
                placeholder="0"
                className="h-9 font-mono text-xs"
                data-testid="input-padding"
              />
              <Input
                type="text"
                value={padding}
                onChange={(e) => setPadding(e.target.value)}
                placeholder="0"
                className="h-9 font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t">
        <Button
          variant="destructive"
          onClick={handleDelete}
          className="gap-2"
          data-testid="button-delete-element"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
        <Button
          onClick={handleSave}
          data-testid="button-save-changes"
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}
