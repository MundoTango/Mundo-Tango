/**
 * Component Selector
 * Click-to-select UI elements with purple outline/border states
 * Figma-like selection experience
 */

import { useState, useEffect, useCallback } from "react";

export interface SelectedComponent {
  element: HTMLElement;
  id: string;
  tagName: string;
  className: string;
  text: string;
  rect: DOMRect;
}

interface ComponentSelectorProps {
  enabled: boolean;
  onSelect: (component: SelectedComponent | null) => void;
}

export function ComponentSelector({ enabled, onSelect }: ComponentSelectorProps) {
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!enabled) return;

    const target = e.target as HTMLElement;
    
    // Ignore editor UI elements
    if (target.closest('[data-visual-editor]')) {
      return;
    }

    setHoveredElement(target);
  }, [enabled]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (!enabled) return;

    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    
    // Ignore editor UI elements
    if (target.closest('[data-visual-editor]')) {
      return;
    }

    setSelectedElement(target);

    // Extract component info
    const component: SelectedComponent = {
      element: target,
      id: target.id || `element-${Date.now()}`,
      tagName: target.tagName.toLowerCase(),
      className: target.className || '',
      text: target.textContent?.substring(0, 100) || '',
      rect: target.getBoundingClientRect()
    };

    onSelect(component);
  }, [enabled, onSelect]);

  useEffect(() => {
    if (!enabled) {
      // Cleanup: remove all editor classes
      document.querySelectorAll('.editor-hover, .editor-selected').forEach(el => {
        el.classList.remove('editor-hover', 'editor-selected');
      });
      setHoveredElement(null);
      setSelectedElement(null);
      onSelect(null);
      return;
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick, true); // Use capture phase

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);
    };
  }, [enabled, handleMouseMove, handleClick, onSelect]);

  useEffect(() => {
    // Remove previous hover state
    document.querySelectorAll('.editor-hover').forEach(el => {
      el.classList.remove('editor-hover');
    });

    // Add hover state to current element
    if (hoveredElement && hoveredElement !== selectedElement) {
      hoveredElement.classList.add('editor-hover');
    }
  }, [hoveredElement, selectedElement]);

  useEffect(() => {
    // Remove previous selected state
    document.querySelectorAll('.editor-selected').forEach(el => {
      el.classList.remove('editor-selected', 'editor-hover');
    });

    // Add selected state to current element
    if (selectedElement) {
      selectedElement.classList.add('editor-selected');
    }
  }, [selectedElement]);

  return null; // This component only manages DOM interactions
}
