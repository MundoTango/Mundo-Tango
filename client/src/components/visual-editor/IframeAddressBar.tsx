/**
 * Iframe Address Bar Component
 * MB.MD v9.0 - November 18, 2025
 * 
 * Browser-style address bar for iframe navigation with history, SSL indicator, and bookmarks
 */

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCw, Home, Lock, AlertTriangle, Clock, Star, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface NavigationHistoryEntry {
  url: string;
  timestamp: number;
  title?: string;
}

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
  navigationHistory?: NavigationHistoryEntry[];
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
  loading = false,
  navigationHistory = []
}: IframeAddressBarProps) {
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('visual-editor-bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.warn('[IframeAddressBar] Failed to load bookmarks');
      }
    }
  }, []);

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

  // Determine SSL status based on URL
  const getSSLStatus = () => {
    if (!currentUrl) return { secure: false, icon: AlertTriangle, color: 'text-muted-foreground' };
    
    // For local development paths (no protocol)
    if (currentUrl.startsWith('/')) {
      return { 
        secure: true, 
        icon: Lock, 
        color: 'text-emerald-600',
        label: 'Local (Secure)'
      };
    }
    
    // For full URLs
    if (currentUrl.startsWith('https://')) {
      return { 
        secure: true, 
        icon: Lock, 
        color: 'text-emerald-600',
        label: 'Secure Connection'
      };
    }
    
    if (currentUrl.startsWith('http://')) {
      return { 
        secure: false, 
        icon: AlertTriangle, 
        color: 'text-amber-600',
        label: 'Not Secure'
      };
    }
    
    return { 
      secure: false, 
      icon: AlertTriangle, 
      color: 'text-muted-foreground',
      label: 'Unknown'
    };
  };

  const sslStatus = getSSLStatus();
  const SSLIcon = sslStatus.icon;

  const handleToggleBookmark = () => {
    const isBookmarked = bookmarks.includes(currentUrl);
    
    let newBookmarks: string[];
    if (isBookmarked) {
      newBookmarks = bookmarks.filter(b => b !== currentUrl);
      toast({
        title: 'Bookmark Removed',
        description: currentUrl,
        duration: 2000
      });
    } else {
      newBookmarks = [...bookmarks, currentUrl];
      toast({
        title: 'Bookmark Added',
        description: currentUrl,
        duration: 2000
      });
    }
    
    setBookmarks(newBookmarks);
    localStorage.setItem('visual-editor-bookmarks', JSON.stringify(newBookmarks));
  };

  const handleNavigateToHistory = (url: string) => {
    onNavigate(url);
  };

  const isBookmarked = bookmarks.includes(currentUrl);

  // Get last 10 history entries (reversed so newest first)
  const recentHistory = [...navigationHistory].reverse().slice(0, 10);

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

      {/* SSL Indicator */}
      <div 
        className={`flex items-center ${sslStatus.color}`}
        title={sslStatus.label}
        data-testid="ssl-indicator"
      >
        <SSLIcon className="h-4 w-4" />
      </div>

      {/* Address Input */}
      <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-1">
        <Input
          ref={inputRef}
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter page URL (e.g., /landing, /home, /profile)"
          className="font-mono text-sm flex-1"
          data-testid="input-address-bar"
          disabled={loading}
        />
      </form>

      {/* Bookmark Button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={handleToggleBookmark}
        disabled={loading}
        data-testid="button-bookmark"
        title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
      >
        <Star className={`h-4 w-4 ${isBookmarked ? 'fill-current text-amber-500' : ''}`} />
      </Button>

      {/* History Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            disabled={loading || recentHistory.length === 0}
            data-testid="button-history-dropdown"
            title="Navigation History"
          >
            <Clock className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[300px]">
          <DropdownMenuLabel>Recent History</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {recentHistory.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              No history yet
            </div>
          ) : (
            <>
              {recentHistory.map((entry, index) => (
                <DropdownMenuItem
                  key={`${entry.url}-${index}`}
                  onClick={() => handleNavigateToHistory(entry.url)}
                  className="cursor-pointer"
                  data-testid={`history-item-${index}`}
                >
                  <div className="flex flex-col gap-1 w-full">
                    <div className="font-mono text-xs truncate">
                      {entry.url}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}
          
          {bookmarks.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Bookmarks</DropdownMenuLabel>
              {bookmarks.map((bookmark, index) => (
                <DropdownMenuItem
                  key={`bookmark-${index}`}
                  onClick={() => handleNavigateToHistory(bookmark)}
                  className="cursor-pointer"
                  data-testid={`bookmark-item-${index}`}
                >
                  <Star className="h-3 w-3 mr-2 fill-current text-amber-500" />
                  <div className="font-mono text-xs truncate">
                    {bookmark}
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
