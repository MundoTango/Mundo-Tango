import { MrBlueInternalExecutor } from '../services/mrBlue/MrBlueInternalExecutor';

async function triggerMrBlue() {
  const executor = new MrBlueInternalExecutor();
  
  console.log('\n🔵 [Mr Blue] Starting Pattern 101 Task: Fix ContactForm API path\n');
  
  const result = await executor.executeTask({
    bugId: 'p101-fix-contactform',
    description: 'Fix ContactForm.tsx to use correct API path /api/pro/contact',
    targetFiles: ['client/src/components/pro/ContactForm.tsx'],
    fixPlan: `Update ContactForm.tsx:
      1. Change the form submission to POST to '/api/pro/contact' using apiRequest
      2. Ensure the mutation uses apiRequest properly (method, path, data)
      3. Import apiRequest from '@/lib/queryClient'
      4. Add success toast when form is submitted
      5. Reset form after successful submission`,
    context: [
      'The contact endpoint is at /api/pro/contact (POST)',
      'apiRequest signature: apiRequest(method: string, path: string, body?: any)',
      'Use useToast for notifications: const { toast } = useToast()',
      'Call onSuccess callback after successful submission'
    ],
  });
  
  console.log('\n🔵 [Mr Blue] Task Result:', JSON.stringify(result, null, 2));
  return result;
}

triggerMrBlue().catch(console.error);
