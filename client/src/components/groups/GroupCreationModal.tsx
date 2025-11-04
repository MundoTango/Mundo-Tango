import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  longDescription: z.string().optional(),
  type: z.string().default("city"),
  visibility: z.string().default("public"),
  joinApproval: z.string().default("open"),
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

interface GroupCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroupCreationModal({ open, onOpenChange }: GroupCreationModalProps) {
  const { toast } = useToast();
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
      joinApproval: "open",
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
      onOpenChange(false);
      form.reset();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-create-group-title">Create a New Group</DialogTitle>
          <DialogDescription>
            Create a community space for tango dancers to connect, share, and organize events.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createGroup.mutate(data))} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Barcelona Tango Community" 
                        {...field} 
                        data-testid="input-group-name"
                        onBlur={(e) => {
                          field.onBlur();
                          if (!form.getValues('slug')) {
                            generateSlug(e.target.value);
                          }
                        }}
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
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          placeholder="barcelona-tango" 
                          {...field} 
                          data-testid="input-group-slug"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => generateSlug(form.getValues('name'))}
                        disabled={isGeneratingSlug || !form.getValues('name')}
                        data-testid="button-generate-slug"
                      >
                        Generate
                      </Button>
                    </div>
                    <FormDescription>
                      URL-friendly identifier: /groups/{field.value || "your-slug"}
                    </FormDescription>
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
                        placeholder="A welcoming community for tango enthusiasts in Barcelona..."
                        {...field}
                        rows={3}
                        data-testid="input-group-description"
                      />
                    </FormControl>
                    <FormDescription>Brief overview shown in search results</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed information about your group, activities, schedule..."
                        {...field}
                        value={field.value || ""}
                        rows={5}
                        data-testid="input-group-long-description"
                      />
                    </FormControl>
                    <FormDescription>Detailed description with markdown support</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Group Type & Location */}
            <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="specialty">Specialty Group</SelectItem>
                        <SelectItem value="practice">Practice Group</SelectItem>
                        <SelectItem value="workshop">Workshop Group</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-group-language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="it">Italiano</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Barcelona" 
                        {...field} 
                        value={field.value || ""}
                        data-testid="input-group-city"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region/State</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Catalonia" 
                        {...field}
                        value={field.value || ""}
                        data-testid="input-group-region"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Spain" 
                        {...field}
                        value={field.value || ""}
                        data-testid="input-group-country"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Privacy & Permissions */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-group-visibility">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public - Anyone can find and view</SelectItem>
                        <SelectItem value="private">Private - Members only</SelectItem>
                        <SelectItem value="secret">Secret - Invite only, hidden from search</SelectItem>
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
                  <FormItem>
                    <FormLabel>Join Approval</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-join-approval">
                          <SelectValue placeholder="Select approval type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="open">Open - Anyone can join</SelectItem>
                        <SelectItem value="approval">Approval Required</SelectItem>
                        <SelectItem value="invite_only">Invite Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whoCanPost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Who Can Post</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-who-can-post">
                          <SelectValue placeholder="Select who can post" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="members">All Members</SelectItem>
                        <SelectItem value="moderators">Moderators & Admins</SelectItem>
                        <SelectItem value="admins">Admins Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-create-group"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createGroup.isPending}
                data-testid="button-submit-create-group"
              >
                {createGroup.isPending ? "Creating..." : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
