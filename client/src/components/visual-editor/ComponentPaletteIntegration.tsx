/**
 * Component Palette Integration
 * Handles drag/drop integration between palette and iframe
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { ComponentPalette } from "./ComponentPalette";
import type { ComponentType } from "./types";
import { generateComponentHTML } from "./componentTemplates";
import { IframeInjector } from "@/lib/iframeInjector";
import { visualEditorTracker } from "@/lib/visualEditorTracker";
import { useToast } from "@/hooks/use-toast";

interface ComponentPaletteIntegrationProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  iframeInjector: IframeInjector | null;
}

export function ComponentPaletteIntegration({ 
  iframeRef, 
  iframeInjector 
}: ComponentPaletteIntegrationProps) {
  const [draggedType, setDraggedType] = useState<ComponentType | null>(null);
  const [dropPosition, setDropPosition] = useState<{ x: number; y: number } | null>(null);
  const [recentlyUsed, setRecentlyUsed] = useState<ComponentType[]>([]);
  const { toast } = useToast();
  
  // Load recently used from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('component-palette-recent');
    if (stored) {
      try {
        setRecentlyUsed(JSON.parse(stored));
      } catch (e) {
        console.warn('Failed to load recently used components');
      }
    }
  }, []);
  
  // Save recently used to localStorage
  const addToRecentlyUsed = useCallback((type: ComponentType) => {
    setRecentlyUsed(prev => {
      // Remove duplicates and add to front
      const filtered = prev.filter(t => t !== type);
      const updated = [type, ...filtered].slice(0, 10); // Keep max 10
      localStorage.setItem('component-palette-recent', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleDragStart = useCallback((type: ComponentType) => {
    setDraggedType(type);
    console.log('[ComponentPalette] Drag started:', type);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'copy';
    
    // Get iframe-relative position
    if (iframeRef.current) {
      const iframeRect = iframeRef.current.getBoundingClientRect();
      const x = e.clientX - iframeRect.left;
      const y = e.clientY - iframeRect.top;
      setDropPosition({ x, y });
      
      // Highlight drop zone in iframe
      if (iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'SHOW_DROP_ZONE',
          position: { x, y }
        }, '*');
      }
    }
  }, [iframeRef]);

  const handleDragLeave = useCallback((e: DragEvent) => {
    // Only clear if leaving the iframe entirely
    const target = e.target as HTMLElement;
    if (target === iframeRef.current) {
      setDropPosition(null);
      
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'HIDE_DROP_ZONE'
        }, '*');
      }
    }
  }, [iframeRef]);

  const handleDrop = useCallback(async (e: DragEvent) => {
    e.preventDefault();
    
    if (!draggedType || !iframeInjector || !dropPosition) {
      console.warn('[ComponentPalette] Missing requirements for drop');
      return;
    }
    
    console.log('[ComponentPalette] Drop detected:', draggedType, dropPosition);
    
    try {
      // Generate unique testId
      const testId = `component-${draggedType}-${Date.now()}`;
      
      // Generate HTML for the component
      const html = generateComponentHTML(draggedType, testId);
      
      // Inject into iframe
      await iframeInjector.injectComponent(draggedType, html, dropPosition);
      
      // Track in visual editor
      visualEditorTracker.track({
        elementId: testId,
        elementTestId: testId,
        changeType: 'position',
        changes: {
          inserted: {
            before: null,
            after: {
              type: draggedType,
              position: dropPosition,
              timestamp: Date.now()
            }
          }
        },
        description: `Inserted ${draggedType} component`
      });
      
      // Add to recently used
      addToRecentlyUsed(draggedType);
      
      toast({
        title: "Component Added",
        description: `${draggedType} component inserted successfully`,
        duration: 2000
      });
      
    } catch (error) {
      console.error('[ComponentPalette] Drop failed:', error);
      toast({
        variant: "destructive",
        title: "Insertion Failed",
        description: "Failed to insert component. Please try again."
      });
    } finally {
      setDraggedType(null);
      setDropPosition(null);
      
      // Hide drop zone
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'HIDE_DROP_ZONE'
        }, '*');
      }
    }
  }, [draggedType, iframeInjector, dropPosition, addToRecentlyUsed, toast, iframeRef]);

  // Set up drag & drop event listeners on iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeElement = iframe;
    
    iframeElement.addEventListener('dragover', handleDragOver as any);
    iframeElement.addEventListener('dragleave', handleDragLeave as any);
    iframeElement.addEventListener('drop', handleDrop as any);

    return () => {
      iframeElement.removeEventListener('dragover', handleDragOver as any);
      iframeElement.removeEventListener('dragleave', handleDragLeave as any);
      iframeElement.removeEventListener('drop', handleDrop as any);
    };
  }, [iframeRef, handleDragOver, handleDragLeave, handleDrop]);

  // Listen for component insertion confirmation from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'IFRAME_COMPONENT_INSERTED') {
        const { componentType, testId, success } = event.data.data;
        
        if (success) {
          console.log('[ComponentPalette] Component inserted in iframe:', componentType, testId);
        } else {
          toast({
            variant: "destructive",
            title: "Insertion Failed",
            description: "Component could not be inserted at that location"
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toast]);

  return (
    <ComponentPalette 
      onDragStart={handleDragStart}
      recentlyUsed={recentlyUsed}
    />
  );
}
