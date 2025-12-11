/**
 * MB.MD v9.9.4 - Volunteer Testing Dashboard
 * Comprehensive dashboard for volunteer testers with scenarios, progress, and leaderboard
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, Clock, Bug, CheckCircle2, Play, Target, 
  Zap, Award, Users, TrendingUp, Star
} from "lucide-react";
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
  totalSessionsCompleted: number;
  totalMinutesTested: number;
  bugsFound: number;
  averageCompletionRate: number;
  skillLevel: string;
}

interface DomainSummary {
  name: string;
  priority: string;
  scenarioCount: number;
  scenarios: { title: string; difficulty: string; estimatedMinutes: number }[];
}

export default function VolunteerDashboard() {
  const { toast } = useToast();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const { data: scenarios = [], isLoading: scenariosLoading } = useQuery<TestScenario[]>({
    queryKey: ["/api/volunteer/scenarios"],
  });

  const { data: leaderboard = [] } = useQuery<VolunteerStats[]>({
    queryKey: ["/api/volunteer/leaderboard"],
  });

  const { data: domains = [] } = useQuery<DomainSummary[]>({
    queryKey: ["/api/scenarios/domains"],
  });

  const { data: coverage } = useQuery({
    queryKey: ["/api/scenarios/coverage"],
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/volunteer/register");
    },
    onSuccess: () => {
      toast({ title: "Registered!", description: "You are now a volunteer tester" });
      queryClient.invalidateQueries({ queryKey: ["/api/volunteer"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Registration failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const filteredScenarios = scenarios.filter(s => 
    selectedDifficulty === "all" || s.difficulty === selectedDifficulty
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "hard": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "";
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority.includes("CRITICAL")) return "bg-red-500/10 text-red-600";
    if (priority.includes("HIGH")) return "bg-orange-500/10 text-orange-600";
    if (priority.includes("MEDIUM")) return "bg-blue-500/10 text-blue-600";
    return "bg-gray-500/10 text-gray-600";
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            Volunteer Testing Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Help improve Mundo Tango by testing features and reporting issues
          </p>
        </div>
        <Button 
          onClick={() => registerMutation.mutate()}
          disabled={registerMutation.isPending}
          data-testid="button-register-volunteer"
        >
          <Zap className="h-4 w-4 mr-2" />
          Register as Tester
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-total-scenarios">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{scenarios.length}</p>
                <p className="text-sm text-muted-foreground">Test Scenarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-total-domains">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{domains.length || 14}</p>
                <p className="text-sm text-muted-foreground">Feature Domains</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-volunteers">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{leaderboard.length}</p>
                <p className="text-sm text-muted-foreground">Active Testers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-estimated-time">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/10">
                <Clock className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {coverage?.estimatedTotalMinutes || scenarios.reduce((s, sc) => s + (sc.estimatedMinutes || 0), 0)} min
                </p>
                <p className="text-sm text-muted-foreground">Total Test Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="scenarios" className="space-y-6">
        <TabsList data-testid="tabs-dashboard">
          <TabsTrigger value="scenarios" data-testid="tab-scenarios">
            <Play className="h-4 w-4 mr-2" />
            Test Scenarios
          </TabsTrigger>
          <TabsTrigger value="domains" data-testid="tab-domains">
            <Target className="h-4 w-4 mr-2" />
            Feature Domains
          </TabsTrigger>
          <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          {/* Difficulty Filter */}
          <div className="flex gap-2">
            {["all", "easy", "medium", "hard"].map((diff) => (
              <Button
                key={diff}
                variant={selectedDifficulty === diff ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDifficulty(diff)}
                data-testid={`button-filter-${diff}`}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </Button>
            ))}
          </div>

          {/* Scenario Grid */}
          {scenariosLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredScenarios.map((scenario) => (
                <Card 
                  key={scenario.id} 
                  className="hover-elevate"
                  data-testid={`card-scenario-${scenario.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">
                        {scenario.title}
                      </CardTitle>
                      <Badge className={getDifficultyColor(scenario.difficulty)}>
                        {scenario.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {scenario.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {scenario.estimatedMinutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        {scenario.steps?.length || 0} steps
                      </span>
                    </div>
                    <Link href={`/volunteer-testing/${scenario.id}`}>
                      <Button className="w-full" data-testid={`button-start-scenario-${scenario.id}`}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Test
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredScenarios.length === 0 && !scenariosLoading && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No scenarios found for this difficulty level
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Domains Tab */}
        <TabsContent value="domains" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(domains.length > 0 ? domains : [
              { name: "Events Management", priority: "P0-CRITICAL", scenarioCount: 4 },
              { name: "Financial Management", priority: "P0-CRITICAL", scenarioCount: 3 },
              { name: "Travel Planning", priority: "P0-CRITICAL", scenarioCount: 3 },
              { name: "Social Features", priority: "P1-HIGH", scenarioCount: 3 },
              { name: "Profile Management", priority: "P1-HIGH", scenarioCount: 2 },
              { name: "Gamification System", priority: "P1-HIGH", scenarioCount: 2 },
              { name: "Life CEO AI", priority: "P1-HIGH", scenarioCount: 2 },
              { name: "Admin Dashboard", priority: "P1-HIGH", scenarioCount: 2 },
              { name: "Groups & Communities", priority: "P2-MEDIUM", scenarioCount: 2 },
              { name: "Messaging System", priority: "P2-MEDIUM", scenarioCount: 2 },
              { name: "Marketplace", priority: "P2-MEDIUM", scenarioCount: 2 },
              { name: "Mr. Blue AI Assistant", priority: "P2-MEDIUM", scenarioCount: 2 },
              { name: "Memories System", priority: "P1-HIGH", scenarioCount: 1 },
              { name: "God-Level Content", priority: "P1-HIGH", scenarioCount: 1 },
            ]).map((domain, idx) => (
              <Card key={idx} data-testid={`card-domain-${idx}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{domain.name}</CardTitle>
                    <Badge className={getPriorityColor(domain.priority)}>
                      {domain.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {domain.scenarioCount} scenarios
                    </span>
                    <Progress 
                      value={0} 
                      className="w-24 h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Volunteer Testers
              </CardTitle>
              <CardDescription>
                Recognizing our most active community testers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No volunteers yet. Be the first to register!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map((volunteer, idx) => (
                    <div 
                      key={volunteer.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                      data-testid={`row-leaderboard-${idx}`}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 font-bold">
                        {idx === 0 ? <Trophy className="h-5 w-5 text-yellow-500" /> : idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Volunteer #{volunteer.userId}</p>
                        <p className="text-sm text-muted-foreground">
                          {volunteer.totalSessionsCompleted} sessions completed
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {volunteer.skillLevel || "beginner"}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Bug className="h-4 w-4" />
                          {volunteer.bugsFound} bugs
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
