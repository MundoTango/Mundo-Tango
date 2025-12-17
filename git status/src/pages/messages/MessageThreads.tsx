import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Archive, Trash2, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type FilterType = "all" | "direct" | "groups" | "archived";
type SortType = "recent" | "unread" | "alphabetical";

export default function MessageThreads() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("recent");
  const [search, setSearch] = useState("");
  const [selectedThreads, setSelectedThreads] = useState<number[]>([]);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["/api/messages/conversations", filter, sort],
  });

  const filteredConversations = conversations?.filter((conv: any) => {
    const matchesSearch = search === "" ||
      conv.userName?.toLowerCase().includes(search.toLowerCase()) ||
      conv.name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = 
      filter === "all" ||
      (filter === "direct" && conv.type === "direct") ||
      (filter === "groups" && conv.type === "group") ||
      (filter === "archived" && conv.archived);

    return matchesSearch && matchesFilter;
  }) || [];

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (sort === "recent") {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else if (sort === "unread") {
      if (a.isRead === b.isRead) return 0;
      return a.isRead ? 1 : -1;
    } else {
      const nameA = a.userName || a.name || "";
      const nameB = b.userName || b.name || "";
      return nameA.localeCompare(nameB);
    }
  });

  const toggleThread = (id: number) => {
    setSelectedThreads(prev =>
      prev.includes(id)
        ? prev.filter(threadId => threadId !== id)
        : [...prev, id]
    );
  };

  const handleBulkAction = (action: "archive" | "delete") => {
    console.log(`Bulk ${action}:`, selectedThreads);
    setSelectedThreads([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading threads...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Message Threads</h1>
          <div className="flex items-center gap-2">
            {selectedThreads.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction("archive")}
                  data-testid="button-bulk-archive"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive ({selectedThreads.length})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction("delete")}
                  data-testid="button-bulk-delete"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedThreads.length})
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
            <TabsList>
              <TabsTrigger value="all" data-testid="filter-all">All</TabsTrigger>
              <TabsTrigger value="direct" data-testid="filter-direct">Direct</TabsTrigger>
              <TabsTrigger value="groups" data-testid="filter-groups">Groups</TabsTrigger>
              <TabsTrigger value="archived" data-testid="filter-archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSort(sort === "recent" ? "unread" : sort === "unread" ? "alphabetical" : "recent")}
              data-testid="button-sort"
            >
              <Filter className="h-4 w-4 mr-2" />
              Sort: {sort}
            </Button>
          </div>
        </div>
      </div>

      {/* Thread List */}
      <ScrollArea className="flex-1">
        {sortedConversations.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No conversations found</p>
          </div>
        ) : (
          <div className="divide-y">
            {sortedConversations.map((conv: any) => {
              const isSelected = selectedThreads.includes(conv.id);
              const path = conv.type === "direct" 
                ? `/messages/direct/${conv.userId}`
                : `/messages/group/${conv.id}`;

              return (
                <div
                  key={conv.id}
                  className={cn(
                    "p-4 hover-elevate transition-colors",
                    !conv.isRead && "bg-accent/50",
                    isSelected && "bg-primary/10"
                  )}
                  data-testid={`thread-${conv.id}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleThread(conv.id)}
                      className="mt-1"
                      data-testid={`checkbox-${conv.id}`}
                    />

                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conv.userImage || conv.image} />
                      <AvatarFallback>
                        {(conv.userName || conv.name)?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <Link href={path} className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className={cn(
                          "font-medium truncate",
                          !conv.isRead && "font-semibold"
                        )}>
                          {conv.userName || conv.name}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(conv.timestamp), "MMM d, HH:mm")}
                        </span>
                      </div>
                      <p className={cn(
                        "text-sm truncate",
                        conv.isRead ? "text-muted-foreground" : "text-foreground"
                      )}>
                        {conv.lastMessage || "No messages yet"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {conv.type === "group" && (
                          <Badge variant="secondary">Group</Badge>
                        )}
                        {!conv.isRead && (
                          <Badge variant="default">Unread</Badge>
                        )}
                      </div>
                    </Link>

                    {/* More Options */}
                    <Button variant="ghost" size="icon" data-testid={`button-more-${conv.id}`}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
