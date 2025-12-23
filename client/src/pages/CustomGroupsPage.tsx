import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, Plus, Lock, Globe, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CustomGroupsPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    type: "custom",
    visibility: "public",
    joinApproval: true
  });
  const { toast } = useToast();

  const { data: groups, isLoading } = useQuery<any[]>({
    queryKey: ["/api/groups", { type: "custom", search: searchQuery }],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/groups", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: t('pages:customGroups.groupCreatedSuccess', 'Group created successfully!') });
      setIsCreateDialogOpen(false);
      setNewGroup({ name: "", description: "", type: "custom", visibility: "public", joinApproval: true });
    },
    onError: () => {
      toast({ title: t('pages:customGroups.failedToCreateGroup', 'Failed to create group'), variant: "destructive" });
    },
  });

  const joinMutation = useMutation({
    mutationFn: (groupId: number) => apiRequest(`/api/groups/${groupId}/join`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: t('pages:customGroups.joinedSuccess', 'Joined group successfully!') });
    },
  });

  const handleCreate = () => {
    if (!newGroup.name || !newGroup.description) {
      toast({ title: t('pages:customGroups.fillRequiredFields', 'Please fill in all required fields'), variant: "destructive" });
      return;
    }
    createMutation.mutate(newGroup);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-custom-groups">{t('pages:customGroups.title', 'Custom Groups')}</h1>
            <p className="text-muted-foreground">{t('pages:customGroups.subtitle', 'Create and join interest-based tango communities')}</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-group">
                <Plus className="h-4 w-4 mr-2" />
                {t('pages:customGroups.createGroup', 'Create Group')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('pages:customGroups.createCustomGroup', 'Create Custom Group')}</DialogTitle>
                <DialogDescription>
                  {t('pages:customGroups.createDescription', 'Create a community for your specific interests')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('pages:customGroups.groupName', 'Group Name')}</Label>
                  <Input
                    id="name"
                    placeholder={t('pages:customGroups.groupNamePlaceholder', 'e.g., Tango Music Lovers')}
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    data-testid="input-group-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t('pages:customGroups.description', 'Description')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('pages:customGroups.descriptionPlaceholder', 'Describe your group...')}
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    data-testid="input-group-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visibility">{t('pages:customGroups.privacy', 'Privacy')}</Label>
                  <Select
                    value={newGroup.visibility}
                    onValueChange={(value) => setNewGroup({ ...newGroup, visibility: value })}
                  >
                    <SelectTrigger data-testid="select-visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          {t('pages:customGroups.public', 'Public - Anyone can find and join')}
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          {t('pages:customGroups.private', 'Private - Invite only')}
                        </div>
                      </SelectItem>
                      <SelectItem value="secret">
                        <div className="flex items-center gap-2">
                          <EyeOff className="h-4 w-4" />
                          {t('pages:customGroups.secret', 'Secret - Hidden from search')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  data-testid="button-submit-group"
                >
                  {t('pages:customGroups.createGroup', 'Create Group')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('pages:customGroups.searchPlaceholder', 'Search custom groups...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-groups"
          />
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-6 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : groups && groups.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((item: any) => {
              const group = item.group;
              const memberCount = item.memberCount || group.memberCount || 0;
              
              return (
                <Card key={group.id} className="hover-elevate" data-testid={`card-group-${group.id}`}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={group.imageUrl} />
                        <AvatarFallback>{group.name?.charAt(0) || "G"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          <Link href={`/groups/${group.id}`} className="hover:underline">
                            {group.name}
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          {group.visibility === "private" && <Lock className="h-3 w-3 inline mr-1" />}
                          {group.visibility === "secret" && <EyeOff className="h-3 w-3 inline mr-1" />}
                          {group.visibility}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {group.description || t('pages:customGroups.noDescription', 'No description available')}
                    </p>
                    <div className="mt-4">
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {t('pages:customGroups.members', '{{count}} members', { count: memberCount })}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => joinMutation.mutate(group.id)}
                      disabled={joinMutation.isPending}
                      data-testid={`button-join-${group.id}`}
                    >
                      {t('pages:customGroups.joinGroup', 'Join Group')}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('pages:customGroups.noGroupsFound', 'No groups found')}</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? t('pages:customGroups.tryDifferentSearch', 'Try a different search') : t('pages:customGroups.beFirstToCreate', 'Be the first to create a custom group')}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('pages:customGroups.createGroup', 'Create Group')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
