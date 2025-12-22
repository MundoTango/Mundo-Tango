import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UnifiedLocationPicker, extractCityCountry } from "@/components/input/UnifiedLocationPicker";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { ArrowLeft, Users } from "lucide-react";
import { Link } from "wouter";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  longDescription: z.string().optional(),
  type: z.string().default("city"),
  visibility: z.string().default("public"),
  joinApproval: z.boolean().default(true),
  city: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  language: z.string().default("en"),
  whoCanPost: z.string().default("members"),
  allowEvents: z.boolean().default(true),
  allowPosts: z.boolean().default(true),
  allowDiscussions: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

export default function GroupCreatePage() {
  const { t } = useTranslation(["pages", "common"]);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      longDescription: "",
      type: "city",
      visibility: "public",
      joinApproval: true,
      city: "",
      country: "",
      region: "",
      allowEvents: true,
      allowPosts: true,
      allowDiscussions: true,
      whoCanPost: "members",
      language: "en",
    },
  });

  const createGroup = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/groups", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Group created!",
        description: `${data.name} has been created successfully.`,
      });
      setLocation(`/groups/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create group",
        description: error.message,
      });
    },
  });

  const generateSlug = (name: string) => {
    setIsGeneratingSlug(true);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    form.setValue('slug', slug);
    setIsGeneratingSlug(false);
  };

  const onSubmit = (data: FormData) => {
    createGroup.mutate(data);
  };

  return (
    <PageLayout>
      <SEO 
        title="Create Group | Mundo Tango"
        description="Create a new tango community group"
      />
      
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="mb-6">
          <Link href="/groups">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-groups">
              <ArrowLeft className="h-4 w-4" />
              Back to Groups
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle data-testid="text-page-title">Create New Group</CardTitle>
                <CardDescription>Build your tango community</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Buenos Aires Tango Community" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (!form.getValues('slug')) {
                              generateSlug(e.target.value);
                            }
                          }}
                          data-testid="input-group-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="buenos-aires-tango" 
                          {...field}
                          data-testid="input-group-slug"
                        />
                      </FormControl>
                      <FormDescription>
                        Used in the group URL: /groups/{field.value || 'your-slug'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-group-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="city">City Community</SelectItem>
                          <SelectItem value="professional">Professional Network</SelectItem>
                          <SelectItem value="interest">Interest Group</SelectItem>
                          <SelectItem value="event">Event Series</SelectItem>
                          <SelectItem value="school">Dance School</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Briefly describe your group..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          data-testid="input-group-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide more details about your group, its goals, and what members can expect..."
                          className="resize-none"
                          rows={5}
                          {...field}
                          data-testid="input-group-long-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-visibility">
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="public">Public - Anyone can find and view</SelectItem>
                          <SelectItem value="private">Private - Only members can view</SelectItem>
                          <SelectItem value="secret">Secret - Hidden from search</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="joinApproval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Join Approval</FormLabel>
                        <FormDescription>
                          New members must be approved by admins
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-join-approval"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h4 className="font-medium">Group Features</h4>
                  
                  <FormField
                    control={form.control}
                    name="allowEvents"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel>Allow Events</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-allow-events"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowPosts"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel>Allow Posts</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-allow-posts"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowDiscussions"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel>Allow Discussions</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-allow-discussions"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Link href="/groups" className="flex-1">
                    <Button type="button" variant="outline" className="w-full" data-testid="button-cancel">
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={createGroup.isPending}
                    data-testid="button-create-group"
                  >
                    {createGroup.isPending ? "Creating..." : "Create Group"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
