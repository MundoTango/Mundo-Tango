/**
 * Visual Editor Split-Pane (Replit Agent-style)
 * LEFT (60%): Live preview of actual MT site
 * RIGHT (40%): Mr. Blue AI chat for conversational editing
 */

import { useState, useEffect, useCallback } from "react";
import { X, Maximize2, Code, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ComponentSelector, type SelectedComponent } from "./ComponentSelector";
import { DragDropHandler } from "./DragDropHandler";
import { EditControls } from "./EditControls";
import { MrBlueVisualChat } from "./MrBlueVisualChat";
import { visualEditorTracker } from "@/lib/visualEditorTracker";

interface VisualEditorSplitPaneProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VisualEditorSplitPane({ isOpen, onClose }: VisualEditorSplitPaneProps) {
  const [selectedComponent, setSelectedComponent] = useState<SelectedComponent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [splitRatio, setSplitRatio] = useState(60); // 60% left, 40% right
  const { toast } = useToast();

  const currentPage = window.location.pathname;

  useEffect(() => {
    if (!isOpen) {
      setSelectedComponent(null);
      visualEditorTracker.clear();
    }
  }, [isOpen]);

  const handleComponentSelect = useCallback((component: SelectedComponent | null) => {
    setSelectedComponent(component);
    
    if (component) {
      toast({
        title: "Component Selected",
        description: `${component.tagName} - ${component.id || 'No ID'}`,
        duration: 2000
      });
    }
  }, [toast]);

  const handleComponentChange = useCallback((updates: any) => {
    if (!selectedComponent) return;

    // Track the change
    visualEditorTracker.track({
      elementId: selectedComponent.id,
      elementTestId: selectedComponent.element.getAttribute('data-testid') || '',
      changeType: updates.type,
      changes: updates.changes,
      description: `Updated ${updates.type} for ${selectedComponent.tagName}`
    });

    // Apply changes to actual element (preview)
    Object.entries(updates.changes).forEach(([key, value]: [string, any]) => {
      if (selectedComponent.element.style) {
        (selectedComponent.element.style as any)[key] = value;
      }
    });
  }, [selectedComponent]);

  const handleGenerateCode = async (prompt: string) => {
    setIsGenerating(true);

    try {
      const allEdits = visualEditorTracker.getAllEdits();
      
      const response = await fetch('/api/visual-editor/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          pagePath: currentPage,
          edits: allEdits,
          selectedElement: selectedComponent?.element.getAttribute('data-testid')
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Code Generated!",
          description: data.explanation || "Changes ready for review",
          duration: 3000
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Failed to generate code"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDragEnd = useCallback((element: HTMLElement, position: { x: number; y: number }) => {
    visualEditorTracker.track({
      elementId: element.id,
      elementTestId: element.getAttribute('data-testid') || '',
      changeType: 'position',
      changes: {
        left: { before: 0, after: position.x },
        top: { before: 0, after: position.y }
      },
      description: `Moved element to (${position.x}, ${position.y})`
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-background"
      data-visual-editor="split-pane"
    >
      {/* Top Bar */}
      <div className="h-14 border-b border-ocean-divider bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold">Visual Editor</h2>
          <span className="text-sm text-muted-foreground">{currentPage}</span>
          {isGenerating && (
            <div className="flex items-center gap-2 text-primary">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-xs">Generating code...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleGenerateCode("Generate code for all visual changes")}
            disabled={isGenerating || visualEditorTracker.getAllEdits().length === 0}
            data-testid="button-generate-all-code"
          >
            <Code className="h-4 w-4 mr-2" />
            Generate Code
          </Button>
          <Button
            size="sm"
            variant="ghost"
            data-testid="button-preview"
          >
            <Play className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            size="sm"
            variant="ghost"
            data-testid="button-fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            data-testid="button-close-visual-editor"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Split Pane Container */}
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* LEFT SIDE: Live Preview (60%) */}
        <div 
          className="relative bg-muted/30"
          style={{ width: `${splitRatio}%` }}
          data-testid="preview-pane"
        >
          {/* Iframe Container for actual site */}
          <div className="absolute inset-0">
            {/* Component Selector */}
            <ComponentSelector
              enabled={isOpen}
              onSelect={handleComponentSelect}
            />

            {/* Drag & Drop Handler */}
            <DragDropHandler
              enabled={isOpen}
              selectedElement={selectedComponent?.element || null}
              onDragEnd={handleDragEnd}
            />

            {/* Edit Controls (overlay on preview) */}
            {selectedComponent && (
              <EditControls
                component={selectedComponent}
                onClose={() => setSelectedComponent(null)}
                onChange={handleComponentChange}
              />
            )}

            {/* Helper Text */}
            <div className="absolute top-4 left-4 glass-card rounded-lg p-3 max-w-xs">
              <p className="text-xs text-muted-foreground">
                <strong>Click</strong> any element to select it, or
                <strong> drag</strong> to reposition. Or just ask Mr. Blue!
              </p>
            </div>
          </div>

          {/* Resize Handle */}
          <div
            className="absolute top-0 right-0 w-1 h-full bg-ocean-divider hover:bg-primary cursor-col-resize z-10"
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startRatio = splitRatio;
              
              const handleMouseMove = (e: MouseEvent) => {
                const delta = ((e.clientX - startX) / window.innerWidth) * 100;
                const newRatio = Math.min(Math.max(startRatio + delta, 40), 80);
                setSplitRatio(newRatio);
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        </div>

        {/* RIGHT SIDE: Mr. Blue Chat (40%) */}
        <div 
          style={{ width: `${100 - splitRatio}%` }}
          data-testid="chat-pane"
        >
          <MrBlueVisualChat
            currentPage={currentPage}
            selectedElement={selectedComponent?.element.getAttribute('data-testid') || null}
            onGenerateCode={handleGenerateCode}
            contextInfo={{
              page: currentPage,
              selectedElement: selectedComponent ? {
                tagName: selectedComponent.tagName,
                testId: selectedComponent.element.getAttribute('data-testid'),
                className: selectedComponent.element.className,
                text: selectedComponent.element.textContent?.slice(0, 100) || ''
              } : null,
              editsCount: visualEditorTracker.getAllEdits().length,
              recentEdits: visualEditorTracker.getAllEdits().slice(0, 5)
            }}
          />
        </div>
      </div>
    </div>
  );
}
