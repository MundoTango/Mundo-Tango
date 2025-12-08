import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThumbsUp, Plus, Loader2, Award, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Endorser {
  id: number;
  name: string;
  profileImage: string | null;
}

interface Skill {
  id: number;
  skillName: string;
  level: string | null;
  endorsementCount: number;
  endorsers: Endorser[];
}

interface SkillEndorsementsProps {
  userId: number;
  isOwnProfile: boolean;
}

const TANGO_SKILLS = [
  "Leader",
  "Follower",
  "Teacher",
  "DJ",
  "Organizer",
  "Performer",
  "Musician",
  "Choreographer"
];

const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "expert"];

export function SkillEndorsements({ userId, isOwnProfile }: SkillEndorsementsProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<string>("");
  const [customSkill, setCustomSkill] = useState(false);

  const { data: skills = [], isLoading, error } = useQuery<Skill[]>({
    queryKey: ["/api/skills", userId],
    retry: false
  });

  const addSkillMutation = useMutation({
    mutationFn: async (data: { skillName: string; level?: string }) => {
      return apiRequest("/api/skills", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills", userId] });
      setAddSkillOpen(false);
      setNewSkillName("");
      setNewSkillLevel("");
      setCustomSkill(false);
      toast({
        title: "Skill added",
        description: "Your new skill has been added to your profile"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add skill",
        variant: "destructive"
      });
    }
  });

  const endorseSkillMutation = useMutation({
    mutationFn: async (skillId: number) => {
      return apiRequest(`/api/skills/${skillId}/endorse`, {
        method: "POST"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills", userId] });
      toast({
        title: "Skill endorsed",
        description: "Your endorsement has been added"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to endorse skill",
        variant: "destructive"
      });
    }
  });

  const removeEndorsementMutation = useMutation({
    mutationFn: async (skillId: number) => {
      return apiRequest(`/api/skills/${skillId}/endorse`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills", userId] });
      toast({
        title: "Endorsement removed",
        description: "Your endorsement has been removed"
      });
    }
  });

  const deleteSkillMutation = useMutation({
    mutationFn: async (skillId: number) => {
      return apiRequest(`/api/skills/${skillId}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills", userId] });
      toast({
        title: "Skill removed",
        description: "The skill has been removed from your profile"
      });
    }
  });

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    addSkillMutation.mutate({
      skillName: newSkillName.trim(),
      level: newSkillLevel || undefined
    });
  };

  const hasUserEndorsed = (skill: Skill) => {
    return currentUser && skill.endorsers.some(e => e.id === currentUser.id);
  };

  const handleEndorseToggle = (skill: Skill) => {
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "Please sign in to endorse skills",
        variant: "destructive"
      });
      return;
    }

    if (hasUserEndorsed(skill)) {
      removeEndorsementMutation.mutate(skill.id);
    } else {
      endorseSkillMutation.mutate(skill.id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Skills & Endorsements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Skills & Endorsements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Skills feature coming soon</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-skill-endorsements">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Skills & Endorsements
          </CardTitle>
          <CardDescription>
            {isOwnProfile 
              ? "Showcase your tango skills and get endorsed by the community"
              : "Endorse skills to validate their tango expertise"}
          </CardDescription>
        </div>
        {isOwnProfile && (
          <Dialog open={addSkillOpen} onOpenChange={setAddSkillOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-skill">
                <Plus className="h-4 w-4 mr-1" />
                Add Skill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a Skill</DialogTitle>
                <DialogDescription>
                  Add a tango skill to your profile that others can endorse
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {!customSkill ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select a skill</label>
                    <Select
                      value={newSkillName}
                      onValueChange={(val) => {
                        if (val === "__custom__") {
                          setCustomSkill(true);
                          setNewSkillName("");
                        } else {
                          setNewSkillName(val);
                        }
                      }}
                    >
                      <SelectTrigger data-testid="select-skill-name">
                        <SelectValue placeholder="Choose a skill..." />
                      </SelectTrigger>
                      <SelectContent>
                        {TANGO_SKILLS.filter(
                          skill => !skills.some(s => s.skillName === skill)
                        ).map((skill) => (
                          <SelectItem key={skill} value={skill}>
                            {skill}
                          </SelectItem>
                        ))}
                        <SelectItem value="__custom__">+ Custom skill...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Custom skill name</label>
                    <Input
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="e.g., Vals, Milonga, Salon style..."
                      data-testid="input-custom-skill"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCustomSkill(false);
                        setNewSkillName("");
                      }}
                    >
                      Back to list
                    </Button>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Level (optional)</label>
                  <Select value={newSkillLevel} onValueChange={setNewSkillLevel}>
                    <SelectTrigger data-testid="select-skill-level">
                      <SelectValue placeholder="Select level..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILL_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAddSkillOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSkill}
                  disabled={!newSkillName.trim() || addSkillMutation.isPending}
                  data-testid="button-confirm-add-skill"
                >
                  {addSkillMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Add Skill
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {skills.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {isOwnProfile 
                ? "Add your first skill to get endorsed"
                : "No skills added yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {skills.map((skill) => {
              const endorsed = hasUserEndorsed(skill);
              return (
                <div
                  key={skill.id}
                  className="flex items-center justify-between gap-4 p-4 border rounded-lg hover-elevate"
                  data-testid={`skill-item-${skill.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium" data-testid={`text-skill-name-${skill.id}`}>
                        {skill.skillName}
                      </span>
                      {skill.level && (
                        <Badge variant="secondary" className="capitalize text-xs">
                          {skill.level}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {skill.endorsementCount}
                      </Badge>
                    </div>
                    {skill.endorsers.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">Endorsed by:</span>
                        <div className="flex -space-x-2">
                          {skill.endorsers.slice(0, 5).map((endorser) => (
                            <Tooltip key={endorser.id}>
                              <TooltipTrigger asChild>
                                <Avatar
                                  className="h-6 w-6 border-2 border-background"
                                  data-testid={`avatar-endorser-${endorser.id}`}
                                >
                                  <AvatarImage src={endorser.profileImage || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {endorser.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{endorser.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                          {skill.endorsementCount > 5 && (
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                              +{skill.endorsementCount - 5}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isOwnProfile && currentUser && (
                      <Button
                        size="sm"
                        variant={endorsed ? "secondary" : "default"}
                        onClick={() => handleEndorseToggle(skill)}
                        disabled={endorseSkillMutation.isPending || removeEndorsementMutation.isPending}
                        data-testid={`button-endorse-${skill.id}`}
                      >
                        <ThumbsUp className={`h-4 w-4 mr-1 ${endorsed ? "fill-current" : ""}`} />
                        {endorsed ? "Endorsed" : "Endorse"}
                      </Button>
                    )}
                    {isOwnProfile && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSkillMutation.mutate(skill.id)}
                        disabled={deleteSkillMutation.isPending}
                        data-testid={`button-delete-skill-${skill.id}`}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
