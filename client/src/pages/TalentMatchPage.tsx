import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { TalentMatchExperience } from "@/components/TalentMatchExperience";

export default function TalentMatchPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <SelfHealingErrorBoundary pageName="Talent Match" fallbackRoute="/platform">
      <PageLayout title="AI Talent Match" showBreadcrumbs>
        <SEO
          title="AI Talent Match - Mundo Tango"
          description="Let AI match your skills with perfect volunteer opportunities at Mundo Tango. Our intelligent matching system finds the ideal role for your talents."
        />
        
        <div className="bg-background py-8 px-6">
          <div className="container mx-auto max-w-4xl">
            <TalentMatchExperience 
              mode="authenticated" 
              showHero={true}
              showBackLink={true}
            />
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
