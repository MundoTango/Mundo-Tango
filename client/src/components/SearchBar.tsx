import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface SearchResult {
  id: number;
  type: "user" | "event" | "group" | "post" | "venue" | "teacher";
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results = [], isLoading } = useQuery<SearchResult[]>({
    queryKey: ["/api/search", query],
    enabled: query.length >= 2,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleResultClick = (url: string) => {
    navigate(url);
    setOpen(false);
    setQuery("");
  };

  const getTypeIcon = (type: string) => {
    const colors = {
      user: "bg-blue-500",
      event: "bg-purple-500",
      group: "bg-green-500",
      post: "bg-orange-500",
      venue: "bg-pink-500",
      teacher: "bg-yellow-500",
    };
    return colors[type as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full md:w-64 justify-start text-muted-foreground"
          data-testid="button-search-trigger"
        >
          <div className="flex items-center w-full gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">Search...</span>
            <kbd className="ml-auto hidden md:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" data-testid="popover-search">
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 shrink-0 opacity-50" />
          <Input
            ref={inputRef}
            placeholder="Search users, events, groups..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            data-testid="input-search"
          />
        </div>
        <ScrollArea className="h-80">
          {isLoading && query.length >= 2 ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  className="w-full flex items-center gap-3 rounded-md p-2 hover-elevate active-elevate-2 text-left"
                  onClick={() => handleResultClick(result.url)}
                  data-testid={`search-result-${result.type}-${result.id}`}
                >
                  {result.image ? (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={result.image} />
                      <AvatarFallback>{result.title.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className={`h-10 w-10 rounded-full ${getTypeIcon(result.type)} flex items-center justify-center text-white font-bold`}>
                      {result.title.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {result.type}
                  </Badge>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No results found</p>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm">Type to search...</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
