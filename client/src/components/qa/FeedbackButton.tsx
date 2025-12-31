import { useMrBlue } from '@/contexts/MrBlueContext';

/**
 * FeedbackButton - Opens Mr. Blue chat for QA assistance
 * The actual QA system (Help/Features/Bug Report) is now integrated
 * directly into the Mr. Blue chat interface with journey tracking
 */
export function FeedbackButton() {
  const { openChat } = useMrBlue();

  return null;
}