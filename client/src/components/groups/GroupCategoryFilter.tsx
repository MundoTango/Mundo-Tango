import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SelectGroupCategory } from "@shared/schema";

interface GroupCategoryFilterProps {
  selectedCategory?: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export function GroupCategoryFilter({ selectedCategory, onSelectCategory }: GroupCategoryFilterProps) {
  const { data: categories, isLoading } = useQuery<SelectGroupCategory[]>({
    queryKey: ["/api/groups/categories"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectCategory(null)}
            data-testid="button-category-all"
          >
            All Groups
          </Button>
          {categories
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectCategory(category.id)}
                data-testid={`button-category-${category.slug}`}
                style={{
                  borderColor: category.color || undefined,
                }}
              >
                {category.icon && <span className="mr-1.5">{category.icon}</span>}
                {category.name}
                <Badge variant="secondary" className="ml-2">
                  {category.groupCount || 0}
                </Badge>
              </Button>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
