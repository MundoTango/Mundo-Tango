import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MousePointer2, Undo2, Redo2, Save, GitBranch, Eye, Settings, Workflow, HelpCircle, Sparkles, Search, GitCommit, Brain, Code, ListTodo, Radio, TrendingUp, Network } from 'lucide-react';
import { WorkflowBuilder } from '@/components/mrBlue/WorkflowBuilder';
import { ClarificationDialog, ClarificationQuestion } from '@/components/mrBlue/ClarificationDialog';
import { PageGeneratorPanel } from '@/components/mr-blue/PageGeneratorPanel';
import { PageAuditPanel } from '@/components/mr-blue/PageAuditPanel';
import { GitCommitPanel } from '@/components/mrBlue/GitCommitPanel';
import { PreferencesPanel } from '@/components/mrBlue/PreferencesPanel';
import { CodeQualityDashboard } from '@/components/mrBlue/CodeQualityDashboard';
import { TaskBreakdownPanel } from '@/components/mrBlue/TaskBreakdownPanel';
import { AgentEventViewer } from '@/components/mrBlue/AgentEventViewer';
import LearningDashboard from '@/components/mrBlue/LearningDashboard';
import { DependencyGraph } from '@/components/mrBlue/DependencyGraph';

interface SelectedElement {
  id: string;
  type: string;
  className: string;
  textContent: string;
}

interface Change {
  id: string;
  element: string;
  property: string;
  oldValue: string;
  newValue: string;
  timestamp: Date;
}

export default function VisualEditorPage() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [changes, setChanges] = useState<Change[]>([]);
  const [undoStack, setUndoStack] = useState<Change[]>([]);
  const [redoStack, setRedoStack] = useState<Change[]>([]);
  
  // Clarification Dialog State
  const [showClarification, setShowClarification] = useState(false);
  const [clarificationQuestions, setClarificationQuestions] = useState<ClarificationQuestion[]>([
    {
      question: "What is the primary purpose of this UI change?",
      reasoning: "Understanding the goal helps me suggest the best implementation approach",
      category: "Purpose"
    },
    {
      question: "Which components should be affected by this change?",
      reasoning: "This ensures I modify only the relevant parts of your application",
      category: "Scope"
    }
  ]);
  const [clarificationRound, setClarificationRound] = useState(1);
  const [clarificationConfidence, setClarificationConfidence] = useState(0.65);

  const handlePropertyChange = (property: string, value: string) => {
    if (!selectedElement) return;

    const change: Change = {
      id: Date.now().toString(),
      element: selectedElement.id,
      property,
      oldValue: selectedElement[property as keyof SelectedElement] as string || '',
      newValue: value,
      timestamp: new Date(),
    };

    setChanges(prev => [...prev, change]);
    setUndoStack(prev => [...prev, change]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastChange = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, lastChange]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const change = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, change]);
  };

  const handleClarificationAnswers = (answers: string[]) => {
    console.log('Clarification answers:', answers);
    // Simulate increasing confidence
    const newConfidence = Math.min(clarificationConfidence + 0.2, 1.0);
    setClarificationConfidence(newConfidence);
    
    if (newConfidence >= 0.8) {
      setShowClarification(false);
      setClarificationRound(1);
      setClarificationConfidence(0.65);
    } else {
      setClarificationRound(prev => prev + 1);
    }
  };

  return (
    <div className="h-screen flex flex-col" data-testid="page-visual-editor">
      <div className="border-b p-4 flex items-center justify-between bg-background">
        <div>
          <h1 className="text-2xl font-bold">Mr Blue Visual Editor</h1>
          <p className="text-sm text-muted-foreground">
            Point, click, and edit your UI visually
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowClarification(true)}
            data-testid="button-clarification"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Ask for Clarification
          </Button>
          <Button
            variant={selectionMode ? 'default' : 'outline'}
            onClick={() => setSelectionMode(!selectionMode)}
            data-testid="button-selection-mode"
          >
            <MousePointer2 className="h-4 w-4 mr-2" />
            {selectionMode ? 'Exit Selection' : 'Select Element'}
          </Button>
          <Button
            variant="outline"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            data-testid="button-undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            data-testid="button-redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" data-testid="button-preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button data-testid="button-save-changes">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="editor" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start rounded-none border-b overflow-x-auto">
          <TabsTrigger value="editor" data-testid="tab-editor">
            <MousePointer2 className="h-4 w-4 mr-2" />
            Visual Editor
          </TabsTrigger>
          <TabsTrigger value="workflow" data-testid="tab-workflow">
            <Workflow className="h-4 w-4 mr-2" />
            Workflow Builder
          </TabsTrigger>
          <TabsTrigger value="page-generator" data-testid="tab-page-generator">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Page Generator
          </TabsTrigger>
          <TabsTrigger value="page-audit" data-testid="tab-page-audit">
            <Search className="h-4 w-4 mr-2" />
            Page Audit
          </TabsTrigger>
          <TabsTrigger value="git-commit" data-testid="tab-git-commit">
            <GitCommit className="h-4 w-4 mr-2" />
            Git Commit
          </TabsTrigger>
          <TabsTrigger value="preferences" data-testid="tab-preferences">
            <Brain className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="code-quality" data-testid="tab-code-quality">
            <Code className="h-4 w-4 mr-2" />
            Code Quality
          </TabsTrigger>
          <TabsTrigger value="task-breakdown" data-testid="tab-task-breakdown">
            <ListTodo className="h-4 w-4 mr-2" />
            Task Breakdown
          </TabsTrigger>
          <TabsTrigger value="agent-events" data-testid="tab-agent-events">
            <Radio className="h-4 w-4 mr-2" />
            Agent Events
          </TabsTrigger>
          <TabsTrigger value="learning" data-testid="tab-learning">
            <TrendingUp className="h-4 w-4 mr-2" />
            Learning
          </TabsTrigger>
          <TabsTrigger value="dependencies" data-testid="tab-dependencies">
            <Network className="h-4 w-4 mr-2" />
            Dependencies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="flex-1 flex overflow-hidden mt-0">
          <div className="flex-1 p-6 overflow-auto bg-muted/30">
            <Card className="max-w-4xl mx-auto" data-testid="card-preview">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-lg border ${selectionMode ? 'cursor-crosshair' : ''}`}
                    onClick={() => selectionMode && setSelectedElement({
                      id: 'card-1',
                      type: 'div',
                      className: 'p-4 rounded-lg border',
                      textContent: 'Sample Card Content'
                    })}
                    data-testid="preview-card-1"
                  >
                    <h3 className="font-semibold mb-2">Sample Card</h3>
                    <p className="text-sm text-muted-foreground">
                      Click to select this element when in selection mode
                    </p>
                  </div>

                  {selectedElement && (
                    <Badge variant="default" data-testid="badge-selected">
                      Selected: {selectedElement.type}#{selectedElement.id}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-80 border-l bg-background overflow-auto">
            <Tabs defaultValue="properties" className="h-full">
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="properties" data-testid="tab-properties">
                  <Settings className="h-4 w-4 mr-2" />
                  Properties
                </TabsTrigger>
                <TabsTrigger value="changes" data-testid="tab-changes">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Changes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="properties" className="p-4 space-y-4">
                {selectedElement ? (
                  <>
                    <div className="space-y-2">
                      <Label>Element Type</Label>
                      <Input value={selectedElement.type} disabled data-testid="input-element-type" />
                    </div>

                    <div className="space-y-2">
                      <Label>Element ID</Label>
                      <Input value={selectedElement.id} disabled data-testid="input-element-id" />
                    </div>

                    <div className="space-y-2">
                      <Label>Class Name</Label>
                      <Input
                        value={selectedElement.className}
                        onChange={(e) => handlePropertyChange('className', e.target.value)}
                        data-testid="input-class-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Text Content</Label>
                      <Input
                        value={selectedElement.textContent}
                        onChange={(e) => handlePropertyChange('textContent', e.target.value)}
                        data-testid="input-text-content"
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MousePointer2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select an element to view and edit its properties</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="changes" className="p-4">
                <div className="space-y-2">
                  {changes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No changes yet</p>
                    </div>
                  ) : (
                    changes.reverse().map((change) => (
                      <div
                        key={change.id}
                        className="p-3 rounded-lg border text-sm space-y-1"
                        data-testid={`change-${change.id}`}
                      >
                        <div className="font-medium">{change.element}</div>
                        <div className="text-muted-foreground">
                          {change.property}: <span className="line-through">{change.oldValue}</span> → {change.newValue}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(change.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="flex-1 overflow-hidden p-6 mt-0">
          <WorkflowBuilder />
        </TabsContent>

        <TabsContent value="page-generator" className="flex-1 overflow-auto p-6 mt-0">
          <div className="max-w-2xl mx-auto">
            <PageGeneratorPanel />
          </div>
        </TabsContent>

        <TabsContent value="page-audit" className="flex-1 overflow-auto p-6 mt-0" data-testid="tab-content-page-audit">
          <div className="max-w-4xl mx-auto">
            <PageAuditPanel />
          </div>
        </TabsContent>

        <TabsContent value="git-commit" className="flex-1 overflow-hidden mt-0" data-testid="tab-content-git-commit">
          <GitCommitPanel />
        </TabsContent>

        <TabsContent value="preferences" className="flex-1 overflow-hidden mt-0" data-testid="tab-content-preferences">
          <PreferencesPanel />
        </TabsContent>

        <TabsContent value="code-quality" className="flex-1 overflow-hidden mt-0" data-testid="tab-content-code-quality">
          <CodeQualityDashboard />
        </TabsContent>

        <TabsContent value="task-breakdown" className="flex-1 overflow-hidden mt-0" data-testid="tab-content-task-breakdown">
          <TaskBreakdownPanel />
        </TabsContent>

        <TabsContent value="agent-events" className="flex-1 overflow-hidden mt-0" data-testid="tab-content-agent-events">
          <AgentEventViewer />
        </TabsContent>

        <TabsContent value="learning" className="flex-1 overflow-hidden mt-0" data-testid="tab-content-learning">
          <LearningDashboard />
        </TabsContent>

        <TabsContent value="dependencies" className="flex-1 overflow-hidden mt-0" data-testid="tab-content-dependencies">
          <DependencyGraph />
        </TabsContent>
      </Tabs>

      <ClarificationDialog
        open={showClarification}
        questions={clarificationQuestions}
        confidence={clarificationConfidence}
        roundNumber={clarificationRound}
        onAnswer={handleClarificationAnswers}
        onClose={() => setShowClarification(false)}
      />
    </div>
  );
}
