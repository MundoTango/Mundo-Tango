/**
 * Visual Editor - Replit-style Development Environment
 * Complete development hub with live preview, Mr. Blue AI, and dev tools
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { Code, Save, GitBranch, Key, Rocket, Database, Terminal } from "lucide-react";
import { MrBlueVisualChat } from "@/components/visual-editor/MrBlueVisualChat";
import { ComponentSelector, type SelectedComponent } from "@/components/visual-editor/ComponentSelector";
import { DragDropHandler } from "@/components/visual-editor/DragDropHandler";
import { EditControls } from "@/components/visual-editor/EditControls";
import { visualEditorTracker } from "@/lib/visualEditorTracker";
import { useToast } from "@/hooks/use-toast";

export default function VisualEditorPage() {
  const [selectedComponent, setSelectedComponent] = useState<SelectedComponent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("/");
  const { toast } = useToast();

  const handleComponentSelect = (component: SelectedComponent | null) => {
    setSelectedComponent(component);
    if (component) {
      toast({
        title: "Component Selected",
        description: `${component.tagName} - ${component.element.getAttribute('data-testid') || 'No test ID'}`,
        duration: 2000
      });
    }
  };

  const handleComponentChange = (updates: any) => {
    if (!selectedComponent) return;

    visualEditorTracker.track({
      elementId: selectedComponent.id,
      elementTestId: selectedComponent.element.getAttribute('data-testid') || '',
      changeType: updates.type,
      changes: updates.changes,
      description: `Updated ${updates.type} for ${selectedComponent.tagName}`
    });

    // Apply changes to iframe content
    Object.entries(updates.changes).forEach(([key, value]: [string, any]) => {
      if (selectedComponent.element.style) {
        (selectedComponent.element.style as any)[key] = value.after || value;
      }
    });
  };

  const handleGenerateCode = async (prompt: string) => {
    setIsGenerating(true);
    try {
      const allEdits = visualEditorTracker.getAllEdits();
      
      const response = await fetch('/api/visual-editor/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          pagePath: previewUrl,
          edits: allEdits,
          selectedElement: selectedComponent?.element.getAttribute('data-testid')
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Code Generated!",
          description: data.explanation || "AI analyzed changes and generated code",
          duration: 3000
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const allEdits = visualEditorTracker.getAllEdits();
      
      const response = await fetch('/api/visual-editor/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagePath: previewUrl,
          edits: allEdits,
          sessionId: `visual-edit-${Date.now()}`
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Changes Saved!",
          description: `Created commit: ${data.commitId}. Ready for review.`,
          duration: 5000
        });
        
        // Clear tracker after successful save
        visualEditorTracker.clear();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <SEO 
        title="Visual Editor - Development Environment"
        description="Replit-style visual development environment for Mundo Tango"
      />

      <div className="fixed inset-0 bg-background flex flex-col">
        {/* Top Toolbar */}
        <div className="h-14 border-b border-ocean-divider bg-card flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold">Visual Editor</h2>
            <span className="text-sm text-muted-foreground">{previewUrl}</span>
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
              onClick={() => handleGenerateCode("Generate code for all changes")}
              disabled={isGenerating || visualEditorTracker.getAllEdits().length === 0}
              data-testid="button-generate-code"
            >
              <Code className="h-4 w-4 mr-2" />
              Generate Code
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={handleSave}
              disabled={isSaving || visualEditorTracker.getAllEdits().length === 0}
              data-testid="button-save-changes"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save & Commit"}
            </Button>
          </div>
        </div>

        {/* Main Content: Split Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Live Preview (60%) + Dev Tools */}
          <div className="w-[60%] border-r border-ocean-divider flex flex-col">
            {/* Preview Iframe */}
            <div className="flex-1 relative bg-muted/30">
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title="Live Preview"
                data-testid="preview-iframe"
              />
              
              <ComponentSelector
                enabled={true}
                onSelect={handleComponentSelect}
              />
              
              <DragDropHandler
                enabled={true}
                selectedElement={selectedComponent?.element || null}
                onDragEnd={(element, position) => {
                  visualEditorTracker.track({
                    elementId: element.id,
                    elementTestId: element.getAttribute('data-testid') || '',
                    changeType: 'position',
                    changes: {
                      left: { before: 0, after: position.x },
                      top: { before: 0, after: position.y }
                    },
                    description: `Moved to (${position.x}, ${position.y})`
                  });
                }}
              />

              {selectedComponent && (
                <EditControls
                  component={selectedComponent}
                  onClose={() => setSelectedComponent(null)}
                  onChange={handleComponentChange}
                />
              )}

              <div className="absolute top-4 left-4 glass-card rounded-lg p-3 max-w-xs">
                <p className="text-xs text-muted-foreground">
                  <strong>Live MT Platform</strong> - Click elements to select, drag to reposition
                </p>
              </div>
            </div>

            {/* Dev Tools Tabs */}
            <div className="h-64 border-t border-ocean-divider bg-card">
              <Tabs defaultValue="git" className="h-full flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b border-ocean-divider">
                  <TabsTrigger value="git" className="gap-2">
                    <GitBranch className="h-4 w-4" />
                    Git
                  </TabsTrigger>
                  <TabsTrigger value="secrets" className="gap-2">
                    <Key className="h-4 w-4" />
                    Secrets
                  </TabsTrigger>
                  <TabsTrigger value="deploy" className="gap-2">
                    <Rocket className="h-4 w-4" />
                    Deployments
                  </TabsTrigger>
                  <TabsTrigger value="database" className="gap-2">
                    <Database className="h-4 w-4" />
                    Database
                  </TabsTrigger>
                  <TabsTrigger value="console" className="gap-2">
                    <Terminal className="h-4 w-4" />
                    Console
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="git" className="flex-1 p-4 overflow-auto">
                  <div className="space-y-3">
                    <h3 className="font-medium">Pending Commits</h3>
                    <p className="text-sm text-muted-foreground">
                      Changes will be committed when you click "Save & Commit"
                    </p>
                    <div className="glass-card p-3 rounded-md">
                      <p className="text-sm font-mono">
                        {visualEditorTracker.getAllEdits().length} changes tracked
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="secrets" className="flex-1 p-4 overflow-auto">
                  <p className="text-sm text-muted-foreground">Secrets management interface</p>
                </TabsContent>

                <TabsContent value="deploy" className="flex-1 p-4 overflow-auto">
                  <p className="text-sm text-muted-foreground">Deployment hub interface</p>
                </TabsContent>

                <TabsContent value="database" className="flex-1 p-4 overflow-auto">
                  <p className="text-sm text-muted-foreground">Database management interface</p>
                </TabsContent>

                <TabsContent value="console" className="flex-1 p-4 overflow-auto font-mono text-xs">
                  <p className="text-muted-foreground">Console output will appear here</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* RIGHT: Mr. Blue AI Chat (40%) */}
          <div className="w-[40%]">
            <MrBlueVisualChat
              currentPage={previewUrl}
              selectedElement={selectedComponent?.element.getAttribute('data-testid') || null}
              onGenerateCode={handleGenerateCode}
            />
          </div>
        </div>
      </div>
    </>
  );
}
