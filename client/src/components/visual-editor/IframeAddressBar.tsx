/**
 * Iframe Address Bar Component
 * MB.MD v9.0 - November 18, 2025
 * 
 * Browser-style address bar for iframe navigation
 */

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCw, Home } from 'lucide-react';

interface IframeAddressBarProps {
  currentUrl: string;
  onNavigate: (url: string) => void;
  onRefresh: () => void;
  onHome: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  onBack?: () => void;
  onForward?: () => void;
  loading?: boolean;
}

export function IframeAddressBar({
  currentUrl,
  onNavigate,
  onRefresh,
  onHome,
  canGoBack = false,
  canGoForward = false,
  onBack,
  onForward,
  loading = false
}: IframeAddressBarProps) {
  const [urlInput, setUrlInput] = useState(currentUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input with currentUrl changes
  useEffect(() => {
    setUrlInput(currentUrl);
  }, [currentUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = urlInput.trim();
    if (trimmedUrl) {
      onNavigate(trimmedUrl);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 border-b bg-background" data-testid="iframe-address-bar">
      {/* Navigation Buttons */}
      <Button
        size="icon"
        variant="ghost"
        onClick={onBack}
        disabled={!canGoBack || loading}
        data-testid="button-back"
        title="Go Back"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={onForward}
        disabled={!canGoForward || loading}
        data-testid="button-forward"
        title="Go Forward"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={onRefresh}
        disabled={loading}
        data-testid="button-refresh"
        title="Refresh"
      >
        <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={onHome}
        disabled={loading}
        data-testid="button-home"
        title="Home"
      >
        <Home className="h-4 w-4" />
      </Button>

      {/* Address Input */}
      <form onSubmit={handleSubmit} className="flex-1">
        <Input
          ref={inputRef}
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter page URL (e.g., /landing, /home, /profile)"
          className="font-mono text-sm"
          data-testid="input-address-bar"
          disabled={loading}
        />
      </form>
    </div>
  );
}
