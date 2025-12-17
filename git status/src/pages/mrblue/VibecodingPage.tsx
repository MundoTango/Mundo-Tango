import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Sparkles, FileCode, Check, X, History, Folder } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import Prism from 'react-syntax-highlighter/dist/esm/prism';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeGeneration {
  id: string;
  prompt: string;
  code: string;
  language: string;
  filePath?: string;
  timestamp: Date;
  applied: boolean;
}

export default function VibecodingPage() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [generations, setGenerations] = useState<CodeGeneration[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');

  const generateCodeMutation = useMutation({
    mutationFn: async (prompt: string) => {
      return apiRequest('/api/mrblue/vibecode', {
        method: 'POST',
        body: JSON.stringify({ prompt, file: selectedFile }),
      });
    },
    onSuccess: (data) => {
      const generation: CodeGeneration = {
        id: Date.now().toString(),
        prompt,
        code: data.code,
        language: data.language || 'typescript',
        filePath: data.filePath,
        timestamp: new Date(),
        applied: false,
      };
      setGenerations(prev => [generation, ...prev]);
      setPrompt('');
      toast({
        title: 'Code Generated',
        description: 'AI has generated code based on your prompt.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to generate code.',
        variant: 'destructive',
      });
    },
  });

  const applyCode = (generationId: string) => {
    setGenerations(prev =>
      prev.map(gen =>
        gen.id === generationId ? { ...gen, applied: true } : gen
      )
    );
    toast({
      title: 'Code Applied',
      description: 'The generated code has been applied to your project.',
    });
  };

  const rejectCode = (generationId: string) => {
    setGenerations(prev => prev.filter(gen => gen.id !== generationId));
    toast({
      title: 'Code Rejected',
      description: 'The generated code has been discarded.',
    });
  };

  const currentGeneration = generations[0];

  return (
    <div className="container mx-auto py-8 space-y-6" data-testid="page-vibecoding">
      <div>
        <h1 className="text-3xl font-bold">Mr Blue Vibecoding</h1>
        <p className="text-muted-foreground mt-2">
          AI-powered code generation from natural language
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1" data-testid="card-file-explorer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              File Explorer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {[
                'client/src/App.tsx',
                'client/src/pages/HomePage.tsx',
                'server/routes.ts',
                'server/storage.ts',
                'shared/schema.ts',
              ].map((file) => (
                <button
                  key={file}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm hover-elevate transition-colors ${
                    selectedFile === file ? 'bg-accent' : ''
                  }`}
                  data-testid={`file-${file}`}
                >
                  <FileCode className="h-4 w-4 inline mr-2" />
                  {file.split('/').pop()}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card data-testid="card-prompt-input">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Natural Language Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedFile && (
                <Badge variant="outline" data-testid="badge-selected-file">
                  <FileCode className="h-3 w-3 mr-1" />
                  {selectedFile}
                </Badge>
              )}
              <Textarea
                placeholder="Describe what you want to code... (e.g., 'Create a new component that displays user stats with a chart')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                data-testid="input-prompt"
              />
              <Button
                onClick={() => generateCodeMutation.mutate(prompt)}
                disabled={!prompt || generateCodeMutation.isPending}
                data-testid="button-generate"
              >
                <Code className="h-4 w-4 mr-2" />
                {generateCodeMutation.isPending ? 'Generating...' : 'Generate Code'}
              </Button>
            </CardContent>
          </Card>

          {currentGeneration && (
            <Card data-testid="card-generated-code">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated Code</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => applyCode(currentGeneration.id)}
                      disabled={currentGeneration.applied}
                      data-testid="button-apply-code"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {currentGeneration.applied ? 'Applied' : 'Apply'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectCode(currentGeneration.id)}
                      data-testid="button-reject-code"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="code">
                  <TabsList>
                    <TabsTrigger value="code" data-testid="tab-code">Code</TabsTrigger>
                    <TabsTrigger value="prompt" data-testid="tab-prompt">Prompt</TabsTrigger>
                  </TabsList>
                  <TabsContent value="code" className="mt-4">
                    <div className="rounded-lg overflow-hidden">
                      <Prism
                        language={currentGeneration.language}
                        style={vscDarkPlus}
                        showLineNumbers
                        wrapLines
                      >
                        {currentGeneration.code}
                      </Prism>
                    </div>
                  </TabsContent>
                  <TabsContent value="prompt" className="mt-4">
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm">{currentGeneration.prompt}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {generations.length > 1 && (
            <Card data-testid="card-iteration-history">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Iteration History ({generations.length - 1})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generations.slice(1).map((gen) => (
                    <div
                      key={gen.id}
                      className="p-3 rounded-lg border space-y-2"
                      data-testid={`history-${gen.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium truncate flex-1">
                          {gen.prompt}
                        </div>
                        {gen.applied && (
                          <Badge variant="default" data-testid={`badge-applied-${gen.id}`}>
                            Applied
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(gen.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
