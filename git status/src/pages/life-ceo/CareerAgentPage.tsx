import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Briefcase, TrendingUp, Target, FileText, Users, Award, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import careerHeroImg from "@assets/stock_images/professional_office__0fd5582e.jpg";
import careerImg1 from "@assets/stock_images/professional_office__3f3e5cfe.jpg";

export default function CareerAgentPage() {
  const metrics = [
    { label: "Skills Mastered", value: "12", icon: Award, color: "text-yellow-500" },
    { label: "Hours Learning", value: "45", icon: Clock, color: "text-blue-500" },
    { label: "Network Growth", value: "+28", icon: Users, color: "text-green-500" },
    { label: "Career Goals", value: "3/5", icon: Target, color: "text-purple-500" }
  ];

  const goals = [
    { title: "Learn React Advanced Patterns", progress: 75, status: "In Progress" },
    { title: "Complete AWS Certification", progress: 40, status: "In Progress" },
    { title: "Contribute to Open Source", progress: 100, status: "Completed" },
    { title: "Attend Tech Conference", progress: 0, status: "Planned" },
    { title: "Build Portfolio Website", progress: 100, status: "Completed" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Career Agent" fallbackRoute="/life-ceo">
      <PageLayout title="Career Agent" showBreadcrumbs>
        <>
          <SEO
            title="Career Agent - Life CEO"
            description="Track your professional development, skills, and career goals with your AI career agent."
          />

          {/* Editorial Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden" data-testid="hero-section">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${careerHeroImg})`}}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  Professional Development
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight" data-testid="heading-hero">
                  Career Agent
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  Your AI-powered professional growth companion
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
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Career Development</h2>
              <p className="text-lg text-muted-foreground">
                Track progress and get AI-powered insights for your professional journey
              </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Career Goals Card with 16:9 Image */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="overflow-hidden hover-elevate">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <motion.img
                      src={careerImg1}
                      alt="Career Goals"
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-2xl font-serif font-bold">Career Goals</h3>
                      <p className="text-white/80 text-sm mt-1">Your path to professional excellence</p>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-4">
                    {goals.map((goal, idx) => (
                      <div key={idx} className="space-y-2" data-testid={`goal-${idx}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{goal.title}</span>
                          <Badge className={
                            goal.status === "Completed" ? "bg-green-500"
                            : goal.status === "In Progress" ? "bg-blue-500"
                            : ""
                          }>
                            {goal.status}
                          </Badge>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${goal.progress === 100 ? "bg-green-500" : "bg-blue-500"}`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{goal.progress}% complete</p>
                      </div>
                    ))}
                    <Button className="w-full gap-2" variant="outline" data-testid="button-add-goal">
                      <Target className="w-4 h-4" />
                      Add Career Goal
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* AI Career Insights */}
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
                      AI Career Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">Resume Update Suggested</p>
                          <p className="text-sm text-muted-foreground">
                            Add your recent AWS certification completion to stand out.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-purple-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">Networking Opportunity</p>
                          <p className="text-sm text-muted-foreground">
                            3 people from your target companies posted on LinkedIn this week.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">Skill Milestone!</p>
                          <p className="text-sm text-muted-foreground">
                            You've completed 45 hours of learning this month - your best yet!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">Focus Recommendation</p>
                          <p className="text-sm text-muted-foreground">
                            TypeScript skills are in high demand. Consider prioritizing this next.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full gap-2" data-testid="button-view-opportunities">
                      <Briefcase className="w-4 h-4" />
                      View Job Opportunities
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
