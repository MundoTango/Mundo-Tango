import { useEffect, useState } from 'react';
import { Eye, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SelectionOverlay({ 
  selectedElement,
  onInspect,
  onEdit,
  onDelete
}: SelectionOverlayProps) {
  const [bounds, setBounds] = useState<DOMRect | null>(null);
  
  useEffect(() => {
    if (selectedElement) {
      const updateBounds = () => {
        const rect = selectedElement.getBoundingClientRect();
        setBounds(rect);
      };
      
      updateBounds();
      
      // Update bounds on scroll/resize
      window.addEventListener('resize', updateBounds);
      window.addEventListener('scroll', updateBounds, true);
      
      return () => {
        window.removeEventListener('resize', updateBounds);
        window.removeEventListener('scroll', updateBounds, true);
      };
    } else {
      setBounds(null);
    }
  }, [selectedElement]);
  
  if (!bounds) return null;
  
  // Ensure toolbar doesn't go off-screen
  const toolbarTop = Math.max(bounds.top - 44, 4);
  const toolbarLeft = Math.max(bounds.left, 4);
  
  return (
    <>
      {/* Selection highlight */}
      <div
        className="pointer-events-none fixed border-2 border-primary bg-primary/10 transition-all z-40"
        style={{
          top: bounds.top,
          left: bounds.left,
          width: bounds.width,
          height: bounds.height,
        }}
        data-testid="selection-overlay"
      />
      
      {/* Selection toolbar */}
      <div
        className="fixed z-50 flex gap-1 p-1 bg-background border rounded shadow-lg"
        style={{
          top: toolbarTop,
          left: toolbarLeft,
        }}
        data-testid="selection-toolbar"
      >
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onInspect?.(selectedElement)}
          data-testid="button-inspect"
          title="Inspect Element"
        >
          <Eye className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEdit?.(selectedElement)}
          data-testid="button-edit"
          title="Edit Element"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete?.(selectedElement)}
          data-testid="button-delete"
          title="Delete Element"
        >
          <Trash className="w-4 h-4" />
        </Button>
      </div>
    </>
  );
}

interface SelectionOverlayProps {
  selectedElement: HTMLElement | null;
  onInspect?: (element: HTMLElement) => void;
  onEdit?: (element: HTMLElement) => void;
  onDelete?: (element: HTMLElement) => void;
}
