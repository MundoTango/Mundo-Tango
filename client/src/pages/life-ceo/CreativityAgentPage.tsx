import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Palette, Lightbulb, Pen, Camera, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function CreativityAgentPage() {
  const stats = [
    { label: "Projects Created", value: "18", icon: Lightbulb, color: "text-yellow-500" },
    { label: "Ideas Captured", value: "142", icon: Pen, color: "text-blue-500" },
    { label: "Photos Taken", value: "356", icon: Camera, color: "text-purple-500" },
    { label: "Inspiration Score", value: "92%", icon: Sparkles, color: "text-pink-500" }
  ];

  const activeProjects = [
    { title: "Tango Choreography Composition", progress: 65, type: "Dance", lastUpdated: "Today" },
    { title: "Photography Portfolio: Milongas", progress: 40, type: "Photography", lastUpdated: "Yesterday" },
    { title: "Tango Poetry Collection", progress: 85, type: "Writing", lastUpdated: "2 days ago" }
  ];

  const inspirations = [
    { text: "Create a dance sequence inspired by ocean waves", category: "Choreography", saved: true },
    { text: "Capture the emotion of embrace in black & white", category: "Photography", saved: false },
    { text: "Write about the silence between tango steps", category: "Writing", saved: true }
  ];

  return (
    <>
      <SEO
        title="Creativity Agent - Life CEO"
        description="Unleash your creative potential with AI-powered inspiration and project management."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                <Palette className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Creativity Agent</h1>
                <p className="text-muted-foreground">Your AI creative companion</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
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
                    <div className="flex items-center justify-between mb-4">
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Active Projects */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Active Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeProjects.map((project, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{project.title}</h3>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>{project.type}</span>
                          <span>•</span>
                          <span>Updated {project.lastUpdated}</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500" 
                        style={{ width: `${project.progress}%` }} 
                      />
                    </div>
                  </div>
                ))}
                <Button className="w-full" data-testid="button-new-project">
                  + Start New Project
                </Button>
              </CardContent>
            </Card>

            {/* Creative Inspirations */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  AI Creative Prompts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {inspirations.map((inspiration, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      inspiration.saved 
                        ? "bg-purple-500/5 border-purple-500/20" 
                        : "bg-muted/50 border-border"
                    }`}
                  >
                    <p className="text-sm mb-2">{inspiration.text}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{inspiration.category}</span>
                      <Button size="sm" variant="ghost" data-testid={`button-save-${idx}`}>
                        {inspiration.saved ? "Saved ✓" : "Save"}
                      </Button>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-generate-inspiration">
                  Generate More Ideas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
