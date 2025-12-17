import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Computer,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Monitor,
  Terminal,
  FileCode,
  Download
} from "lucide-react";
import { motion } from "framer-motion";

interface ComputerUseTask {
  id: number;
  taskId: string;
  instruction: string;
  status: string;
  steps: any[];
  currentStep: number;
  maxSteps: number;
  result?: any;
  error?: string;
  requiresApproval: boolean;
  automationType?: string;
  createdAt: string;
}

export function ComputerUseAutomation() {
  const { toast } = useToast();
  const [instruction, setInstruction] = useState("");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Fetch tasks
  const { data: tasks, isLoading } = useQuery<ComputerUseTask[]>({
    queryKey: ['/api/computer-use/tasks'],
    refetchInterval: 5000 // Poll every 5 seconds for status updates
  });

  // Create automation task
  const createTaskMutation = useMutation({
    mutationFn: async (data: { instruction: string; requiresApproval: boolean; maxSteps: number }) => {
      return apiRequest('/api/computer-use/automate', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Task Created",
        description: `Automation task ${data.taskId} created successfully${data.requiresApproval ? ' (pending approval)' : ''}`
      });
      setInstruction("");
      queryClient.invalidateQueries({ queryKey: ['/api/computer-use/tasks'] });
      setSelectedTask(data.taskId);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create automation task",
        variant: "destructive"
      });
    }
  });

  // Approve task
  const approveTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest(`/api/computer-use/task/${taskId}/approve`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Task Approved",
        description: "Automation task is now running"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/computer-use/tasks'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve task",
        variant: "destructive"
      });
    }
  });

  // Wix extraction shortcut
  const wixExtractionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/computer-use/wix-extract', {
        method: 'POST',
        body: JSON.stringify({})
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Wix Extraction Started",
        description: `Task ${data.taskId} created. Check status below.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/computer-use/tasks'] });
      setSelectedTask(data.taskId);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start Wix extraction",
        variant: "destructive"
      });
    }
  });

  const handleCreateTask = () => {
    if (!instruction.trim()) {
      toast({
        title: "Error",
        description: "Please enter automation instructions",
        variant: "destructive"
      });
      return;
    }

    createTaskMutation.mutate({
      instruction: instruction.trim(),
      requiresApproval: true,
      maxSteps: 50
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'requires_approval':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'completed': 'default',
      'failed': 'destructive',
      'running': 'secondary',
      'requires_approval': 'outline',
      'pending': 'secondary'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const selectedTaskData = tasks?.find(t => t.taskId === selectedTask);

  return (
    <div className="space-y-6" data-testid="computer-use-automation">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Computer className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Computer Use Automation</h2>
          <p className="text-sm text-muted-foreground">
            Automate browser tasks with Claude's Computer Use API
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Pre-configured automation shortcuts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => wixExtractionMutation.mutate()}
            disabled={wixExtractionMutation.isPending}
            className="w-full gap-2"
            data-testid="button-wix-extract"
          >
            <Download className="h-4 w-4" />
            Extract Wix Contacts
            {wixExtractionMutation.isPending && <Clock className="h-4 w-4 animate-spin ml-auto" />}
          </Button>
          <p className="text-xs text-muted-foreground">
            Automatically login to Wix, navigate to contacts, and export data
          </p>
        </CardContent>
      </Card>

      {/* Custom Automation */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Automation</CardTitle>
          <CardDescription>Describe any task you want to automate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: Navigate to example.com, click the login button, fill in username and password, then click submit..."
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            rows={4}
            data-testid="input-automation-instruction"
          />
          
          <div className="flex gap-2">
            <Button
              onClick={handleCreateTask}
              disabled={createTaskMutation.isPending || !instruction.trim()}
              className="gap-2"
              data-testid="button-create-task"
            >
              <Play className="h-4 w-4" />
              Create Automation Task
              {createTaskMutation.isPending && <Clock className="h-4 w-4 animate-spin ml-auto" />}
            </Button>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <p className="font-semibold">💡 Tips for better automation:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Be specific about URLs, button text, and field names</li>
              <li>Break complex tasks into clear steps</li>
              <li>All tasks require approval before execution (safety first)</li>
              <li>Maximum 50 steps per task to prevent infinite loops</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `${tasks?.length || 0} automation tasks`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : tasks && tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <motion.div
                    key={task.taskId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border transition-all cursor-pointer hover-elevate ${
                      selectedTask === task.taskId ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setSelectedTask(task.taskId)}
                    data-testid={`task-item-${task.taskId}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span className="font-medium text-sm">{task.instruction.slice(0, 60)}...</span>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(task.status)}
                          {task.automationType && (
                            <Badge variant="outline">
                              {task.automationType}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Step {task.currentStep}/{task.maxSteps}
                          </span>
                        </div>

                        {task.status === 'requires_approval' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              approveTaskMutation.mutate(task.taskId);
                            }}
                            disabled={approveTaskMutation.isPending}
                            className="gap-2"
                            data-testid={`button-approve-${task.taskId}`}
                          >
                            <CheckCircle className="h-3 w-3" />
                            Approve & Run
                          </Button>
                        )}

                        {task.error && (
                          <p className="text-xs text-red-500 mt-2">{task.error}</p>
                        )}
                      </div>

                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(task.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Monitor className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No automation tasks yet</p>
                <p className="text-xs text-muted-foreground">Create your first automation above</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Task Details */}
      {selectedTaskData && (
        <Card>
          <CardHeader>
            <CardTitle>Task Details: {selectedTaskData.taskId}</CardTitle>
            <CardDescription>{selectedTaskData.instruction}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Status</p>
                <div className="mt-1">{getStatusBadge(selectedTaskData.status)}</div>
              </div>
              <div>
                <p className="text-sm font-medium">Progress</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTaskData.currentStep} / {selectedTaskData.maxSteps} steps
                </p>
              </div>
            </div>

            {selectedTaskData.steps && selectedTaskData.steps.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Execution Steps</p>
                <ScrollArea className="h-48 rounded-md border p-3">
                  <div className="space-y-2">
                    {selectedTaskData.steps.map((step: any, idx: number) => (
                      <div key={idx} className="text-xs font-mono bg-muted p-2 rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Step {idx + 1}
                          </Badge>
                          {step.tool === 'bash' && <Terminal className="h-3 w-3" />}
                          {step.tool === 'text_editor' && <FileCode className="h-3 w-3" />}
                          {step.tool === 'computer' && <Monitor className="h-3 w-3" />}
                          <span className="font-semibold">{step.tool}</span>
                        </div>
                        <pre className="mt-1 text-xs whitespace-pre-wrap">
                          {JSON.stringify(step.input, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {selectedTaskData.result && (
              <div>
                <p className="text-sm font-medium mb-2">Result</p>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                  {JSON.stringify(selectedTaskData.result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
