import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { UserCheck, CheckCircle, AlertCircle, Clock, Users, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import onboardingHeroImg from "@assets/stock_images/business_team_meetin_caa5de6b.jpg";
import onboardingImg1 from "@assets/stock_images/business_team_meetin_061b6626.jpg";
import onboardingImg2 from "@assets/stock_images/business_team_meetin_6cccf697.jpg";

export default function OnboardingAgentPage() {
  const metrics = [
    { label: "Active Onboarding", value: "5", change: "+2", icon: Users, color: "text-blue-500" },
    { label: "Completed", value: "23", change: "+3", icon: CheckCircle, color: "text-green-500" },
    { label: "Avg. Time", value: "12 days", change: "-2 days", icon: Clock, color: "text-purple-500" },
    { label: "Pending Tasks", value: "18", change: "-4", icon: AlertCircle, color: "text-orange-500" }
  ];

  const newHires = [
    { name: "Maria Rodriguez", role: "Senior Instructor", progress: 85, startDate: "Nov 1, 2025", tasksLeft: 3 },
    { name: "Carlos Mendez", role: "Event Coordinator", progress: 60, startDate: "Oct 28, 2025", tasksLeft: 8 },
    { name: "Sofia Garcia", role: "Community Manager", progress: 40, startDate: "Oct 25, 2025", tasksLeft: 12 }
  ];

  const onboardingSteps = [
    { step: "Complete HR Paperwork", completion: 100, color: "bg-green-500" },
    { step: "System Access Setup", completion: 85, color: "bg-blue-500" },
    { step: "Team Introductions", completion: 70, color: "bg-purple-500" },
    { step: "Training Modules", completion: 45, color: "bg-orange-500" },
    { step: "First Project Assignment", completion: 20, color: "bg-red-500" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Onboarding Agent" fallbackRoute="/platform">
    <PageLayout title="Onboarding Agent" showBreadcrumbs>
<>
      <SEO
        title="Onboarding Agent - HR Dashboard"
        description="Manage new hire onboarding, training, and integration tracking with AI-powered insights."
      />

      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('${onboardingHeroImg}')`
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
              Onboarding Agent
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Seamless onboarding - guide new hires, track progress, and ensure successful integration
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

        {/* Featured Onboarding Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8">Onboarding Progress</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* New Hires Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={onboardingImg1}
                  alt="New Hires"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">New Hires</h3>
                  <p className="text-white/80 text-sm mt-1">Currently in onboarding process</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {newHires.map((hire, idx) => (
                  <div key={idx} className="p-4 rounded-lg border hover-elevate" data-testid={`hire-${idx}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{hire.name}</h4>
                        <p className="text-xs text-muted-foreground">{hire.role}</p>
                      </div>
                      <span className="text-sm font-bold text-green-500">{hire.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${hire.progress}%` }} 
                      />
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Started: {hire.startDate}</span>
                      <span>•</span>
                      <span>{hire.tasksLeft} tasks left</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full gap-2" variant="outline" data-testid="button-add-new-hire">
                  <Sparkles className="w-4 h-4" />
                  Add New Hire
                </Button>
              </CardContent>
            </Card>

            {/* Onboarding Steps Card with 16:9 Image */}
            <Card className="overflow-hidden hover-elevate">
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={onboardingImg2}
                  alt="Onboarding Steps"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-serif font-bold">Workflow Steps</h3>
                  <p className="text-white/80 text-sm mt-1">Overall completion status</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                {onboardingSteps.map((step, idx) => (
                  <div key={idx} data-testid={`step-${idx}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{step.step}</span>
                      <span className="text-sm font-bold">{step.completion}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={step.color}
                        style={{ width: `${step.completion}%` }} 
                      />
                    </div>
                  </div>
                ))}
                <Button className="w-full mt-4 gap-2" data-testid="button-customize-workflow">
                  <Calendar className="w-4 h-4" />
                  Customize Workflow
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
