import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Palette, Lightbulb, Pen, Camera, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import creativityHeroImg from "@assets/stock_images/elegant_professional_29e89c1e.jpg";
import creativityImg1 from "@assets/stock_images/elegant_professional_9405e610.jpg";

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
    <SelfHealingErrorBoundary pageName="Creativity Agent" fallbackRoute="/life-ceo">
      <PageLayout title="Creativity Agent" showBreadcrumbs>
        <>
          <SEO
            title="Creativity Agent - Life CEO"
            description="Unleash your creative potential with AI-powered inspiration and project management."
          />

          {/* Editorial Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden" data-testid="hero-section">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${creativityHeroImg})`}}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  Artistic Expression
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight" data-testid="heading-hero">
                  Creativity Agent
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  Your AI creative companion for inspiration and artistic projects
                </p>
              </motion.div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-16">
            {/* Stats Grid */}
            <div className="grid gap-8 md:grid-cols-4 mb-16">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Card className="hover-elevate">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <stat.icon className={`h-8 w-8 ${stat.color}`} />
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-serif font-bold mt-2">{stat.value}</p>
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
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Creative Projects</h2>
              <p className="text-lg text-muted-foreground">
                Bring your artistic visions to life with AI-powered guidance
              </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Active Projects Card with 16:9 Image */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="overflow-hidden hover-elevate">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <motion.img
                      src={creativityImg1}
                      alt="Active Projects"
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-2xl font-serif font-bold">Active Projects</h3>
                      <p className="text-white/80 text-sm mt-1">Your creative endeavors in progress</p>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-4">
                    {activeProjects.map((project, idx) => (
                      <div key={idx} className="space-y-2" data-testid={`project-${idx}`}>
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
                    <Button className="w-full gap-2" data-testid="button-new-project">
                      <Lightbulb className="w-4 h-4" />
                      Start New Project
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Creative Inspirations */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                      <Sparkles className="h-6 w-6 text-purple-500" />
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
                        data-testid={`inspiration-${idx}`}
                      >
                        <p className="text-sm mb-2">{inspiration.text}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{inspiration.category}</Badge>
                          <Button size="sm" variant="ghost" data-testid={`button-save-${idx}`}>
                            {inspiration.saved ? "Saved ✓" : "Save"}
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button className="w-full gap-2" variant="outline" data-testid="button-generate-inspiration">
                      <Sparkles className="w-4 h-4" />
                      Generate More Ideas
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
