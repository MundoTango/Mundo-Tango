/**
 * BreadcrumbContext - Hierarchical page/tab/section tracking
 * Components register themselves as breadcrumb nodes for automatic tracking
 * MB.MD Pattern 67: Universal Bug Diagnostic System
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface BreadcrumbNode {
  id: string;
  label: string;
  type: 'page' | 'tab' | 'section' | 'subsection' | 'modal' | 'action';
  testId?: string;
  file?: string;
  component?: string;
  entityId?: number | string;
  entityType?: string;
}

interface BreadcrumbContextValue {
  breadcrumb: BreadcrumbNode[];
  pushBreadcrumb: (node: BreadcrumbNode) => void;
  popBreadcrumb: (id: string) => void;
  replaceBreadcrumb: (id: string, node: BreadcrumbNode) => void;
  clearBreadcrumb: () => void;
  getCurrentBreadcrumb: () => string[];
  getFullContext: () => BreadcrumbNode[];
  setEntityContext: (entityType: string, entityId: number | string, label?: string) => void;
  entityContext: Record<string, { id: number | string; label?: string }>;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbNode[]>([]);
  const [entityContext, setEntityContextState] = useState<Record<string, { id: number | string; label?: string }>>({});

  const pushBreadcrumb = useCallback((node: BreadcrumbNode) => {
    setBreadcrumb(prev => {
      // Remove any existing node with same id (prevent duplicates)
      const filtered = prev.filter(n => n.id !== node.id);
      // For tabs/sections, remove siblings of same type
      if (node.type === 'tab') {
        return [...filtered.filter(n => n.type !== 'tab' && n.type !== 'section' && n.type !== 'subsection'), node];
      }
      if (node.type === 'section') {
        return [...filtered.filter(n => n.type !== 'section' && n.type !== 'subsection'), node];
      }
      return [...filtered, node];
    });
  }, []);

  const popBreadcrumb = useCallback((id: string) => {
    setBreadcrumb(prev => prev.filter(n => n.id !== id));
  }, []);

  const replaceBreadcrumb = useCallback((id: string, node: BreadcrumbNode) => {
    setBreadcrumb(prev => prev.map(n => n.id === id ? node : n));
  }, []);

  const clearBreadcrumb = useCallback(() => {
    setBreadcrumb([]);
    setEntityContextState({});
  }, []);

  const getCurrentBreadcrumb = useCallback((): string[] => {
    return breadcrumb.map(n => n.label);
  }, [breadcrumb]);

  const getFullContext = useCallback((): BreadcrumbNode[] => {
    return [...breadcrumb];
  }, [breadcrumb]);

  const setEntityContext = useCallback((entityType: string, entityId: number | string, label?: string) => {
    setEntityContextState(prev => ({
      ...prev,
      [entityType]: { id: entityId, label }
    }));
  }, []);

  return (
    <BreadcrumbContext.Provider value={{
      breadcrumb,
      pushBreadcrumb,
      popBreadcrumb,
      replaceBreadcrumb,
      clearBreadcrumb,
      getCurrentBreadcrumb,
      getFullContext,
      setEntityContext,
      entityContext
    }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
}

export function useBreadcrumbRegister(node: Omit<BreadcrumbNode, 'id'> & { id?: string }) {
  const { pushBreadcrumb, popBreadcrumb } = useBreadcrumb();
  const id = node.id || `${node.type}-${node.label}`;
  
  // Auto-register on mount, auto-unregister on unmount
  const register = useCallback(() => {
    pushBreadcrumb({ ...node, id });
  }, [pushBreadcrumb, id, node]);

  const unregister = useCallback(() => {
    popBreadcrumb(id);
  }, [popBreadcrumb, id]);

  return { register, unregister, id };
}

export default BreadcrumbContext;
