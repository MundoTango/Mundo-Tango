/**
 * Drag & Drop Handler
 * Figma-like drag and drop repositioning with alignment guides
 * Snap-to-grid functionality for precise positioning
 */

import { useState, useEffect, useCallback } from "react";

interface DragDropHandlerProps {
  enabled: boolean;
  selectedElement: HTMLElement | null;
  onDragEnd: (element: HTMLElement, position: { x: number; y: number }) => void;
}

interface DragState {
  isDragging: boolean;
  element: HTMLElement | null;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

export function DragDropHandler({ enabled, selectedElement, onDragEnd }: DragDropHandlerProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    element: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  });

  const [snapLines, setSnapLines] = useState<{ x: number[]; y: number[] }>({
    x: [],
    y: []
  });

  const SNAP_THRESHOLD = 8; // pixels
  const GRID_SIZE = 8; // 8px grid

  const snapToGrid = (value: number): number => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  const findSnapLines = useCallback((element: HTMLElement): { x: number[]; y: number[] } => {
    const rect = element.getBoundingClientRect();
    const allElements = document.querySelectorAll('body *:not([data-visual-editor])');
    const lines = { x: [], y: [] } as { x: number[]; y: number[] };

    allElements.forEach(el => {
      if (el === element || element.contains(el) || el.contains(element)) return;

      const elRect = el.getBoundingClientRect();

      // Vertical snap lines (for horizontal alignment)
      [elRect.left, elRect.right, elRect.left + elRect.width / 2].forEach(x => {
        if (Math.abs(x - rect.left) < SNAP_THRESHOLD ||
            Math.abs(x - rect.right) < SNAP_THRESHOLD ||
            Math.abs(x - (rect.left + rect.width / 2)) < SNAP_THRESHOLD) {
          lines.x.push(x);
        }
      });

      // Horizontal snap lines (for vertical alignment)
      [elRect.top, elRect.bottom, elRect.top + elRect.height / 2].forEach(y => {
        if (Math.abs(y - rect.top) < SNAP_THRESHOLD ||
            Math.abs(y - rect.bottom) < SNAP_THRESHOLD ||
            Math.abs(y - (rect.top + rect.height / 2)) < SNAP_THRESHOLD) {
          lines.y.push(y);
        }
      });
    });

    return lines;
  }, [SNAP_THRESHOLD]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!enabled || !selectedElement) return;

    const target = e.target as HTMLElement;
    if (!selectedElement.contains(target) && target !== selectedElement) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = selectedElement.getBoundingClientRect();

    setDragState({
      isDragging: true,
      element: selectedElement,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    });

    selectedElement.classList.add('editor-dragging');
  }, [enabled, selectedElement]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.element) return;

    e.preventDefault();

    let newX = e.clientX - dragState.offsetX;
    let newY = e.clientY - dragState.offsetY;

    // Snap to grid
    newX = snapToGrid(newX);
    newY = snapToGrid(newY);

    // Apply position
    dragState.element.style.position = 'absolute';
    dragState.element.style.left = `${newX}px`;
    dragState.element.style.top = `${newY}px`;

    // Find snap lines
    const lines = findSnapLines(dragState.element);
    setSnapLines(lines);

    // Snap to alignment guides
    lines.x.forEach(snapX => {
      const rect = dragState.element!.getBoundingClientRect();
      if (Math.abs(snapX - rect.left) < SNAP_THRESHOLD) {
        dragState.element!.style.left = `${snapX}px`;
      } else if (Math.abs(snapX - rect.right) < SNAP_THRESHOLD) {
        dragState.element!.style.left = `${snapX - rect.width}px`;
      }
    });

    lines.y.forEach(snapY => {
      const rect = dragState.element!.getBoundingClientRect();
      if (Math.abs(snapY - rect.top) < SNAP_THRESHOLD) {
        dragState.element!.style.top = `${snapY}px`;
      } else if (Math.abs(snapY - rect.bottom) < SNAP_THRESHOLD) {
        dragState.element!.style.top = `${snapY - rect.height}px`;
      }
    });
  }, [dragState, snapToGrid, findSnapLines, SNAP_THRESHOLD]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.element) return;

    e.preventDefault();

    const finalRect = dragState.element.getBoundingClientRect();
    
    dragState.element.classList.remove('editor-dragging');
    setSnapLines({ x: [], y: [] });

    onDragEnd(dragState.element, {
      x: finalRect.left,
      y: finalRect.top
    });

    setDragState({
      isDragging: false,
      element: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0
    });
  }, [dragState, onDragEnd]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enabled, handleMouseDown, handleMouseMove, handleMouseUp]);

  // Render snap line guides
  if (!dragState.isDragging) return null;

  return (
    <>
      {/* Vertical snap lines */}
      {snapLines.x.map((x, index) => (
        <div
          key={`v-${index}`}
          className="fixed top-0 bottom-0 w-px bg-primary/50 pointer-events-none z-[9999]"
          style={{ left: `${x}px` }}
        />
      ))}

      {/* Horizontal snap lines */}
      {snapLines.y.map((y, index) => (
        <div
          key={`h-${index}`}
          className="fixed left-0 right-0 h-px bg-primary/50 pointer-events-none z-[9999]"
          style={{ top: `${y}px` }}
        />
      ))}
    </>
  );
}
