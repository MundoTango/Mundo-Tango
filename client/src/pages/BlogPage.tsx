import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Calendar, Clock, Search } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/blog"],
    queryFn: async () => {
      const res = await fetch(`/api/blog${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch blog posts");
      return res.json();
    },
  });

  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tango Blog</h1>
          <p className="text-muted-foreground">
            Stories, tips, and insights from the tango world
          </p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading articles...</div>
        ) : posts && Array.isArray(posts) && posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post: any) => (
              <Card key={post.id} className="hover-elevate" data-testid={`post-${post.id}`}>
                <div className="grid md:grid-cols-3 gap-6">
                  {post.image && (
                    <div className="aspect-video md:aspect-square bg-muted overflow-hidden">
                      <img src={post.image} alt={post.title} className="object-cover w-full h-full" />
                    </div>
                  )}
                  
                  <div className={post.image ? "md:col-span-2" : "md:col-span-3"}>
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        {post.published && <Badge variant="secondary">Published</Badge>}
                      </div>
                      <Link href={`/blog/${post.slug || post.id}`}>
                        <CardTitle className="text-2xl hover:underline cursor-pointer">
                          {post.title}
                        </CardTitle>
                      </Link>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {post.excerpt && (
                        <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {post.author && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback>{post.author.name?.[0] || "?"}</AvatarFallback>
                            </Avatar>
                            <span>{post.author.name}</span>
                          </div>
                        )}
                        {post.createdAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                        )}
                        {post.views !== undefined && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {post.views} views
                          </div>
                        )}
                      </div>

                      <Link href={`/blog/${post.slug || post.id}`}>
                        <Button variant="outline" data-testid={`button-read-${post.id}`}>
                          Read More
                        </Button>
                      </Link>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No articles found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
