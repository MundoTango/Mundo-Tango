import { MrBlueChatComponent } from '../components/MrBlue/ChatComponent';

export function MrBluePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Mr Blue AI Assistant</h1>
      <MrBlueChatComponent />
    </div>
  );
}

export default MrBluePage;
