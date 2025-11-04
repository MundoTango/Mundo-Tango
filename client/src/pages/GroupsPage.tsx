import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Users, Plus, Search } from "lucide-react";
import type { SelectGroup } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { GroupCreationModal } from "@/components/groups/GroupCreationModal";
import { GroupCategoryFilter } from "@/components/groups/GroupCategoryFilter";

export default function GroupsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: groups, isLoading } = useQuery<SelectGroup[]>({
    queryKey: ["/api/groups"],
  });

  const filteredGroups = groups?.filter(group => {
    const matchesSearch = !searchQuery || 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <SelfHealingErrorBoundary pageName="Groups" fallbackRoute="/feed">
      <PageLayout title="Tango Groups" showBreadcrumbs>
<>
      <SEO 
        title="Tango Groups"
        description="Discover and join tango communities. Connect with dancers, find practice groups, and engage with the global tango community."
      />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">Tango Groups</h1>
            <p className="text-muted-foreground">Connect with communities around the world</p>
          </div>
          <Button onClick={() => setIsCreating(true)} data-testid="button-create-group">
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-groups"
          />
        </div>

        {/* Category Filter */}
        <GroupCategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <Skeleton className="h-32 w-full rounded-t-xl" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredGroups && filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="overflow-hidden" data-testid={`card-group-${group.id}`}>
              {group.coverImage && (
                <div className="h-32 w-full overflow-hidden">
                  <img
                    src={group.coverImage}
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle data-testid="text-group-name">{group.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {group.memberCount || 0} members · {group.type || 'Group'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {group.description}
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/groups/${group.id}`}>
                  <Button className="w-full" data-testid={`button-view-group-${group.id}`}>
                    View Group
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No groups found. Be the first to create one!
          </CardContent>
        </Card>
      )}

        {/* Create Group Modal */}
        <GroupCreationModal open={isCreating} onOpenChange={setIsCreating} />
      </div>
    </>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
