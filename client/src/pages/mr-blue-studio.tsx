import { useTranslation } from "react-i18next";
import { MrBlueStudio } from '@/components/mrBlue/advanced/MrBlueStudio';
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';

export default function MrBlueStudioPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <SelfHealingErrorBoundary pageName={t('pages:mrBlueStudio.pageName', 'Mr Blue Studio')} fallbackRoute="/dashboard">
      <MrBlueStudio />
    </SelfHealingErrorBoundary>
  );
}
