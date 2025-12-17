import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Undo2, Redo2 } from 'lucide-react';
import { applyInstantChange } from '@/lib/iframeInjector';
import { visualEditorTracker } from '@/lib/visualEditorTracker';
import DOMPurify from 'dompurify';

interface ElementInspectorProps {
  element: HTMLElement | null;
  iframe: HTMLIFrameElement | null;
  changeCount: number;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const SYSTEM_FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'Verdana',
  'Trebuchet MS',
  'Palatino',
  'Garamond',
  'Comic Sans MS',
  'Impact',
  'system-ui',
  'Inter',
  'Playfair Display'
];

const BORDER_STYLES = [
  'solid',
  'dashed',
  'dotted',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
  'none'
];

export function ElementInspector({ 
  element, 
  iframe,
  changeCount = 0,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}: ElementInspectorProps) {
  const [editableContent, setEditableContent] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [borderColor, setBorderColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(16);
  const [padding, setPadding] = useState(0);
  const [margin, setMargin] = useState(0);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontWeight, setFontWeight] = useState('normal');
  const [fontStyle, setFontStyle] = useState('normal');
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderStyle, setBorderStyle] = useState('solid');
  const [borderRadius, setBorderRadius] = useState(0);

  // Initialize values when element changes
  useEffect(() => {
    if (!element) return;

    const computedStyle = window.getComputedStyle(element);
    
    // Set initial values from computed styles
    setBackgroundColor(rgbToHex(computedStyle.backgroundColor) || '#ffffff');
    setTextColor(rgbToHex(computedStyle.color) || '#000000');
    setBorderColor(rgbToHex(computedStyle.borderColor) || '#000000');
    setFontSize(parseInt(computedStyle.fontSize) || 16);
    setPadding(parseInt(computedStyle.padding) || 0);
    setMargin(parseInt(computedStyle.margin) || 0);
    setFontFamily(computedStyle.fontFamily.split(',')[0].replace(/['"]/g, '').trim());
    setFontWeight(computedStyle.fontWeight === '700' || computedStyle.fontWeight === 'bold' ? 'bold' : 'normal');
    setFontStyle(computedStyle.fontStyle || 'normal');
    setBorderWidth(parseInt(computedStyle.borderWidth) || 0);
    setBorderStyle(computedStyle.borderStyle || 'solid');
    setBorderRadius(parseInt(computedStyle.borderRadius) || 0);
    setEditableContent(element.innerHTML || '');
  }, [element]);

  // Apply style change with instant update
  const applyStyleChange = useCallback((property: string, value: string | number) => {
    if (!iframe || !element) return;

    const stringValue = String(value);
    
    // Track change
    const previousValue = element.style[property as any] || '';
    
    visualEditorTracker.track({
      elementId: element.id || 'unknown',
      elementTestId: element.getAttribute('data-testid') || '',
      changeType: 'style',
      changes: {
        [property]: { before: previousValue, after: stringValue }
      },
      description: `Changed ${property} from ${previousValue} to ${stringValue}`
    });

    // Send APPLY_STYLE message to iframe
    applyInstantChange(iframe, {
      type: 'style',
      property,
      value: stringValue
    });
  }, [iframe, element]);

  // Handle color changes
  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
    applyStyleChange('backgroundColor', color);
  };

  const handleTextColorChange = (color: string) => {
    setTextColor(color);
    applyStyleChange('color', color);
  };

  const handleBorderColorChange = (color: string) => {
    setBorderColor(color);
    applyStyleChange('borderColor', color);
  };

  // Handle slider changes
  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    applyStyleChange('fontSize', `${newSize}px`);
  };

  const handlePaddingChange = (value: number[]) => {
    const newPadding = value[0];
    setPadding(newPadding);
    applyStyleChange('padding', `${newPadding}px`);
  };

  const handleMarginChange = (value: number[]) => {
    const newMargin = value[0];
    setMargin(newMargin);
    applyStyleChange('margin', `${newMargin}px`);
  };

  const handleBorderWidthChange = (value: number[]) => {
    const newWidth = value[0];
    setBorderWidth(newWidth);
    applyStyleChange('borderWidth', `${newWidth}px`);
  };

  const handleBorderRadiusChange = (value: number[]) => {
    const newRadius = value[0];
    setBorderRadius(newRadius);
    applyStyleChange('borderRadius', `${newRadius}px`);
  };

  // Handle font family change
  const handleFontFamilyChange = (value: string) => {
    setFontFamily(value);
    applyStyleChange('fontFamily', value);
  };

  // Handle font weight toggle
  const handleFontWeightChange = (value: string) => {
    if (!value) return;
    setFontWeight(value);
    applyStyleChange('fontWeight', value);
  };

  // Handle font style toggle
  const handleFontStyleChange = (value: string) => {
    if (!value) return;
    setFontStyle(value);
    applyStyleChange('fontStyle', value);
  };

  // Handle border style change
  const handleBorderStyleChange = (value: string) => {
    setBorderStyle(value);
    applyStyleChange('borderStyle', value);
  };

  // Handle HTML content editing
  const handleContentChange = (newContent: string) => {
    setEditableContent(newContent);
  };

  const handleContentBlur = () => {
    if (!iframe || !element) return;

    // Sanitize HTML to prevent XSS
    const sanitizedContent = DOMPurify.sanitize(editableContent, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'span', 'div', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'class', 'id', 'style']
    });

    const previousContent = element.innerHTML;

    visualEditorTracker.track({
      elementId: element.id || 'unknown',
      elementTestId: element.getAttribute('data-testid') || '',
      changeType: 'text',
      changes: {
        innerHTML: { before: previousContent, after: sanitizedContent }
      },
      description: 'Updated element HTML content'
    });

    // Send UPDATE_CONTENT message to iframe
    applyInstantChange(iframe, {
      type: 'html',
      value: sanitizedContent
    });
  };

  if (!element) {
    return (
      <Card data-testid="element-inspector-empty">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Element Inspector</CardTitle>
            {changeCount > 0 && (
              <Badge variant="secondary" data-testid="change-count-badge">
                {changeCount} {changeCount === 1 ? 'change' : 'changes'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click an element to inspect it
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const computedStyle = window.getComputedStyle(element);
  const classList = element.className ? element.className.split(' ').filter(Boolean) : [];
  
  return (
    <Card data-testid="element-inspector">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Element Inspector</CardTitle>
          <div className="flex items-center gap-2">
            {changeCount > 0 && (
              <Badge variant="secondary" data-testid="change-count-badge">
                {changeCount} {changeCount === 1 ? 'change' : 'changes'}
              </Badge>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={onUndo}
              disabled={!canUndo}
              data-testid="button-undo"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onRedo}
              disabled={!canRedo}
              data-testid="button-redo"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2">Element Info</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tag:</span>
              <Badge variant="secondary" data-testid="element-tag">
                {element.tagName.toLowerCase()}
              </Badge>
            </div>
            {element.id && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">ID:</span>
                <code className="text-sm bg-muted px-2 py-1 rounded" data-testid="element-id">
                  #{element.id}
                </code>
              </div>
            )}
            {element.getAttribute('data-testid') && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Test ID:</span>
                <code className="text-sm bg-muted px-2 py-1 rounded" data-testid="element-testid">
                  {element.getAttribute('data-testid')}
                </code>
              </div>
            )}
            {classList.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">Classes:</span>
                <div className="flex flex-wrap gap-1" data-testid="element-classes">
                  {classList.map((cls, index) => (
                    <Badge key={`${cls}-${index}`} variant="outline">
                      .{cls}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* HTML Content Editor */}
        <div className="space-y-2">
          <Label htmlFor="html-content" className="text-sm font-semibold">
            HTML Content
          </Label>
          <Textarea
            id="html-content"
            value={editableContent}
            onChange={(e) => handleContentChange(e.target.value)}
            onBlur={handleContentBlur}
            className="font-mono text-xs min-h-[100px]"
            placeholder="Edit HTML content..."
            data-testid="input-html-content"
          />
          <p className="text-xs text-muted-foreground">
            HTML is sanitized to prevent XSS attacks
          </p>
        </div>

        <Separator />

        {/* Live CSS Editor */}
        <ScrollArea className="h-[500px]">
          <div className="space-y-4 pr-4">
            <h4 className="text-sm font-semibold">Live CSS Editor</h4>

            {/* Color Controls */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="bg-color" className="text-xs">Background Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="bg-color"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => handleBackgroundColorChange(e.target.value)}
                    className="w-20 h-9"
                    data-testid="input-bg-color"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => handleBackgroundColorChange(e.target.value)}
                    className="flex-1 font-mono text-xs"
                    data-testid="input-bg-color-text"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text-color" className="text-xs">Text Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="text-color"
                    type="color"
                    value={textColor}
                    onChange={(e) => handleTextColorChange(e.target.value)}
                    className="w-20 h-9"
                    data-testid="input-text-color"
                  />
                  <Input
                    type="text"
                    value={textColor}
                    onChange={(e) => handleTextColorChange(e.target.value)}
                    className="flex-1 font-mono text-xs"
                    data-testid="input-text-color-text"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="border-color" className="text-xs">Border Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="border-color"
                    type="color"
                    value={borderColor}
                    onChange={(e) => handleBorderColorChange(e.target.value)}
                    className="w-20 h-9"
                    data-testid="input-border-color"
                  />
                  <Input
                    type="text"
                    value={borderColor}
                    onChange={(e) => handleBorderColorChange(e.target.value)}
                    className="flex-1 font-mono text-xs"
                    data-testid="input-border-color-text"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Typography Controls */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="font-size" className="text-xs">
                  Font Size: {fontSize}px
                </Label>
                <Slider
                  id="font-size"
                  min={8}
                  max={72}
                  step={1}
                  value={[fontSize]}
                  onValueChange={handleFontSizeChange}
                  data-testid="slider-font-size"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-family" className="text-xs">Font Family</Label>
                <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
                  <SelectTrigger id="font-family" data-testid="select-font-family">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SYSTEM_FONTS.map((font) => (
                      <SelectItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>{font}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Font Weight</Label>
                <ToggleGroup
                  type="single"
                  value={fontWeight}
                  onValueChange={handleFontWeightChange}
                  data-testid="toggle-font-weight"
                >
                  <ToggleGroupItem value="normal" className="flex-1">
                    Normal
                  </ToggleGroupItem>
                  <ToggleGroupItem value="bold" className="flex-1">
                    <strong>Bold</strong>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Font Style</Label>
                <ToggleGroup
                  type="single"
                  value={fontStyle}
                  onValueChange={handleFontStyleChange}
                  data-testid="toggle-font-style"
                >
                  <ToggleGroupItem value="normal" className="flex-1">
                    Normal
                  </ToggleGroupItem>
                  <ToggleGroupItem value="italic" className="flex-1">
                    <em>Italic</em>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

            <Separator />

            {/* Spacing Controls */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="padding" className="text-xs">
                  Padding: {padding}px
                </Label>
                <Slider
                  id="padding"
                  min={0}
                  max={100}
                  step={1}
                  value={[padding]}
                  onValueChange={handlePaddingChange}
                  data-testid="slider-padding"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="margin" className="text-xs">
                  Margin: {margin}px
                </Label>
                <Slider
                  id="margin"
                  min={0}
                  max={100}
                  step={1}
                  value={[margin]}
                  onValueChange={handleMarginChange}
                  data-testid="slider-margin"
                />
              </div>
            </div>

            <Separator />

            {/* Border Controls */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="border-width" className="text-xs">
                  Border Width: {borderWidth}px
                </Label>
                <Slider
                  id="border-width"
                  min={0}
                  max={20}
                  step={1}
                  value={[borderWidth]}
                  onValueChange={handleBorderWidthChange}
                  data-testid="slider-border-width"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="border-style" className="text-xs">Border Style</Label>
                <Select value={borderStyle} onValueChange={handleBorderStyleChange}>
                  <SelectTrigger id="border-style" data-testid="select-border-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BORDER_STYLES.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="border-radius" className="text-xs">
                  Border Radius: {borderRadius}px
                </Label>
                <Slider
                  id="border-radius"
                  min={0}
                  max={50}
                  step={1}
                  value={[borderRadius]}
                  onValueChange={handleBorderRadiusChange}
                  data-testid="slider-border-radius"
                />
              </div>
            </div>

            <Separator />

            {/* Read-only Computed Styles */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Computed Styles (Read-only)</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Display:</span>
                  <code className="bg-muted px-2 py-0.5 rounded">{computedStyle.display}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position:</span>
                  <code className="bg-muted px-2 py-0.5 rounded">{computedStyle.position}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Width:</span>
                  <code className="bg-muted px-2 py-0.5 rounded">{computedStyle.width}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Height:</span>
                  <code className="bg-muted px-2 py-0.5 rounded">{computedStyle.height}</code>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Helper function to convert RGB to HEX
function rgbToHex(rgb: string): string {
  if (rgb.startsWith('#')) return rgb;
  
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
  if (!match) return '#000000';
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}
