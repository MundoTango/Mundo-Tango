import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Hand, Music, Users, Heart, AlertCircle } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";

export default function TangoEtiquettePage() {
  const { t } = useTranslation(["pages", "common"]);

  const rules = [
    {
      icon: Eye,
      title: t('pages:tangoEtiquette.rule1Title', 'The Cabeceo'),
      description: t('pages:tangoEtiquette.rule1Desc', 'Use eye contact to invite someone to dance. This respectful system allows both parties to decline gracefully without awkwardness.'),
      dos: [
        t('pages:tangoEtiquette.rule1Do1', 'Make eye contact from your table'),
        t('pages:tangoEtiquette.rule1Do2', 'Wait for a clear nod of acceptance'),
        t('pages:tangoEtiquette.rule1Do3', 'Walk to meet them on the floor')
      ],
      donts: [
        t('pages:tangoEtiquette.rule1Dont1', 'Walk up and verbally ask'),
        t('pages:tangoEtiquette.rule1Dont2', 'Interrupt someone mid-conversation'),
        t('pages:tangoEtiquette.rule1Dont3', "Take silence as a 'yes'")
      ]
    },
    {
      icon: Users,
      title: t('pages:tangoEtiquette.rule2Title', 'Respecting the Ronda'),
      description: t('pages:tangoEtiquette.rule2Desc', 'The ronda is the counterclockwise line of dance. Maintaining proper spacing and flow ensures everyone enjoys the milonga.'),
      dos: [
        t('pages:tangoEtiquette.rule2Do1', 'Move counterclockwise around the floor'),
        t('pages:tangoEtiquette.rule2Do2', 'Maintain consistent spacing'),
        t('pages:tangoEtiquette.rule2Do3', 'Yield to couples in front')
      ],
      donts: [
        t('pages:tangoEtiquette.rule2Dont1', 'Pass other couples'),
        t('pages:tangoEtiquette.rule2Dont2', 'Stop abruptly in the line'),
        t('pages:tangoEtiquette.rule2Dont3', 'Dance in the center')
      ]
    },
    {
      icon: Music,
      title: t('pages:tangoEtiquette.rule3Title', 'Tandas and Cortinas'),
      description: t('pages:tangoEtiquette.rule3Desc', 'Dances are organized in tandas (sets of 3-4 songs) separated by cortinas (musical breaks). This structure helps manage invitations and energy.'),
      dos: [
        t('pages:tangoEtiquette.rule3Do1', 'Dance the full tanda with your partner'),
        t('pages:tangoEtiquette.rule3Do2', 'Thank your partner after the tanda'),
        t('pages:tangoEtiquette.rule3Do3', 'Return to your table during cortinas')
      ],
      donts: [
        t('pages:tangoEtiquette.rule3Dont1', 'Leave mid-tanda without good reason'),
        t('pages:tangoEtiquette.rule3Dont2', 'Invite during a cortina'),
        t('pages:tangoEtiquette.rule3Dont3', 'Expect multiple tandas in a row')
      ]
    },
    {
      icon: Hand,
      title: t('pages:tangoEtiquette.rule4Title', 'Personal Hygiene'),
      description: t('pages:tangoEtiquette.rule4Desc', 'Close embrace requires attention to cleanliness and comfort for both partners.'),
      dos: [
        t('pages:tangoEtiquette.rule4Do1', 'Arrive freshly showered'),
        t('pages:tangoEtiquette.rule4Do2', 'Bring a change of shirt'),
        t('pages:tangoEtiquette.rule4Do3', 'Use deodorant (not cologne)')
      ],
      donts: [
        t('pages:tangoEtiquette.rule4Dont1', 'Dance in sweaty clothes'),
        t('pages:tangoEtiquette.rule4Dont2', 'Wear strong perfumes'),
        t('pages:tangoEtiquette.rule4Dont3', 'Skip personal hygiene')
      ]
    },
    {
      icon: Heart,
      title: t('pages:tangoEtiquette.rule5Title', 'Floor Etiquette'),
      description: t('pages:tangoEtiquette.rule5Desc', 'Mutual respect creates a safe, enjoyable environment for all dancers.'),
      dos: [
        t('pages:tangoEtiquette.rule5Do1', 'Focus on your partner'),
        t('pages:tangoEtiquette.rule5Do2', 'Apologize for collisions'),
        t('pages:tangoEtiquette.rule5Do3', 'Welcome all skill levels')
      ],
      donts: [
        t('pages:tangoEtiquette.rule5Dont1', 'Teach on the dance floor'),
        t('pages:tangoEtiquette.rule5Dont2', 'Criticize your partner'),
        t('pages:tangoEtiquette.rule5Dont3', 'Show off with large moves')
      ]
    },
    {
      icon: AlertCircle,
      title: t('pages:tangoEtiquette.rule6Title', 'Declining Invitations'),
      description: t('pages:tangoEtiquette.rule6Desc', "It's always okay to say no—but do so politely and considerately."),
      dos: [
        t('pages:tangoEtiquette.rule6Do1', 'Decline with a subtle head shake'),
        t('pages:tangoEtiquette.rule6Do2', 'If declining, sit out that tanda'),
        t('pages:tangoEtiquette.rule6Do3', 'Be honest if you need a break')
      ],
      donts: [
        t('pages:tangoEtiquette.rule6Dont1', 'Accept one person, decline another same tanda'),
        t('pages:tangoEtiquette.rule6Dont2', 'Make excuses publicly'),
        t('pages:tangoEtiquette.rule6Dont3', 'Take it personally if declined')
      ]
    }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Tango Etiquette" fallbackRoute="/">
      <PageLayout title={t('pages:tangoEtiquette.pageTitle', 'Tango Etiquette')} showBreadcrumbs>
        <PublicLayout>
          <SEO
            title={t('pages:tangoEtiquette.seoTitle', 'Tango Etiquette - Mundo Tango')}
            description={t('pages:tangoEtiquette.seoDescription', 'Learn essential tango etiquette and milonga codes. Master the cabeceo, understand tandas and cortinas, and navigate the social dance floor with confidence and respect.')}
          />
          
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1445384763658-0400939829cd?w=1600&h=900&fit=crop')`
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
                  {t('pages:tangoEtiquette.badge', 'Etiquette')}
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  {t('pages:tangoEtiquette.heroTitle', 'Tango Etiquette')}
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-subtitle">
                  {t('pages:tangoEtiquette.heroSubtitle', 'Navigate the milonga with confidence and respect')}
                </p>
              </motion.div>
            </div>
          </div>
        
          <div className="bg-background py-12 px-4">
            <div className="container mx-auto max-w-4xl space-y-12">

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-3xl mx-auto"
              >
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                  {t('pages:tangoEtiquette.whyMattersTitle', 'Why Etiquette Matters')}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t('pages:tangoEtiquette.whyMattersDesc', "Tango etiquette isn't about rules for rules' sake—it's a system that creates safe, respectful spaces where everyone can enjoy the dance. These codes have evolved over decades to ensure harmonious milongas.")}
                </p>
              </motion.div>

              <div className="space-y-8">
                {rules.map((rule, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                  >
                    <Card className="hover-elevate" data-testid={`card-rule-${idx}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl font-serif">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <rule.icon className="h-6 w-6 text-primary" />
                          </div>
                          {rule.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed">
                          {rule.description}
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <Heart className="h-4 w-4 text-green-500" />
                              {t('pages:tangoEtiquette.do', 'Do')}
                            </h4>
                            <ul className="space-y-1">
                              {rule.dos.map((item, itemIdx) => (
                                <li key={itemIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-green-500 mt-1">✓</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              {t('pages:tangoEtiquette.dont', "Don't")}
                            </h4>
                            <ul className="space-y-1">
                              {rule.donts.map((item, itemIdx) => (
                                <li key={itemIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-red-500 mt-1">✗</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
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
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" data-testid="card-remember">
                  <CardHeader>
                    <CardTitle className="text-3xl font-serif">{t('pages:tangoEtiquette.rememberTitle', 'Remember')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                      {t('pages:tangoEtiquette.rememberP1', 'Every community may have slight variations in etiquette. When visiting a new milonga, observe and ask questions. Most dancers are happy to help newcomers understand local customs.')}
                    </p>
                    <p>
                      {t('pages:tangoEtiquette.rememberP2', "The golden rule: Be respectful, considerate, and present. Focus on connection rather than perfection, and you'll always be welcome on the dance floor.")}
                    </p>
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
