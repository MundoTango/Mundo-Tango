/**
 * VisualEditorShell - Lightweight wrapper for Visual Editor
 * Provides layout structure without heavy dependencies
 * MB.MD v9.5.1: Playwright-compatible modular architecture
 */

import { ReactNode } from "react";
import { SEO } from "@/components/SEO";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface VisualEditorShellProps {
  children: ReactNode;
}

export function VisualEditorShell({ children }: VisualEditorShellProps) {
  return (
    <>
      <SEO 
        title="Visual Editor - Mr. Blue AI"
        description="Autonomous AI-powered visual editor for web development"
      />
      
      <ErrorBoundary>
        <div className="flex flex-col h-screen bg-background overflow-hidden">
          {children}
        </div>
      </ErrorBoundary>
    </>
  );
}
