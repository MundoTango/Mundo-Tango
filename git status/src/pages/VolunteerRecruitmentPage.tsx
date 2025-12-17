import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trophy, Target, Clock, Users, TrendingUp, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface TestScenario {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimatedMinutes: number;
  steps: any[];
  isActive: boolean;
}

interface VolunteerStats {
  id: number;
  userId: number;
  totalSessions: number;
  completedSessions: number;
  bugsFound: number;
  averageDifficultyRating: number | null;
  skillLevel: string;
  lastSessionAt: Date | null;
}

export default function VolunteerRecruitmentPage() {
  const { toast } = useToast();

  const { data: scenarios = [], isLoading: scenariosLoading } = useQuery<TestScenario[]>({
    queryKey: ["/api/volunteer/scenarios"],
  });

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery<VolunteerStats[]>({
    queryKey: ["/api/volunteer/leaderboard"],
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/volunteer/register", {});
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You're now registered as a volunteer tester",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/volunteer/leaderboard"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to register",
        variant: "destructive",
      });
    },
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "hard":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "advanced":
        return "text-purple-600 dark:text-purple-400";
      case "intermediate":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const stats = {
    totalVolunteers: leaderboard.length,
    activeScenarios: scenarios.filter((s) => s.isActive).length,
    bugsFoundThisWeek: leaderboard.reduce((sum, v) => sum + v.bugsFound, 0),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" data-testid="text-page-title">
            Volunteer Testing Program
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Help us improve Mundo Tango by testing new features and reporting issues. 
            Earn recognition and help build a better platform for the tango community.
          </p>
          <div className="mt-6">
            <Button
              size="lg"
              onClick={() => registerMutation.mutate()}
              disabled={registerMutation.isPending}
              data-testid="button-register-volunteer"
            >
              <Users className="mr-2 h-5 w-5" />
              {registerMutation.isPending ? "Registering..." : "Become a Volunteer"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card data-testid="card-stat-volunteers">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-volunteers">
                {stats.totalVolunteers}
              </div>
              <p className="text-xs text-muted-foreground">Active testers</p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-scenarios">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Scenarios</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-active-scenarios">
                {stats.activeScenarios}
              </div>
              <p className="text-xs text-muted-foreground">Available tests</p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-bugs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bugs Found</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-bugs-found">
                {stats.bugsFoundThisWeek}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card data-testid="card-scenarios-list">
              <CardHeader>
                <CardTitle>Available Test Scenarios</CardTitle>
                <CardDescription>
                  Choose a scenario to start testing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scenariosLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading scenarios...</div>
                ) : scenarios.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No scenarios available yet</div>
                ) : (
                  <div className="space-y-4">
                    {scenarios.map((scenario) => (
                      <Card key={scenario.id} className="hover-elevate" data-testid={`card-scenario-${scenario.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <CardTitle className="text-lg" data-testid={`text-scenario-title-${scenario.id}`}>
                                {scenario.title}
                              </CardTitle>
                              <CardDescription className="mt-2">
                                {scenario.description}
                              </CardDescription>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Badge className={getDifficultyColor(scenario.difficulty)} data-testid={`badge-difficulty-${scenario.id}`}>
                                {scenario.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span data-testid={`text-estimated-minutes-${scenario.id}`}>
                                  {scenario.estimatedMinutes} min
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                <span>{scenario.steps?.length || 0} steps</span>
                              </div>
                            </div>
                            <Link href={`/volunteer-testing/${scenario.id}`}>
                              <Button data-testid={`button-start-test-${scenario.id}`}>
                                Start Testing
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card data-testid="card-leaderboard">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Leaderboard
                </CardTitle>
                <CardDescription>Top volunteer testers</CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboardLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading leaderboard...</div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No volunteers yet</div>
                ) : (
                  <div className="space-y-4">
                    {leaderboard.slice(0, 10).map((volunteer, index) => (
                      <div
                        key={volunteer.id}
                        className="flex items-center justify-between"
                        data-testid={`row-leaderboard-${index}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium" data-testid={`text-volunteer-name-${index}`}>
                              Volunteer #{volunteer.userId}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span>{volunteer.completedSessions} sessions</span>
                              <Separator orientation="vertical" className="h-3" />
                              <span className={getSkillLevelColor(volunteer.skillLevel)}>
                                {volunteer.skillLevel}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" data-testid={`badge-bugs-${index}`}>
                            {volunteer.bugsFound} bugs
                          </Badge>
                          {volunteer.averageDifficultyRating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              <span className="text-sm">{volunteer.averageDifficultyRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
