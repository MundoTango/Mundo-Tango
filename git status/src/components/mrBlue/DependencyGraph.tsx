import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Network, Search, AlertTriangle, FileCode, ArrowRight, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface FileDependency {
  filePath: string;
  imports: string[];
  exports: string[];
  dependencies: string[];
  dependents: string[];
  size: number;
  lastModified: string;
}

interface DependencyGraphData {
  nodes: {
    id: string;
    label: string;
    type: 'file' | 'module';
    dependencyCount: number;
  }[];
  edges: {
    from: string;
    to: string;
    type: 'import' | 'export';
  }[];
  cycles: string[][];
}

interface ImpactAnalysis {
  filePath: string;
  directDependents: number;
  totalDependents: number;
  impactScore: number;
  criticalPaths: string[][];
}

export function DependencyGraph() {
  const { toast } = useToast();
  const [filePath, setFilePath] = useState('');
  const [analysis, setAnalysis] = useState<FileDependency | null>(null);
  const [impact, setImpact] = useState<ImpactAnalysis | null>(null);
  const [graph, setGraph] = useState<DependencyGraphData | null>(null);

  // Mutation: Analyze file dependencies
  const analyzeMutation = useMutation({
    mutationFn: async (path: string) => {
      return await apiRequest('/api/mrblue/dependencies/analyze', {
        method: 'POST',
        body: { filePath: path }
      });
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast({
        title: 'Analysis Complete',
        description: `Found ${data.imports.length} imports and ${data.exports.length} exports.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Analysis Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation: Calculate impact
  const impactMutation = useMutation({
    mutationFn: async (path: string) => {
      return await apiRequest('/api/mrblue/dependencies/impact', {
        method: 'POST',
        body: { filePath: path }
      });
    },
    onSuccess: (data) => {
      setImpact(data);
      toast({
        title: 'Impact Analysis Complete',
        description: `${data.totalDependents} files depend on this file.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Impact Analysis Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation: Build dependency graph
  const graphMutation = useMutation({
    mutationFn: async (rootPath: string) => {
      return await apiRequest('/api/mrblue/dependencies/graph', {
        method: 'POST',
        body: { rootPath }
      });
    },
    onSuccess: (data) => {
      setGraph(data);
      toast({
        title: 'Graph Built',
        description: `Generated graph with ${data.nodes.length} nodes and ${data.edges.length} edges.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Graph Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleAnalyze = () => {
    if (!filePath.trim()) {
      toast({
        title: 'Empty Path',
        description: 'Please provide a file path to analyze.',
        variant: 'destructive',
      });
      return;
    }
    analyzeMutation.mutate(filePath);
    impactMutation.mutate(filePath);
  };

  const handleBuildGraph = () => {
    const rootPath = filePath || 'client/src';
    graphMutation.mutate(rootPath);
  };

  const getImpactColor = (score: number) => {
    if (score >= 0.7) return 'text-red-500';
    if (score >= 0.4) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" data-testid="panel-dependency-graph">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Network className="h-6 w-6" />
              Dependency Graph
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Analyze file dependencies and impact of changes
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="analysis" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start rounded-none border-b">
          <TabsTrigger value="analysis" data-testid="tab-analysis">
            <FileCode className="h-4 w-4 mr-2" />
            File Analysis
          </TabsTrigger>
          <TabsTrigger value="graph" data-testid="tab-graph">
            <Network className="h-4 w-4 mr-2" />
            Dependency Graph
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="flex-1 overflow-auto p-6 mt-0">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Analysis Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Analyze File</CardTitle>
                <CardDescription>
                  Enter a file path to analyze its dependencies and impact
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>File Path</Label>
                    <Input
                      placeholder="e.g., client/src/App.tsx"
                      value={filePath}
                      onChange={(e) => setFilePath(e.target.value)}
                      data-testid="input-file-path"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending || impactMutation.isPending}
                  data-testid="button-analyze"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze Dependencies'}
                </Button>
              </CardContent>
            </Card>

            {/* File Dependencies */}
            {analysis && (
              <Card>
                <CardHeader>
                  <CardTitle>File Dependencies</CardTitle>
                  <CardDescription>{analysis.filePath}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Imports</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{analysis.imports.length}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Exports</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{analysis.exports.length}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Dependencies</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{analysis.dependencies.length}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Dependents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{analysis.dependents.length}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    {/* Imports List */}
                    {analysis.imports.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Imports</h4>
                        <ScrollArea className="h-40 rounded-md border p-3">
                          <div className="space-y-1">
                            {analysis.imports.map((imp, index) => (
                              <div
                                key={index}
                                className="text-sm font-mono text-muted-foreground flex items-center gap-2"
                              >
                                <ArrowRight className="h-3 w-3" />
                                {imp}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}

                    {/* Exports List */}
                    {analysis.exports.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Exports</h4>
                        <ScrollArea className="h-40 rounded-md border p-3">
                          <div className="space-y-1">
                            {analysis.exports.map((exp, index) => (
                              <div
                                key={index}
                                className="text-sm font-mono text-muted-foreground"
                              >
                                {exp}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Impact Analysis */}
            {impact && (
              <Card>
                <CardHeader>
                  <CardTitle>Impact Analysis</CardTitle>
                  <CardDescription>
                    Potential impact of changes to this file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm text-muted-foreground">Impact Score</p>
                      <p className={`text-3xl font-bold ${getImpactColor(impact.impactScore)}`}>
                        {(impact.impactScore * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Dependents</p>
                      <p className="text-3xl font-bold">{impact.totalDependents}</p>
                    </div>
                  </div>

                  {impact.criticalPaths.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Critical Dependency Paths
                      </h4>
                      <ScrollArea className="h-40">
                        <div className="space-y-2">
                          {impact.criticalPaths.map((path, index) => (
                            <div
                              key={index}
                              className="text-sm font-mono p-2 rounded-md bg-muted/30"
                              data-testid={`critical-path-${index}`}
                            >
                              {path.join(' → ')}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="graph" className="flex-1 overflow-auto p-6 mt-0">
          <div className="max-w-6xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Build Dependency Graph</CardTitle>
                <CardDescription>
                  Generate a visual representation of your project's dependencies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Root Path</Label>
                    <Input
                      placeholder="e.g., client/src (leave empty for default)"
                      value={filePath}
                      onChange={(e) => setFilePath(e.target.value)}
                      data-testid="input-root-path"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleBuildGraph}
                  disabled={graphMutation.isPending}
                  data-testid="button-build-graph"
                >
                  <Network className="h-4 w-4 mr-2" />
                  {graphMutation.isPending ? 'Building...' : 'Build Graph'}
                </Button>
              </CardContent>
            </Card>

            {graph && (
              <>
                {/* Graph Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Nodes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{graph.nodes.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Connections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{graph.edges.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Circular Dependencies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-2xl font-bold ${graph.cycles.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {graph.cycles.length}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Circular Dependencies Warning */}
                {graph.cycles.length > 0 && (
                  <Card className="border-yellow-500">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2 text-yellow-500">
                        <AlertTriangle className="h-4 w-4" />
                        Circular Dependencies Detected
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-40">
                        <div className="space-y-2">
                          {graph.cycles.map((cycle, index) => (
                            <div
                              key={index}
                              className="text-sm font-mono p-2 rounded-md bg-yellow-500/10"
                              data-testid={`cycle-${index}`}
                            >
                              {cycle.join(' → ')} → {cycle[0]}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {/* Graph Visualization Placeholder */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dependency Graph Visualization</CardTitle>
                    <CardDescription>
                      Interactive graph showing file dependencies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 flex items-center justify-center bg-muted/30 rounded-md">
                      <div className="text-center text-muted-foreground">
                        <Network className="h-16 w-16 mx-auto mb-4" />
                        <p className="text-sm">Graph visualization will appear here</p>
                        <p className="text-xs mt-1">
                          {graph.nodes.length} nodes, {graph.edges.length} edges
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
