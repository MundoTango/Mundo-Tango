import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { UserPlus, Briefcase, Users, TrendingUp, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import recruiterHeroImg from "@assets/stock_images/business_team_meetin_eee3879e.jpg";
import recruiterImg1 from "@assets/stock_images/business_team_meetin_e7614141.jpg";
import recruiterImg2 from "@assets/stock_images/business_team_meetin_c8361ee1.jpg";

export default function RecruiterAgentPage() {
  const metrics = [
    { label: "Open Positions", value: "8", change: "+2", icon: Briefcase, color: "text-blue-500" },
    { label: "Active Candidates", value: "147", change: "+23", icon: Users, color: "text-green-500" },
    { label: "Interviews Scheduled", value: "12", change: "+5", icon: Clock, color: "text-orange-500" },
    { label: "Hires This Month", value: "3", change: "+1", icon: CheckCircle2, color: "text-purple-500" }
  ];

  const openPositions = [
    { title: "Senior Tango Instructor", applicants: 24, stage: "Interviewing", urgency: "high" },
    { title: "Event Coordinator", applicants: 32, stage: "Screening", urgency: "medium" },
    { title: "Community Manager", applicants: 18, stage: "Reviewing", urgency: "high" },
    { title: "Video Content Creator", applicants: 15, stage: "Posted", urgency: "low" }
  ];

  const topCandidates = [
    { name: "Maria Rodriguez", role: "Senior Instructor", score: 92, status: "Final Round" },
    { name: "Carlos Mendez", role: "Event Coordinator", score: 88, status: "Technical Interview" },
    { name: "Sofia Garcia", role: "Community Manager", score: 85, status: "Reference Check" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Recruiter Agent" fallbackRoute="/platform">
    <PageLayout title="Recruiter Agent" showBreadcrumbs>
<>
      <SEO
        title="Recruiter Agent - HR Dashboard"
        description="Manage recruitment pipeline, candidates, and hiring analytics with AI-powered insights."
      />

      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('${recruiterHeroImg}')`
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-hr">
              HR AI
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
              Recruiter Agent
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Intelligent recruitment - streamline hiring, manage candidates, and build exceptional teams
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
                  <div className="flex items-center justify-between mb-4">
                    <metric.icon className={`h-8 w-8 ${metric.color}`} />
                    <span className="text-xs text-green-500 font-medium">{metric.change}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-3xl font-serif font-bold mt-2">{metric.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Featured Recruitment Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8">Hiring Pipeline</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Open Positions Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={recruiterImg1}
                  alt="Open Positions"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">Open Positions</h3>
                  <p className="text-white/80 text-sm mt-1">Active job openings and applicants</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {openPositions.map((position, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate" data-testid={`position-${idx}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{position.title}</h4>
                      <Badge className={
                        position.urgency === "high" ? "bg-red-500"
                        : position.urgency === "medium" ? "bg-orange-500"
                        : "bg-blue-500"
                      }>
                        {position.urgency}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{position.applicants} applicants</span>
                      <span>•</span>
                      <span>{position.stage}</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full gap-2" variant="outline" data-testid="button-post-job">
                  <Sparkles className="w-4 h-4" />
                  Post New Job
                </Button>
              </CardContent>
            </Card>

            {/* Top Candidates Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={recruiterImg2}
                  alt="Top Candidates"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">Top Candidates</h3>
                  <p className="text-white/80 text-sm mt-1">Highest-rated talent in pipeline</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {topCandidates.map((candidate, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-muted/50" data-testid={`candidate-${idx}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{candidate.name}</h4>
                      <span className="text-sm font-bold text-green-500">{candidate.score}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{candidate.role}</p>
                    <Badge className="bg-blue-500">
                      {candidate.status}
                    </Badge>
                  </div>
                ))}
                <Button className="w-full gap-2" data-testid="button-view-candidates">
                  <TrendingUp className="w-4 h-4" />
                  View All Candidates
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
