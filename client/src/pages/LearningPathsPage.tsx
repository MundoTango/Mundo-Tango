import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, TrendingUp, Award } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

const getPaths = (t: any) => [
  {
    level: t('pages:learningPaths.beginner', 'Beginner'),
    icon: BookOpen,
    duration: t('pages:learningPaths.beginnerDuration', '0-6 months'),
    description: t('pages:learningPaths.beginnerDescription', 'Your first steps in tango. Learn the fundamentals of embrace, walk, and basic musicality.'),
    milestones: [
      t('pages:learningPaths.beginnerMilestone1', 'Master the tango walk and posture'),
      t('pages:learningPaths.beginnerMilestone2', 'Learn basic ochos and turns'),
      t('pages:learningPaths.beginnerMilestone3', 'Understand tango music structure'),
      t('pages:learningPaths.beginnerMilestone4', 'Attend your first milonga'),
      t('pages:learningPaths.beginnerMilestone5', 'Dance a complete tanda comfortably')
    ],
    resources: [
      { label: t('pages:learningPaths.findBeginnerClasses', 'Find Beginner Classes'), href: "/teachers?level=beginner" },
      { label: t('pages:learningPaths.videoLessonsBeginners', 'Video Lessons for Beginners'), href: "/video-lessons?level=beginner" }
    ]
  },
  {
    level: t('pages:learningPaths.intermediate', 'Intermediate'),
    icon: Target,
    duration: t('pages:learningPaths.intermediateDuration', '6-18 months'),
    description: t('pages:learningPaths.intermediateDescription', 'Deepen your connection and expand your vocabulary. Develop musicality and navigation skills.'),
    milestones: [
      t('pages:learningPaths.intermediateMilestone1', 'Develop smooth, connected walking'),
      t('pages:learningPaths.intermediateMilestone2', 'Master sacadas and barridas'),
      t('pages:learningPaths.intermediateMilestone3', 'Dance comfortably in close embrace'),
      t('pages:learningPaths.intermediateMilestone4', 'Interpret different orchestras'),
      t('pages:learningPaths.intermediateMilestone5', 'Navigate crowded milongas confidently')
    ],
    resources: [
      { label: t('pages:learningPaths.intermediateClasses', 'Intermediate Classes'), href: "/teachers?level=intermediate" },
      { label: t('pages:learningPaths.advancedVideoContent', 'Advanced Video Content'), href: "/video-lessons?level=intermediate" }
    ]
  },
  {
    level: t('pages:learningPaths.advanced', 'Advanced'),
    icon: TrendingUp,
    duration: t('pages:learningPaths.advancedDuration', '18+ months'),
    description: t('pages:learningPaths.advancedDescription', 'Refine your technique and develop your unique style. Focus on deep musical interpretation.'),
    milestones: [
      t('pages:learningPaths.advancedMilestone1', 'Develop personal dance style'),
      t('pages:learningPaths.advancedMilestone2', 'Master complex musical interpretation'),
      t('pages:learningPaths.advancedMilestone3', 'Lead/follow with subtle connection'),
      t('pages:learningPaths.advancedMilestone4', 'Teach or assist in classes'),
      t('pages:learningPaths.advancedMilestone5', 'Perform or compete (optional)')
    ],
    resources: [
      { label: t('pages:learningPaths.masterClasses', 'Master Classes'), href: "/workshops" },
      { label: t('pages:learningPaths.privateLessons', 'Private Lessons'), href: "/teachers?lessons=private" }
    ]
  },
  {
    level: t('pages:learningPaths.professional', 'Professional'),
    icon: Award,
    duration: t('pages:learningPaths.professionalDuration', '3+ years'),
    description: t('pages:learningPaths.professionalDescription', 'Share your knowledge and continue growing. Teaching, performing, and contributing to the community.'),
    milestones: [
      t('pages:learningPaths.professionalMilestone1', 'Develop teaching methodology'),
      t('pages:learningPaths.professionalMilestone2', 'Create performance choreography'),
      t('pages:learningPaths.professionalMilestone3', 'Mentor other dancers'),
      t('pages:learningPaths.professionalMilestone4', 'Travel to festivals as teacher/DJ'),
      t('pages:learningPaths.professionalMilestone5', 'Contribute to tango evolution')
    ],
    resources: [
      { label: t('pages:learningPaths.teacherResources', 'Teacher Resources'), href: "/user-guide#teachers" },
      { label: t('pages:learningPaths.listYourServices', 'List Your Services'), href: "/profile/edit" }
    ]
  }
];

export default function LearningPathsPage() {
  const { t } = useTranslation(["pages", "common"]);
  const paths = getPaths(t);
  return (
    <SelfHealingErrorBoundary pageName="Learning Paths" fallbackRoute="/">
      <PageLayout title={t('pages:learningPaths.title', 'Learning Paths')} showBreadcrumbs>
        <PublicLayout>
          <SEO
            title={t('pages:learningPaths.seoTitle', 'Learning Paths - Mundo Tango')}
            description={t('pages:learningPaths.seoDescription', 'Explore structured learning paths for every level of tango dancer. From complete beginner to professional, discover your roadmap to tango mastery.')}
          />
          
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&h=900&fit=crop')`
            }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  {t('pages:learningPaths.badgeTitle', 'Learning Paths')}
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  {t('pages:learningPaths.heroTitle', 'Your Tango Journey')}
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
                  {t('pages:learningPaths.heroSubtitle', 'Structured paths from beginner to professional')}
                </p>
              </motion.div>
            </div>
          </div>
        
          <div className="bg-background py-12 px-4">
            <div className="container mx-auto max-w-5xl space-y-12">

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-3xl mx-auto"
              >
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                  {t('pages:learningPaths.everyJourneyUnique', 'Every Journey is Unique')}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t('pages:learningPaths.everyJourneyDescription', 'These paths provide guidance, not strict rules. Your tango journey unfolds at your own pace, shaped by your goals, practice time, and passion for the dance.')}
                </p>
              </motion.div>

              <div className="space-y-8">
                {paths.map((path, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                  >
                    <Card className="hover-elevate" data-testid={`card-path-${idx}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-primary/10">
                              <path.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-2xl font-serif">{path.level}</CardTitle>
                              <Badge variant="outline">{path.duration}</Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <p className="text-muted-foreground leading-relaxed">
                          {path.description}
                        </p>
                        
                        <div>
                          <h4 className="font-semibold mb-3">{t('pages:learningPaths.keyMilestones', 'Key Milestones')}</h4>
                          <ul className="space-y-2">
                            {path.milestones.map((milestone, milestoneIdx) => (
                              <li key={milestoneIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Award className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{milestone}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex gap-3 flex-wrap pt-2">
                          {path.resources.map((resource, resourceIdx) => (
                            <Button
                              key={resourceIdx}
                              variant="outline"
                              size="sm"
                              asChild
                              data-testid={`button-resource-${idx}-${resourceIdx}`}
                            >
                              <a href={resource.href}>{resource.label}</a>
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" data-testid="card-cta">
                  <CardContent className="py-12 text-center">
                    <h3 className="text-3xl font-serif font-bold mb-3">{t('pages:learningPaths.readyToStart', 'Ready to Start Your Journey?')}</h3>
                    <p className="text-muted-foreground mb-6 text-lg max-w-lg mx-auto">
                      {t('pages:learningPaths.findPerfectTeacher', 'Find the perfect teacher or class to begin your tango adventure')}
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                      <Button size="lg" asChild data-testid="button-find-teachers">
                        <a href="/teachers">{t('pages:learningPaths.findTeachers', 'Find Teachers')}</a>
                      </Button>
                      <Button size="lg" variant="outline" asChild data-testid="button-browse-events">
                        <a href="/events">{t('pages:learningPaths.browseEvents', 'Browse Events')}</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </PublicLayout>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
