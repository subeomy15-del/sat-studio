import http from 'node:http';
import path from 'node:path';
import { readFile, realpath, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { AppError, readConfig, createProvider } from './lib/providers.mjs';
import { identifyQuestion, officialContext, questionSources, questionAddress } from './lib/bundles.mjs';
import { retrieveLessons, tutorPrompt, validateChat, validateQuizRequest, practiceQuiz, generateQuiz, diagnosticQuiz } from './lib/study.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };

function json(response, status, data) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(data));
}
async function readJsonBody(request) {
  if (!/^application\/json(?:;|$)/i.test(request.headers['content-type'] || '')) throw new AppError(415, 'Send this request as JSON.', 'JSON_REQUIRED');
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 160_000) throw new AppError(413, 'This request is too large. Shorten your conversation or quiz prompt.', 'BODY_TOO_LARGE');
    chunks.push(chunk);
  }
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
    return body;
  } catch { throw new AppError(400, 'This request contains invalid JSON.', 'INVALID_JSON'); }
}
function checkOrigin(request) {
  const host = request.headers.host || '';
  if (!/^(?:127\.0\.0\.1|localhost)(?::\d{1,5})?$/.test(host)) throw new AppError(403, 'This app is available only through localhost.', 'INVALID_HOST');
  if (request.headers['sec-fetch-site'] === 'cross-site') throw new AppError(403, 'Cross-site requests are not allowed.', 'CROSS_SITE');
  if (request.headers.origin && request.headers.origin !== `http://${host}`) throw new AppError(403, 'Open SAT Studio directly to use this feature.', 'INVALID_ORIGIN');
}

export async function createApp({ config = readConfig(), fetchImpl = fetch, data, root = ROOT } = {}) {
  const lessons = data?.lessons ?? JSON.parse(await readFile(path.join(root, 'data/lessons.json'), 'utf8'));
  const bank = data?.bank ?? JSON.parse(await readFile(path.join(root, 'data/practice.json'), 'utf8'));
  let guide = data?.guide;
  if (guide === undefined) { try { guide = await readFile(path.join(root, 'data/guide.md'), 'utf8'); } catch { guide = ''; } }
  if (!Array.isArray(lessons) || !Array.isArray(bank)) throw new Error('Study data must contain arrays.');
  let bundles = data?.bundles;
  if (bundles === undefined) { try { bundles = JSON.parse(await readFile(path.join(root, 'data/bundles.json'), 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; bundles = { questions: [], documents: [] }; } }
  const questions = bundles.questions || [];
  const assets = new Set([...(bundles.documents || []).map(d => d.file), ...questions.map(q => q.image), ...questions.flatMap(q => q.explanationImages || [])]);
  const publicRoot = await realpath(path.join(root, 'public'));
  const provider = createProvider(config, fetchImpl);
  let activeRequests = 0;
  async function aiTask(callback) {
    if (activeRequests >= 2) throw new AppError(429, 'Your tutor is already working on two requests. Wait for one to finish, then try again.', 'AI_BUSY');
    activeRequests++;
    try { return await callback(); } finally { activeRequests--; }
  }
  const server = http.createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    try {
      checkOrigin(request);
      const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
      if (request.method === 'GET' && pathname === '/api/health') return json(response, 200, { ...await provider.status(), version: '2.0', importedQuestions: questions.length });
      const params = new URL(request.url, 'http://127.0.0.1').searchParams;
      if (request.method === 'GET' && pathname === '/api/bundles') return json(response, 200, { documents: bundles.documents, questions: questions.map(({id,test,section,module,number,page}) => ({id,test,section,module,number,page})), count: questions.length });
      if (request.method === 'GET' && pathname === '/api/bundle-question') {
        const q = questions.find(q => q.id === params.get('id'));
        if (!q) throw new AppError(404, 'Question not found.', 'NOT_FOUND');
        return json(response, 200, { ...q, address: questionAddress(q), sources: questionSources(q) });
      }
      if (['GET','HEAD'].includes(request.method) && pathname === '/api/bundle-asset') {
        const file = params.get('file');
        if (!assets.has(file) || path.basename(file) !== file) throw new AppError(404, 'Source file not found.', 'NOT_FOUND');
        const bundleRoot = await realpath(path.join(root, 'data/bundles'));
        const target = await realpath(path.join(bundleRoot, file));
        if (!target.startsWith(bundleRoot + path.sep)) throw new AppError(404, 'Source file not found.', 'NOT_FOUND');
        const content = await readFile(target);
        response.writeHead(200, { 'Content-Type': file.endsWith('.pdf') ? 'application/pdf' : 'image/png', 'Content-Length': content.length, 'Cache-Control': 'private, max-age=3600' });
        return response.end(request.method === 'HEAD' ? undefined : content);
      }
      if (request.method === 'GET' && pathname === '/api/library') return json(response, 200, { lessons });
      if (request.method === 'GET' && pathname === '/api/diagnostic') return json(response, 200, diagnosticQuiz(bank));
      if (request.method === 'GET' && pathname === '/api/guide') return json(response, 200, { content: guide });
      if (request.method === 'POST' && pathname === '/api/chat') {
        const { messages, style, lessonId, questionId, learner } = validateChat(await readJsonBody(request));
        const query = messages.at(-1).content;
        const official = identifyQuestion(messages, questions, questionId);
        const relevant = retrieveLessons(lessons, query, lessonId);
        const result = await aiTask(() => provider.generate({ system: tutorPrompt({ style, lessons: relevant, guide, query, learner }) + officialContext(official), messages, maxTokens: style === 'quick' ? 850 : style === 'socratic' ? 700 : 2600 }));
        return json(response, 200, { ...result, questionId: official?.id, sources: [...questionSources(official), ...relevant.map(lesson => ({ id: lesson.id, title: lesson.title }))] });
      }
      if (request.method === 'POST' && pathname === '/api/quiz') {
        const quizRequest = validateQuizRequest(await readJsonBody(request));
        const quiz = quizRequest.source === 'practice' ? practiceQuiz(bank, quizRequest) : await aiTask(() => generateQuiz(provider, quizRequest));
        return json(response, 200, quiz);
      }
      if (pathname.startsWith('/api/')) throw new AppError(404, 'That API endpoint does not exist.', 'NOT_FOUND');
      if (!['GET', 'HEAD'].includes(request.method)) throw new AppError(405, 'This method is not supported.', 'METHOD_NOT_ALLOWED');
      let decoded;
      try { decoded = decodeURIComponent(pathname); } catch { throw new AppError(400, 'Invalid URL.', 'INVALID_URL'); }
      if (decoded.split(/[\\/]/).some(part => part.startsWith('.')) || decoded.includes('\0') || decoded.includes('\\')) throw new AppError(404, 'File not found.', 'NOT_FOUND');
      const target = path.resolve(publicRoot, `.${decoded === '/' ? '/index.html' : decoded}`);
      if (!target.startsWith(`${publicRoot}${path.sep}`)) throw new AppError(404, 'File not found.', 'NOT_FOUND');
      let resolved;
      try { resolved = await realpath(target); } catch { throw new AppError(404, 'File not found.', 'NOT_FOUND'); }
      if (!resolved.startsWith(`${publicRoot}${path.sep}`) || !(await stat(resolved)).isFile()) throw new AppError(404, 'File not found.', 'NOT_FOUND');
      const extension = path.extname(resolved).toLowerCase();
      if (!MIME[extension]) throw new AppError(404, 'File not found.', 'NOT_FOUND');
      const content = await readFile(resolved);
      response.writeHead(200, { 'Content-Type': MIME[extension], 'Cache-Control': 'no-cache', 'Content-Length': content.length });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch (error) {
      if (response.destroyed || response.writableEnded) return;
      if (!(error instanceof AppError)) console.error('Request failed:', error.name);
      json(response, error.status || 500, { error: error instanceof AppError ? error.message : 'Something went wrong. Please try again.', message: error instanceof AppError ? error.message : 'Something went wrong. Please try again.', code: error.code || 'SERVER_ERROR' });
    }
  });
  server.requestTimeout = 300_000;
  server.headersTimeout = 15_000;
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const config = readConfig();
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) throw new Error('PORT must be a valid port number.');
  const server = await createApp({ config });
  server.listen(config.port, '127.0.0.1', () => console.log(`Margin is ready at http://127.0.0.1:${config.port}`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
}
