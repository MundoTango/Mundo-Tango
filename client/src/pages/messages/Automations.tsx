import { useState } from "react";
import { useQuery, useMutation, queryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit, Zap } from "lucide-react";
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
import { format } from "date-fns";

const automationSchema = z.object({
  name: z.string().min(1, "Automation name is required"),
  channel: z.enum(["mt", "gmail", "facebook", "instagram", "whatsapp"]),
  automationType: z.enum(["auto_reply", "template", "scheduled", "routing"]),
  trigger: z.object({
    type: z.string(),
    condition: z.string().optional(),
  }),
  action: z.object({
    type: z.string(),
    message: z.string().optional(),
    templateId: z.number().optional(),
  }),
  templateId: z.number().optional(),
  isActive: z.boolean().default(true),
});

type AutomationFormData = z.infer<typeof automationSchema>;

const AUTOMATION_TYPES = [
  { value: "auto_reply", label: "Auto-Reply", description: "Automatically reply to incoming messages" },
  { value: "template", label: "Template Response", description: "Send a template-based response" },
  { value: "scheduled", label: "Scheduled Send", description: "Send messages at scheduled times" },
  { value: "routing", label: "Message Routing", description: "Route messages based on conditions" },
];

const TRIGGER_TYPES = [
  { value: "new_message", label: "New Message Received" },
  { value: "keyword", label: "Keyword Match" },
  { value: "time", label: "Time-Based" },
  { value: "sender", label: "Specific Sender" },
];

export default function Automations() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<any>(null);
  const [deletingAutomation, setDeletingAutomation] = useState<number | null>(null);

  const { data: automations, isLoading } = useQuery({
    queryKey: ["/api/messages/automations"],
  });

  const { data: templates } = useQuery({
    queryKey: ["/api/messages/templates"],
  });

  const form = useForm<AutomationFormData>({
    resolver: zodResolver(automationSchema),
    defaultValues: {
      name: "",
      channel: "mt",
      automationType: "auto_reply",
      trigger: { type: "new_message" },
      action: { type: "send_message" },
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AutomationFormData) => {
      return apiRequest("POST", "/api/messages/automations", data);
    },
    onSuccess: () => {
      toast({
        title: "Automation created",
        description: "Your automation has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/automations"] });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create automation",
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AutomationFormData> }) => {
      return apiRequest("PATCH", `/api/messages/automations/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Automation updated",
        description: "Your automation has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/automations"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update automation",
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/messages/automations/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Automation deleted",
        description: "Your automation has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/automations"] });
      setDeletingAutomation(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete automation",
        description: error.message,
      });
    },
  });

  const toggleAutomation = (id: number, isActive: boolean) => {
    updateMutation.mutate({ id, data: { isActive: !isActive } as Partial<AutomationFormData> });
  };

  const onSubmit = (data: AutomationFormData) => {
    if (editingAutomation) {
      updateMutation.mutate({ id: editingAutomation.id, data });
      setEditingAutomation(null);
      form.reset();
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (automation: any) => {
    setEditingAutomation(automation);
    form.reset({
      name: automation.name,
      channel: automation.channel,
      automationType: automation.automationType,
      trigger: automation.trigger || { type: "new_message" },
      action: automation.action || { type: "send_message" },
      templateId: automation.templateId,
      isActive: automation.isActive,
    });
  };

  const AutomationForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Automation Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Welcome Message" {...field} data-testid="input-automation-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="channel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Channel</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="select-channel">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="mt">MT Messages</SelectItem>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="automationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Automation Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="select-automation-type">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select automation type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {AUTOMATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {AUTOMATION_TYPES.find(t => t.value === field.value)?.description}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trigger.type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trigger</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="select-trigger-type">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TRIGGER_TYPES.map((trigger) => (
                    <SelectItem key={trigger.value} value={trigger.value}>
                      {trigger.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                When should this automation run?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("trigger.type") === "keyword" && (
          <FormField
            control={form.control}
            name="trigger.condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keyword</FormLabel>
                <FormControl>
                  <Input placeholder="Enter keyword to match" {...field} data-testid="input-trigger-condition" />
                </FormControl>
                <FormDescription>
                  The automation will trigger when this keyword is found in the message
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch("automationType") === "template" && (
          <FormField
            control={form.control}
            name="templateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={field.value?.toString()}
                  data-testid="select-template-id"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {templates?.map((template: any) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch("automationType") === "auto_reply" && (
          <FormField
            control={form.control}
            name="action.message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auto-Reply Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your auto-reply message..."
                    className="min-h-[100px]"
                    {...field}
                    data-testid="textarea-action-message"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Enable Automation</FormLabel>
                <FormDescription>
                  Start running this automation immediately
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="switch-isactive"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsCreateOpen(false);
              setEditingAutomation(null);
              form.reset();
            }}
            data-testid="button-cancel-automation"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            data-testid="button-save-automation"
          >
            {editingAutomation ? "Update" : "Create"} Automation
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Message Automations</h1>
          <p className="text-muted-foreground">
            Automate your messaging workflow with rules and triggers
          </p>
        </div>
        <Dialog open={isCreateOpen || !!editingAutomation} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingAutomation(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-automation">
              <Plus className="mr-2 h-4 w-4" />
              Create Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAutomation ? "Edit Automation" : "Create New Automation"}
              </DialogTitle>
            </DialogHeader>
            <AutomationForm />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading automations...</div>
        </div>
      ) : automations && automations.length > 0 ? (
        <div className="grid gap-6">
          {automations.map((automation: any) => (
            <Card key={automation.id} data-testid={`automation-card-${automation.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{automation.name}</CardTitle>
                      <Badge variant={automation.isActive ? "default" : "secondary"}>
                        {automation.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">
                        {AUTOMATION_TYPES.find(t => t.value === automation.automationType)?.label}
                      </Badge>
                    </div>
                    <CardDescription>
                      Channel: {automation.channel.toUpperCase()} • 
                      Trigger: {TRIGGER_TYPES.find(t => t.value === automation.trigger?.type)?.label}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Switch
                      checked={automation.isActive}
                      onCheckedChange={() => toggleAutomation(automation.id, automation.isActive)}
                      data-testid={`switch-toggle-${automation.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(automation)}
                      data-testid={`button-edit-${automation.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingAutomation(automation.id)}
                      data-testid={`button-delete-${automation.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Total Runs</div>
                    <div className="font-medium">{automation.runCount || 0}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Last Run</div>
                    <div className="font-medium">
                      {automation.lastRunAt
                        ? format(new Date(automation.lastRunAt), "MMM d, h:mm a")
                        : "Never"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Created</div>
                    <div className="font-medium">
                      {format(new Date(automation.createdAt), "MMM d, yyyy")}
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
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No automations yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first automation to streamline your messaging workflow
            </p>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-automation">
              <Plus className="mr-2 h-4 w-4" />
              Create Automation
            </Button>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAutomation} onOpenChange={() => setDeletingAutomation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Automation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this automation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-automation">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingAutomation && deleteMutation.mutate(deletingAutomation)}
              data-testid="button-confirm-delete-automation"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
