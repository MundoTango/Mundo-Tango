import { useTranslation } from "react-i18next";
import { MrBlueChatComponent } from '../components/mrBlue/core/ChatComponent';

export function MrBluePage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{t('pages:mrBlue.title', 'Mr Blue AI Assistant')}</h1>
      <MrBlueChatComponent />
    </div>
  );
}

export default MrBluePage;
