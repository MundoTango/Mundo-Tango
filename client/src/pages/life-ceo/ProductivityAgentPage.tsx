import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SEO } from "@/components/SEO";
import { Target, CheckCircle2, Clock, TrendingUp, ListTodo, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductivityAgentPage() {
  const todayTasks = [
    { id: 1, text: "Review pull requests", completed: true, priority: "high" },
    { id: 2, text: "Write project documentation", completed: true, priority: "medium" },
    { id: 3, text: "Team standup meeting", completed: true, priority: "high" },
    { id: 4, text: "Update Jira tickets", completed: false, priority: "medium" },
    { id: 5, text: "Code review session", completed: false, priority: "high" },
    { id: 6, text: "Respond to emails", completed: false, priority: "low" }
  ];

  const stats = [
    { label: "Tasks Completed", value: "8/10", icon: CheckCircle2, color: "text-green-500" },
    { label: "Focus Time", value: "4.5h", icon: Clock, color: "text-blue-500" },
    { label: "Productivity Score", value: "87%", icon: TrendingUp, color: "text-purple-500" },
    { label: "Streak", value: "12 days", icon: Target, color: "text-orange-500" }
  ];

  return (
    <>
      <SEO
        title="Productivity Agent - Life CEO"
        description="Manage tasks, track time, and boost productivity with your AI productivity agent."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Productivity Agent</h1>
                <p className="text-muted-foreground">Your AI-powered task manager</p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <stat.icon className={`h-8 w-8 ${stat.color} mb-4`} />
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Today's Tasks */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-primary" />
                  Today's Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      task.completed ? "bg-green-500/5" : "hover-elevate"
                    }`}
                  >
                    <Checkbox checked={task.completed} data-testid={`checkbox-task-${task.id}`} />
                    <span className={`flex-1 ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                      {task.text}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.priority === "high" ? "bg-red-500/10 text-red-500" :
                      task.priority === "medium" ? "bg-orange-500/10 text-orange-500" :
                      "bg-blue-500/10 text-blue-500"
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-add-task">
                  + Add Task
                </Button>
              </CardContent>
            </Card>

            {/* AI Productivity Insights */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  AI Productivity Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <p className="text-sm font-medium mb-1">🎯 Peak Performance</p>
                  <p className="text-sm text-muted-foreground">
                    You're most productive between 9-11 AM. Schedule complex tasks then.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <p className="text-sm font-medium mb-1">⏰ Time Optimization</p>
                  <p className="text-sm text-muted-foreground">
                    Consider batching similar tasks together to reduce context switching.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <p className="text-sm font-medium mb-1">📊 Weekly Trend</p>
                  <p className="text-sm text-muted-foreground">
                    Your productivity is up 15% compared to last week. Keep it up!
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                  <p className="text-sm font-medium mb-1">🔔 Reminder</p>
                  <p className="text-sm text-muted-foreground">
                    Don't forget to take breaks every 90 minutes for optimal focus.
                  </p>
                </div>

                <Button className="w-full" variant="outline" data-testid="button-view-analytics">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Weekly Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
