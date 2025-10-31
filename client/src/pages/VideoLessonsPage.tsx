import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, Users, Star } from "lucide-react";
import { Link } from "wouter";

export default function VideoLessonsPage() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["/api/video-lessons", activeTab],
  });

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Video Lessons</h1>
          <p className="text-lg text-muted-foreground">
            Master tango with step-by-step video instruction from world-class teachers
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all" data-testid="tab-all">All Lessons</TabsTrigger>
            <TabsTrigger value="technique" data-testid="tab-technique">Technique</TabsTrigger>
            <TabsTrigger value="musicality" data-testid="tab-musicality">Musicality</TabsTrigger>
            <TabsTrigger value="patterns" data-testid="tab-patterns">Patterns</TabsTrigger>
            <TabsTrigger value="embrace" data-testid="tab-embrace">Embrace</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="text-center py-12">Loading lessons...</div>
            ) : lessons && Array.isArray(lessons) && lessons.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {lessons.map((lesson: any) => (
                  <Card key={lesson.id} className="hover-elevate" data-testid={`lesson-card-${lesson.id}`}>
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      {lesson.thumbnail ? (
                        <img src={lesson.thumbnail} alt={lesson.title} className="object-cover w-full h-full" />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-primary/5">
                          <Play className="h-16 w-16 text-primary/50" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary">{lesson.duration || "15 min"}</Badge>
                      </div>
                    </div>

                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2">{lesson.title}</CardTitle>
                        {lesson.premium && <Badge variant="default">Premium</Badge>}
                      </div>
                      {lesson.instructor && (
                        <p className="text-sm text-muted-foreground">by {lesson.instructor}</p>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {lesson.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{lesson.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {lesson.students && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {lesson.students.toLocaleString()}
                          </div>
                        )}
                        {lesson.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            {lesson.rating.toFixed(1)}
                          </div>
                        )}
                      </div>

                      <Link href={`/video-lessons/${lesson.id}`}>
                        <Button className="w-full" data-testid={`button-watch-${lesson.id}`}>
                          <Play className="h-4 w-4 mr-2" />
                          Watch Lesson
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Play className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No lessons available in this category</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
