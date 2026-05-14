import { json, error } from '../_lib/http.js';

const chatHistories = new Map();
const DEFAULT_AI_MODEL = 'gpt-4o-mini';
const DEFAULT_AI_API_URL = 'https://api.openai.com/v1/chat/completions';

const readEnvValue = (edgeEnv, key, fallback = '') => {
  const fromEdgeEnv = edgeEnv && typeof edgeEnv[key] !== 'undefined' ? edgeEnv[key] : undefined;
  const fromProcessEnv =
    typeof process !== 'undefined' && process?.env && typeof process.env[key] !== 'undefined'
      ? process.env[key]
      : undefined;
  const raw = fromEdgeEnv ?? fromProcessEnv ?? fallback;
  return String(raw ?? '').trim();
};

const getAiConfig = (edgeEnv) => {
  const apiKey = readEnvValue(edgeEnv, 'AI_API_KEY', '');
  const model = readEnvValue(edgeEnv, 'AI_MODEL', DEFAULT_AI_MODEL) || DEFAULT_AI_MODEL;
  const apiUrl = readEnvValue(edgeEnv, 'AI_API_URL', DEFAULT_AI_API_URL) || DEFAULT_AI_API_URL;
  return { apiKey, model, apiUrl };
};

const SYSTEM_PROMPT = `You are a helpful AI customer service assistant for Inkling, an AI writing workspace SaaS.

You help users with:
- Product features and capabilities
- Pricing and plans
- Getting started guides
- Troubleshooting issues
- Best practices for AI writing

Be friendly, professional, and concise. If you do not know something, suggest they contact support.

Reply in the same language the user writes in when it is clear (for example Chinese questions in Chinese, English in English).`;

const notConfiguredReply =
  'Live AI replies are turned off because this deployment has no model credentials yet.\n\n' +
  'To enable real conversations, set these environment variables on EdgeOne Pages (or in your local Edge Functions env):\n\n' +
  '• **AI_API_KEY** (required) — API secret for an OpenAI-compatible Chat Completions endpoint.\n' +
  '• **AI_MODEL** (required) — Model id, e.g. `gpt-4o-mini` or `gpt-4o`.\n' +
  '• **AI_API_URL** (optional) — Defaults to `https://api.openai.com/v1/chat/completions`.\n\n' +
  'Redeploy after saving secrets. Until then, this assistant only shows this setup message.';

const postChat = async ({ request, storage, edgeEnv }) => {
  const { apiKey, model, apiUrl } = getAiConfig(edgeEnv);
  const body = await request.json().catch(() => null);
  const { message, sessionId } = body || {};

  if (!message || typeof message !== 'string') {
    return error('Message is required.', 400);
  }

  const chatId = sessionId || `chat_${Date.now()}`;
  let history = chatHistories.get(chatId) || [];

  history.push({ role: 'user', content: message });
  if (history.length > 10) {
    history = history.slice(-10);
  }

  if (!apiKey) {
    history.push({ role: 'assistant', content: notConfiguredReply });
    chatHistories.set(chatId, history);
    if (storage) {
      try {
        await storage.put(`chat:${chatId}`, JSON.stringify(history));
      } catch {
        /* ignore KV errors */
      }
    }
    return json({
      ok: false,
      code: 'AI_NOT_CONFIGURED',
      error: 'AI_API_KEY is not set.',
      reply: notConfiguredReply,
      response: notConfiguredReply,
      sessionId: chatId
    });
  }

  const upstreamMessages = [{ role: 'system', content: SYSTEM_PROMPT }, ...history];

  let reply;
  let upstreamOk = false;

  try {
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: upstreamMessages,
        temperature: 0.6
      })
    });

    const data = await resp.json().catch(() => ({}));
    upstreamOk = resp.ok;

    if (!resp.ok) {
      const errText =
        typeof data?.error === 'string'
          ? data.error
          : data?.error?.message || `HTTP ${resp.status}`;
      reply = `The model request failed: ${errText}`;
    } else {
      reply = data?.choices?.[0]?.message?.content?.trim();
      if (!reply) {
        reply = 'The model returned an empty reply. Try again or check AI_MODEL / AI_API_URL.';
      }
    }
  } catch (e) {
    reply = `Could not reach the chat API: ${e instanceof Error ? e.message : String(e)}`;
  }

  history.push({ role: 'assistant', content: reply });
  chatHistories.set(chatId, history);

  if (storage) {
    try {
      await storage.put(`chat:${chatId}`, JSON.stringify(history));
    } catch {
      /* ignore KV errors */
    }
  }

  return json({
    ok: upstreamOk,
    reply,
    response: reply,
    sessionId: chatId
  });
};

export const onRequestPost = (context) =>
  postChat({ request: context.request, storage: context.env?.inkling_kv, edgeEnv: context.env });
