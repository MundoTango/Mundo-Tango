import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  FileText,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

/**
 * Plan Progress Tracker
 * 
 * Displays all 47 pages from MB_MD_FINAL_PLAN.md Part 10
 * with validation status, notes, and progress tracking.
 */

interface PageProgress {
  id: number;
  userId: number;
  pageName: string;
  pageUrl: string;
  category: string;
  validated: boolean;
  validatedAt: string | null;
  notes: string | null;
  issuesFound: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PageDefinition {
  name: string;
  url: string;
  category: string;
  description: string;
  progress: PageProgress | null;
}

interface RoadmapStats {
  total: number;
  validated: number;
  inProgress: number;
  pending: number;
  issuesFound: number;
  percentComplete: number;
}

interface CategoryProgress {
  category: string;
  total: number;
  validated: number;
  percentComplete: number;
}

interface RoadmapData {
  pages: PageDefinition[];
  stats: RoadmapStats;
  byCategory: CategoryProgress[];
}

const categoryColors: Record<string, string> = {
  core: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  community: 'bg-green-500/10 text-green-500 border-green-500/20',
  messaging: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  admin: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  ai: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
};

interface ValidationDialogProps {
  page: PageDefinition;
  userId: number;
  onValidate: () => void;
}

function ValidationDialog({ page, userId, onValidate }: ValidationDialogProps) {
  const [notes, setNotes] = useState(page.progress?.notes || '');
  const [issuesFound, setIssuesFound] = useState(page.progress?.issuesFound || 0);
  const { toast } = useToast();

  const validateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/mrblue/plan/validate-page', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          pageName: page.name,
          notes: notes || undefined,
          issuesFound: issuesFound || undefined,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/plan/roadmap'] });
      toast({
        title: 'Page Validated',
        description: `${page.name} marked as validated`,
      });
      onValidate();
    },
    onError: (error) => {
      toast({
        title: 'Validation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" data-testid={`button-validate-${page.name.replace(/\s+/g, '-').toLowerCase()}`}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {page.progress?.validated ? 'Update Validation' : 'Mark Validated'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Validate: {page.name}</DialogTitle>
          <DialogDescription>{page.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Validation Notes</label>
            <Textarea
              placeholder="Add notes about this page validation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              data-testid="input-validation-notes"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Issues Found</label>
            <Input
              type="number"
              min="0"
              value={issuesFound}
              onChange={(e) => setIssuesFound(parseInt(e.target.value) || 0)}
              data-testid="input-issues-found"
            />
          </div>
          <Button
            onClick={() => validateMutation.mutate()}
            disabled={validateMutation.isPending}
            className="w-full"
            data-testid="button-submit-validation"
          >
            {validateMutation.isPending ? 'Validating...' : 'Save Validation'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PlanProgressTracker() {
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const userId = 1; // TODO: Get from auth context

  const { data: roadmap, isLoading } = useQuery<RoadmapData>({
    queryKey: ['/api/mrblue/plan/roadmap', userId],
    queryFn: async () => {
      const response = await fetch(`/api/mrblue/plan/roadmap?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch roadmap');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-2">
          <Clock className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="text-center p-12">
        <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Failed to load roadmap</p>
      </div>
    );
  }

  const filteredPages = selectedCategory
    ? roadmap.pages.filter(p => p.category === selectedCategory)
    : roadmap.pages;

  const getStatusIcon = (page: PageDefinition) => {
    if (page.progress?.validated) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (page.progress?.status === 'in_progress') {
      return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
    }
    if (page.progress?.issuesFound && page.progress.issuesFound > 0) {
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    }
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6 p-6" data-testid="component-plan-progress-tracker">
      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {roadmap.stats.validated} / {roadmap.stats.total} pages validated
                </span>
                <span className="text-sm text-muted-foreground">
                  {roadmap.stats.percentComplete}%
                </span>
              </div>
              <Progress value={roadmap.stats.percentComplete} className="h-3" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Validated</p>
                <p className="text-2xl font-bold text-green-500" data-testid="text-validated-count">
                  {roadmap.stats.validated}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-500" data-testid="text-in-progress-count">
                  {roadmap.stats.inProgress}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-muted-foreground" data-testid="text-pending-count">
                  {roadmap.stats.pending}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Issues Found</p>
                <p className="text-2xl font-bold text-orange-500" data-testid="text-issues-count">
                  {roadmap.stats.issuesFound}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => setSelectedCategory(null)}
          data-testid="button-filter-all"
        >
          All Categories ({roadmap.pages.length})
        </Button>
        {roadmap.byCategory.map((cat) => (
          <Button
            key={cat.category}
            size="sm"
            variant={selectedCategory === cat.category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat.category)}
            data-testid={`button-filter-${cat.category}`}
          >
            {cat.category.charAt(0).toUpperCase() + cat.category.slice(1)} ({cat.validated}/{cat.total})
          </Button>
        ))}
      </div>

      {/* Pages List */}
      <div className="space-y-3">
        {filteredPages.map((page, index) => (
          <Card
            key={index}
            className={`hover-elevate ${page.progress?.validated ? 'border-green-500/30' : ''}`}
            data-testid={`card-page-${page.name.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(page)}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{page.name}</CardTitle>
                      <Badge variant="outline" className={categoryColors[page.category]}>
                        {page.category}
                      </Badge>
                      {page.progress?.validated && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">
                          Validated
                        </Badge>
                      )}
                      {page.progress?.issuesFound ? (
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                          {page.progress.issuesFound} issue{page.progress.issuesFound > 1 ? 's' : ''}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{page.description}</p>
                    {page.progress?.notes && (
                      <div className="mt-2 p-2 bg-muted rounded-md">
                        <p className="text-xs flex items-start gap-2">
                          <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{page.progress.notes}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(page.url)}
                    data-testid={`button-visit-${page.name.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit
                  </Button>
                  <ValidationDialog 
                    page={page} 
                    userId={userId}
                    onValidate={() => {}}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {filteredPages.length === 0 && (
        <div className="text-center p-12">
          <p className="text-muted-foreground">No pages in this category</p>
        </div>
      )}
    </div>
  );
}
