import { MrBlueStudio } from '@/components/mr-blue/MrBlueStudio';
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';

export default function MrBlueStudioPage() {
  return (
    <SelfHealingErrorBoundary pageName="Mr Blue Studio" fallbackRoute="/dashboard">
      <MrBlueStudio />
    </SelfHealingErrorBoundary>
  );
}
