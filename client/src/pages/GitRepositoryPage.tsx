import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, GitCommit, ExternalLink, RefreshCw } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

interface GitInfo {
  owner: string;
  repo: string;
  repoId: string;
  defaultBranch: string;
  branches: Array<{
    name: string;
    commit: string;
    protected: boolean;
  }>;
  recentCommits: Array<{
    sha: string;
    message: string;
    author: string;
    date: string;
    branch: string;
  }>;
  stats: {
    totalCommits: number;
    totalBranches: number;
    contributors: number;
  };
}

export default function GitRepositoryPage() {
  // Fetch git repository info from backend API
  const { data: gitInfo, isLoading } = useQuery<GitInfo>({
    queryKey: ["/api/platform/git-info"],
  });

  if (isLoading || !gitInfo) {
    return (
      <SelfHealingErrorBoundary pageName="Git Repository" fallbackRoute="/platform">
        <PageLayout title="Git Repository" showBreadcrumbs>
<div className="container mx-auto p-6">
        <div className="text-center py-8" data-testid="loading-git-info">
          Loading repository information...
        </div>
      </div>
        </PageLayout>
      </SelfHealingErrorBoundary>
    );
  }

  const repoUrl = `https://github.com/${gitInfo.owner}/${gitInfo.repo}`;

  return (
    <SelfHealingErrorBoundary pageName="Git Repository" fallbackRoute="/platform">
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Git Repository</h1>
          <p className="text-muted-foreground mt-1">
            {gitInfo.owner}/{gitInfo.repo}
          </p>
        </div>
        <Button variant="outline" asChild data-testid="button-view-on-github">
          <a href={repoUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            View on GitHub
          </a>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commits</CardTitle>
            <GitCommit className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-commits">{gitInfo.stats.totalCommits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
            <GitBranch className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-branches">{gitInfo.stats.totalBranches}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contributors</CardTitle>
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-contributors">{gitInfo.stats.contributors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Branches */}
      <Card>
        <CardHeader>
          <CardTitle>Branches</CardTitle>
          <CardDescription>Active branches in the repository</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gitInfo.branches.map((branch) => (
              <div
                key={branch.name}
                className="flex items-center justify-between p-3 border rounded-lg"
                data-testid={`branch-${branch.name}`}
              >
                <div className="flex items-center gap-3">
                  <GitBranch className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{branch.name}</div>
                    <div className="text-sm text-muted-foreground font-mono">{branch.commit}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {branch.name === gitInfo.defaultBranch && (
                    <Badge variant="default">Default</Badge>
                  )}
                  {branch.protected && (
                    <Badge variant="secondary">Protected</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Commits */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Commits</CardTitle>
          <CardDescription>Latest commits across all branches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gitInfo.recentCommits.map((commit) => (
              <div
                key={commit.sha}
                className="flex items-start gap-4 p-3 border rounded-lg"
                data-testid={`commit-${commit.sha}`}
              >
                <GitCommit className="w-5 h-5 text-muted-foreground mt-1" />
                <div className="flex-1 space-y-1">
                  <div className="font-medium">{commit.message}</div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{commit.author}</span>
                    <span>•</span>
                    <span className="font-mono">{commit.sha.substring(0, 7)}</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">{commit.branch}</Badge>
                    <span>•</span>
                    <span>{new Date(commit.date).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </SelfHealingErrorBoundary>
  );
}
