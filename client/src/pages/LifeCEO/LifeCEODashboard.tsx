/**
 * LIFE CEO DASHBOARD (P65)
 * Main dashboard showing all 16 agents + current goals/tasks
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Heart,
  Wallet,
  Users,
  Briefcase,
  GraduationCap,
  Home,
  Plane,
  Trophy,
  Calendar,
  BookOpen,
  Dumbbell,
  Music,
  Lightbulb,
  Target,
  CheckCircle2,
} from "lucide-react";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";

const agents = [
  { id: "A1", name: "Goals.Agent", icon: Target, description: "Goal setting & tracking", route: "/life-ceo/goals" },
  { id: "A2", name: "Health.Agent", icon: Heart, description: "Health & wellness", route: "/life-ceo/health" },
  { id: "A3", name: "Finance.Agent", icon: Wallet, description: "Financial planning", route: "/life-ceo/finance" },
  { id: "A4", name: "Social.Agent", icon: Users, description: "Relationships & connections", route: "/life-ceo/social" },
  { id: "A5", name: "Career.Agent", icon: Briefcase, description: "Career development", route: "/life-ceo/career" },
  { id: "A6", name: "Learning.Agent", icon: GraduationCap, description: "Skills & education", route: "/life-ceo/learning" },
  { id: "A7", name: "Housing.Agent", icon: Home, description: "Housing management", route: "/life-ceo/housing" },
  { id: "A8", name: "Travel.Agent", icon: Plane, description: "Trip planning", route: "/life-ceo/travel" },
  { id: "A9", name: "Achievement.Agent", icon: Trophy, description: "Milestones & rewards", route: "/life-ceo/achievements" },
  { id: "A10", name: "Calendar.Agent", icon: Calendar, description: "Schedule optimization", route: "/life-ceo/calendar" },
  { id: "A11", name: "Knowledge.Agent", icon: BookOpen, description: "Personal knowledge base", route: "/life-ceo/knowledge" },
  { id: "A12", name: "Fitness.Agent", icon: Dumbbell, description: "Exercise & activity", route: "/life-ceo/fitness" },
  { id: "A13", name: "Creative.Agent", icon: Music, description: "Creative projects", route: "/life-ceo/creative" },
  { id: "A14", name: "Mindfulness.Agent", icon: Brain, description: "Mental wellness", route: "/life-ceo/mindfulness" },
  { id: "A15", name: "Innovation.Agent", icon: Lightbulb, description: "Ideas & innovation", route: "/life-ceo/innovation" },
  { id: "A16", name: "Impact.Agent", icon: CheckCircle2, description: "Purpose & contribution", route: "/life-ceo/impact" },
];

interface Goal {
  id: number;
  title: string;
  description: string;
  progress: number;
  targetDate: string;
}

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export default function LifeCEODashboard() {
  const { data: goals = [] } = useQuery<Goal[]>({ queryKey: ["/api/life-ceo/goals"] });
  const { data: tasks = [] } = useQuery<Task[]>({ queryKey: ["/api/life-ceo/tasks"] });

  return (
    <SelfHealingErrorBoundary pageName="LifeCEODashboard" fallbackRoute="/feed">
      <SEO 
        title="Life CEO Dashboard"
        description="Manage all aspects of your life with 16 intelligent agents for health, finance, career, relationships, and personal growth"
        ogImage="/og-image.png"
      />
      <PageLayout title="Life CEO" showBreadcrumbs>
        <div className="container mx-auto py-8 px-4">
      

      {/* Active Goals */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Active Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.slice(0, 4).map((goal) => (
            <Card key={goal.id}>
              <CardHeader>
                <CardTitle>{goal.title}</CardTitle>
                <CardDescription>{goal.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} />
                  <div className="text-xs text-muted-foreground">
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 16 Life CEO Agents */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your AI Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent) => (
            <Link key={agent.id} href={agent.route}>
              <Card className="cursor-pointer hover-elevate active-elevate-2 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <agent.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{agent.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Upcoming Tasks</h2>
          <Link href="/life-ceo/tasks">
            <Button variant="ghost">View All</Button>
          </Link>
        </div>
        <div className="space-y-2">
          {tasks.slice(0, 5).map((task: any) => (
            <Card key={task.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">{task.domain}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
