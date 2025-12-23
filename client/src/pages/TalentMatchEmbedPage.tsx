import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { TalentMatchExperience } from "@/components/TalentMatchExperience";

export default function TalentMatchEmbedPage() {
  const { t } = useTranslation(["pages", "common"]);
  const handleClose = () => {
    // Navigate parent window to marketing home page
    if (window.parent !== window) {
      window.parent.location.href = "/";
    } else {
      window.location.href = "/";
    }
  };

  return (
    <SelfHealingErrorBoundary pageName="Talent Match Embed" fallbackRoute="/register">
      <SEO
        title={t('pages:talentMatchEmbed.seoTitle', 'AI Talent Match - Mundo Tango')}
        description={t('pages:talentMatchEmbed.seoDescription', 'Let AI match your skills with perfect volunteer opportunities at Mundo Tango. Our intelligent matching system finds the ideal role for your talents.')}
      />
      
      <div className="min-h-screen bg-background py-8 px-6">
        <div className="container mx-auto max-w-4xl">
          <TalentMatchExperience 
            mode="guest" 
            showHero={true}
            showBackLink={false}
            onClose={handleClose}
          />
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
