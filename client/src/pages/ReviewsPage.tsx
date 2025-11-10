import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SelectReview } from "@shared/schema";

const reviewFormSchema = z.object({
  targetType: z.string().min(1, "Target type is required"),
  targetId: z.number().min(1, "Target ID is required"),
  rating: z.number().min(1).max(5),
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Review must be at least 10 characters"),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface ReviewWithUser extends SelectReview {
  user?: {
    id: number;
    name: string | null;
    username: string | null;
    profileImage: string | null;
  };
}

export default function ReviewsPage() {
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: reviews = [], isLoading } = useQuery<ReviewWithUser[]>({
    queryKey: ["/api/reviews"],
  });

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      targetType: "teacher",
      targetId: 1,
      rating: 5,
      title: "",
      content: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      return await apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({ title: "Review created successfully!" });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      return await apiRequest("DELETE", `/api/reviews/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({ title: "Review deleted successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const helpfulMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      return await apiRequest("POST", `/api/reviews/${reviewId}/helpful`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({ title: "Marked as helpful!" });
    },
  });

  const filteredReviews = filterType === "all" 
    ? reviews 
    : reviews.filter((r: ReviewWithUser) => r.targetType === filterType);

  const onSubmit = (data: ReviewFormData) => {
    createMutation.mutate(data);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Reviews</h1>
            <p className="text-muted-foreground">
              Explore community reviews and share your experiences
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-review">Write a Review</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
                <DialogDescription>
                  Share your experience with the community
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="targetType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Review Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-target-type">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="teacher">Teacher</SelectItem>
                              <SelectItem value="venue">Venue</SelectItem>
                              <SelectItem value="event">Event</SelectItem>
                              <SelectItem value="housing">Housing</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="targetId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target ID</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1"
                              data-testid="input-target-id"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              data-testid={`button-rating-${star}`}
                              onClick={() => field.onChange(star)}
                              className="hover-elevate active-elevate-2 rounded-md p-1"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= field.value
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-muted text-muted-foreground"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Great experience!"
                            data-testid="input-review-title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share your detailed experience..."
                            rows={5}
                            data-testid="input-review-content"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                      data-testid="button-cancel-review"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      data-testid="button-submit-review"
                    >
                      {createMutation.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["all", "teacher", "venue", "event", "housing"].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              onClick={() => setFilterType(type)}
              data-testid={`filter-${type}`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>

        {/* Reviews List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading reviews...
          </div>
        ) : filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Star className="mx-auto h-12 w-12 mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">No reviews found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} data-testid={`card-review-${review.id}`}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={review.user?.profileImage || undefined} />
                        <AvatarFallback>
                          {review.user?.name?.charAt(0) || review.user?.username?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {review.title || "Untitled Review"}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            by {review.user?.name || review.user?.username || "Anonymous"}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {review.targetType}
                          </Badge>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2">{renderStars(review.rating)}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => helpfulMutation.mutate(review.id)}
                        data-testid={`button-helpful-${review.id}`}
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {review.helpfulCount || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(review.id)}
                        data-testid={`button-delete-${review.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{review.content}</p>
                  {review.createdAt && (
                    <p className="text-xs text-muted-foreground mt-4">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
