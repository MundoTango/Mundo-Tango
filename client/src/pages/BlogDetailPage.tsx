import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Heart, Share2, BookmarkPlus, ArrowLeft, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

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
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: post.featuredImage ? `url('${post.featuredImage}')` : `url('https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1600&h=900&fit=crop&q=80')`
          }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-end h-full px-8 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-full max-w-4xl"
            >
              <Badge variant="outline" className="mb-4 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                <BookOpen className="w-3 h-3 mr-1.5" />
                {post.category}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4" data-testid="text-blog-title">
                {post.title}
              </h1>
              
              <div className="flex items-center gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 border-2 border-white/30">
                    <AvatarImage src={post.authorImage} />
                    <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{post.authorName}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.publishedAt), 'MMMM dd, yyyy')}
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime} min read
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl px-6 py-12">
          <Button variant="outline" asChild className="mb-8" data-testid="button-back">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-8">
                <div className="mb-6">

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
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
