/**
 * Element Highlighter Component
 * Highlights elements in the iframe based on natural language references
 * Shows selector paths and confidence scores
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, X, MousePointer, Code } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ElementHighlighterProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  onElementSelected?: (selector: string, confidence: number) => void;
  initialReference?: string;
}

interface SelectedElement {
  selector: string;
  confidence: number;
  explanation: string;
  alternatives: string[];
  reference: string;
}

export function ElementHighlighter({ iframeRef, onElementSelected, initialReference }: ElementHighlighterProps) {
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [hoveredSelector, setHoveredSelector] = useState<string | null>(null);

  /**
   * Parse natural language element reference
   */
  const parseElementReference = useCallback(async (reference: string) => {
    try {
      const response = await apiRequest('POST', '/api/mrblue/select-element', {
        reference,
        userId: 147 // God user
      });
      
      const data = await response.json();
      
      if (data.success) {
        const element: SelectedElement = {
          selector: data.selector,
          confidence: data.confidence,
          explanation: data.explanation,
          alternatives: data.alternatives || [],
          reference
        };
        
        setSelectedElement(element);
        highlightElement(data.selector);
        
        if (onElementSelected) {
          onElementSelected(data.selector, data.confidence);
        }
      }
    } catch (error) {
      console.error('[ElementHighlighter] Parse error:', error);
    }
  }, [onElementSelected]);

  /**
   * Highlight element in iframe
   */
  const highlightElement = useCallback((selector: string) => {
    if (!iframeRef.current) return;
    
    try {
      const iframeDoc = iframeRef.current.contentDocument;
      if (!iframeDoc) return;

      // Remove existing highlights
      const existingHighlights = iframeDoc.querySelectorAll('.mr-blue-highlight');
      existingHighlights.forEach(el => el.classList.remove('mr-blue-highlight'));

      // Remove existing highlight style
      let styleEl = iframeDoc.getElementById('mr-blue-highlight-style');
      if (!styleEl) {
        styleEl = iframeDoc.createElement('style');
        styleEl.id = 'mr-blue-highlight-style';
        styleEl.textContent = `
          .mr-blue-highlight {
            outline: 3px solid #3b82f6 !important;
            outline-offset: 2px !important;
            background-color: rgba(59, 130, 246, 0.1) !important;
            transition: all 0.2s ease !important;
            cursor: pointer !important;
          }
          .mr-blue-highlight-hover {
            outline: 3px solid #10b981 !important;
            outline-offset: 2px !important;
            background-color: rgba(16, 185, 129, 0.1) !important;
          }
        `;
        iframeDoc.head.appendChild(styleEl);
      }

      // Add highlight to target element(s)
      const elements = iframeDoc.querySelectorAll(selector);
      elements.forEach(el => el.classList.add('mr-blue-highlight'));

      // Scroll first element into view
      if (elements[0]) {
        elements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (error) {
      console.error('[ElementHighlighter] Highlight error:', error);
    }
  }, [iframeRef]);

  /**
   * Enable click-to-select mode
   */
  const enableInspectMode = useCallback(() => {
    if (!iframeRef.current) return;
    
    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;

    setIsInspecting(true);

    // Add hover highlighting
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      target.classList.add('mr-blue-highlight-hover');
      
      // Show selector preview
      const selector = getElementSelector(target);
      setHoveredSelector(selector);
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      target.classList.remove('mr-blue-highlight-hover');
      setHoveredSelector(null);
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target as HTMLElement;
      const selector = getElementSelector(target);
      
      setSelectedElement({
        selector,
        confidence: 1.0,
        explanation: 'Selected by click',
        alternatives: [],
        reference: 'clicked element'
      });
      
      highlightElement(selector);
      disableInspectMode();
      
      if (onElementSelected) {
        onElementSelected(selector, 1.0);
      }
    };

    iframeDoc.body.addEventListener('mouseover', handleMouseOver);
    iframeDoc.body.addEventListener('mouseout', handleMouseOut);
    iframeDoc.body.addEventListener('click', handleClick);

    // Store cleanup function
    (iframeDoc.body as any)._cleanupInspector = () => {
      iframeDoc.body.removeEventListener('mouseover', handleMouseOver);
      iframeDoc.body.removeEventListener('mouseout', handleMouseOut);
      iframeDoc.body.removeEventListener('click', handleClick);
    };
  }, [iframeRef, onElementSelected, highlightElement]);

  /**
   * Disable click-to-select mode
   */
  const disableInspectMode = useCallback(() => {
    if (!iframeRef.current) return;
    
    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;

    setIsInspecting(false);
    
    if ((iframeDoc.body as any)._cleanupInspector) {
      (iframeDoc.body as any)._cleanupInspector();
      delete (iframeDoc.body as any)._cleanupInspector;
    }
  }, [iframeRef]);

  /**
   * Get CSS selector for an element
   */
  function getElementSelector(element: HTMLElement): string {
    // Priority 1: data-testid
    const testId = element.getAttribute('data-testid');
    if (testId) {
      return `[data-testid="${testId}"]`;
    }

    // Priority 2: ID
    if (element.id) {
      return `#${element.id}`;
    }

    // Priority 3: Class + tag
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes[0]}`;
      }
    }

    // Fallback: Tag name
    return element.tagName.toLowerCase();
  }

  /**
   * Clear selection
   */
  const clearSelection = useCallback(() => {
    setSelectedElement(null);
    
    if (!iframeRef.current) return;
    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;

    const highlights = iframeDoc.querySelectorAll('.mr-blue-highlight');
    highlights.forEach(el => el.classList.remove('mr-blue-highlight'));
  }, [iframeRef]);

  // Parse initial reference
  useEffect(() => {
    if (initialReference) {
      parseElementReference(initialReference);
    }
  }, [initialReference, parseElementReference]);

  return (
    <div className="space-y-2">
      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={isInspecting ? "default" : "outline"}
          onClick={isInspecting ? disableInspectMode : enableInspectMode}
          data-testid="button-inspect-element"
        >
          <MousePointer className="h-3 w-3 mr-2" />
          {isInspecting ? 'Cancel Inspect' : 'Inspect Element'}
        </Button>
        
        {selectedElement && (
          <Button
            size="sm"
            variant="ghost"
            onClick={clearSelection}
            data-testid="button-clear-selection"
          >
            <X className="h-3 w-3 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Hover preview */}
      {isInspecting && hoveredSelector && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-muted-foreground" />
              <code className="text-xs font-mono">{hoveredSelector}</code>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected element info */}
      {selectedElement && (
        <Card data-testid="selected-element-card">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Selected Element</span>
              </div>
              <Badge 
                variant={selectedElement.confidence > 0.8 ? "default" : "secondary"}
                className="text-xs"
              >
                {Math.round(selectedElement.confidence * 100)}% confidence
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Selector:</div>
              <code className="text-xs font-mono bg-muted p-1 rounded block">
                {selectedElement.selector}
              </code>
            </div>

            {selectedElement.explanation && (
              <div className="text-xs text-muted-foreground">
                {selectedElement.explanation}
              </div>
            )}

            {selectedElement.alternatives.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Alternatives:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedElement.alternatives.map((alt, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-xs cursor-pointer hover-elevate"
                      onClick={() => highlightElement(alt)}
                    >
                      {alt}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
