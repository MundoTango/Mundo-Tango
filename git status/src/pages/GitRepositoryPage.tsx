import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, GitCommit, ExternalLink, RefreshCw } from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

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
  const { data: gitInfo, isLoading } = useQuery<GitInfo>({
    queryKey: ["/api/platform/git-info"],
  });

  if (isLoading || !gitInfo) {
    return (
      <SelfHealingErrorBoundary pageName="Git Repository" fallbackRoute="/platform">
        <div className="container mx-auto p-6">
          <div className="text-center py-8" data-testid="loading-git-info">
            Loading repository information...
          </div>
        </div>
      </SelfHealingErrorBoundary>
    );
  }

  const repoUrl = `https://github.com/${gitInfo.owner}/${gitInfo.repo}`;

  return (
    <SelfHealingErrorBoundary pageName="Git Repository" fallbackRoute="/platform">
      <div className="min-h-screen bg-background">
        {/* Editorial Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=1600&auto=format&fit=crop')`
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </motion.div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="max-w-4xl"
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                <GitBranch className="w-3 h-3 mr-1" />
                Source Control
              </Badge>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="heading-page-title">
                Git Repository
              </h1>

              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8" data-testid="text-hero-subtitle">
                {gitInfo.owner}/{gitInfo.repo}
              </p>

              <Button
                size="lg"
                variant="outline"
                asChild
                className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                data-testid="button-view-on-github"
              >
                <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-5 h-5" />
                  View on GitHub
                </a>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="overflow-hidden hover-elevate">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <GitCommit className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-serif font-bold">Total Commits</h3>
                  </div>
                  <div className="text-4xl font-bold text-primary" data-testid="text-total-commits">
                    {gitInfo.stats.totalCommits}
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover-elevate">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <GitBranch className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-serif font-bold">Total Branches</h3>
                  </div>
                  <div className="text-4xl font-bold text-primary" data-testid="text-total-branches">
                    {gitInfo.stats.totalBranches}
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover-elevate">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-serif font-bold">Contributors</h3>
                  </div>
                  <div className="text-4xl font-bold text-primary" data-testid="text-contributors">
                    {gitInfo.stats.contributors}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Branches */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b">
                <CardTitle className="text-2xl font-serif">Branches</CardTitle>
                <CardDescription>Active branches in the repository</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                {gitInfo.branches.map((branch, index) => (
                  <motion.div
                    key={branch.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-6 border rounded-xl hover-elevate"
                    data-testid={`branch-${branch.name}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <GitBranch className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{branch.name}</div>
                        <div className="text-sm text-muted-foreground font-mono">{branch.commit}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {branch.name === gitInfo.defaultBranch && (
                        <Badge>Default</Badge>
                      )}
                      {branch.protected && (
                        <Badge variant="secondary">Protected</Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Commits */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b">
                <CardTitle className="text-2xl font-serif">Recent Commits</CardTitle>
                <CardDescription>Latest commits across all branches</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                {gitInfo.recentCommits.map((commit, index) => (
                  <motion.div
                    key={commit.sha}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="flex items-start gap-4 p-6 border rounded-xl hover-elevate"
                    data-testid={`commit-${commit.sha}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <GitCommit className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="font-semibold text-lg leading-relaxed">{commit.message}</div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>{commit.author}</span>
                        <span>•</span>
                        <span className="font-mono">{commit.sha.substring(0, 7)}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">{commit.branch}</Badge>
                        <span>•</span>
                        <span>{new Date(commit.date).toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
