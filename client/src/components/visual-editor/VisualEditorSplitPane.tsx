/**
 * Visual Editor Split-Pane (Replit Agent-style)
 * LEFT (60%): Live preview of actual MT site
 * RIGHT (40%): Mr. Blue AI chat for conversational editing
 */

import { useState, useEffect, useCallback, Suspense, lazy, useRef } from "react";
import { X, Maximize2, Code, Play, AlertTriangle, GitBranch, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ComponentSelector, type SelectedComponent } from "./ComponentSelector";
import { ComponentPaletteIntegration } from "./ComponentPaletteIntegration";
import { DragDropHandler } from "./DragDropHandler";
import { EditControls } from "./EditControls";
import { SelectionOverlay } from "./SelectionOverlay";
import { ElementInspector } from "./ElementInspector";
import { MrBlueVisualChat } from "./MrBlueVisualChat";
import { IframeAddressBar } from "./IframeAddressBar";
import { visualEditorTracker } from "@/lib/visualEditorTracker";
import { VisualEditorErrorBoundary } from "./ErrorBoundary";
import { 
  IframeLoading, 
  ChatPaneLoading, 
  CodePreviewLoading, 
  GitPanelLoading,
  ElementInspectorLoading,
  PageLoadError,
  SavingIndicator,
  SavedIndicator,
  AIGeneratingProgress,
  OptimisticChangeIndicator,
  ChangeAppliedIndicator
} from "./LoadingStates";
import { IframeInjector, type IframeCallbacks, injectSelectionScript } from "@/lib/iframeInjector";
import { GitPanel } from "./GitPanel";
import { FocusMode } from "./FocusMode";
import { FocusModeTimer } from "./FocusModeTimer";
import { useFocusModeStore } from "@/lib/focusModeStore";

const CodePreview = lazy(() => import('./CodePreview').then(module => ({ default: module.CodePreview })));

interface VisualEditorSplitPaneProps {
  isOpen: boolean;
  onClose: () => void;
  embeddedMode?: boolean;
}

export function VisualEditorSplitPane({ isOpen, onClose, embeddedMode = false }: VisualEditorSplitPaneProps) {
  const [selectedComponent, setSelectedComponent] = useState<SelectedComponent | null>(null);
  const [selectedIframeElement, setSelectedIframeElement] = useState<HTMLElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [splitRatio, setSplitRatio] = useState(60); // 60% left, 40% right
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [showInspector, setShowInspector] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showGitPanel, setShowGitPanel] = useState(false);
  
  // Mobile Tabs State
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<"chat" | "preview" | "code" | "components">("preview");
  
  // URL Navigation State
  const [currentUrl, setCurrentUrl] = useState(window.location.pathname);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<Array<{ url: string; timestamp: number; title?: string }>>([]);
  
  const { toast } = useToast();
  const iframeInjectorRef = useRef<IframeInjector | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentPage = window.location.pathname;
  
  // Focus Mode state
  const { 
    isActive: isFocusModeActive, 
    startSession, 
    endSession, 
    incrementEdits,
    sessionDuration 
  } = useFocusModeStore();
  
  // Initialize IframeInjector with callbacks
  useEffect(() => {
    if (!isOpen) return;
    
    const iframeCallbacks: IframeCallbacks = {
      onElementSelected: (element) => {
        setSelectedIframeElement(element);
        setShowInspector(true);
        toast({
          title: "Element Selected",
          description: `${element.tagName} - ${element.id || 'No ID'}`,
          duration: 2000
        });
      },
      onChangeApplied: (change) => {
        visualEditorTracker.track({
          elementId: change.selector,
          elementTestId: '',
          changeType: 'style',
          changes: { [change.property]: { before: change.previousValue, after: change.newValue } },
          description: `Applied ${change.property} change`
        });
      },
      onUrlChanged: (url, back, forward) => {
        setCurrentUrl(url);
        setCanGoBack(back);
        setCanGoForward(forward);
        
        // Update navigation history from injector
        if (iframeInjectorRef.current) {
          const history = iframeInjectorRef.current.getNavigationHistory();
          setNavigationHistory(history);
        }
        
        console.log('[VisualEditor] URL changed:', url, 'back:', back, 'forward:', forward);
      },
      onNavigationStart: () => {
        setIsNavigating(true);
        setIsPreviewLoading(true);
      },
      onNavigationEnd: () => {
        setIsNavigating(false);
        setIsPreviewLoading(false);
      },
    };
    
    // Create and initialize injector
    if (!iframeInjectorRef.current) {
      iframeInjectorRef.current = new IframeInjector();
    }
    
    return () => {
      if (iframeInjectorRef.current) {
        iframeInjectorRef.current.destroy();
        iframeInjectorRef.current = null;
      }
    };
  }, [isOpen, toast]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedComponent(null);
      setSelectedIframeElement(null);
      setShowInspector(false);
      visualEditorTracker.clear();
    }
  }, [isOpen]);
  
  // Focus Mode keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // F11 to toggle focus mode
      if (e.key === 'F11' && !isFocusModeActive) {
        e.preventDefault();
        startSession(sessionDuration);
        toast({
          title: "Focus Mode Activated",
          description: `${sessionDuration} minute session started`,
          duration: 3000
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFocusModeActive, startSession, sessionDuration, toast]);
  
  // Track edits in focus mode
  useEffect(() => {
    if (!isFocusModeActive) return;
    
    const trackerListener = () => {
      incrementEdits();
    };
    
    visualEditorTracker.addListener(trackerListener);
    return () => visualEditorTracker.removeListener(trackerListener);
  }, [isFocusModeActive, incrementEdits]);
  
  // Handlers for SelectionOverlay toolbar actions
  const handleInspect = useCallback((element: HTMLElement) => {
    setShowInspector(true);
    toast({
      title: "Inspecting Element",
      description: `${element.tagName} - ${element.id || 'No ID'}`,
      duration: 2000
    });
  }, [toast]);
  
  const handleEdit = useCallback((element: HTMLElement) => {
    // Convert to SelectedComponent format for EditControls
    const component: SelectedComponent = {
      id: element.id || `element-${Date.now()}`,
      tagName: element.tagName.toLowerCase(),
      element: element
    };
    setSelectedComponent(component);
  }, []);
  
  const handleDelete = useCallback((element: HTMLElement) => {
    if (confirm('Are you sure you want to delete this element?')) {
      element.remove();
      setSelectedIframeElement(null);
      setShowInspector(false);
      toast({
        title: "Element Deleted",
        description: "The element has been removed from the page.",
        duration: 2000
      });
    }
  }, [toast]);

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

  const handleSaveChanges = async () => {
    const allEdits = visualEditorTracker.getAllEdits();
    
    if (allEdits.length === 0) {
      toast({
        title: "No Changes",
        description: "Make some edits first before saving",
        variant: "default"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/visual-editor/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagePath: currentPage,
          edits: allEdits,
          checkpointMessage: `Visual Editor: ${allEdits.length} changes to ${currentPage}`
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        visualEditorTracker.clear();
        setShowSaved(true);
        
        toast({
          title: "Changes Saved!",
          description: `Applied ${allEdits.length} changes to ${data.filePath || currentPage}`,
          duration: 5000
        });
        
        // Hide saved indicator after 3 seconds
        setTimeout(() => setShowSaved(false), 3000);
      } else {
        throw new Error(data.message || 'Save failed');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || "Failed to save changes"
      });
    } finally {
      setIsSaving(false);
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
  
  // Navigation Handlers
  const handleNavigate = useCallback((url: string) => {
    if (iframeInjectorRef.current) {
      iframeInjectorRef.current.navigateTo(url);
    }
  }, []);
  
  const handleBack = useCallback(() => {
    if (iframeInjectorRef.current) {
      iframeInjectorRef.current.goBack();
    }
  }, []);
  
  const handleForward = useCallback(() => {
    if (iframeInjectorRef.current) {
      iframeInjectorRef.current.goForward();
    }
  }, []);
  
  const handleRefresh = useCallback(() => {
    if (iframeInjectorRef.current) {
      iframeInjectorRef.current.refresh();
    }
  }, []);
  
  const handleHome = useCallback(() => {
    if (iframeInjectorRef.current) {
      iframeInjectorRef.current.goHome();
    }
  }, []);
  
  // Focus Mode handlers
  const handleToggleFocusMode = useCallback(() => {
    if (isFocusModeActive) {
      endSession();
    } else {
      startSession(sessionDuration);
      toast({
        title: "Focus Mode Activated",
        description: `${sessionDuration} minute session started. Press Esc to exit.`,
        duration: 3000
      });
    }
  }, [isFocusModeActive, endSession, startSession, sessionDuration, toast]);
  
  const handleFocusModeExit = useCallback(() => {
    const session = endSession();
    if (session) {
      toast({
        title: "Focus Session Complete",
        description: `${session.editsCount} edits in ${session.duration} minutes`,
        duration: 5000
      });
    }
  }, [endSession, toast]);
  
  const handleAutoSave = useCallback(() => {
    if (visualEditorTracker.getAllEdits().length > 0) {
      handleSaveChanges();
    }
  }, [handleSaveChanges]);

  if (!isOpen) return null;

  const editorContent = (
    <VisualEditorErrorBoundary>
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
            {isSaving && <SavingIndicator />}
            {showSaved && !isSaving && <SavedIndicator />}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isFocusModeActive ? "default" : "ghost"}
              onClick={handleToggleFocusMode}
              data-testid="button-toggle-focus-mode"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isFocusModeActive ? 'Exit Focus' : 'Focus Mode'}
            </Button>
            {!isFocusModeActive && (
              <>
                <Button
                  size="sm"
                  variant={showGitPanel ? "default" : "ghost"}
                  onClick={() => setShowGitPanel(!showGitPanel)}
                  data-testid="button-toggle-git-panel"
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  Git
                </Button>
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
              </>
            )}
            <Button
              size="sm"
              variant="default"
              onClick={handleSaveChanges}
              disabled={isSaving || visualEditorTracker.getAllEdits().length === 0}
              data-testid="button-save-changes"
            >
              {isSaving ? 'Saving...' : `Save (${visualEditorTracker.getAllEdits().length})`}
            </Button>
            {!isFocusModeActive && (
              <Button
                size="sm"
                variant="ghost"
                data-testid="button-fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
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

        {/* Split Pane Container - Mobile Tabs or Desktop 3-Pane */}
        {isMobile ? (
          /* MOBILE: Tab-based layout */
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as typeof activeTab)}
            className="flex flex-col h-[calc(100vh-3.5rem)]"
          >
            <TabsList className="w-full grid grid-cols-4 rounded-none border-b" data-testid="mobile-tabs-list">
              <TabsTrigger value="chat" data-testid="tab-chat">Chat</TabsTrigger>
              <TabsTrigger value="preview" data-testid="tab-preview">Preview</TabsTrigger>
              <TabsTrigger value="code" data-testid="tab-code">Code</TabsTrigger>
              <TabsTrigger value="components" data-testid="tab-components">Components</TabsTrigger>
            </TabsList>
            
            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 overflow-hidden m-0 mt-0 data-[state=active]:flex data-[state=active]:flex-col">
              <Suspense fallback={<ChatPaneLoading />}>
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
              </Suspense>
            </TabsContent>
            
            {/* Preview Tab */}
            <TabsContent value="preview" className="flex-1 overflow-hidden m-0 mt-0 data-[state=active]:flex data-[state=active]:flex-col">
              <VisualEditorErrorBoundary>
                <div className="relative bg-muted/30 flex-1 flex flex-col" data-testid="preview-pane-mobile">
                  {/* Address Bar */}
                  <IframeAddressBar
                    currentUrl={currentUrl}
                    onNavigate={handleNavigate}
                    onRefresh={handleRefresh}
                    onHome={handleHome}
                    canGoBack={canGoBack}
                    canGoForward={canGoForward}
                    onBack={handleBack}
                    onForward={handleForward}
                    loading={isNavigating}
                    navigationHistory={navigationHistory}
                  />
                  
                  {/* Error State */}
                  {previewError && (
                    <PageLoadError 
                      pagePath={currentUrl}
                      onRetry={() => {
                        setPreviewError(null);
                        setIsPreviewLoading(true);
                        handleRefresh();
                      }}
                    />
                  )}

                  {/* Loading State */}
                  {isPreviewLoading && !previewError && <IframeLoading />}

                  {/* Iframe Container for actual site */}
                  {!previewError && (
                    <div className="relative flex-1">
                      <iframe
                        ref={iframeRef}
                        src={currentUrl}
                        className="w-full h-full border-0"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-modals"
                        onLoad={() => {
                          console.log('[VisualEditor] iframe loaded');
                          setIsPreviewLoading(false);
                          
                          if (iframeRef.current) {
                            try {
                              injectSelectionScript(iframeRef.current);
                              
                              if (!iframeInjectorRef.current) {
                                iframeInjectorRef.current = new IframeInjector();
                              }
                              iframeInjectorRef.current.initialize(iframeRef.current, {
                                onElementSelected: (element) => {
                                  setSelectedIframeElement(element);
                                  setShowInspector(true);
                                  toast({
                                    title: "Element Selected",
                                    description: `${element.tagName} - ${element.id || 'No ID'}`,
                                    duration: 2000
                                  });
                                },
                                onChangeApplied: (change) => {
                                  visualEditorTracker.track({
                                    elementId: change.targetElement.selector,
                                    elementTestId: '',
                                    changeType: 'style',
                                    changes: { [change.property || 'unknown']: { before: change.oldValue, after: change.newValue } },
                                    description: change.description
                                  });
                                },
                                onUrlChanged: (url, back, forward) => {
                                  setCurrentUrl(url);
                                  setCanGoBack(back);
                                  setCanGoForward(forward);
                                  console.log('[VisualEditor] URL changed:', url, 'back:', back, 'forward:', forward);
                                },
                                onNavigationStart: () => {
                                  setIsNavigating(true);
                                  setIsPreviewLoading(true);
                                },
                                onNavigationEnd: () => {
                                  setIsNavigating(false);
                                  setIsPreviewLoading(false);
                                },
                              });
                              
                              iframeInjectorRef.current.handleIframeLoad();
                              
                              console.log('[VisualEditor] Script injected and initialized');
                            } catch (error) {
                              console.error('[VisualEditor] Injection failed:', error);
                            }
                          }
                        }}
                        onError={() => {
                          console.error('[VisualEditor] iframe load error');
                          setPreviewError('Failed to load preview');
                          setIsPreviewLoading(false);
                        }}
                        data-testid="visual-editor-iframe-mobile"
                      />
                      
                      {/* Component Selector */}
                      <ComponentSelector
                        enabled={isOpen && !isPreviewLoading}
                        onSelect={handleComponentSelect}
                      />

                      {/* Drag & Drop Handler */}
                      <DragDropHandler
                        enabled={isOpen && !isPreviewLoading}
                        selectedElement={selectedComponent?.element || null}
                        onDragEnd={handleDragEnd}
                      />

                      {/* Edit Controls */}
                      {selectedComponent && (
                        <EditControls
                          component={selectedComponent}
                          onClose={() => setSelectedComponent(null)}
                          onChange={handleComponentChange}
                        />
                      )}
                      
                      {/* Selection Overlay with toolbar */}
                      <SelectionOverlay
                        selectedElement={selectedIframeElement}
                        onInspect={handleInspect}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </div>
                  )}
                </div>
              </VisualEditorErrorBoundary>
            </TabsContent>
            
            {/* Code Tab */}
            <TabsContent value="code" className="flex-1 overflow-hidden m-0 mt-0 data-[state=active]:flex data-[state=active]:flex-col">
              <Suspense fallback={<CodePreviewLoading />}>
                <CodePreview 
                  currentPage={currentPage}
                  edits={visualEditorTracker.getAllEdits()}
                />
              </Suspense>
            </TabsContent>
            
            {/* Components Tab */}
            <TabsContent value="components" className="flex-1 overflow-hidden m-0 mt-0 data-[state=active]:flex data-[state=active]:flex-col">
              <VisualEditorErrorBoundary>
                <ComponentPaletteIntegration 
                  iframeRef={iframeRef}
                  iframeInjector={iframeInjectorRef.current}
                />
              </VisualEditorErrorBoundary>
            </TabsContent>
          </Tabs>
        ) : (
          /* DESKTOP: 3-Pane Layout */
          <div className="flex h-[calc(100vh-3.5rem)]">
            {/* LEFT: Component Palette (hidden in focus mode) */}
            {!isFocusModeActive && (
              <VisualEditorErrorBoundary>
                <ComponentPaletteIntegration 
                  iframeRef={iframeRef}
                  iframeInjector={iframeInjectorRef.current}
                />
              </VisualEditorErrorBoundary>
            )}
            
            {/* CENTER: Live Preview */}
            <VisualEditorErrorBoundary>
            <div 
              className="relative bg-muted/30 flex-1 flex flex-col"
              data-testid="preview-pane"
            >
              {/* Address Bar */}
              <IframeAddressBar
                currentUrl={currentUrl}
                onNavigate={handleNavigate}
                onRefresh={handleRefresh}
                onHome={handleHome}
                canGoBack={canGoBack}
                canGoForward={canGoForward}
                onBack={handleBack}
                onForward={handleForward}
                loading={isNavigating}
                navigationHistory={navigationHistory}
              />
              
              {/* Error State */}
              {previewError && (
                <PageLoadError 
                  pagePath={currentUrl}
                  onRetry={() => {
                    setPreviewError(null);
                    setIsPreviewLoading(true);
                    handleRefresh();
                  }}
                />
              )}

              {/* Loading State */}
              {isPreviewLoading && !previewError && <IframeLoading />}

              {/* Iframe Container for actual site */}
              {!previewError && (
                <div className="relative flex-1">
                  {/* CRITICAL FIX 1: Actual iframe element */}
                  <iframe
                    ref={iframeRef}
                    src={currentUrl}
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-modals"
                    onLoad={() => {
                      console.log('[VisualEditor] iframe loaded');
                      setIsPreviewLoading(false);
                      
                      // CRITICAL FIX 2: Inject selection script
                      if (iframeRef.current) {
                        try {
                          injectSelectionScript(iframeRef.current);
                          
                          // Initialize IframeInjector with callbacks
                          if (!iframeInjectorRef.current) {
                            iframeInjectorRef.current = new IframeInjector();
                          }
                          iframeInjectorRef.current.initialize(iframeRef.current, {
                            onElementSelected: (element) => {
                              setSelectedIframeElement(element);
                              setShowInspector(true);
                              toast({
                                title: "Element Selected",
                                description: `${element.tagName} - ${element.id || 'No ID'}`,
                                duration: 2000
                              });
                            },
                            onChangeApplied: (change) => {
                              visualEditorTracker.track({
                                elementId: change.targetElement.selector,
                                elementTestId: '',
                                changeType: 'style',
                                changes: { [change.property || 'unknown']: { before: change.oldValue, after: change.newValue } },
                                description: change.description
                              });
                            },
                            onUrlChanged: (url, back, forward) => {
                              setCurrentUrl(url);
                              setCanGoBack(back);
                              setCanGoForward(forward);
                              console.log('[VisualEditor] URL changed:', url, 'back:', back, 'forward:', forward);
                            },
                            onNavigationStart: () => {
                              setIsNavigating(true);
                              setIsPreviewLoading(true);
                            },
                            onNavigationEnd: () => {
                              setIsNavigating(false);
                              setIsPreviewLoading(false);
                            },
                          });
                          
                          // Handle iframe load for navigation tracking
                          iframeInjectorRef.current.handleIframeLoad();
                          
                          console.log('[VisualEditor] Script injected and initialized');
                        } catch (error) {
                          console.error('[VisualEditor] Injection failed:', error);
                        }
                      }
                    }}
                    onError={() => {
                      console.error('[VisualEditor] iframe load error');
                      setPreviewError('Failed to load preview');
                      setIsPreviewLoading(false);
                    }}
                    data-testid="visual-editor-iframe"
                  />
                  
                  {/* Overlays on top of iframe */}
                  {/* Component Selector */}
                  <ComponentSelector
                    enabled={isOpen && !isPreviewLoading}
                    onSelect={handleComponentSelect}
                  />

                  {/* Drag & Drop Handler */}
                  <DragDropHandler
                    enabled={isOpen && !isPreviewLoading}
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
                  
                  {/* Selection Overlay with toolbar */}
                  <SelectionOverlay
                    selectedElement={selectedIframeElement}
                    onInspect={handleInspect}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />

                  {/* Helper Text */}
                  <div className="absolute top-4 left-4 glass-card rounded-lg p-3 max-w-xs z-50 pointer-events-none">
                    <p className="text-xs text-muted-foreground">
                      <strong>Click</strong> any element in iframe to select it. Or just ask Mr. Blue!
                    </p>
                  </div>
                </div>
              )}

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
          </VisualEditorErrorBoundary>

          {/* RIGHT SIDE: Inspector + Chat (40%) or Focus Mode Timer */}
          {!isFocusModeActive && (
            <VisualEditorErrorBoundary>
              <div 
                className="flex flex-col"
                style={{ width: `${100 - splitRatio}%` }}
                data-testid="chat-pane"
              >
                {/* Element Inspector Panel (collapsible) */}
                {showInspector && (
                  <div className="border-b border-ocean-divider p-4 overflow-auto" style={{ maxHeight: '60vh' }}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">Inspector</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowInspector(false)}
                        data-testid="button-close-inspector"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <ElementInspector 
                      element={selectedIframeElement}
                      iframe={iframeRef.current}
                      changeCount={visualEditorTracker.getAllEdits().length}
                      onUndo={() => {
                        if (iframeInjectorRef.current) {
                          iframeInjectorRef.current.undo();
                        }
                      }}
                      onRedo={() => {
                        if (iframeInjectorRef.current) {
                          iframeInjectorRef.current.redo();
                        }
                      }}
                      canUndo={iframeInjectorRef.current?.canUndo() || false}
                      canRedo={iframeInjectorRef.current?.canRedo() || false}
                    />
                  </div>
                )}
                
                {/* Git Panel or Mr. Blue Chat */}
                <div className="flex-1 overflow-hidden">
                  {showGitPanel ? (
                    <GitPanel
                      currentFile={currentPage}
                      onBranchSwitch={(branch) => {
                        toast({
                          title: "Branch Switched",
                          description: `Now on branch: ${branch}. Reload the page to see changes.`,
                          duration: 5000
                        });
                      }}
                    />
                  ) : (
                    <Suspense fallback={<ChatPaneLoading />}>
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
                    </Suspense>
                  )}
                </div>
              </div>
            </VisualEditorErrorBoundary>
          )}
          
          {/* Focus Mode Timer (replaces right panel when active) */}
          {isFocusModeActive && (
            <div className="absolute top-20 right-4 z-[160]" data-testid="focus-mode-timer-container">
              <FocusModeTimer 
                onExit={handleFocusModeExit}
                onAutoSave={handleAutoSave}
              />
            </div>
          )}
          </div>
        )}
      </div>
    </VisualEditorErrorBoundary>
  );
  
  // Wrap with Focus Mode when active
  if (isFocusModeActive) {
    return (
      <FocusMode onClose={handleFocusModeExit}>
        {editorContent}
      </FocusMode>
    );
  }
  
  return editorContent;
}
