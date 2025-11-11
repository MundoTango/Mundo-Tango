import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SEO } from "@/components/SEO";
import { Target, CheckCircle2, Clock, TrendingUp, ListTodo, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import productivityHeroImg from "@assets/stock_images/professional_office__0fd5582e.jpg";
import productivityImg1 from "@assets/stock_images/professional_abstrac_0be569f5.jpg";

export default function ProductivityAgentPage() {
  const todayTasks = [
    { id: 1, text: "Review pull requests", completed: true, priority: "high" },
    { id: 2, text: "Write project documentation", completed: true, priority: "medium" },
    { id: 3, text: "Team standup meeting", completed: true, priority: "high" },
    { id: 4, text: "Update Jira tickets", completed: false, priority: "medium" },
    { id: 5, text: "Code review session", completed: false, priority: "high" },
    { id: 6, text: "Respond to emails", completed: false, priority: "low" }
  ];

  const metrics = [
    { label: "Tasks Done", value: "8/10", icon: CheckCircle2, color: "text-green-500" },
    { label: "Focus Time", value: "4.5h", icon: Clock, color: "text-blue-500" },
    { label: "Score", value: "87%", icon: TrendingUp, color: "text-purple-500" },
    { label: "Streak", value: "12d", icon: Target, color: "text-orange-500" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Productivity Agent" fallbackRoute="/life-ceo">
      <PageLayout title="Productivity Agent" showBreadcrumbs>
        <>
          <SEO
            title="Productivity Agent - Life CEO"
            description="Manage tasks, track time, and boost productivity with your AI productivity agent."
          />

          {/* Editorial Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden" data-testid="hero-section">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${productivityHeroImg})`}}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  Task Management
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight" data-testid="heading-hero">
                  Productivity Agent
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  Your AI-powered task manager
                </p>
              </motion.div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-16">
            {/* Metrics Grid */}
            <div className="grid gap-8 md:grid-cols-4 mb-16">
              {metrics.map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Card className="hover-elevate">
                    <CardContent className="pt-6">
                      <metric.icon className={`h-8 w-8 ${metric.color} mb-4`} />
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="text-3xl font-serif font-bold mt-2">{metric.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Daily Progress</h2>
              <p className="text-lg text-muted-foreground">
                Stay on top of your tasks and maximize your focus time
              </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Today's Tasks Card with 16:9 Image */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="overflow-hidden hover-elevate">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <motion.img
                      src={productivityImg1}
                      alt="Today's Tasks"
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-2xl font-serif font-bold">Today's Tasks</h3>
                      <p className="text-white/80 text-sm mt-1">Your daily action plan</p>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-3">
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
                        <Badge className={
                          task.priority === "high" ? "bg-red-500" :
                          task.priority === "medium" ? "bg-orange-500" :
                          "bg-blue-500"
                        }>
                          {task.priority}
                        </Badge>
                      </div>
                    ))}
                    <Button className="w-full" variant="outline" data-testid="button-add-task">
                      + Add Task
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* AI Productivity Insights */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                      <TrendingUp className="h-6 w-6 text-green-500" />
                      AI Productivity Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">Peak Performance</p>
                          <p className="text-sm text-muted-foreground">
                            You're most productive between 9-11 AM. Schedule complex tasks then.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">Time Optimization</p>
                          <p className="text-sm text-muted-foreground">
                            Consider batching similar tasks together to reduce context switching.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">Weekly Trend</p>
                          <p className="text-sm text-muted-foreground">
                            Your productivity is up 15% compared to last week. Keep it up!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                      <div className="flex items-start gap-3">
                        <ListTodo className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">Reminder</p>
                          <p className="text-sm text-muted-foreground">
                            Don't forget to take breaks every 90 minutes for optimal focus.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full gap-2" data-testid="button-view-analytics">
                      <Calendar className="w-4 h-4" />
                      View Weekly Analytics
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
