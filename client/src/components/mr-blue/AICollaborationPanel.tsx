/**
 * AICollaborationPanel - Replit AI ↔ Mr Blue Chat Interface
 * 
 * MB.MD v9.3: Hierarchical Execution Visualization
 * Shows AI-to-AI communication and parallel task execution
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Bot, 
  Brain, 
  Zap, 
  Send, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Clock,
  Users,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface CollaborationMessage {
  id: string;
  sender: 'replit_ai' | 'mr_blue' | 'agent';
  agentId?: string;
  content: string;
  type: 'strategic' | 'tactical' | 'execution' | 'status' | 'result';
  timestamp: Date;
  metadata?: {
    taskCount?: number;
    agentsAssigned?: string[];
    progress?: number;
    errors?: string[];
  };
}

interface ParallelTask {
  id: string;
  description: string;
  agentId: string;
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
}

interface Session {
  id: string;
  status: 'active' | 'completed' | 'error';
  currentPhase: string;
  messages: CollaborationMessage[];
  tasks: ParallelTask[];
}

export function AICollaborationPanel() {
  const [input, setInput] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const startMutation = useMutation({
    mutationFn: async (request: string) => {
      const response = await apiRequest('POST', '/api/ai-collaboration/start', { request });
      return response.json();
    },
    onSuccess: (data: any) => {
      setSession(data.session);
      toast({
        title: "Collaboration Started",
        description: "Replit AI and Mr Blue are now collaborating",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start collaboration",
        variant: "destructive"
      });
    }
  });
  
  const executeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest('POST', `/api/ai-collaboration/${sessionId}/execute`);
      return response.json();
    },
    onSuccess: (data: any) => {
      setSession(data.session);
      toast({
        title: "Execution Complete",
        description: `${data.session.tasks.filter((t: ParallelTask) => t.status === 'completed').length} tasks completed simultaneously`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Execution Failed",
        description: error.message || "Failed to execute tasks",
        variant: "destructive"
      });
    }
  });
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    startMutation.mutate(input.trim());
    setInput("");
  };
  
  const handleExecute = () => {
    if (session?.id) {
      executeMutation.mutate(session.id);
    }
  };
  
  const getSenderInfo = (sender: string, agentId?: string) => {
    switch (sender) {
      case 'replit_ai':
        return {
          name: 'Replit AI',
          icon: Brain,
          color: 'bg-purple-500/20 text-purple-400',
          level: 'Level 1 - Strategic'
        };
      case 'mr_blue':
        return {
          name: 'Mr Blue',
          icon: Bot,
          color: 'bg-blue-500/20 text-blue-400',
          level: 'Level 2 - Tactical'
        };
      case 'agent':
        return {
          name: agentId || 'Agent',
          icon: Zap,
          color: 'bg-green-500/20 text-green-400',
          level: 'Level 3 - Execution'
        };
      default:
        return {
          name: 'Unknown',
          icon: Bot,
          color: 'bg-gray-500/20 text-gray-400',
          level: ''
        };
    }
  };
  
  const getPhaseProgress = () => {
    if (!session) return 0;
    const phases = ['planning', 'delegation', 'execution', 'validation', 'complete'];
    const currentIndex = phases.indexOf(session.currentPhase);
    return ((currentIndex + 1) / phases.length) * 100;
  };

  return (
    <div className="flex flex-col h-full" data-testid="ai-collaboration-panel">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Collaboration
            </CardTitle>
            {session && (
              <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                {session.currentPhase}
              </Badge>
            )}
          </div>
          
          {session && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Brain className="h-3 w-3 text-purple-400" />
                  <span>Replit AI</span>
                </div>
                <ArrowRight className="h-3 w-3" />
                <div className="flex items-center gap-1">
                  <Bot className="h-3 w-3 text-blue-400" />
                  <span>Mr Blue</span>
                </div>
                <ArrowRight className="h-3 w-3" />
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-green-400" />
                  <span>{session.tasks.length} Agents</span>
                </div>
              </div>
              <Progress value={getPhaseProgress()} className="h-1" />
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
          <ScrollArea className="flex-1 px-4" ref={scrollRef}>
            <div className="space-y-4 py-4">
              {!session && (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Enter a task to start AI collaboration</p>
                  <p className="text-xs mt-2">
                    Replit AI will create a strategic plan, Mr Blue will orchestrate agents
                  </p>
                </div>
              )}
              
              <AnimatePresence>
                {session?.messages.map((message, index) => {
                  const senderInfo = getSenderInfo(message.sender, message.agentId);
                  const Icon = senderInfo.icon;
                  
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-3"
                      data-testid={`message-${message.id}`}
                    >
                      <Avatar className={`h-8 w-8 ${senderInfo.color}`}>
                        <AvatarFallback className="bg-transparent">
                          <Icon className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{senderInfo.name}</span>
                          <Badge variant="outline" className="text-[10px] px-1 py-0">
                            {senderInfo.level}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <Card className="bg-muted/50">
                          <CardContent className="p-3 text-sm whitespace-pre-wrap">
                            {message.content}
                          </CardContent>
                        </Card>
                        
                        {message.metadata?.taskCount && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{message.metadata.taskCount} tasks assigned</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {session && session.tasks.length > 0 && session.currentPhase !== 'planning' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4"
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        Parallel Tasks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {session.tasks.map((task, index) => (
                        <div 
                          key={task.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                          data-testid={`task-${task.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">
                              #{index + 1}
                            </span>
                            <span className="text-sm">{task.agentName}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {task.status === 'pending' && (
                              <Badge variant="secondary" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Pending
                              </Badge>
                            )}
                            {task.status === 'running' && (
                              <Badge variant="secondary" className="gap-1 animate-pulse">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Running
                              </Badge>
                            )}
                            {task.status === 'completed' && (
                              <Badge variant="default" className="gap-1 bg-green-500/20 text-green-400 border-green-500/30">
                                <CheckCircle className="h-3 w-3" />
                                Complete
                              </Badge>
                            )}
                            {task.status === 'failed' && (
                              <Badge variant="destructive" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                Failed
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t space-y-3">
            {session && session.currentPhase === 'delegation' && (
              <Button 
                onClick={handleExecute}
                disabled={executeMutation.isPending}
                className="w-full gap-2"
                data-testid="button-execute-parallel"
              >
                {executeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Execute Parallel Tasks
                  </>
                )}
              </Button>
            )}
            
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter a task for AI collaboration..."
                disabled={startMutation.isPending || (session?.status === 'active' && session.currentPhase !== 'complete')}
                data-testid="input-collaboration-request"
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={!input.trim() || startMutation.isPending || (session?.status === 'active' && session.currentPhase !== 'complete')}
                data-testid="button-start-collaboration"
              >
                {startMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            
            {session?.status === 'completed' && (
              <Button 
                variant="outline" 
                onClick={() => setSession(null)} 
                className="w-full"
                data-testid="button-new-collaboration"
              >
                Start New Collaboration
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
