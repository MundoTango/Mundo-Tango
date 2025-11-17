import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Sparkles,
  Code,
  Users,
  Zap,
  ListChecks
} from 'lucide-react';
import { PlanProgressTracker } from './PlanProgressTracker';
import { useQuery } from '@tanstack/react-query';

/**
 * THE PLAN VIEW - Roadmap visualization
 * 
 * Shows the MB.MD build plan progress:
 * - Week 1-8: Build Mr Blue (8 systems) - COMPLETE
 * - Week 9-12: Mr Blue builds Mundo Tango autonomously
 * 
 * Data source: MB_MD_FINAL_PLAN.md
 */

interface PlanPhase {
  week: string;
  title: string;
  status: 'complete' | 'in-progress' | 'pending';
  features: number;
  progress: number;
  description: string;
}

const PLAN_PHASES: PlanPhase[] = [
  {
    week: 'Week 1-8',
    title: 'Build Mr Blue AI Partner',
    status: 'complete',
    features: 8,
    progress: 100,
    description: '8 integrated systems: Video Calls, Chat, Vibe Code, Voice Cloning, Messenger, Memory, 3D Creator, AI Video'
  },
  {
    week: 'Week 9',
    title: 'Social Features',
    status: 'in-progress',
    features: 186,
    progress: 80,
    description: 'Posts, Friends, Groups, Messages, Feed with AI recommendations'
  },
  {
    week: 'Week 10',
    title: 'AI Infrastructure',
    status: 'pending',
    features: 60,
    progress: 0,
    description: 'Multi-AI orchestration, autonomous coding, quality validation'
  },
  {
    week: 'Week 11',
    title: 'Platform Infrastructure',
    status: 'pending',
    features: 310,
    progress: 0,
    description: 'Events, Housing, Travel, Marketplace, Premium features'
  },
  {
    week: 'Week 12',
    title: 'Polish & Launch',
    status: 'pending',
    features: 371,
    progress: 0,
    description: 'Testing, optimization, deployment, marketing site'
  }
];

const CURRENT_TASKS = [
  { title: 'AI Services Consolidation', status: 'in-progress', progress: 80 },
  { title: 'Unified Mr Blue Interface', status: 'in-progress', progress: 60 },
  { title: '3D Creator + AI Video Deploy', status: 'pending', progress: 0 },
];

interface RoadmapStats {
  total: number;
  validated: number;
  inProgress: number;
  pending: number;
  issuesFound: number;
  percentComplete: number;
}

export function ThePlanView() {
  const userId = 1; // TODO: Get from auth context
  const totalFeatures = PLAN_PHASES.reduce((sum, phase) => sum + phase.features, 0);
  const completedFeatures = PLAN_PHASES
    .filter(p => p.status === 'complete')
    .reduce((sum, phase) => sum + phase.features, 0);
  const overallProgress = (completedFeatures / totalFeatures) * 100;

  // Fetch real-time progress from API
  const { data: liveStats } = useQuery<RoadmapStats>({
    queryKey: ['/api/mrblue/plan/stats', userId],
    queryFn: async () => {
      const response = await fetch(`/api/mrblue/plan/stats?userId=${userId}`);
      if (!response.ok) return null;
      return response.json();
    },
  });

  return (
    <div className="space-y-6 p-6" data-testid="view-the-plan">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          🎯 THE PLAN
        </h2>
        <p className="text-muted-foreground">
          Week 9-12: Mr Blue Builds Mundo Tango Autonomously
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="default">
            {completedFeatures} / {totalFeatures} Features
          </Badge>
          <Badge variant="outline">
            {overallProgress.toFixed(0)}% Complete
          </Badge>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-4" />
          <p className="text-sm text-muted-foreground mt-2">
            {Math.round(overallProgress)}% of all features across 5 phases
          </p>
        </CardContent>
      </Card>

      {/* Phase Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Build Phases</h3>
        {PLAN_PHASES.map((phase, index) => (
          <Card 
            key={index}
            className={phase.status === 'complete' ? 'border-green-500/50' : phase.status === 'in-progress' ? 'border-blue-500/50' : ''}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{phase.week}</Badge>
                    {phase.status === 'complete' && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {phase.status === 'in-progress' && (
                      <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
                    )}
                    {phase.status === 'pending' && (
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle>{phase.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{phase.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{phase.features}</div>
                  <div className="text-xs text-muted-foreground">features</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={phase.progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {phase.progress}% Complete
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Active Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {CURRENT_TASKS.map((task, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{task.title}</span>
                <Badge variant={task.status === 'in-progress' ? 'default' : 'outline'}>
                  {task.status === 'in-progress' ? 'In Progress' : 'Pending'}
                </Badge>
              </div>
              <Progress value={task.progress} className="h-1" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Key Milestones */}
      <Card className="border-blue-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            MB.MD Promise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Week 1-8 Complete
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✅ Video conversations with 3D Mr Blue</li>
                <li>✅ Natural language vibe coding</li>
                <li>✅ Voice cloning (ElevenLabs)</li>
                <li>✅ Facebook Messenger integration</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Code className="h-4 w-4 text-blue-500" />
                Systems Active
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✅ 134,648 lines of context</li>
                <li>✅ Multi-file editing with safety</li>
                <li>✅ Screen sharing collaboration</li>
                <li>✅ Autonomous coding engine</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Part 10 Validation Progress */}
      {liveStats && (
        <Card className="border-blue-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-blue-500" />
              Part 10: Page Validation Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {liveStats.validated} / {liveStats.total} pages validated
                  </span>
                  <Badge variant="default">
                    {liveStats.percentComplete}% Complete
                  </Badge>
                </div>
                <Progress value={liveStats.percentComplete} className="h-3" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Validated</p>
                  <p className="text-xl font-bold text-green-500">{liveStats.validated}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">In Progress</p>
                  <p className="text-xl font-bold text-blue-500">{liveStats.inProgress}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold text-muted-foreground">{liveStats.pending}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Issues</p>
                  <p className="text-xl font-bold text-orange-500">{liveStats.issuesFound}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Progress Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Validation Tracker</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
              <TabsTrigger 
                value="overview" 
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                data-testid="tab-overview"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="tracker" 
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                data-testid="tab-tracker"
              >
                47-Page Tracker
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="p-6 space-y-4">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold">Next Steps</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="default" data-testid="button-chat-about-plan">
                    <Users className="h-4 w-4 mr-2" />
                    Chat with Mr Blue About The Plan
                  </Button>
                  <Button variant="outline" data-testid="button-view-full-plan">
                    <Target className="h-4 w-4 mr-2" />
                    View Full Documentation
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="tracker" className="p-0">
              <PlanProgressTracker />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
