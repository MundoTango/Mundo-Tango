import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { ListTodo, Clock, User, Tag, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function TaskBoardPage() {
  const columns = [
    {
      name: "Open",
      tasks: [
        { id: 1, title: "Design new homepage", domain: "Frontend", hours: 12, skills: ["React", "Figma"] },
        { id: 2, title: "API integration for auth", domain: "Backend", hours: 8, skills: ["Node.js", "JWT"] },
        { id: 3, title: "Database optimization", domain: "Backend", hours: 6, skills: ["PostgreSQL", "Drizzle"] }
      ],
      color: "border-blue-500/20 bg-blue-500/5"
    },
    {
      name: "In Progress",
      tasks: [
        { id: 4, title: "Build user dashboard", domain: "Frontend", hours: 10, skills: ["React", "TypeScript"] },
        { id: 5, title: "Setup CI/CD pipeline", domain: "DevOps", hours: 4, skills: ["GitHub Actions", "Docker"] }
      ],
      color: "border-orange-500/20 bg-orange-500/5"
    },
    {
      name: "Completed",
      tasks: [
        { id: 6, title: "Setup project structure", domain: "Fullstack", hours: 8, skills: ["React", "Express"] },
        { id: 7, title: "User authentication", domain: "Backend", hours: 12, skills: ["Passport", "JWT"] }
      ],
      color: "border-green-500/20 bg-green-500/5"
    }
  ];

  return (
    <>
      <SEO
        title="Task Board - Admin"
        description="Manage project tasks and assign them to volunteers using AI-powered talent matching."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">Task Board</h1>
              <p className="text-muted-foreground">
                Manage project tasks and assign them to volunteers
              </p>
            </div>
            <Button className="gap-2" data-testid="button-create-task">
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          </motion.div>

          {/* Kanban Board */}
          <div className="grid gap-6 lg:grid-cols-3">
            {columns.map((column, colIdx) => (
              <motion.div
                key={colIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: colIdx * 0.1 }}
              >
                <Card className={`glass-card border-2 ${column.color}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{column.name}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {column.tasks.length}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {column.tasks.map((task, taskIdx) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (colIdx * 0.1) + (taskIdx * 0.05) }}
                      >
                        <Card className="hover-elevate cursor-pointer" data-testid={`task-card-${task.id}`}>
                          <CardContent className="pt-4">
                            <h3 className="font-semibold mb-2">{task.title}</h3>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <Tag className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                                {task.domain}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{task.hours}h estimated</span>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {task.skills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 rounded bg-accent/10 text-accent-foreground"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full gap-2"
                              data-testid={`button-assign-${task.id}`}
                            >
                              <User className="h-3 w-3" />
                              Find Volunteer
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
