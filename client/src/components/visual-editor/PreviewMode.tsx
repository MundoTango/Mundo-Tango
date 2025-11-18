/**
 * Preview Mode Component
 * Side-by-side (or other layouts) comparison of before/after changes
 * with synchronized scrolling, device emulation, and difference highlighting
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  X, Monitor, Tablet, Smartphone, RotateCw, 
  Camera, Check, XCircle, Edit, ChevronLeft, ChevronRight,
  SplitSquareHorizontal, SplitSquareVertical, Maximize2,
  Columns2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import type { VisualEdit } from "@/lib/visualEditorTracker";
import { captureIframeScreenshot, saveScreenshot } from "@/lib/screenshotCapture";

interface Device {
  name: string;
  width: number;
  height: number;
  icon: typeof Monitor | typeof Tablet | typeof Smartphone;
}

const DEVICES: Record<string, Device> = {
  desktop: { name: 'Desktop', width: 1920, height: 1080, icon: Monitor },
  tablet: { name: 'iPad', width: 768, height: 1024, icon: Tablet },
  mobile: { name: 'iPhone', width: 375, height: 667, icon: Smartphone },
};

type LayoutMode = 'side-by-side' | 'vertical' | 'slider' | 'toggle';

interface PreviewModeProps {
  originalHtml: string;
  currentHtml: string;
  changes: VisualEdit[];
  onApply: () => void;
  onDiscard: () => void;
  onContinueEditing: () => void;
  isOpen: boolean;
}

export function PreviewMode({
  originalHtml,
  currentHtml,
  changes,
  onApply,
  onDiscard,
  onContinueEditing,
  isOpen
}: PreviewModeProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('side-by-side');
  const [selectedDevice, setSelectedDevice] = useState<string>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [showBefore, setShowBefore] = useState(true);
  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [hoveredChange, setHoveredChange] = useState<VisualEdit | null>(null);
  
  const beforeIframeRef = useRef<HTMLIFrameElement>(null);
  const afterIframeRef = useRef<HTMLIFrameElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const device = DEVICES[selectedDevice];
  const actualWidth = orientation === 'portrait' ? device.height : device.width;
  const actualHeight = orientation === 'portrait' ? device.width : device.height;

  // Synchronized scrolling
  useEffect(() => {
    if (!isOpen || layoutMode === 'toggle' || layoutMode === 'slider') return;
    
    const beforeIframe = beforeIframeRef.current;
    const afterIframe = afterIframeRef.current;
    
    if (!beforeIframe || !afterIframe) return;
    
    let isScrolling = false;
    
    const syncScroll = (source: HTMLIFrameElement, target: HTMLIFrameElement) => {
      if (isScrolling) return;
      
      isScrolling = true;
      
      const sourceDoc = source.contentWindow;
      const targetDoc = target.contentWindow;
      
      if (sourceDoc && targetDoc) {
        const scrollTop = sourceDoc.scrollY;
        const scrollLeft = sourceDoc.scrollX;
        
        targetDoc.scrollTo(scrollLeft, scrollTop);
      }
      
      setTimeout(() => { isScrolling = false; }, 10);
    };
    
    const handleBeforeScroll = () => syncScroll(beforeIframe, afterIframe);
    const handleAfterScroll = () => syncScroll(afterIframe, beforeIframe);
    
    beforeIframe.contentWindow?.addEventListener('scroll', handleBeforeScroll);
    afterIframe.contentWindow?.addEventListener('scroll', handleAfterScroll);
    
    return () => {
      beforeIframe.contentWindow?.removeEventListener('scroll', handleBeforeScroll);
      afterIframe.contentWindow?.removeEventListener('scroll', handleAfterScroll);
    };
  }, [isOpen, layoutMode]);

  // Apply difference highlighting
  useEffect(() => {
    if (!isOpen || !highlightDifferences) return;
    
    const afterIframe = afterIframeRef.current;
    if (!afterIframe?.contentDocument) return;
    
    const afterDoc = afterIframe.contentDocument;
    
    // Highlight changed elements in after view (green outline)
    changes.forEach(change => {
      const selector = change.elementId ? `#${change.elementId}` : 
                       change.elementTestId ? `[data-testid="${change.elementTestId}"]` : null;
      
      if (!selector) return;
      
      const element = afterDoc.querySelector(selector) as HTMLElement;
      if (element) {
        element.style.outline = '2px solid #10b981'; // green-500
        element.style.outlineOffset = '2px';
        element.setAttribute('data-preview-changed', 'true');
        
        // Add hover listener for tooltip
        element.addEventListener('mouseenter', () => setHoveredChange(change));
        element.addEventListener('mouseleave', () => setHoveredChange(null));
      }
    });
    
    return () => {
      // Cleanup highlights
      changes.forEach(change => {
        const selector = change.elementId ? `#${change.elementId}` : 
                         change.elementTestId ? `[data-testid="${change.elementTestId}"]` : null;
        
        if (!selector) return;
        
        const element = afterDoc.querySelector(selector) as HTMLElement;
        if (element) {
          element.style.outline = '';
          element.style.outlineOffset = '';
          element.removeAttribute('data-preview-changed');
        }
      });
    };
  }, [isOpen, changes, highlightDifferences]);

  const handleSliderDrag = useCallback((e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    
    const container = sliderRef.current.parentElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  }, []);

  const handleTakeScreenshot = async () => {
    try {
      const screenshots: string[] = [];
      
      if (beforeIframeRef.current) {
        const beforeScreenshot = await captureIframeScreenshot(beforeIframeRef.current);
        screenshots.push(beforeScreenshot);
      }
      
      if (afterIframeRef.current) {
        const afterScreenshot = await captureIframeScreenshot(afterIframeRef.current);
        screenshots.push(afterScreenshot);
      }
      
      // Create side-by-side composite
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas not supported');
      
      canvas.width = actualWidth * 2 + 20; // 20px gap
      canvas.height = actualHeight;
      
      // Draw both screenshots
      for (let i = 0; i < screenshots.length; i++) {
        const img = new Image();
        img.src = screenshots[i];
        await new Promise((resolve) => { img.onload = resolve; });
        
        const x = i === 0 ? 0 : actualWidth + 20;
        ctx.drawImage(img, x, 0, actualWidth, actualHeight);
      }
      
      const compositeScreenshot = canvas.toDataURL('image/png');
      await saveScreenshot(compositeScreenshot, `preview-comparison-${Date.now()}.png`);
      
      toast({
        title: "Screenshot Captured!",
        description: "Before/after comparison saved",
        duration: 3000
      });
    } catch (error) {
      console.error('[PreviewMode] Screenshot failed:', error);
      toast({
        variant: "destructive",
        title: "Screenshot Failed",
        description: "Could not capture preview"
      });
    }
  };

  const handleApply = () => {
    if (confirm(`Apply ${changes.length} changes and save?`)) {
      onApply();
      toast({
        title: "Changes Applied",
        description: `${changes.length} edits saved successfully`,
        duration: 3000
      });
    }
  };

  const handleDiscard = () => {
    if (confirm(`Discard ${changes.length} changes? This cannot be undone.`)) {
      onDiscard();
      toast({
        title: "Changes Discarded",
        description: "Reverted to original version",
        duration: 3000
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-background" data-testid="preview-mode">
      {/* Toolbar */}
      <div className="h-14 border-b border-ocean-divider bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold">Preview Changes</h2>
          <Badge variant="default" data-testid="badge-change-count">
            {changes.length} {changes.length === 1 ? 'change' : 'changes'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout Mode Selector */}
          <div className="flex items-center gap-1 mr-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={layoutMode === 'side-by-side' ? 'default' : 'ghost'}
                  onClick={() => setLayoutMode('side-by-side')}
                  data-testid="button-layout-side-by-side"
                >
                  <Columns2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Side by Side</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={layoutMode === 'vertical' ? 'default' : 'ghost'}
                  onClick={() => setLayoutMode('vertical')}
                  data-testid="button-layout-vertical"
                >
                  <SplitSquareVertical className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Vertical Split</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={layoutMode === 'slider' ? 'default' : 'ghost'}
                  onClick={() => setLayoutMode('slider')}
                  data-testid="button-layout-slider"
                >
                  <SplitSquareHorizontal className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Slider</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={layoutMode === 'toggle' ? 'default' : 'ghost'}
                  onClick={() => setLayoutMode('toggle')}
                  data-testid="button-layout-toggle"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle View</TooltipContent>
            </Tooltip>
          </div>

          {/* Device Selector */}
          <Select value={selectedDevice} onValueChange={setSelectedDevice}>
            <SelectTrigger className="w-32" data-testid="select-device">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DEVICES).map(([key, dev]) => (
                <SelectItem key={key} value={key} data-testid={`select-device-${key}`}>
                  <div className="flex items-center gap-2">
                    <dev.icon className="h-4 w-4" />
                    {dev.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Orientation Toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setOrientation(o => o === 'portrait' ? 'landscape' : 'portrait')}
            data-testid="button-toggle-orientation"
          >
            <RotateCw className="h-4 w-4 mr-2" />
            {orientation === 'portrait' ? 'Portrait' : 'Landscape'}
          </Button>

          {/* Highlight Toggle */}
          <Button
            size="sm"
            variant={highlightDifferences ? 'default' : 'ghost'}
            onClick={() => setHighlightDifferences(!highlightDifferences)}
            data-testid="button-toggle-highlights"
          >
            Highlight Changes
          </Button>

          {/* Screenshot */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleTakeScreenshot}
            data-testid="button-take-screenshot"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="h-[calc(100vh-7rem)] overflow-auto bg-muted/30 flex items-center justify-center p-8">
        {layoutMode === 'side-by-side' && (
          <div className="flex gap-4 w-full max-w-[95%]" data-testid="preview-side-by-side">
            {/* Before */}
            <Card className="flex-1 overflow-hidden">
              <div className="p-2 border-b bg-muted/50 flex items-center justify-between">
                <span className="text-sm font-medium">Before</span>
                <Badge variant="outline">Original</Badge>
              </div>
              <div className="flex items-center justify-center p-4 bg-background">
                <iframe
                  ref={beforeIframeRef}
                  srcDoc={originalHtml}
                  style={{ width: actualWidth, height: actualHeight, border: 'none' }}
                  className="border border-ocean-divider rounded-md"
                  data-testid="iframe-before"
                />
              </div>
            </Card>

            {/* After */}
            <Card className="flex-1 overflow-hidden">
              <div className="p-2 border-b bg-muted/50 flex items-center justify-between">
                <span className="text-sm font-medium">After</span>
                <Badge variant="default">{changes.length} changes</Badge>
              </div>
              <div className="flex items-center justify-center p-4 bg-background">
                <iframe
                  ref={afterIframeRef}
                  srcDoc={currentHtml}
                  style={{ width: actualWidth, height: actualHeight, border: 'none' }}
                  className="border border-ocean-divider rounded-md"
                  data-testid="iframe-after"
                />
              </div>
            </Card>
          </div>
        )}

        {layoutMode === 'vertical' && (
          <div className="flex flex-col gap-4 w-full max-w-[95%]" data-testid="preview-vertical">
            {/* Before */}
            <Card className="overflow-hidden">
              <div className="p-2 border-b bg-muted/50 flex items-center justify-between">
                <span className="text-sm font-medium">Before</span>
                <Badge variant="outline">Original</Badge>
              </div>
              <div className="flex items-center justify-center p-4 bg-background">
                <iframe
                  ref={beforeIframeRef}
                  srcDoc={originalHtml}
                  style={{ width: actualWidth, height: actualHeight / 2, border: 'none' }}
                  className="border border-ocean-divider rounded-md"
                  data-testid="iframe-before"
                />
              </div>
            </Card>

            {/* After */}
            <Card className="overflow-hidden">
              <div className="p-2 border-b bg-muted/50 flex items-center justify-between">
                <span className="text-sm font-medium">After</span>
                <Badge variant="default">{changes.length} changes</Badge>
              </div>
              <div className="flex items-center justify-center p-4 bg-background">
                <iframe
                  ref={afterIframeRef}
                  srcDoc={currentHtml}
                  style={{ width: actualWidth, height: actualHeight / 2, border: 'none' }}
                  className="border border-ocean-divider rounded-md"
                  data-testid="iframe-after"
                />
              </div>
            </Card>
          </div>
        )}

        {layoutMode === 'slider' && (
          <Card className="overflow-hidden max-w-[95%]" data-testid="preview-slider">
            <div className="p-2 border-b bg-muted/50 flex items-center justify-between">
              <span className="text-sm font-medium">Before / After Slider</span>
              <Badge variant="default">{changes.length} changes</Badge>
            </div>
            <div 
              className="relative flex items-center justify-center p-4 bg-background"
              onMouseMove={handleSliderDrag}
              style={{ cursor: 'col-resize' }}
            >
              <div style={{ width: actualWidth, height: actualHeight, position: 'relative', overflow: 'hidden' }}>
                {/* After (underneath) */}
                <iframe
                  ref={afterIframeRef}
                  srcDoc={currentHtml}
                  style={{ 
                    width: actualWidth, 
                    height: actualHeight, 
                    border: 'none',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                  className="border border-ocean-divider rounded-md"
                  data-testid="iframe-after"
                />

                {/* Before (clipped overlay) */}
                <div 
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${sliderPosition}%`,
                    height: '100%',
                    overflow: 'hidden'
                  }}
                >
                  <iframe
                    ref={beforeIframeRef}
                    srcDoc={originalHtml}
                    style={{ 
                      width: actualWidth, 
                      height: actualHeight, 
                      border: 'none'
                    }}
                    className="border border-ocean-divider rounded-md"
                    data-testid="iframe-before"
                  />
                </div>

                {/* Slider Handle */}
                <div 
                  ref={sliderRef}
                  style={{ 
                    position: 'absolute',
                    left: `${sliderPosition}%`,
                    top: 0,
                    width: '4px',
                    height: '100%',
                    backgroundColor: 'hsl(var(--primary))',
                    cursor: 'col-resize',
                    transform: 'translateX(-50%)'
                  }}
                  data-testid="slider-handle"
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary rounded-full p-2">
                    <ChevronLeft className="h-4 w-4 text-primary-foreground absolute -left-4" />
                    <ChevronRight className="h-4 w-4 text-primary-foreground absolute -right-4" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {layoutMode === 'toggle' && (
          <Card className="overflow-hidden max-w-[95%]" data-testid="preview-toggle">
            <div className="p-2 border-b bg-muted/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{showBefore ? 'Before' : 'After'}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowBefore(!showBefore)}
                  data-testid="button-toggle-view"
                >
                  Switch to {showBefore ? 'After' : 'Before'}
                </Button>
              </div>
              <Badge variant={showBefore ? 'outline' : 'default'}>
                {showBefore ? 'Original' : `${changes.length} changes`}
              </Badge>
            </div>
            <div className="flex items-center justify-center p-4 bg-background">
              <iframe
                ref={showBefore ? beforeIframeRef : afterIframeRef}
                srcDoc={showBefore ? originalHtml : currentHtml}
                style={{ width: actualWidth, height: actualHeight, border: 'none' }}
                className="border border-ocean-divider rounded-md"
                data-testid={showBefore ? 'iframe-before' : 'iframe-after'}
              />
            </div>
          </Card>
        )}
      </div>

      {/* Tooltip for hovered changes */}
      {hoveredChange && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[300]">
          <Card className="p-3 max-w-md">
            <p className="text-sm font-medium mb-1">{hoveredChange.description}</p>
            <div className="text-xs text-muted-foreground">
              {Object.entries(hoveredChange.changes).map(([key, value]) => (
                <div key={key}>
                  <span className="font-mono">{key}</span>: 
                  <span className="text-destructive ml-1">{String(value.before)}</span>
                  <span className="mx-1">→</span>
                  <span className="text-green-500">{String(value.after)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Action Bar */}
      <div className="h-14 border-t border-ocean-divider bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Previewing {changes.length} {changes.length === 1 ? 'change' : 'changes'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={onContinueEditing}
            data-testid="button-continue-editing"
          >
            <Edit className="h-4 w-4 mr-2" />
            Continue Editing
          </Button>
          <Button
            variant="destructive"
            onClick={handleDiscard}
            data-testid="button-discard-changes"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Discard Changes
          </Button>
          <Button
            variant="default"
            onClick={handleApply}
            data-testid="button-apply-changes"
          >
            <Check className="h-4 w-4 mr-2" />
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
