import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { EventFilters, EventFilterValues } from "@/components/events/EventFilters";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface SearchResult {
  event: any;
  organizer: {
    id: number;
    name: string;
    username: string;
    profileImage: string | null;
    isVerified: boolean;
  };
  attendeeCount: number;
}

interface SearchResponse {
  events: SearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function EventSearchPage() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState<EventFilterValues>({
    priceMin: 0,
    priceMax: 500,
  });
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (filters.q) params.append("q", filters.q);
    if (filters.city) params.append("city", filters.city);
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom.toISOString());
    if (filters.dateTo) params.append("dateTo", filters.dateTo.toISOString());
    if (filters.type && filters.type !== "all") params.append("type", filters.type);
    if (filters.priceMin !== undefined) params.append("priceMin", filters.priceMin.toString());
    if (filters.priceMax !== undefined) params.append("priceMax", filters.priceMax.toString());
    if (filters.danceStyle && filters.danceStyle !== "all") params.append("danceStyle", filters.danceStyle);
    if (filters.skillLevel && filters.skillLevel !== "all") params.append("skillLevel", filters.skillLevel);
    if (filters.online !== null && filters.online !== undefined) params.append("online", filters.online.toString());
    if (filters.verified) params.append("verified", "true");
    if (filters.tags && filters.tags.length > 0) params.append("tags", filters.tags.join(","));
    
    params.append("sortBy", sortBy);
    params.append("page", currentPage.toString());
    params.append("limit", "20");

    return params.toString();
  };

  const { data, isLoading, error } = useQuery<SearchResponse>({
    queryKey: ["/api/events/search", filters, sortBy, currentPage],
    queryFn: async () => {
      const response = await fetch(`/api/events/search?${buildQueryString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      return response.json();
    },
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  const handleFilterChange = (newFilters: EventFilterValues) => {
    setFilters(newFilters);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    if (!data?.pagination) return null;

    const { page, totalPages } = data.pagination;
    const pages = [];

    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          data-testid="button-prev-page"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {pages.map((pageNum) => (
          <Button
            key={pageNum}
            variant={pageNum === page ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(pageNum)}
            data-testid={`button-page-${pageNum}`}
          >
            {pageNum}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          data-testid="button-next-page"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Events</h1>
        <p className="text-muted-foreground">
          Find the perfect tango event with our advanced search filters
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-4">
            <EventFilters
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          </div>
        </aside>

        <div className="lg:hidden mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full" data-testid="button-open-filters">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <EventFilters
                  onFilterChange={handleFilterChange}
                  initialFilters={filters}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <main className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                <Skeleton className="w-32 h-5" />
              ) : (
                <span data-testid="text-results-count">
                  {data?.pagination.total || 0} events found
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-40" data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date (soonest first)</SelectItem>
                  <SelectItem value="price">Price (low to high)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <Card className="mb-6">
              <CardContent className="p-6 text-center text-destructive">
                Error loading events. Please try again.
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="w-48 h-32 rounded-md" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="w-3/4 h-6" />
                        <Skeleton className="w-1/2 h-4" />
                        <Skeleton className="w-full h-4" />
                        <Skeleton className="w-full h-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data?.events.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-lg text-muted-foreground mb-2">No events found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters to see more results
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {data?.events.map((result) => (
                  <div
                    key={result.event.id}
                    data-testid={`event-result-${result.event.id}`}
                  >
                    <EventCard
                      id={result.event.id}
                      title={result.event.title}
                      description={result.event.description}
                      startDate={result.event.startDate}
                      location={result.event.location}
                      imageUrl={result.event.imageUrl}
                      eventType={result.event.eventType}
                      attendeeCount={result.attendeeCount}
                      organizerName={result.organizer.name}
                      organizerId={result.organizer.id}
                      isVerified={result.organizer.isVerified}
                      price={result.event.price}
                      isFree={result.event.isFree}
                    />
                  </div>
                ))}
              </div>

              {renderPagination()}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
