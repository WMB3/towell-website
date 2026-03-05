import { OpenAI } from 'openai';
import { buildSystemPrompt, retrieveRelevantContext } from '../server/heritageKnowledge.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, language = 'en', conversationHistory = [] } = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        reply: 'Missing OPENAI_API_KEY environment variable.',
        sources: [],
        relatedEvents: [],
        error: 'Configuration error'
      });
    }

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const { context, events, sources } = retrieveRelevantContext(message, language);
    const systemPrompt = buildSystemPrompt(language, context);

    const historyMessages = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-4).map((msg) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: String(msg.content || '')
        }))
      : [];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...historyMessages,
        { role: 'user', content: String(message) }
      ],
      temperature: 0.7,
      max_tokens: 220,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const reply = completion.choices?.[0]?.message?.content;

    return res.status(200).json({
      reply: reply || 'I could not generate a response at this time.',
      sources,
      relatedEvents: events,
      language
    });
  } catch (error) {
    console.error('Heritage API Error:', error);

    const isArabic = req.body?.language === 'ar';
    return res.status(500).json({
      reply: isArabic
        ? 'عذراً، أواجه مشكلة تقنية. يرجى المحاولة مرة أخرى أو التواصل مع info@wjtowell.com'
        : "I apologize, I'm experiencing technical difficulties. Please try again or contact info@wjtowell.com",
      sources: [],
      relatedEvents: [],
      error: 'Internal server error'
    });
  }
}
