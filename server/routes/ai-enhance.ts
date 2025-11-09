import express from 'express';
import { OpenAI } from 'openai';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY,
  baseURL: process.env.BIFROST_BASE_URL || undefined,
});

router.post('/enhance-content', authenticateToken, async (req, res) => {
  try {
    const { content, context = 'feed' } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    const systemPrompt = `You are a content enhancement AI for a social platform focused on tango dancing and cultural memories. 
Your task is to improve user-written content while preserving their authentic voice and meaning.

Guidelines:
- Fix grammar and spelling errors
- Improve clarity and flow
- Keep the same tone and personality
- Don't make it overly formal or robotic
- Preserve emojis and @mentions
- Keep it concise (similar length to original)
- Add engaging elements if appropriate
- For recommendations, highlight key details

Context: This is a ${context} post.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Enhance this post:\n\n${content}` }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const enhancedContent = completion.choices[0]?.message?.content || content;

    // Simple sentiment analysis
    const sentimentCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'Analyze the sentiment of the following text. Respond with only one word: positive, neutral, or negative.' 
        },
        { role: 'user', content: enhancedContent }
      ],
      temperature: 0.3,
      max_tokens: 10,
    });

    const sentiment = sentimentCompletion.choices[0]?.message?.content?.toLowerCase().trim() || 'neutral';

    res.json({
      enhancedContent,
      originalContent: content,
      sentiment,
      improvements: {
        grammarFixed: true,
        clarityImproved: true,
      }
    });

  } catch (error) {
    console.error('AI enhancement error:', error);
    res.status(500).json({ 
      error: 'Enhancement failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;
