import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { 
  MessageSquare, Bot, Users, TrendingUp, AlertCircle, CheckCircle, 
  Brain, Sparkles, ArrowRight, Target, Briefcase, UserCheck,
  Zap, Activity, Settings
} from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

export default function H2ACDashboardPage() {
  const { t } = useTranslation(["pages", "common"]);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: volunteerProfile } = useQuery({
    queryKey: ["/api/v1/volunteers/me"],
    enabled: !!user
  });

  const { data: volunteerMatches } = useQuery<any[]>({
    queryKey: ["/api/v1/volunteers", volunteerProfile?.id, "matches"],
    queryFn: async () => {
      const response = await fetch(`/api/v1/volunteers/${volunteerProfile?.id}/matches`, {
        credentials: 'include'
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!volunteerProfile?.id
  });

  const matchCount = volunteerMatches?.length || 0;
  const tasksCompleted = volunteerProfile?.tasksCompleted || 0;
  const skillScore = volunteerProfile?.skillScore || 0;

  const metrics = [
    { label: t('pages:h2acDashboard.activeAgents', 'Active Agents'), value: "134", change: t('pages:h2acDashboard.allOnline', 'All online'), icon: Bot, color: "text-blue-500" },
    { label: t('pages:h2acDashboard.yourMatches', 'Your Matches'), value: matchCount.toString(), change: matchCount > 0 ? t('pages:h2acDashboard.readyToReview', 'Ready to review') : t('pages:h2acDashboard.startMatching', 'Start matching'), icon: UserCheck, color: "text-green-500" },
    { label: t('pages:h2acDashboard.tasksCompleted', 'Tasks Completed'), value: tasksCompleted.toString(), change: tasksCompleted > 0 ? t('pages:h2acDashboard.activeContributor', 'Active contributor') : "-", icon: CheckCircle, color: "text-purple-500" },
    { label: t('pages:h2acDashboard.skillScore', 'Skill Score'), value: skillScore > 0 ? `${skillScore}%` : "-", change: skillScore > 0 ? t('pages:h2acDashboard.analyzed', 'Analyzed') : t('pages:h2acDashboard.uploadResume', 'Upload resume'), icon: Target, color: "text-orange-500" }
  ];

  const talentMatchAgents = [
    {
      id: "ESA_TALENT_1",
      name: t('pages:h2acDashboard.agentResumeAnalyzer', 'Resume Analyzer'),
      role: t('pages:h2acDashboard.roleSkillExtraction', 'Skill Extraction'),
      status: "active",
      description: t('pages:h2acDashboard.descResumeAnalyzer', 'Analyzes your resume and extracts relevant skills for matching')
    },
    {
      id: "ESA_TALENT_2",
      name: t('pages:h2acDashboard.agentRoleMatcher', 'Role Matcher'),
      role: t('pages:h2acDashboard.roleOpportunityMatching', 'Opportunity Matching'),
      status: "active",
      description: t('pages:h2acDashboard.descRoleMatcher', 'Matches your profile with available volunteer opportunities')
    },
    {
      id: "ESA_TALENT_3",
      name: t('pages:h2acDashboard.agentInterviewClarifier', 'Interview Clarifier'),
      role: t('pages:h2acDashboard.roleProfileEnhancement', 'Profile Enhancement'),
      status: "ready",
      description: t('pages:h2acDashboard.descInterviewClarifier', 'Conducts AI interviews to clarify skills and preferences')
    },
    {
      id: "ESA_TALENT_4",
      name: t('pages:h2acDashboard.agentAssignmentCoordinator', 'Assignment Coordinator'),
      role: t('pages:h2acDashboard.roleTaskAssignment', 'Task Assignment'),
      status: "standby",
      description: t('pages:h2acDashboard.descAssignmentCoordinator', 'Coordinates task assignments based on your matches')
    }
  ];

  const recentCommunications = [
    {
      agentType: t('pages:h2acDashboard.agentResumeAnalyzer', 'Resume Analyzer'),
      message: volunteerProfile 
        ? t('pages:h2acDashboard.msgProfileComplete', 'Profile analysis complete - 12 key skills identified for matching')
        : t('pages:h2acDashboard.msgReadyToAnalyze', 'Ready to analyze your resume. Start Talent Match to begin!'),
      priority: volunteerProfile ? "medium" : "low",
      timestamp: t('pages:h2acDashboard.justNow', 'Just now'),
      status: volunteerProfile ? t('pages:h2acDashboard.statusResolved', 'resolved') : t('pages:h2acDashboard.statusNew', 'new')
    },
    {
      agentType: t('pages:h2acDashboard.agentRoleMatcher', 'Role Matcher'),
      message: t('pages:h2acDashboard.msgOpportunitiesMatch', '5 volunteer opportunities match your skill profile - review recommended'),
      priority: "high",
      timestamp: t('pages:h2acDashboard.fiveMinAgo', '5 min ago'),
      status: t('pages:h2acDashboard.statusNew', 'new')
    },
    {
      agentType: t('pages:h2acDashboard.agentInterviewClarifier', 'Interview Clarifier'),
      message: t('pages:h2acDashboard.msgReadyForInterview', 'Ready to conduct follow-up interview for better skill understanding'),
      priority: "medium",
      timestamp: t('pages:h2acDashboard.tenMinAgo', '10 min ago'),
      status: t('pages:h2acDashboard.statusAcknowledged', 'acknowledged')
    }
  ];

  const agentCategories = [
    { category: t('pages:h2acDashboard.categoryTalentMatch', 'Talent Match Agents'), count: 4, active: volunteerProfile ? 4 : 1, healthScore: 100 },
    { category: t('pages:h2acDashboard.categoryAlgorithm', 'Algorithm Agents'), count: 50, active: 50, healthScore: 98 },
    { category: t('pages:h2acDashboard.categoryPage', 'Page Agents'), count: 50, active: 48, healthScore: 96 },
    { category: t('pages:h2acDashboard.categoryLifeCEO', 'Life CEO Agents'), count: 16, active: 16, healthScore: 100 },
    { category: t('pages:h2acDashboard.categoryMrBlue', 'Mr Blue AI Agents'), count: 8, active: 8, healthScore: 100 }
  ];

  const matchedOpportunities = volunteerMatches || [];

  return (
    <SelfHealingErrorBoundary pageName={t('pages:h2acDashboard.pageName', 'Volunteer Dashboard')} fallbackRoute="/feed">
      <PageLayout title={t('pages:h2acDashboard.title', 'Volunteer Dashboard')} showBreadcrumbs>
        <SEO
          title={t('pages:h2acDashboard.seoTitle', 'Volunteer Dashboard - Mundo Tango')}
          description={t('pages:h2acDashboard.seoDescription', 'Your volunteer dashboard for talent matching, task assignments, and AI agent collaboration.')}
        />

        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
          <div className="container mx-auto max-w-7xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{t('pages:h2acDashboard.heading', 'Volunteer Dashboard')}</h2>
                    <p className="text-muted-foreground">{t('pages:h2acDashboard.subheading', 'Track your volunteer opportunities and AI-matched assignments')}</p>
                  </div>
                </div>
                
                {!volunteerProfile && (
                  <Link href="/talent-match">
                    <Button className="gap-2" data-testid="button-start-talent-match">
                      <Brain className="h-4 w-4" />
                      {t('pages:h2acDashboard.startTalentMatch', 'Start Talent Match')}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>

            {/* Talent Match CTA Banner (if not matched) */}
            {!volunteerProfile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <Card className="bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 border-primary/30">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                          <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{t('pages:h2acDashboard.activateTeam', 'Activate Your AI Agent Team')}</h3>
                          <p className="text-muted-foreground">
                            {t('pages:h2acDashboard.activateDescription', 'Complete Talent Match to unlock personalized agent assignments and opportunities')}
                          </p>
                        </div>
                      </div>
                      <Link href="/talent-match">
                        <Button size="lg" className="gap-2" data-testid="button-activate-agents">
                          <Brain className="h-5 w-5" />
                          {t('pages:h2acDashboard.beginTalentMatch', 'Begin Talent Match')}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-4 mb-8">
              {metrics.map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="glass-card hover-elevate">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <metric.icon className={`h-8 w-8 ${metric.color}`} />
                        <span className="text-xs text-green-500 font-medium">{metric.change}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                <TabsTrigger value="overview" data-testid="tab-overview">{t('pages:h2acDashboard.tabOverview', 'Overview')}</TabsTrigger>
                <TabsTrigger value="talent-agents" data-testid="tab-talent-agents">{t('pages:h2acDashboard.tabTalentAgents', 'Talent Agents')}</TabsTrigger>
                <TabsTrigger value="opportunities" data-testid="tab-opportunities">{t('pages:h2acDashboard.tabOpportunities', 'Opportunities')}</TabsTrigger>
                <TabsTrigger value="communications" data-testid="tab-communications">{t('pages:h2acDashboard.tabCommunications', 'Communications')}</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Recent Communications */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        {t('pages:h2acDashboard.recentCommunications', 'Recent Agent Communications')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {recentCommunications.map((comm, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border ${
                            comm.priority === "critical" ? "bg-red-500/5 border-red-500/20"
                            : comm.priority === "high" ? "bg-orange-500/5 border-orange-500/20"
                            : comm.priority === "medium" ? "bg-blue-500/5 border-blue-500/20"
                            : "bg-gray-500/5 border-gray-500/20"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Bot className="h-4 w-4 text-blue-500" />
                              <span className="font-semibold text-sm">{comm.agentType}</span>
                            </div>
                            <Badge variant="outline" className={`text-xs ${
                              comm.priority === "critical" ? "border-red-500 text-red-500"
                              : comm.priority === "high" ? "border-orange-500 text-orange-500"
                              : comm.priority === "medium" ? "border-blue-500 text-blue-500"
                              : "border-gray-500 text-gray-500"
                            }`}>
                              {comm.priority}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">{comm.message}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{comm.timestamp}</span>
                            <Badge variant="secondary" className="text-xs">
                              {comm.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      <Button className="w-full" variant="outline" data-testid="button-view-all-communications">
                        {t('pages:h2acDashboard.viewAllCommunications', 'View All Communications')}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Agent Categories */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-blue-500" />
                        {t('pages:h2acDashboard.agentCategories', 'Agent Categories')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {agentCategories.map((category, idx) => (
                        <div key={idx} className="p-4 rounded-lg border bg-muted/50 hover-elevate">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{category.category}</h3>
                            <span className="text-sm font-bold text-green-500">{category.healthScore}%</span>
                          </div>
                          <div className="flex gap-6 text-sm text-muted-foreground">
                            <span>{t('pages:h2acDashboard.total', 'Total')}: {category.count}</span>
                            <span>•</span>
                            <span>{t('pages:h2acDashboard.active', 'Active')}: {category.active}</span>
                          </div>
                          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 transition-all"
                              style={{ width: `${category.healthScore}%` }} 
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Talent Agents Tab */}
              <TabsContent value="talent-agents" className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      {t('pages:h2acDashboard.talentMatchAgents', 'Your Talent Match Agents')}
                    </CardTitle>
                    <CardDescription>
                      {t('pages:h2acDashboard.talentMatchDescription', 'AI agents assigned to help you find the perfect volunteer role')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {talentMatchAgents.map((agent, idx) => (
                        <motion.div
                          key={agent.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Card className={`hover-elevate ${
                            agent.status === "active" ? "border-green-500/30 bg-green-500/5"
                            : agent.status === "ready" ? "border-blue-500/30 bg-blue-500/5"
                            : "border-gray-500/30 bg-gray-500/5"
                          }`}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                    agent.status === "active" ? "bg-green-500/20"
                                    : agent.status === "ready" ? "bg-blue-500/20"
                                    : "bg-gray-500/20"
                                  }`}>
                                    <Bot className={`h-5 w-5 ${
                                      agent.status === "active" ? "text-green-500"
                                      : agent.status === "ready" ? "text-blue-500"
                                      : "text-gray-500"
                                    }`} />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{agent.name}</h4>
                                    <p className="text-xs text-muted-foreground">{agent.role}</p>
                                  </div>
                                </div>
                                <Badge variant={
                                  agent.status === "active" ? "default"
                                  : agent.status === "ready" ? "secondary"
                                  : "outline"
                                } className={
                                  agent.status === "active" ? "bg-green-500"
                                  : agent.status === "ready" ? "bg-blue-500"
                                  : ""
                                }>
                                  {agent.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{agent.description}</p>
                              {agent.status === "active" && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                                  <Activity className="h-3 w-3" />
                                  <span>{t('pages:h2acDashboard.processingProfile', 'Currently processing your profile')}</span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                    
                    {!volunteerProfile && (
                      <div className="mt-6 text-center">
                        <Link href="/talent-match">
                          <Button className="gap-2" data-testid="button-activate-talent-agents">
                            <Zap className="h-4 w-4" />
                            {t('pages:h2acDashboard.activateTalentAgents', 'Activate Talent Agents')}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Opportunities Tab */}
              <TabsContent value="opportunities" className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      {t('pages:h2acDashboard.matchedOpportunities', 'Matched Opportunities')}
                    </CardTitle>
                    <CardDescription>
                      {t('pages:h2acDashboard.matchedOpportunitiesDescription', 'Volunteer roles that match your skills and preferences')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {volunteerProfile ? (
                      <div className="space-y-4">
                        {matchedOpportunities.map((opp, idx) => (
                          <motion.div
                            key={opp.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <Card className="hover-elevate">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h4 className="font-semibold">{opp.title}</h4>
                                      <Badge variant="outline" className="border-green-500 text-green-600">
                                        {t('pages:h2acDashboard.matchPercent', '{{score}}% Match', { score: opp.matchScore })}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">{t('pages:h2acDashboard.team', 'Team')}: {opp.team}</p>
                                    <div className="flex flex-wrap gap-2">
                                      {opp.skills.map((skill, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <Button size="sm" className="gap-2" data-testid={`button-apply-${opp.id}`}>
                                    {t('pages:h2acDashboard.apply', 'Apply')}
                                    <ArrowRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                          <Target className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{t('pages:h2acDashboard.noMatchesYet', 'No Matches Yet')}</h3>
                        <p className="text-muted-foreground mb-4">
                          {t('pages:h2acDashboard.noMatchesDescription', 'Complete Talent Match to discover opportunities that fit your skills')}
                        </p>
                        <Link href="/talent-match">
                          <Button className="gap-2" data-testid="button-start-matching">
                            <Brain className="h-4 w-4" />
                            {t('pages:h2acDashboard.startTalentMatch', 'Start Talent Match')}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Communications Tab */}
              <TabsContent value="communications" className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      {t('pages:h2acDashboard.allCommunications', 'All Agent Communications')}
                    </CardTitle>
                    <CardDescription>
                      {t('pages:h2acDashboard.allCommunicationsDescription', 'Full history of communications from your assigned agents')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[...recentCommunications, ...recentCommunications].map((comm, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border transition-all hover-elevate ${
                          comm.priority === "critical" ? "bg-red-500/5 border-red-500/20"
                          : comm.priority === "high" ? "bg-orange-500/5 border-orange-500/20"
                          : comm.priority === "medium" ? "bg-blue-500/5 border-blue-500/20"
                          : "bg-gray-500/5 border-gray-500/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold text-sm">{comm.agentType}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${
                              comm.priority === "critical" ? "border-red-500 text-red-500"
                              : comm.priority === "high" ? "border-orange-500 text-orange-500"
                              : comm.priority === "medium" ? "border-blue-500 text-blue-500"
                              : "border-gray-500 text-gray-500"
                            }`}>
                              {comm.priority}
                            </Badge>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm mb-2">{comm.message}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{comm.timestamp}</span>
                          <Badge variant="secondary" className="text-xs">
                            {comm.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
