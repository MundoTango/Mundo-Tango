import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Plus, Trash2, Edit, Eye, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().optional(),
  body: z.string().min(1, "Template body is required"),
  channels: z.array(z.string()).min(1, "Select at least one channel"),
  isPublic: z.boolean().default(false),
});

type TemplateFormData = z.infer<typeof templateSchema>;

const CHANNEL_OPTIONS = [
  { value: "mt", label: "MT Messages" },
  { value: "gmail", label: "Gmail" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
];

const TEMPLATE_VARIABLES = [
  { key: "{{name}}", description: "Recipient's name" },
  { key: "{{firstName}}", description: "Recipient's first name" },
  { key: "{{lastName}}", description: "Recipient's last name" },
  { key: "{{eventName}}", description: "Event name" },
  { key: "{{eventDate}}", description: "Event date" },
  { key: "{{eventLocation}}", description: "Event location" },
  { key: "{{userName}}", description: "Your name" },
];

export default function Templates() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<number | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/messages/templates"],
  });

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      subject: "",
      body: "",
      channels: [],
      isPublic: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      return apiRequest("POST", "/api/messages/templates", data);
    },
    onSuccess: () => {
      toast({
        title: "Template created",
        description: "Your message template has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/templates"] });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create template",
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TemplateFormData }) => {
      return apiRequest("PATCH", `/api/messages/templates/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Template updated",
        description: "Your message template has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/templates"] });
      setEditingTemplate(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update template",
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/messages/templates/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Template deleted",
        description: "Your message template has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/templates"] });
      setDeletingTemplate(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete template",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: TemplateFormData) => {
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    form.reset({
      name: template.name,
      subject: template.subject || "",
      body: template.body,
      channels: template.channels || [],
      isPublic: template.isPublic || false,
    });
  };

  const insertVariable = (variable: string) => {
    const currentBody = form.getValues("body");
    form.setValue("body", currentBody + variable);
  };

  const TemplateForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Event Invitation" {...field} data-testid="input-template-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="channels"
          render={() => (
            <FormItem>
              <FormLabel>Channels</FormLabel>
              <FormDescription>
                Select which channels this template can be used for
              </FormDescription>
              <div className="space-y-2">
                {CHANNEL_OPTIONS.map((channel) => (
                  <FormField
                    key={channel.value}
                    control={form.control}
                    name="channels"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(channel.value)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, channel.value])
                                : field.onChange(
                                    field.value?.filter((value) => value !== channel.value)
                                  );
                            }}
                            data-testid={`checkbox-channel-${channel.value}`}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{channel.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Message subject" {...field} data-testid="input-template-subject" />
              </FormControl>
              <FormDescription>For email channels (Gmail, MT Messages)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message Body</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your template message here..."
                  className="min-h-[200px]"
                  {...field}
                  data-testid="textarea-template-body"
                />
              </FormControl>
              <FormDescription>
                Use variables like {`{{name}}`} or {`{{eventName}}`}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <div className="text-sm font-medium mb-2">Insert Variables</div>
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_VARIABLES.map((variable) => (
              <Button
                key={variable.key}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertVariable(variable.key)}
                data-testid={`button-variable-${variable.key}`}
              >
                {variable.key}
              </Button>
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="checkbox-ispublic"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Make this template public</FormLabel>
                <FormDescription>
                  Public templates can be used by other team members
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsCreateOpen(false);
              setEditingTemplate(null);
              form.reset();
            }}
            data-testid="button-cancel-template"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            data-testid="button-save-template"
          >
            {editingTemplate ? "Update" : "Create"} Template
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Message Templates</h1>
          <p className="text-muted-foreground">
            Create and manage reusable message templates
          </p>
        </div>
        <Dialog open={isCreateOpen || !!editingTemplate} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingTemplate(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-template">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Template" : "Create New Template"}
              </DialogTitle>
            </DialogHeader>
            <TemplateForm />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading templates...</div>
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid gap-6">
          {templates.map((template: any) => (
            <Card key={template.id} data-testid={`template-card-${template.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {template.name}
                      {template.isPublic && (
                        <Badge variant="secondary">Public</Badge>
                      )}
                    </CardTitle>
                    {template.subject && (
                      <CardDescription className="mt-2">
                        Subject: {template.subject}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPreviewTemplate(template)}
                      data-testid={`button-preview-${template.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(template)}
                      data-testid={`button-edit-${template.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingTemplate(template.id)}
                      data-testid={`button-delete-${template.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Message Preview</div>
                    <div className="text-sm bg-muted p-4 rounded-md line-clamp-3">
                      {template.body}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Channels: </span>
                      {template.channels?.map((channel: string, i: number) => (
                        <Badge key={i} variant="outline" className="ml-1">
                          {CHANNEL_OPTIONS.find(c => c.value === channel)?.label}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-muted-foreground">
                      Used {template.usageCount || 0} times
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <Copy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first message template to save time composing messages
            </p>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-template">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewTemplate?.subject && (
              <div>
                <div className="text-sm font-medium mb-1">Subject</div>
                <div className="text-sm text-muted-foreground">{previewTemplate.subject}</div>
              </div>
            )}
            <div>
              <div className="text-sm font-medium mb-1">Message Body</div>
              <div className="text-sm bg-muted p-4 rounded-md whitespace-pre-wrap">
                {previewTemplate?.body}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Available Variables</div>
              <div className="flex flex-wrap gap-2">
                {TEMPLATE_VARIABLES.map((variable) => (
                  <Badge key={variable.key} variant="outline">
                    {variable.key}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTemplate} onOpenChange={() => setDeletingTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingTemplate && deleteMutation.mutate(deletingTemplate)}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
