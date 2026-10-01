export class AppError extends Error {
  constructor(status, message, code = 'REQUEST_FAILED') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function readConfig(env = process.env) {
  const provider = env.AI_PROVIDER || 'auto';
  if (!['auto', 'ollama', 'openai'].includes(provider)) throw new Error('AI_PROVIDER must be auto, ollama, or openai.');
  const ollamaBaseURL = env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  const url = new URL(ollamaBaseURL);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid OLLAMA_BASE_URL.');
  return {
    provider,
    ollamaBaseURL: ollamaBaseURL.replace(/\/$/, ''),
    ollamaModel: env.OLLAMA_MODEL || 'qwen3:4b',
    openaiKey: env.OPENAI_API_KEY || '',
    openaiModel: env.OPENAI_MODEL || 'gpt-4.1-mini',
    timeoutMs: 240_000,
    port: Number(env.PORT || 4317),
  };
}

export function createProvider(config, fetchImpl = fetch) {
  let cached;
  let checkedAt = 0;
  async function status(refresh = false) {
    if (!refresh && cached && Date.now() - checkedAt < 10_000) return cached;
    if (config.provider !== 'openai') {
      try {
        const response = await fetchImpl(`${config.ollamaBaseURL}/api/tags`, { signal: AbortSignal.timeout(2500) });
        if (response.ok) {
          const body = await response.json();
          const models = (body.models || []).map(item => item.name).filter(name => typeof name === 'string');
          const model = models.find(name => name === config.ollamaModel || name === `${config.ollamaModel}:latest`)
            || models.find(name => /qwen|llama|gemma|mistral|phi|deepseek/i.test(name) && !/embed/i.test(name));
          if (model) {
            cached = { ready: true, provider: 'ollama', model, message: 'Your local AI tutor is ready. Messages stay on this computer.' };
            checkedAt = Date.now();
            return cached;
          }
        }
      } catch { /* An unavailable local server is an expected setup state. */ }
    }
    if (config.provider !== 'ollama' && config.openaiKey) {
      cached = { ready: true, provider: 'openai', model: config.openaiModel, message: 'OpenAI is configured. Messages are sent to OpenAI; API charges apply. Connection is checked when you ask a question.' };
    } else {
      cached = { ready: false, provider: 'none', model: config.ollamaModel, message: 'AI is not connected yet. Start Ollama and install a chat model, or configure an OpenAI API key in .env. Study guides and practice-bank quizzes still work.' };
    }
    checkedAt = Date.now();
    return cached;
  }

  async function generate({ system, messages, schema, maxTokens = 2200 }) {
    const active = await status();
    if (!active.ready) throw new AppError(503, active.message, 'AI_NOT_READY');
    let response;
    try {
      if (active.provider === 'ollama') {
        response = await fetchImpl(`${config.ollamaBaseURL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: active.model, stream: false, ...(/^qwen3[.:]/i.test(active.model) ? { think: false } : {}), messages: [{ role: 'system', content: system }, ...messages], ...(schema ? { format: schema } : {}), options: { temperature: schema ? 0.25 : 0.45, num_predict: maxTokens, num_ctx: 16384 }, keep_alive: '15m' }),
          signal: AbortSignal.timeout(config.timeoutMs),
        });
      } else {
        response = await fetchImpl('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.openaiKey}` },
          body: JSON.stringify({ model: active.model, store: false, instructions: system, input: messages, max_output_tokens: maxTokens, ...(schema ? { text: { format: { type: 'json_schema', name: 'sat_quiz', strict: true, schema } } } : {}) }),
          signal: AbortSignal.timeout(config.timeoutMs),
        });
      }
      if (!response.ok) {
        checkedAt = 0;
        const message = response.status === 429 ? 'The AI service is busy or its usage limit has been reached. Try again shortly or use a practice-bank quiz.'
          : response.status === 401 || response.status === 403 ? 'The AI service rejected the configured credentials. Check your server .env settings.'
          : 'The AI service could not complete that request. Try again, or use the study library and practice bank.';
        throw new AppError(502, message, 'AI_PROVIDER_ERROR');
      }
      const body = await response.json();
      let reply;
      if (active.provider === 'ollama') reply = body.message?.content;
      else reply = typeof body.output_text === 'string' ? body.output_text : (body.output || []).flatMap(item => item.content || []).filter(item => item.type === 'output_text').map(item => item.text).join('\n');
      if (typeof reply !== 'string' || !reply.trim()) throw new AppError(502, 'The AI returned an empty response. Please try a more specific prompt.', 'AI_EMPTY_RESPONSE');
      return { reply: reply.trim(), provider: active.provider, model: active.model };
    } catch (error) {
      if (error instanceof AppError) throw error;
      checkedAt = 0;
      throw new AppError(502, error.name === 'TimeoutError' || error.name === 'AbortError' ? 'The AI took too long to reply. Try fewer questions or a shorter request; the study library remains available.' : 'Could not reach the AI service. Check that Ollama is running, or check your OpenAI connection.', 'AI_CONNECTION_ERROR');
    }
  }
  return { status, generate };
}
