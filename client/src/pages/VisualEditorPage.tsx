/**
 * Visual Editor - Replit-style Development Environment
 * Complete development hub with resizable panes, live preview, Mr. Blue AI, and dev tools
 */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { SEO } from "@/components/SEO";
import { Code, Save, GitBranch, Key, Rocket, Database, Terminal, ExternalLink, MessageSquare } from "lucide-react";
import { MrBlueVisualChat } from "@/components/visual-editor/MrBlueVisualChat";
import { type SelectedComponent } from "@/components/visual-editor/ComponentSelector";
import { EditControls } from "@/components/visual-editor/EditControls";
import { visualEditorTracker } from "@/lib/visualEditorTracker";
import { useToast } from "@/hooks/use-toast";
import { injectSelectionScript } from "@/lib/iframeInjector";
import { apiRequest } from "@/lib/queryClient";

export default function VisualEditorPage() {
  const [selectedComponent, setSelectedComponent] = useState<SelectedComponent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("/");
  const [iframeReady, setIframeReady] = useState(false);
  const [activeTab, setActiveTab] = useState("mrblue");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const selectedElementRef = useRef<any>(null);
  const { toast } = useToast();

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'IFRAME_SCRIPT_READY') {
        console.log('[VisualEditor] Iframe script ready');
        setIframeReady(true);
      }

      if (event.data?.type === 'IFRAME_ELEMENT_SELECTED') {
        const componentData = event.data.component;
        
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
          style: {}
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
      
      try {
        injectSelectionScript(iframeRef.current);
        
        setTimeout(() => {
          if (!iframeReady) {
            console.log('[VisualEditor] Fallback: Setting iframe ready');
            setIframeReady(true);
          }
        }, 1000);
      } catch (error) {
        console.error('[VisualEditor] Script injection failed:', error);
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
      
      const contextInfo = {
        prompt,
        pagePath: previewUrl,
        edits: allEdits,
        selectedElement: selectedComponent ? {
          testId: selectedComponent.element.getAttribute('data-testid'),
          tagName: selectedComponent.tagName,
          className: selectedComponent.className,
          text: selectedComponent.text
        } : null,
        totalEdits: allEdits.length
      };
      
      const response = await apiRequest('POST', '/api/visual-editor/generate', contextInfo);
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Code Generated!",
          description: data.explanation || "AI analyzed changes and generated code",
          duration: 3000
        });
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const allEdits = visualEditorTracker.getAllEdits();
      
      const response = await apiRequest('POST', '/api/visual-editor/save', {
        pagePath: previewUrl,
        edits: allEdits,
        sessionId: `visual-edit-${Date.now()}`
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Changes Saved!",
          description: `Created commit: ${data.commitId}. Ready for review.`,
          duration: 5000
        });
        
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

        {/* Resizable Main Content */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* LEFT: Live Preview Panel (default 60%) */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="h-full flex flex-col" data-visual-editor="preview-panel">
              <div className="flex-1 relative bg-muted/30">
                <iframe
                  ref={iframeRef}
                  src={`${previewUrl}${previewUrl.includes('?') ? '&' : '?'}hideControls=true`}
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
                    {selectedComponent && (
                      <p className="text-xs text-primary mt-1">
                        Selected: {selectedComponent.tagName}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* RIGHT: Dev Tools + Mr. Blue Panel (default 40%) */}
          <ResizablePanel defaultSize={40} minSize={25}>
            <div className="h-full flex flex-col bg-card" data-visual-editor="tools-panel">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                {/* Tabs at TOP */}
                <TabsList className="w-full justify-start rounded-none border-b border-ocean-divider">
                  <TabsTrigger value="mrblue" className="gap-2" data-testid="tab-mr-blue">
                    <MessageSquare className="h-4 w-4" />
                    Mr. Blue
                  </TabsTrigger>
                  <TabsTrigger value="git" className="gap-2" data-testid="tab-git">
                    <GitBranch className="h-4 w-4" />
                    Git
                  </TabsTrigger>
                  <TabsTrigger value="secrets" className="gap-2" data-testid="tab-secrets">
                    <Key className="h-4 w-4" />
                    Secrets
                  </TabsTrigger>
                  <TabsTrigger value="deploy" className="gap-2" data-testid="tab-deploy">
                    <Rocket className="h-4 w-4" />
                    Deploy
                  </TabsTrigger>
                  <TabsTrigger value="database" className="gap-2" data-testid="tab-database">
                    <Database className="h-4 w-4" />
                    Database
                  </TabsTrigger>
                  <TabsTrigger value="console" className="gap-2" data-testid="tab-console">
                    <Terminal className="h-4 w-4" />
                    Console
                  </TabsTrigger>
                </TabsList>

                {/* Mr. Blue Chat Tab - Context-Aware */}
                <TabsContent value="mrblue" className="flex-1 m-0 overflow-hidden">
                  <MrBlueVisualChat 
                    currentPage={previewUrl}
                    selectedElement={selectedComponent?.element.getAttribute('data-testid') || null}
                    onGenerateCode={handleGenerateCode}
                    contextInfo={{
                      page: previewUrl,
                      selectedElement: selectedComponent ? {
                        tagName: selectedComponent.tagName,
                        testId: selectedComponent.element.getAttribute('data-testid'),
                        className: selectedComponent.className,
                        text: selectedComponent.text
                      } : null,
                      editsCount: visualEditorTracker.getAllEdits().length,
                      recentEdits: visualEditorTracker.getRecentEdits(5)
                    }}
                  />
                </TabsContent>

                {/* Git Tab */}
                <TabsContent value="git" className="flex-1 m-0 p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Pending Commits</h3>
                      <span className="text-xs text-muted-foreground">
                        {visualEditorTracker.getAllEdits().length} changes tracked
                      </span>
                    </div>
                    
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Changes will be committed when you click "Save & Commit"
                      </p>
                      
                      {visualEditorTracker.getAllEdits().length > 0 ? (
                        <div className="space-y-2 mt-3">
                          {visualEditorTracker.getAllEdits().map((edit, idx) => (
                            <div key={idx} className="text-xs text-muted-foreground border-l-2 border-primary pl-2">
                              {edit.description}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No changes yet</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Secrets Tab */}
                <TabsContent value="secrets" className="flex-1 m-0 p-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Environment Secrets</h3>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        Manage API keys and secrets for your application
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        <Key className="h-3 w-3 mr-2" />
                        Manage Secrets
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Deploy Tab */}
                <TabsContent value="deploy" className="flex-1 m-0 p-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Deployments</h3>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        Preview and publish your changes to production
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        <Rocket className="h-3 w-3 mr-2" />
                        Deploy to Production
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Database Tab */}
                <TabsContent value="database" className="flex-1 m-0 p-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Database</h3>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        View and manage your database schema
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        <Database className="h-3 w-3 mr-2" />
                        Open Database
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Console Tab */}
                <TabsContent value="console" className="flex-1 m-0 p-4 font-mono text-xs">
                  <div className="space-y-2">
                    <h3 className="font-semibold font-sans">Console Output</h3>
                    <div className="bg-black text-green-400 rounded-lg p-3 h-96 overflow-auto">
                      <div>[Visual Editor] Ready</div>
                      <div>[Preview] {previewUrl}</div>
                      {selectedComponent && (
                        <div className="text-yellow-400">
                          [Selected] {selectedComponent.tagName} - {selectedComponent.element.getAttribute('data-testid')}
                        </div>
                      )}
                      <div className="text-muted-foreground mt-2">
                        Waiting for logs...
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}
