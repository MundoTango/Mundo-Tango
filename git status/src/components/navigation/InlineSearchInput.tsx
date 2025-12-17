import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchResult {
  type: 'post' | 'event' | 'user' | 'group';
  id: string | number;
  title?: string;
  name?: string;
  content?: string;
  description?: string;
}

interface SearchResponse {
  posts?: SearchResult[];
  events?: SearchResult[];
  users?: SearchResult[];
  groups?: SearchResult[];
}

export function InlineSearchInput() {
  const [location, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      setResults({});
      setShowResults(false);
      return;
    }

    setShowResults(true);
    setIsLoading(true);
    
    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers: Record<string, string> = {};
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        
        const response = await fetch(
          `/api/user/global-search?q=${encodeURIComponent(query)}`,
          {
            headers,
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (type: string, id: string | number) => {
    setQuery("");
    setResults({});
    setShowResults(false);

    switch (type) {
      case "post":
        setLocation(`/post/${id}`);
        break;
      case "event":
        setLocation(`/event/${id}`);
        break;
      case "user":
        setLocation(`/profile/${id}`);
        break;
      case "group":
        setLocation(`/group/${id}`);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resultCount = 
    (results.posts?.length || 0) +
    (results.events?.length || 0) +
    (results.users?.length || 0) +
    (results.groups?.length || 0);

  return (
    <div ref={containerRef} className="w-full relative">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search posts, events, people, groups..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setShowResults(true)}
          className="pl-10 pr-8"
          data-testid="input-search"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults({});
              setShowResults(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 text-muted-foreground hover:text-foreground z-10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && query && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : resultCount === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results found
            </div>
          ) : (
            <div className="py-2">
              {/* Posts */}
              {results.posts && results.posts.length > 0 && (
                <>
                  <div className="px-4 py-2 font-semibold text-xs text-muted-foreground uppercase">
                    Posts
                  </div>
                  {results.posts.map((post) => (
                    <button
                      key={`post-${post.id}`}
                      onClick={() => handleResultClick("post", post.id)}
                      className="w-full text-left px-4 py-2 hover:bg-accent transition-colors cursor-pointer"
                      data-testid={`search-result-post-${post.id}`}
                    >
                      <p className="text-sm font-medium truncate">
                        {post.content || "Untitled Post"}
                      </p>
                    </button>
                  ))}
                  <div className="border-t" />
                </>
              )}

              {/* Events */}
              {results.events && results.events.length > 0 && (
                <>
                  <div className="px-4 py-2 font-semibold text-xs text-muted-foreground uppercase">
                    Events
                  </div>
                  {results.events.map((event) => (
                    <button
                      key={`event-${event.id}`}
                      onClick={() => handleResultClick("event", event.id)}
                      className="w-full text-left px-4 py-2 hover:bg-accent transition-colors cursor-pointer"
                      data-testid={`search-result-event-${event.id}`}
                    >
                      <p className="text-sm font-medium truncate">
                        {event.title || "Untitled Event"}
                      </p>
                    </button>
                  ))}
                  <div className="border-t" />
                </>
              )}

              {/* Users */}
              {results.users && results.users.length > 0 && (
                <>
                  <div className="px-4 py-2 font-semibold text-xs text-muted-foreground uppercase">
                    People
                  </div>
                  {results.users.map((user) => (
                    <button
                      key={`user-${user.id}`}
                      onClick={() => handleResultClick("user", user.id)}
                      className="w-full text-left px-4 py-2 hover:bg-accent transition-colors cursor-pointer"
                      data-testid={`search-result-user-${user.id}`}
                    >
                      <p className="text-sm font-medium truncate">
                        {user.name || "Unnamed User"}
                      </p>
                    </button>
                  ))}
                  <div className="border-t" />
                </>
              )}

              {/* Groups */}
              {results.groups && results.groups.length > 0 && (
                <>
                  <div className="px-4 py-2 font-semibold text-xs text-muted-foreground uppercase">
                    Groups
                  </div>
                  {results.groups.map((group) => (
                    <button
                      key={`group-${group.id}`}
                      onClick={() => handleResultClick("group", group.id)}
                      className="w-full text-left px-4 py-2 hover:bg-accent transition-colors cursor-pointer"
                      data-testid={`search-result-group-${group.id}`}
                    >
                      <p className="text-sm font-medium truncate">
                        {group.name || "Unnamed Group"}
                      </p>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
