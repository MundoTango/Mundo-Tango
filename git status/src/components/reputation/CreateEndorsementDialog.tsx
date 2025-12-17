import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface CreateEndorsementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  endorseeId: number;
  endorseeName: string;
}

const ROLE_SKILLS: Record<string, string[]> = {
  teacher: ["musicality", "technique", "pedagogy", "communication", "patience"],
  dj: ["music_selection", "reading_the_room", "technical_skills", "creativity", "energy"],
  organizer: ["event_planning", "logistics", "communication", "networking", "attention_to_detail"],
  performer: ["stage_presence", "musicality", "technique", "creativity", "expression"],
};

export function CreateEndorsementDialog({
  open,
  onOpenChange,
  endorseeId,
  endorseeName,
}: CreateEndorsementDialogProps) {
  const [role, setRole] = useState<string>("");
  const [skill, setSkill] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const { toast } = useToast();

  const createEndorsementMutation = useMutation({
    mutationFn: async (data: {
      endorseeId: number;
      tangoRole: string;
      skillType?: string;
      rating: number;
      comment?: string;
    }) => {
      return apiRequest(`/api/endorsements`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/endorsements", endorseeId] });
      queryClient.invalidateQueries({ queryKey: ["/api/reputation/resume", endorseeId] });
      toast({
        title: "Endorsement Created",
        description: "Your endorsement has been submitted successfully!",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create endorsement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setRole("");
    setSkill("");
    setRating(5);
    setComment("");
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!role) {
      toast({
        title: "Missing Information",
        description: "Please select a role to endorse",
        variant: "destructive",
      });
      return;
    }

    createEndorsementMutation.mutate({
      endorseeId,
      tangoRole: role,
      skillType: skill || undefined,
      rating,
      comment: comment || undefined,
    });
  };

  const availableSkills = role ? ROLE_SKILLS[role] || [] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]" data-testid="create-endorsement-dialog">
        <DialogHeader>
          <DialogTitle>Endorse {endorseeName}</DialogTitle>
          <DialogDescription>
            Share your experience working with {endorseeName} as a tango professional
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Tango Role *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role" data-testid="select-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="dj">DJ</SelectItem>
                <SelectItem value="organizer">Organizer</SelectItem>
                <SelectItem value="performer">Performer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role && (
            <div className="space-y-2">
              <Label htmlFor="skill">Specific Skill (Optional)</Label>
              <Select value={skill} onValueChange={setSkill}>
                <SelectTrigger id="skill" data-testid="select-skill">
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent>
                  {availableSkills.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-2" data-testid="rating-selector">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="transition-transform hover:scale-110"
                  data-testid={`star-${value}`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      value <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 flex items-center text-sm font-medium">
                {rating}/5
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={4}
              data-testid="input-comment"
            />
            <p className="text-xs text-muted-foreground">
              {comment.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createEndorsementMutation.isPending}
            data-testid="button-submit"
          >
            {createEndorsementMutation.isPending ? "Submitting..." : "Submit Endorsement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
