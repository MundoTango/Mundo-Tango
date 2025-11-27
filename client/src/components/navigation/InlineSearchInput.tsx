import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      setResults({});
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/user/global-search?q=${encodeURIComponent(query)}`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setIsOpen(true);
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
    setIsOpen(false);

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

  const resultCount = 
    (results.posts?.length || 0) +
    (results.events?.length || 0) +
    (results.users?.length || 0) +
    (results.groups?.length || 0);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div className="w-full">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search posts, events, people, groups..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query && setIsOpen(true)}
              className="pl-10 pr-8"
              data-testid="input-search"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults({});
                  setIsOpen(false);
                  inputRef.current?.focus();
                }}
                className="absolute right-3 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </DropdownMenuTrigger>

      {isOpen && query && (
        <DropdownMenuContent align="start" className="w-80 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : resultCount === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results found
            </div>
          ) : (
            <>
              {/* Posts */}
              {results.posts && results.posts.length > 0 && (
                <>
                  <div className="px-4 py-2 font-semibold text-xs text-muted-foreground uppercase">
                    Posts
                  </div>
                  {results.posts.map((post) => (
                    <DropdownMenuItem
                      key={`post-${post.id}`}
                      onClick={() => handleResultClick("post", post.id)}
                      className="cursor-pointer"
                      data-testid={`search-result-post-${post.id}`}
                    >
                      <div className="truncate">
                        <p className="text-sm font-medium truncate">
                          {post.content || "Untitled Post"}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Events */}
              {results.events && results.events.length > 0 && (
                <>
                  <div className="px-4 py-2 font-semibold text-xs text-muted-foreground uppercase">
                    Events
                  </div>
                  {results.events.map((event) => (
                    <DropdownMenuItem
                      key={`event-${event.id}`}
                      onClick={() => handleResultClick("event", event.id)}
                      className="cursor-pointer"
                      data-testid={`search-result-event-${event.id}`}
                    >
                      <div className="truncate">
                        <p className="text-sm font-medium truncate">
                          {event.title || "Untitled Event"}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Users */}
              {results.users && results.users.length > 0 && (
                <>
                  <div className="px-4 py-2 font-semibold text-xs text-muted-foreground uppercase">
                    People
                  </div>
                  {results.users.map((user) => (
                    <DropdownMenuItem
                      key={`user-${user.id}`}
                      onClick={() => handleResultClick("user", user.id)}
                      className="cursor-pointer"
                      data-testid={`search-result-user-${user.id}`}
                    >
                      <div className="truncate">
                        <p className="text-sm font-medium truncate">
                          {user.name || "Unnamed User"}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Groups */}
              {results.groups && results.groups.length > 0 && (
                <>
                  <div className="px-4 py-2 font-semibold text-xs text-muted-foreground uppercase">
                    Groups
                  </div>
                  {results.groups.map((group) => (
                    <DropdownMenuItem
                      key={`group-${group.id}`}
                      onClick={() => handleResultClick("group", group.id)}
                      className="cursor-pointer"
                      data-testid={`search-result-group-${group.id}`}
                    >
                      <div className="truncate">
                        <p className="text-sm font-medium truncate">
                          {group.name || "Unnamed Group"}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </>
          )}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
