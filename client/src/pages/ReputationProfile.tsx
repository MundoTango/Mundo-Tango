import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TangoResume } from "@/components/reputation/TangoResume";
import { EndorsementCard } from "@/components/reputation/EndorsementCard";
import { CreateEndorsementDialog } from "@/components/reputation/CreateEndorsementDialog";
import { Award, Filter, Plus, TrendingUp, Users, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

export default function ReputationProfile() {
  const { userId: userIdParam } = useParams();
  const userId = parseInt(userIdParam || "0");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  // Fetch resume data
  const { data: resume, isLoading: resumeLoading } = useQuery({
    queryKey: ["/api/reputation/resume", userId],
    enabled: !!userId && userId > 0,
  });

  // Fetch endorsements
  const { data: endorsements, isLoading: endorsementsLoading } = useQuery({
    queryKey: selectedRole === "all" 
      ? ["/api/endorsements", userId] 
      : ["/api/endorsements", userId, selectedRole],
    queryFn: async () => {
      const url =
        selectedRole === "all"
          ? `/api/endorsements/${userId}`
          : `/api/endorsements/${userId}?role=${selectedRole}`;
      return apiRequest(url);
    },
    enabled: !!userId && userId > 0,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["/api/reputation/stats", userId],
    enabled: !!userId && userId > 0,
  });

  // Delete endorsement mutation
  const deleteEndorsementMutation = useMutation({
    mutationFn: async (endorsementId: number) => {
      return apiRequest(`/api/endorsements/${endorsementId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/endorsements", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/reputation/resume", userId] });
      toast({
        title: "Endorsement Deleted",
        description: "The endorsement has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete endorsement.",
        variant: "destructive",
      });
    },
  });

  // Sort endorsements
  const sortedEndorsements = endorsements
    ? [...endorsements].sort((a: any, b: any) => {
        if (sortBy === "date") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === "rating") {
          return (b.rating || 0) - (a.rating || 0);
        }
        return 0;
      })
    : [];

  if (!userId || userId === 0) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Invalid user ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resumeLoading || endorsementsLoading) {
    return (
      <div className="container space-y-6 py-8">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const verificationRate = stats
    ? Math.round((stats.verifiedEndorsements / stats.totalEndorsements) * 100) || 0
    : 0;

  return (
    <div className="container space-y-6 py-8" data-testid="reputation-profile-page">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Endorsements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total">
              {stats?.totalEndorsements || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-rating">
              {stats?.averageRating?.toFixed(1) || "0.0"}/5
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Endorsers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-endorsers">
              {stats?.uniqueEndorsers || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-verification">
              {verificationRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="resume" className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <TabsList>
            <TabsTrigger value="resume" data-testid="tab-resume">
              Tango Résumé
            </TabsTrigger>
            <TabsTrigger value="endorsements" data-testid="tab-endorsements">
              Endorsements ({endorsements?.length || 0})
            </TabsTrigger>
          </TabsList>

          <Button onClick={() => setShowCreateDialog(true)} data-testid="button-endorse">
            <Plus className="mr-2 h-4 w-4" />
            Endorse This User
          </Button>
        </div>

        <TabsContent value="resume" className="space-y-6">
          {resume ? (
            <TangoResume resume={resume} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">No reputation data available yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="endorsements" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter & Sort Endorsements
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger data-testid="filter-role">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="dj">DJ</SelectItem>
                    <SelectItem value="organizer">Organizer</SelectItem>
                    <SelectItem value="performer">Performer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger data-testid="sort-by">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Most Recent</SelectItem>
                    <SelectItem value="rating">Highest Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Endorsements List */}
          <div className="space-y-4">
            {sortedEndorsements && sortedEndorsements.length > 0 ? (
              sortedEndorsements.map((endorsement: any) => (
                <EndorsementCard
                  key={endorsement.id}
                  endorsement={endorsement}
                  canDelete={false} // TODO: Check if current user is the endorser
                  onDelete={(id) => deleteEndorsementMutation.mutate(id)}
                />
              ))
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <p className="text-lg font-medium">No endorsements yet</p>
                    <p className="text-sm text-muted-foreground">
                      Be the first to endorse this user!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <CreateEndorsementDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        endorseeId={userId}
        endorseeName="User" // TODO: Get actual name from user data
      />
    </div>
  );
}
