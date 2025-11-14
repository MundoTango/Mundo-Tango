import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
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
import { Card } from "@/components/ui/card";
import { MessageCircle, Mail, Send, Clock, X } from "lucide-react";
import { SiFacebook, SiInstagram, SiWhatsapp } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, queryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

const composeSchema = z.object({
  channel: z.enum(["mt", "gmail", "facebook", "instagram", "whatsapp"]),
  to: z.string().min(1, "Recipient is required"),
  subject: z.string().optional(),
  body: z.string().min(1, "Message body is required"),
  templateId: z.number().optional(),
  scheduledFor: z.date().optional(),
});

type ComposeFormData = z.infer<typeof composeSchema>;

const channelIcons = {
  mt: MessageCircle,
  gmail: Mail,
  facebook: SiFacebook,
  instagram: SiInstagram,
  whatsapp: SiWhatsapp,
};

const channelLabels = {
  mt: "MT Messages",
  gmail: "Gmail",
  facebook: "Facebook",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
};

interface ComposeMessageProps {
  onClose?: () => void;
  defaultChannel?: "mt" | "gmail" | "facebook" | "instagram" | "whatsapp";
}

export function ComposeMessage({ onClose, defaultChannel = "mt" }: ComposeMessageProps) {
  const { toast } = useToast();
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [showScheduler, setShowScheduler] = useState(false);

  const form = useForm<ComposeFormData>({
    resolver: zodResolver(composeSchema),
    defaultValues: {
      channel: defaultChannel,
      to: "",
      subject: "",
      body: "",
    },
  });

  const { data: templates } = useQuery({
    queryKey: ["/api/messages/templates"],
  });

  const sendMutation = useMutation({
    mutationFn: async (data: ComposeFormData) => {
      if (data.scheduledFor) {
        return apiRequest("POST", "/api/messages/schedule", data);
      }
      return apiRequest("POST", "/api/messages/send", data);
    },
    onSuccess: () => {
      toast({
        title: scheduleDate ? "Message scheduled" : "Message sent",
        description: scheduleDate 
          ? `Your message will be sent on ${format(scheduleDate, "PPP 'at' p")}`
          : "Your message has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unified"] });
      form.reset();
      onClose?.();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: ComposeFormData) => {
    if (scheduleDate) {
      data.scheduledFor = scheduleDate;
    }
    sendMutation.mutate(data);
  };

  const insertTemplate = (templateId: number) => {
    const template = templates?.find((t: any) => t.id === templateId);
    if (template) {
      form.setValue("subject", template.subject || "");
      form.setValue("body", template.body);
      toast({
        title: "Template inserted",
        description: `Template "${template.name}" has been inserted.`,
      });
    }
  };

  const ChannelIcon = channelIcons[form.watch("channel")];

  return (
    <Card className="p-6" data-testid="compose-message-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Compose Message</h2>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="button-close-compose"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="channel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Channel</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  data-testid="select-channel"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(channelLabels).map(([value, label]) => {
                      const Icon = channelIcons[value as keyof typeof channelIcons];
                      return (
                        <SelectItem key={value} value={value} data-testid={`option-channel-${value}`}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {templates && templates.length > 0 && (
            <div>
              <FormLabel>Insert Template</FormLabel>
              <Select onValueChange={(value) => insertTemplate(Number(value))} data-testid="select-template">
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template: any) => (
                    <SelectItem key={template.id} value={String(template.id)} data-testid={`option-template-${template.id}`}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <FormField
            control={form.control}
            name="to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Recipient email or username"
                    {...field}
                    data-testid="input-to"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {["gmail", "mt"].includes(form.watch("channel")) && (
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Message subject"
                      {...field}
                      data-testid="input-subject"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your message..."
                    className="min-h-[200px]"
                    {...field}
                    data-testid="textarea-body"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowScheduler(!showScheduler)}
              data-testid="button-schedule"
            >
              <Clock className="mr-2 h-4 w-4" />
              {scheduleDate ? format(scheduleDate, "PPP") : "Schedule for later"}
            </Button>

            {showScheduler && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" data-testid="button-open-calendar">
                    Select date & time
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduleDate}
                    onSelect={setScheduleDate}
                    initialFocus
                    data-testid="calendar-schedule"
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="flex gap-4 justify-end">
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={sendMutation.isPending}
              data-testid="button-send"
            >
              {sendMutation.isPending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {scheduleDate ? "Schedule" : "Send"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
