import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Heart, ArrowLeft, ExternalLink, Users, Globe, Clock, DollarSign } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { GoFundMeEmbed } from "@/components/marketing/GoFundMeEmbed";
import { useQuery } from "@tanstack/react-query";

// Type-safe motion components for React 19 compatibility
const MotionDiv = motion.div as any;

export default function DonatePage() {
  const { t } = useTranslation(["pages", "common"]);
  const { data: publicStats } = useQuery<{
    platformStats: {
      hoursInvested: number;
      amountInvested: number;
      yearsOfDancing: number;
      cities: number;
      countries: number;
    };
  }>({
    queryKey: ["/api/stats/public"],
  });

  return (
    <PublicLayout>
      <SEO
        title={t('pages:donate.seo.title', 'Support Mundo Tango - GoFundMe')}
        description={t('pages:donate.seo.description', 'Support the global tango community through our GoFundMe campaign. Your donation helps us connect dancers worldwide and preserve the art of Argentine tango.')}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <Link href="/support">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('pages:donate.backToSupport', 'Back to Support')}
            </Button>
          </Link>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4">
                <Heart className="w-3 h-3 mr-1" />
                {t('pages:donate.badge', 'Support Mundo Tango')}
              </Badge>
              <h1 className="text-4xl font-serif font-bold mb-4" data-testid="heading-donate">
                {t('pages:donate.hero.title', 'Support Our Mission')}
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('pages:donate.hero.subtitle', 'Your support helps us connect dancers worldwide and preserve the beautiful art of Argentine tango.')}
              </p>
            </div>

            <div className="flex justify-center">
              <GoFundMeEmbed showCard={false} />
            </div>

            <Card>
              <CardHeader className="text-center">
                <CardTitle>{t('pages:donate.why.title', 'Why Support Mundo Tango?')}</CardTitle>
                <CardDescription>
                  {t('pages:donate.why.subtitle', 'Built by a dancer, for dancers')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{(publicStats?.platformStats?.hoursInvested || 3000).toLocaleString()}+</div>
                    <div className="text-sm text-muted-foreground">{t('pages:donate.stats.hours', 'Hours Invested')}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">${((publicStats?.platformStats?.amountInvested || 30000) / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-muted-foreground">{t('pages:donate.stats.selfFunded', 'Self-Funded')}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <Globe className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{publicStats?.platformStats?.cities || 79}</div>
                    <div className="text-sm text-muted-foreground">{t('pages:donate.stats.cities', 'Cities Visited')}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{publicStats?.platformStats?.yearsOfDancing || 18}</div>
                    <div className="text-sm text-muted-foreground">{t('pages:donate.stats.yearsDancing', 'Years Dancing')}</div>
                  </div>
                </div>
                <p className="text-muted-foreground text-center">
                  {t('pages:donate.why.description', 'Scott has invested thousands of hours and his own savings to build Mundo Tango. Your contribution helps cover server costs, AI services, and continued development to serve dancers worldwide.')}
                </p>
              </CardContent>
            </Card>

            <div className="text-center space-y-4">
              <a 
                href="https://www.gofundme.com/f/join-us-in-bringing-mundo-tango-to-life" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="lg" className="ocean-gradient text-white" data-testid="button-gofundme-external">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  {t('pages:donate.cta.gofundme', 'View Full Campaign on GoFundMe')}
                </Button>
              </a>
              <p className="text-sm text-muted-foreground">
                {t('pages:donate.footer.security', 'All donations are processed securely through GoFundMe')}
              </p>
            </div>
          </MotionDiv>
        </div>
      </div>
    </PublicLayout>
  );
}
