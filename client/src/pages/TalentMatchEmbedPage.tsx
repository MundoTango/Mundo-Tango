import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { TalentMatchExperience } from "@/components/TalentMatchExperience";
import { useLocation } from "wouter";

export default function TalentMatchEmbedPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [location] = useLocation();
  
  // Parse query params for initial data
  const params = new URLSearchParams(window.location.search);
  const initialName = params.get("name") || undefined;
  const initialEmail = params.get("email") || undefined;
  const mode = (params.get("mode") as "authenticated" | "guest") || "guest";

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
            mode={mode}
            initialName={initialName}
            initialEmail={initialEmail}
            showHero={true}
            showBackLink={false}
            onClose={handleClose}
          />
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
