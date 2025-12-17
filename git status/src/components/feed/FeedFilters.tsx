import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Globe, Bookmark, User, AtSign, Home } from "lucide-react";

type FilterType = "all" | "friends" | "public" | "saved" | "my-posts" | "mentions";

interface FeedFiltersProps {
  value: FilterType;
  onChange: (filter: FilterType) => void;
}

const filters = [
  { value: "all" as const, label: "All Posts", icon: Home },
  { value: "friends" as const, label: "Friends", icon: Users },
  { value: "public" as const, label: "Public", icon: Globe },
  { value: "saved" as const, label: "Saved", icon: Bookmark },
  { value: "my-posts" as const, label: "My Posts", icon: User },
  { value: "mentions" as const, label: "Mentions", icon: AtSign },
];

export function FeedFilters({ value, onChange }: FeedFiltersProps) {
  // Persist filter selection in localStorage
  useEffect(() => {
    localStorage.setItem("feedFilter", value);
  }, [value]);

  // Load persisted filter on mount
  useEffect(() => {
    const savedFilter = localStorage.getItem("feedFilter") as FilterType;
    if (savedFilter && filters.some(f => f.value === savedFilter)) {
      onChange(savedFilter);
    }
  }, []);

  return (
    <div className="w-full mb-6" data-testid="feed-filters">
      <Tabs value={value} onValueChange={(v) => onChange(v as FilterType)}>
        <TabsList className="w-full grid grid-cols-3 lg:grid-cols-6 gap-2">
          {filters.map(({ value: filterValue, label, icon: Icon }) => (
            <TabsTrigger
              key={filterValue}
              value={filterValue}
              className="flex items-center gap-2"
              data-testid={`filter-${filterValue}`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
