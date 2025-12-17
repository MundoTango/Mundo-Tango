import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Save, Type, Palette, Layout, Code2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ElementPropertiesPanelProps {
  element: any;
  onSave: (changes: any) => void;
  onDelete: () => void;
}

export function ElementPropertiesPanel({ element, onSave, onDelete }: ElementPropertiesPanelProps) {
  const [textContent, setTextContent] = useState(element.text || "");
  const [fontSize, setFontSize] = useState(element.styles?.fontSize || "16px");
  const [textColor, setTextColor] = useState(element.styles?.color || "#000000");
  const [backgroundColor, setBackgroundColor] = useState(element.styles?.backgroundColor || "transparent");
  const [margin, setMargin] = useState(element.styles?.margin || "0");
  const [padding, setPadding] = useState(element.styles?.padding || "0");

  const handleSave = () => {
    onSave({
      textContent,
      fontSize,
      textColor,
      backgroundColor,
      margin,
      padding
    });
  };

  return (
    <div className="space-y-6">
      {/* Element Info Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Element Properties</h3>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            data-testid="button-delete-element"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Element Tags */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            <Code2 className="h-3 w-3 mr-1" />
            {element.tagName}
          </Badge>
          {element.id && (
            <Badge variant="secondary" className="font-mono text-xs">
              #{element.id}
            </Badge>
          )}
          {element.testId && (
            <Badge variant="secondary" className="font-mono text-xs">
              data-testid="{element.testId}"
            </Badge>
          )}
        </div>

        {/* Classes */}
        {element.className && (
          <div className="mt-2">
            <Label className="text-xs text-muted-foreground">Classes</Label>
            <p className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">
              {element.className}
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Text Content Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Type className="h-4 w-4" />
          <Label className="font-semibold">Text Content</Label>
        </div>
        
        <div>
          <Label htmlFor="text-content" className="text-xs">Content</Label>
          <Textarea
            id="text-content"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Element text content..."
            className="mt-1 min-h-[80px]"
            data-testid="input-text-content"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="font-size" className="text-xs">Font Size</Label>
            <Input
              id="font-size"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              placeholder="16px"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Appearance Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="h-4 w-4" />
          <Label className="font-semibold">Appearance</Label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="text-color" className="text-xs">Text Color</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="text-color"
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-16 h-9 p-1"
              />
              <Input
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bg-color" className="text-xs">Background</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="bg-color"
                type="color"
                value={backgroundColor === "transparent" ? "#ffffff" : backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-16 h-9 p-1"
              />
              <Input
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="transparent"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Layout Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Layout className="h-4 w-4" />
          <Label className="font-semibold">Layout</Label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="margin" className="text-xs">Margin</Label>
            <Input
              id="margin"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              placeholder="0"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="padding" className="text-xs">Padding</Label>
            <Input
              id="padding"
              value={padding}
              onChange={(e) => setPadding(e.target.value)}
              placeholder="0"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Computed Styles Info */}
      {element.styles && Object.keys(element.styles).length > 0 && (
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Computed Styles</Label>
          <div className="bg-muted p-3 rounded font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
            {Object.entries(element.styles).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-muted-foreground">{key}:</span>
                <span className="text-foreground ml-2">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <Button
        onClick={handleSave}
        className="w-full"
        data-testid="button-save-element"
      >
        <Save className="h-4 w-4 mr-2" />
        Save Changes
      </Button>
    </div>
  );
}
