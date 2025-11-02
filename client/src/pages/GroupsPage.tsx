import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import type { SelectGroup } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function GroupsPage() {
  const { data: groups, isLoading } = useQuery<SelectGroup[]>({
    queryKey: ["/api/groups"],
  });

  return (
    <SelfHealingErrorBoundary pageName="Groups" fallbackRoute="/feed">
      <PageLayout title="Tango Groups" showBreadcrumbs>
<>
      <SEO 
        title="Tango Groups"
        description="Discover and join tango communities. Connect with dancers, find practice groups, and engage with the global tango community."
      />
      <div className="max-w-7xl mx-auto p-6">
      

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
      ) : groups && groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="overflow-hidden" data-testid={`card-group-${group.id}`}>
              {group.coverPhoto && (
                <div className="h-32 w-full overflow-hidden">
                  <img
                    src={group.coverPhoto}
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle data-testid="text-group-name">{group.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {group.memberCount || 0} members · {group.groupType}
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
      </div>
    </>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
