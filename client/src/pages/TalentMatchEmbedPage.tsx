import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { TalentMatchExperience } from "@/components/TalentMatchExperience";

export default function TalentMatchEmbedPage() {
  return (
    <SelfHealingErrorBoundary pageName="Talent Match Embed" fallbackRoute="/register">
      <SEO
        title="AI Talent Match - Mundo Tango"
        description="Let AI match your skills with perfect volunteer opportunities at Mundo Tango. Our intelligent matching system finds the ideal role for your talents."
      />
      
      <div className="min-h-screen bg-background py-8 px-6">
        <div className="container mx-auto max-w-4xl">
          <TalentMatchExperience 
            mode="authenticated" 
            showHero={true}
            showBackLink={false}
          />
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
