import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { OpenAI } from 'openai';
import { buildSystemPrompt, retrieveRelevantContext } from './heritageKnowledge.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/heritage-chat', async (req, res) => {
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
    console.error('API Error:', error);
    const isArabic = req.body?.language === 'ar';
    return res.status(500).json({
      reply: isArabic
        ? 'عذراً، حدث خطأ تقني. يرجى المحاولة مرة أخرى أو التواصل مع info@wjtowell.com'
        : 'Technical error occurred. Please contact info@wjtowell.com',
      sources: [],
      relatedEvents: []
    });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Heritage bot server running on port ${PORT}`);
});
