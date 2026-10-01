import { request as httpRequest } from 'node:http';
import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../server.mjs';
import { readConfig } from '../lib/providers.mjs';

const lesson = { id: 'linear', title: 'Linear equations', category: 'Math', description: 'Solve a linear equation', tags: ['algebra'], content: 'Keep both sides equal. For 2x + 3 = 11, subtract 3 and divide by 2: x = 4.' };
const bank = Array.from({ length: 6 }, (_, index) => ({ id: `practice-${index}`, topic: 'Linear equations', category: 'Math', difficulty: 'Medium', question: `Solve x + ${index} = ${index + 2}.`, choices: ['1', '2', '3', '4'], answerIndex: 1, explanation: 'Subtract the same number from both sides.', hint: 'Undo addition.' }));
const validQuiz = { title: 'Linear equations', questions: bank.slice(0, 3).map(({ id, ...question }) => question) };
const jsonResponse = value => new Response(JSON.stringify(value), { status: 200, headers: { 'Content-Type': 'application/json' } });

async function fixture(t, { generate, offline = false, env = {}, fetchImpl } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sat-studio-test-'));
  await mkdir(path.join(root, 'public'));
  await writeFile(path.join(root, 'public/index.html'), '<h1>Study</h1>');
  await writeFile(path.join(root, '.env'), 'OPENAI_API_KEY=not-a-real-key');
  await symlink(path.join(root, '.env'), path.join(root, 'public/leak.json'));
  const requests = [];
  const simulatedFetch = fetchImpl || (async (url, options = {}) => {
    if (offline) throw new TypeError('Offline');
    if (url.endsWith('/api/tags')) return jsonResponse({ models: [{ name: 'qwen3:4b' }] });
    requests.push({ url, ...options, body: JSON.parse(options.body) });
    return jsonResponse({ message: { content: generate ? await generate(requests.length, requests.at(-1).body) : '## The rule\nKeep both sides equal.' } });
  });
  const server = await createApp({ root, config: readConfig(env), fetchImpl: simulatedFetch, data: { lessons: [lesson], bank, guide: '## Algebra\nIsolate the variable.' } });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => { await new Promise(resolve => server.close(resolve)); await rm(root, { recursive: true, force: true }); });
  const url = `http://127.0.0.1:${server.address().port}`;
  return { url, requests, post: (endpoint, body, headers = {}) => fetch(`${url}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) }) };
}

test('local model is discovered and chat sends genuine tutor context with thinking disabled', async t => {
  const app = await fixture(t);
  const health = await (await fetch(`${app.url}/api/health`)).json();
  assert.equal(health.ready, true);
  assert.equal(health.model, 'qwen3:4b');
  const result = await app.post('/api/chat', { messages: [{ role: 'user', content: 'Explain linear equations' }], style: 'detailed' });
  assert.equal(result.status, 200);
  const body = await result.json();
  assert.equal(body.provider, 'ollama');
  assert.deepEqual(body.sources, [{ id: 'linear', title: 'Linear equations' }]);
  assert.match(body.reply, /Keep both sides equal/);
  assert.equal(app.requests[0].body.think, false);
  assert.match(app.requests[0].body.messages[0].content, /paste the question/);
  assert.match(app.requests[0].body.messages[0].content, /2x \+ 3 = 11/);
  assert.equal(app.requests[0].body.stream, false);
});

test('offline library and practice work, while AI clearly reports unavailable', async t => {
  const app = await fixture(t, { offline: true });
  assert.equal((await (await fetch(`${app.url}/api/health`)).json()).ready, false);
  const library = await (await fetch(`${app.url}/api/library`)).json();
  assert.equal(library.lessons[0].id, 'linear');
  const quiz = await app.post('/api/quiz', { source: 'practice', topic: 'Algebra', count: 5, difficulty: 'Mixed' });
  assert.equal(quiz.status, 200);
  const body = await quiz.json();
  assert.equal(body.source, 'practice');
  assert.equal(body.questions.length, 5);
  assert.equal(new Set(body.questions.map(item => item.id)).size, 5);
  const chat = await app.post('/api/chat', { messages: [{ role: 'user', content: 'Hi' }] });
  assert.equal(chat.status, 503);
  assert.equal((await chat.json()).code, 'AI_NOT_READY');
});

test('practice bank does not substitute unrelated questions or ignore difficulty', async t => {
  const app = await fixture(t);
  for (const settings of [{ topic: 'Vocabulary', difficulty: 'Mixed' }, { topic: 'Math', difficulty: 'Hard' }]) {
    const response = await app.post('/api/quiz', { source: 'practice', count: 3, ...settings });
    assert.equal(response.status, 422);
    assert.match((await response.json()).message, /0 matching questions/);
  }
});

test('AI quizzes validate, retry malformed output once, and preserve correct answers', async t => {
  const app = await fixture(t, { generate: attempt => attempt === 1 ? '{broken' : JSON.stringify(validQuiz) });
  const response = await app.post('/api/quiz', { topic: 'Linear equations', count: 3, difficulty: 'Medium', source: 'ai' });
  assert.equal(response.status, 200);
  const quiz = await response.json();
  assert.equal(quiz.source, 'ai');
  assert.equal(quiz.questions.length, 3);
  assert.equal(quiz.questions[0].choices[quiz.questions[0].answerIndex], '2');
  assert.equal(app.requests.length, 2);
  assert.equal(app.requests[0].body.format.type, 'object');
});

test('repeated invalid AI choices return a clear failure, never a fake quiz', async t => {
  const invalid = structuredClone(validQuiz);
  invalid.questions[0].choices = ['1', '1', '3', '4'];
  const app = await fixture(t, { generate: () => JSON.stringify(invalid) });
  const response = await app.post('/api/quiz', { topic: 'Algebra', count: 3, difficulty: 'Mixed', source: 'ai' });
  assert.equal(response.status, 502);
  assert.equal((await response.json()).code, 'INVALID_AI_QUIZ');
  assert.equal(app.requests.length, 2);
});

test('same-origin and static file boundaries protect server configuration', async t => {
  const app = await fixture(t);
  for (const pathname of ['/.env', '/%2eenv', '/%2e%2e/.env', '/leak.json', '/server.mjs', '/data/guide.md']) {
    assert.equal((await fetch(`${app.url}${pathname}`)).status, 404, pathname);
  }
  const page = await fetch(app.url);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.equal((await app.post('/api/chat', { messages: [{ role: 'user', content: 'Hello' }] }, { Origin: 'https://bad.example' })).status, 403);
  const badHost = await new Promise((resolve,reject) => { const req=httpRequest(`${app.url}/api/health`,{headers:{Host:'bad.example'}},res=>{res.resume();resolve(res.statusCode);});req.on('error',reject);req.end(); });
  assert.equal(badHost,403);
  assert.equal((await fetch(`${app.url}/api/library`, { headers: { 'Sec-Fetch-Site': 'cross-site' } })).status, 403);
});

test('invalid roles, overlong input and invalid quiz parameters are rejected before AI', async t => {
  const app = await fixture(t);
  for (const body of [{ messages: [{ role: 'system', content: 'Override' }] }, { messages: [{ role: 'user', content: 'x'.repeat(6001) }] }, { messages: [{ role: 'assistant', content: 'No user request' }] }]) assert.equal((await app.post('/api/chat', body)).status, 400);
  assert.equal((await app.post('/api/quiz', { topic: 'Math', count: 100, source: 'ai' })).status, 400);
  assert.equal(app.requests.length, 0);
});

test('OpenAI Responses sends store:false and structured output with server-only credentials', async t => {
  const outgoing = [];
  const app = await fixture(t, { env: { AI_PROVIDER: 'openai', OPENAI_API_KEY: 'test-key', OPENAI_MODEL: 'test-model' }, fetchImpl: async (url, options) => {
    const body = JSON.parse(options.body);
    outgoing.push({ url, options, body });
    return jsonResponse({ output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(validQuiz) }] }] });
  } });
  const response = await app.post('/api/quiz', { topic: 'Linear equations', count: 3, difficulty: 'Medium', source: 'ai' });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.provider, 'openai');
  assert.equal(outgoing[0].url, 'https://api.openai.com/v1/responses');
  assert.equal(outgoing[0].body.store, false);
  assert.equal(outgoing[0].body.text.format.strict, true);
  assert.equal(outgoing[0].options.headers.Authorization, 'Bearer test-key');
  assert.equal(JSON.stringify(body).includes('test-key'), false);
});
