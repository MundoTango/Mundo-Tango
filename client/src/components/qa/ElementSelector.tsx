import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crosshair, X, Check, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ElementSelectorProps {
  isActive: boolean;
  onSelect: (selector: string, element: HTMLElement) => void;
  onCancel: () => void;
}

export function ElementSelector({ isActive, onSelect, onCancel }: ElementSelectorProps) {
  const { t } = useTranslation('common');
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const getElementSelector = useCallback((el: HTMLElement): string => {
    if (el.id) {
      return `#${el.id}`;
    }
    
    if (el.dataset.testid) {
      return `[data-testid="${el.dataset.testid}"]`;
    }
    
    const tag = el.tagName.toLowerCase();
    const classes = Array.from(el.classList).slice(0, 2).join('.');
    
    if (classes) {
      return `${tag}.${classes}`;
    }
    
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
      const index = siblings.indexOf(el);
      if (siblings.length > 1) {
        return `${getElementSelector(parent)} > ${tag}:nth-child(${index + 1})`;
      }
    }
    
    return tag;
  }, []);

  const getElementBounds = useCallback((el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      setHoveredElement(null);
      setSelectedElement(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('[data-element-selector-overlay]')) {
        return;
      }
      
      if (target !== hoveredElement) {
        setHoveredElement(target);
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target as HTMLElement;
      
      if (target.closest('[data-element-selector-overlay]')) {
        return;
      }
      
      setSelectedElement(target);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, hoveredElement, onCancel]);

  const handleConfirm = useCallback(() => {
    if (selectedElement) {
      const selector = getElementSelector(selectedElement);
      onSelect(selector, selectedElement);
    }
  }, [selectedElement, getElementSelector, onSelect]);

  if (!isActive) {
    return null;
  }

  const displayElement = selectedElement || hoveredElement;
  const bounds = displayElement ? getElementBounds(displayElement) : null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[9998] pointer-events-none"
        style={{ cursor: 'crosshair' }}
      />
      
      {bounds && (
        <div
          className="fixed z-[9999] pointer-events-none border-2 rounded-sm transition-all duration-75"
          style={{
            top: bounds.top,
            left: bounds.left,
            width: bounds.width,
            height: bounds.height,
            borderColor: selectedElement ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)',
            backgroundColor: selectedElement 
              ? 'rgba(34, 197, 94, 0.1)' 
              : 'rgba(59, 130, 246, 0.1)',
          }}
        />
      )}

      <div 
        data-element-selector-overlay
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10000] bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 flex items-center gap-3"
        data-testid="element-selector-toolbar"
      >
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {selectedElement 
              ? t('bugReport.elementSelected', 'Element Selected')
              : t('bugReport.selectElement', 'Click on an element')}
          </span>
        </div>

        {displayElement && (
          <Badge variant="outline" className="font-mono text-xs max-w-[200px] truncate">
            {getElementSelector(displayElement)}
          </Badge>
        )}

        <div className="flex items-center gap-2 ml-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            data-testid="button-cancel-element-select"
          >
            <X className="h-4 w-4 mr-1" />
            {t('common.cancel', 'Cancel')}
          </Button>
          
          {selectedElement && (
            <Button
              size="sm"
              onClick={handleConfirm}
              data-testid="button-confirm-element-select"
            >
              <Check className="h-4 w-4 mr-1" />
              {t('common.confirm', 'Confirm')}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

interface ElementSelectorButtonProps {
  onElementSelected: (selector: string, element: HTMLElement) => void;
  selectedSelector?: string;
}

export function ElementSelectorButton({ onElementSelected, selectedSelector }: ElementSelectorButtonProps) {
  const { t } = useTranslation('common');
  const [isSelecting, setIsSelecting] = useState(false);

  return (
    <>
      <Button
        size="sm"
        variant={selectedSelector ? "default" : "outline"}
        className="gap-1.5 text-xs"
        onClick={() => setIsSelecting(true)}
        data-testid="button-select-element"
      >
        <Crosshair className="h-3.5 w-3.5" />
        {selectedSelector 
          ? t('bugReport.elementTargeted', 'Element Targeted')
          : t('bugReport.targetElement', 'Target Element')}
      </Button>

      <ElementSelector
        isActive={isSelecting}
        onSelect={(selector, element) => {
          setIsSelecting(false);
          onElementSelected(selector, element);
        }}
        onCancel={() => setIsSelecting(false)}
      />
    </>
  );
}
