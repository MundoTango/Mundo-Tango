import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, BookOpen, Clock, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";

export default function TutorialsPage() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: tutorials, isLoading } = useQuery({
    queryKey: ["/api/tutorials", activeTab],
  });

  return (
    <PageLayout title="Tango Tutorials" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all" data-testid="tab-all">
              All Tutorials
            </TabsTrigger>
            <TabsTrigger value="beginner" data-testid="tab-beginner">
              Beginner
            </TabsTrigger>
            <TabsTrigger value="intermediate" data-testid="tab-intermediate">
              Intermediate
            </TabsTrigger>
            <TabsTrigger value="advanced" data-testid="tab-advanced">
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="text-center py-12">Loading tutorials...</div>
            ) : tutorials && Array.isArray(tutorials) && tutorials.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tutorials.map((tutorial: any) => (
                  <Card key={tutorial.id} className="hover-elevate" data-testid={`tutorial-card-${tutorial.id}`}>
                    {/* Thumbnail */}
                    {tutorial.thumbnail && (
                      <div className="relative aspect-video bg-muted overflow-hidden">
                        <img
                          src={tutorial.thumbnail}
                          alt={tutorial.title}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                          <Play className="h-12 w-12 text-white" />
                        </div>
                      </div>
                    )}

                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-lg line-clamp-2">
                          {tutorial.title}
                        </CardTitle>
                        {tutorial.level && (
                          <Badge variant="secondary">{tutorial.level}</Badge>
                        )}
                      </div>
                      {tutorial.instructor && (
                        <p className="text-sm text-muted-foreground">
                          by {tutorial.instructor}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {tutorial.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {tutorial.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {tutorial.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {tutorial.duration}
                          </div>
                        )}
                        {tutorial.views && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {tutorial.views.toLocaleString()} views
                          </div>
                        )}
                      </div>

                      <Link href={`/tutorials/${tutorial.id}`}>
                        <Button className="w-full" data-testid={`button-watch-${tutorial.id}`}>
                          <Play className="h-4 w-4 mr-2" />
                          Watch Tutorial
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No tutorials available for this level</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </PageLayout>);
}
