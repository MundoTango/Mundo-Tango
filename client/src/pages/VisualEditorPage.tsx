/**
 * Visual Editor - Replit-style Development Environment
 * Complete development hub with live preview, Mr. Blue AI, and dev tools
 */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { Code, Save, GitBranch, Key, Rocket, Database, Terminal, ExternalLink } from "lucide-react";
import { MrBlueVisualChat } from "@/components/visual-editor/MrBlueVisualChat";
import { type SelectedComponent } from "@/components/visual-editor/ComponentSelector";
import { EditControls } from "@/components/visual-editor/EditControls";
import { visualEditorTracker } from "@/lib/visualEditorTracker";
import { useToast } from "@/hooks/use-toast";
import { injectSelectionScript } from "@/lib/iframeInjector";

export default function VisualEditorPage() {
  const [selectedComponent, setSelectedComponent] = useState<SelectedComponent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("/");
  const [iframeReady, setIframeReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const selectedElementRef = useRef<any>(null);
  const { toast } = useToast();

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Verify origin (in production, check against allowed origins)
      if (event.data?.type === 'IFRAME_SCRIPT_READY') {
        console.log('[VisualEditor] Iframe script ready');
        setIframeReady(true);
      }

      if (event.data?.type === 'IFRAME_ELEMENT_SELECTED') {
        const componentData = event.data.component;
        
        // Create a proxy element for EditControls
        const proxyElement = {
          id: componentData.id,
          tagName: componentData.tagName,
          className: componentData.className,
          textContent: componentData.text,
          getAttribute: (attr: string) => {
            if (attr === 'data-testid') return componentData.testId;
            return null;
          },
          getBoundingClientRect: () => componentData.rect,
          style: {} // Placeholder - actual style changes will be sent via postMessage
        } as unknown as HTMLElement;

        const component: SelectedComponent = {
          element: proxyElement,
          id: componentData.id,
          tagName: componentData.tagName,
          className: componentData.className,
          text: componentData.text,
          rect: componentData.rect as DOMRect
        };

        selectedElementRef.current = componentData;
        setSelectedComponent(component);
        
        toast({
          title: "Component Selected",
          description: `${component.tagName} - ${componentData.testId || 'No test ID'}`,
          duration: 2000
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toast]);

  // Inject selection script when iframe loads
  const handleIframeLoad = () => {
    if (iframeRef.current) {
      console.log('[VisualEditor] Iframe loaded, attempting script injection');
      
      // Try immediate injection for same-origin iframes
      try {
        injectSelectionScript(iframeRef.current);
        
        // Fallback: Set ready after short delay if no message received
        setTimeout(() => {
          if (!iframeReady) {
            console.log('[VisualEditor] Fallback: Setting iframe ready');
            setIframeReady(true);
          }
        }, 1000);
      } catch (error) {
        console.error('[VisualEditor] Script injection failed:', error);
        // Still set ready to show preview
        setIframeReady(true);
      }
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

    // Send style changes to iframe via postMessage
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'APPLY_STYLE_CHANGES',
        elementId: selectedComponent.id,
        changes: updates.changes
      }, '*');
    }
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

      <div className="fixed inset-0 bg-background flex flex-col" data-visual-editor="root">
        {/* Top Toolbar */}
        <div className="h-14 border-b border-ocean-divider bg-card flex items-center justify-between px-4" data-visual-editor="toolbar">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold">Visual Editor</h2>
            <select 
              className="text-sm bg-muted border border-ocean-divider rounded px-2 py-1"
              value={previewUrl}
              onChange={(e) => {
                setPreviewUrl(e.target.value);
                setIframeReady(false);
                setSelectedComponent(null);
              }}
              data-testid="select-preview-page"
            >
              <option value="/">Homepage</option>
              <option value="/memories">Memories</option>
              <option value="/feed">Feed</option>
              <option value="/events">Events</option>
              <option value="/groups">Groups</option>
              <option value="/teachers">Teachers</option>
            </select>
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
              onClick={() => window.open(previewUrl, '_blank')}
              data-testid="button-open-in-new-tab"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Page
            </Button>
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
          <div className="w-[60%] border-r border-ocean-divider flex flex-col" data-visual-editor="preview-panel">
            {/* Preview Iframe */}
            <div className="flex-1 relative bg-muted/30">
              <iframe
                ref={iframeRef}
                src={previewUrl}
                className="w-full h-full border-0 bg-white"
                title="Live Preview"
                data-testid="preview-iframe"
                onLoad={handleIframeLoad}
              />

              {selectedComponent && (
                <EditControls
                  component={selectedComponent}
                  onClose={() => setSelectedComponent(null)}
                  onChange={handleComponentChange}
                />
              )}

              {!iframeReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                  <div className="glass-card rounded-lg p-6 text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Loading preview...</p>
                  </div>
                </div>
              )}

              {iframeReady && (
                <div className="absolute top-4 left-4 glass-card rounded-lg p-3 max-w-xs">
                  <p className="text-xs text-muted-foreground">
                    <strong>Live MT Platform</strong> - Click elements to select
                  </p>
                </div>
              )}
            </div>

            {/* Dev Tools Tabs */}
            <div className="h-64 border-t border-ocean-divider bg-card" data-visual-editor="dev-tools">
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
          <div className="w-[40%]" data-visual-editor="chat-panel">
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
