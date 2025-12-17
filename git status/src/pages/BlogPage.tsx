import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { BookOpen, Calendar, Clock, Search } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
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
      <SEO
        title="Tango Blog | Mundo Tango"
        description="Read stories, tips, and insights from the tango world. Explore techniques, history, culture, events, and interviews from dancers and teachers worldwide."
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=1600&h=900&fit=crop&q=80')`
          }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                <BookOpen className="w-3 h-3 mr-1.5" />
                Editorial
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4" data-testid="text-page-title">
                Tango Blog
              </h1>
              
              <p className="text-lg text-white/80 max-w-2xl mx-auto" data-testid="text-page-description">
                Stories, tips, and insights from the tango world
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container max-w-6xl mx-auto px-6 py-12 space-y-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4 mb-6"
        >
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

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {["all", "techniques", "history", "culture", "events", "interviews"].map((category) => (
              <Button
                key={category}
                variant={categoryFilter === category ? "default" : "outline"}
                onClick={() => setCategoryFilter(category)}
                size="sm"
                data-testid={`filter-category-${category}`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">Loading articles...</div>
        ) : posts && Array.isArray(posts) && posts.length > 0 ? (
          <div className="space-y-6">
            {posts
              .filter((post: any) => categoryFilter === "all" || post.category === categoryFilter)
              .map((post: any, index: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="hover-elevate" data-testid={`post-${post.id}`}>
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
                        <CardTitle className="text-2xl font-serif hover:underline cursor-pointer">
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
              </motion.div>
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
      </div>
    </AppLayout>
  );
}
