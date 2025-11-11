import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Heart, Share2, BookmarkPlus, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  authorName: string;
  authorImage?: string;
  authorBio?: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: number;
  likes: number;
  views: number;
  isLiked: boolean;
  isSaved: boolean;
  featuredImage?: string;
}

export default function BlogDetailPage() {
  const { blogId } = useParams();

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: [`/api/blog/${blogId}`],
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading article...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!post) {
    return (
      <AppLayout>
        <div className="container mx-auto max-w-4xl py-8 px-4">
          <p className="text-center text-muted-foreground">Article not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <div className="container mx-auto max-w-4xl py-8 px-4">
          <Button variant="outline" asChild className="mb-6" data-testid="button-back">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>

          <Card>
            <CardContent className="p-0">
              {post.featuredImage && (
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8">
                <div className="mb-6">
                  <Badge className="mb-4">{post.category}</Badge>
                  <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="text-blog-title">
                    {post.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(post.publishedAt), 'MMMM dd, yyyy')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {post.readTime} min read
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      {post.likes.toLocaleString()} likes
                    </div>
                    <span>{post.views.toLocaleString()} views</span>
                  </div>

                  <div className="flex items-center justify-between pb-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={post.authorImage} />
                        <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-foreground">{post.authorName}</div>
                        {post.authorBio && (
                          <div className="text-sm text-muted-foreground">{post.authorBio}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" data-testid="button-like">
                        <Heart className={`h-4 w-4 mr-2 ${post.isLiked ? 'fill-current' : ''}`} />
                        Like
                      </Button>
                      <Button variant="outline" size="sm" data-testid="button-save">
                        <BookmarkPlus className="h-4 w-4 mr-2" />
                        {post.isSaved ? 'Saved' : 'Save'}
                      </Button>
                      <Button variant="outline" size="sm" data-testid="button-share">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {post.content}
                  </div>
                </div>

                {post.tags.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-border">
                    <h3 className="font-semibold text-foreground mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-8 border-t border-border">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={post.authorImage} />
                      <AvatarFallback className="text-2xl">{post.authorName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground text-lg mb-1">
                        {post.authorName}
                      </div>
                      {post.authorBio && (
                        <p className="text-sm text-muted-foreground">{post.authorBio}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
