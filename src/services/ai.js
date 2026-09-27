// -----------------------------------------------------------------------
// ai.js
// -----------------------------------------------------------------------
// Clean AI service layer.
//
// If VITE_AI_API_KEY / VITE_AI_API_URL are configured in .env, this file
// sends the user's real data (and only their real data — never invented
// figures) to that endpoint and returns its reply. The API key is only
// ever read from an environment variable and only ever used from this
// one module; it is never hardcoded and never rendered in the UI.
//
// If no key is configured, or the request fails for any reason (offline,
// invalid key, rate limit, etc.), this file transparently falls back to
// the local rule-based engine in localRecommendations.js so the feature
// never breaks a demo.
// -----------------------------------------------------------------------

import { generateRecommendations, answerChatQuestion } from './localRecommendations';

const AI_API_KEY = import.meta.env.VITE_AI_API_KEY;
const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'https://api.anthropic.com/v1/messages';

export const isExternalAiConfigured = Boolean(AI_API_KEY);

function buildDataSummary({ transactions, budgets, profile }) {
  return {
    currency: profile?.currency || 'INR',
    monthly_income: profile?.monthly_income || 0,
    savings_goal: profile?.savings_goal || 0,
    budgets: (budgets || []).map((b) => ({ category: b.category, amount: b.amount })),
    recent_transactions: (transactions || []).slice(0, 30).map((t) => ({
      type: t.type,
      amount: t.amount,
      category: t.category,
      date: t.transaction_date,
    })),
  };
}

async function callExternalAi(systemPrompt, userPrompt) {
  const response = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': AI_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const data = await response.json();
  const text = (data.content || []).map((c) => c.text || '').join('\n').trim();
  if (!text) throw new Error('AI API returned an empty response.');
  return text;
}

export async function getRecommendations(data) {
  if (!isExternalAiConfigured) {
    return generateRecommendations(data);
  }
  try {
    const summary = buildDataSummary(data);
    const system = 'You are Pocket Smart AI, a budgeting assistant. Only use the JSON data given to you. Never invent transactions or numbers. Reply with 3-5 short, specific, encouraging recommendations, one per line, no numbering.';
    const text = await callExternalAi(system, JSON.stringify(summary));
    const lines = text.split('\n').map((l) => l.replace(/^[-*\d.\s]+/, '').trim()).filter(Boolean);
    return lines.map((line, i) => ({ id: `ext-${i}`, tone: 'info', text: line }));
  } catch (err) {
    console.error('External AI recommendation failed, falling back to local engine:', err);
    return generateRecommendations(data);
  }
}

export async function askAssistant(question, data) {
  if (!isExternalAiConfigured) {
    return answerChatQuestion(question, data);
  }
  try {
    const summary = buildDataSummary(data);
    const system = 'You are Pocket Smart AI, a budgeting chat assistant. Only answer using the JSON financial data provided. If the data cannot answer the question, say so honestly instead of guessing. Keep replies short (1-3 sentences) and use the currency symbol given.';
    const prompt = `User data: ${JSON.stringify(summary)}\n\nQuestion: ${question}`;
    return await callExternalAi(system, prompt);
  } catch (err) {
    console.error('External AI chat failed, falling back to local engine:', err);
    return answerChatQuestion(question, data);
  }
}
