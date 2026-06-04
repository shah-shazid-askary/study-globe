const express = require('express');
const router = express.Router();
const { ollama, fetchContext, buildContextString } = require('../utils/ragHelper');
const { authenticateUser } = require('../middleware/auth');


// ─── POST /api/chat ───────────────────────────────────────────────────────────
router.post('/', authenticateUser, async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
  if (!lastUserMessage) {
    return res.status(400).json({ error: 'No user message found' });
  }

  try {
    // Step 1: Read real-time DB data as Context
    const context = await fetchContext(lastUserMessage.content);
    const contextStr = buildContextString(context);

    console.log(`[Chat] Using Real-Time Supabase Context | User: "${lastUserMessage.content.slice(0, 60)}"`);

    // Step 2: Build conversation history for Ollama
    const rawHistory = messages.slice(0, -1);
    const history = [];
    for (const m of rawHistory) {
      const role = m.role === 'assistant' ? 'assistant' : 'user';
      history.push({ role, content: m.content });
    }

    // Step 3: Call Ollama with local Database context
    const systemPrompt = `You are StudyGlobe Assistant, a helpful AI advisor for international students looking to study abroad.

You are securely connected directly to the central PostgreSQL/Supabase database in real-time.
You MUST use the database records provided below to answer questions. 
Do NOT invent universities or search the web.
If the real-time data does not contain the answer, say "I don't have that information in my database".

${contextStr}

Instructions:
- Provide ALL information and data points that match the user's query from the database records! Do not just give a single answer. Extract all relevant schools, programs, scholarships, etc., and present them comprehensively.
- Format lists clearly using bullet points or tables where appropriate.
- Mention specific universities and locations exactly as written in the database.`;

    const ollamaMessages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: lastUserMessage.content }
    ];

    const response = await ollama.chat({
      model: process.env.OLLAMA_MODEL || 'gemma4:31b',
      messages: ollamaMessages,
    });

    const reply = response.message.content;
    console.log(`[Chat] Reply: "${reply.slice(0, 80)}..."`);
    res.json({ reply });

  } catch (err) {
    console.error('[Chat] Error:', err?.message || err);
    const detail = err?.message || 'Unknown error';

    if (detail.includes('429') || detail.includes('quota') || detail.includes('rate')) {
      return res.status(429).json({
        error: 'The AI assistant is busy right now. Please wait a moment and try again.',
      });
    }
    
    if (detail.includes('<!DOCTYPE html>') || detail.includes('524') || detail.includes('timeout')) {
      return res.status(504).json({
        error: 'The cloud AI provider timed out while thinking. Please wait a moment and try again.',
      });
    }

    res.status(500).json({ error: `AI assistant error: ${detail.slice(0, 200)}...` });
  }
});

module.exports = router;
