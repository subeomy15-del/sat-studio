// Browser regression checks using a mocked tutor; no AI service is called.
// Run with: node tests/frontend-review.mjs
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, join } from 'node:path';
import os from 'node:os';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || `${os.homedir()}/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs`);

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const mime = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.woff':'font/woff', '.ttf':'font/ttf' };
const server = createServer(async (req,res) => {
  try {
    const file = new URL(req.url, 'http://localhost').pathname;
    const body = await readFile(join(publicDir, file === '/' ? 'index.html' : file));
    res.writeHead(200, {'content-type':mime[extname(file)] || (file === '/' ? 'text/html' : 'application/octet-stream')});
    res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({channel:'chrome',headless:true});
const page = await browser.newPage({ viewport:{width:1440,height:1000} });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
let chatCalls = [];
let quizCalls = [];
let chatFails = true;
let guideReject;
let holdGuide = false;
const questions = [0,1,2].map(i => ({id:`q${i}`,question:`What is ${i + 1} + 1?`,choices:[`${i + 2}`,`${i + 3}`,`${i + 4}`,`${i + 5}`],answerIndex:0,topic:'Algebra',difficulty:'Easy',hint:'Add one to the first number.',explanation:`The correct answer is **${i + 2}**.`}));
await page.route('**/api/**', async route => {
  const path = new URL(route.request().url()).pathname;
  let data;
  let status = 200;
  if(path === '/api/library') data = {lessons:[{id:'linear',title:'Linear equations',description:'Learn to solve equations.',category:'Math',minutes:10,tags:['algebra'],content:'# Linear equations\n\nSolve $x + 1 = 3$.\n\nThe answer is $x = 2$.'}]};
  if(path === '/api/health') data = {ready:true,provider:'ollama',model:'mock',message:'Mock tutor ready'};
  if(path === '/api/chat') {
    chatCalls.push(route.request().postDataJSON());
    if(chatFails) {status = 503; data = {message:'Temporary tutor error'}; chatFails = false;}
    else data = {reply:'## Worked example\n\nSubtract 1 from both sides. $x=2$.'};
  }
  if(path === '/api/quiz') {quizCalls.push(route.request().postDataJSON()); data = {title:'Original arithmetic',source:'practice',questions};}
  if(path === '/api/guide') {
    if(holdGuide) {await new Promise(resolve => {guideReject=resolve;}); status=503; data={message:'Guide unavailable'};}
    else data={content:'# Full guide\n\nReview your mistakes.'};
  }
  await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data || {})});
});
const go = async hash => {await page.evaluate(h => {location.hash=h;}, hash); await page.waitForTimeout(70);};
try {
  await page.goto(origin);
  await page.getByRole('heading',{name:'Big goals. Small steps.'}).waitFor();
  await go('tutor');
  await page.locator('#chat-input').fill('Explain linear equations');
  await page.locator('#chat-form').evaluate(form=>form.requestSubmit());
  await page.getByText('Temporary tutor error').waitFor();
  await page.locator('#retry-chat').click();
  await page.getByRole('heading',{name:'Worked example'}).waitFor();
  assert.equal(chatCalls.length,2);
  assert.deepEqual(chatCalls[0].messages,chatCalls[1].messages,'Retry must not duplicate the user message');
  assert.equal(await page.locator('.message.user').count(),1);
  assert.equal(await page.locator('.katex').count(),1,'Tutor math must render');
  await page.locator('#chat-input').fill('Why subtract?');
  await page.locator('#chat-form').evaluate(form=>form.requestSubmit());
  await page.waitForFunction(()=>document.querySelectorAll('.message.assistant').length===2);
  assert.equal(chatCalls.at(-1).messages.length,3,'Follow-up must send preceding question and answer');

  await go('quiz');
  await page.locator('#quiz-topic').fill('Algebra practice');
  await page.locator('#quiz-count').selectOption('3');
  await page.locator('#quiz-source').selectOption('practice');
  await page.locator('#generate-quiz').click();
  await page.locator('[data-choice="1"]').click();
  await page.locator('#check-answer').click();
  await page.locator('#next-question').click();
  await page.locator('#quiz-hint').click();
  await page.locator('[data-choice="0"]').click();
  await page.locator('#check-answer').click();
  await page.locator('#next-question').click();
  await page.locator('[data-choice="0"]').click();
  await page.locator('#check-answer').click();
  await page.locator('#next-question').click();
  assert.match(await page.locator('.score-orb').innerText(),/2\s*\/3/);
  assert.equal(quizCalls[0].count,3);
  let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('margin-sat-v1')));
  assert.equal(saved.history.length,1);
  assert.equal(saved.history[0].score,2);
  assert.equal(saved.history[0].hints,1);
  assert.equal(saved.mistakes.length,2);
  await go('home'); await go('quiz');
  saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('margin-sat-v1')));
  assert.equal(saved.history.length,1,'Revisiting quiz results must not double-save');
  await go('review');
  assert.match(await page.locator('.stat-card').nth(1).innerText(),/67%/);
  for(const button of await page.locator('[data-resolve]').all()){await page.locator('[data-resolve]').first().click();}
  await page.reload();
  await page.getByRole('heading',{name:'A little clearer, every day.'}).waitFor();
  saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('margin-sat-v1')));
  assert.equal(saved.messages.length,4,'Conversation survives refresh');
  assert.equal(saved.mistakes[0].resolved,true,'Resolved mistake survives refresh');

  await go('library/linear');
  assert.equal(await page.locator('.katex').count(),2);
  await page.locator('#lesson-complete').click();
  saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('margin-sat-v1')));
  assert.deepEqual(saved.completed,['linear']);

  await page.setViewportSize({width:390,height:844});
  for(const route of ['home','tutor','quiz','library','library/linear','review']) {
    await go(route);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    assert.equal(overflow,false,`Mobile horizontal overflow on ${route}`);
  }
  await go('home');
  await page.screenshot({path:'/private/tmp/sat-mobile-review.png',fullPage:true});
  await page.setViewportSize({width:1440,height:1000});
  await page.screenshot({path:'/private/tmp/sat-desktop-review.png',fullPage:true});

  holdGuide=true;
  await go('library/guide');
  await page.getByText('Opening your study guide…').waitFor();
  await go('home');
  guideReject();
  await page.waitForTimeout(100);
  assert.equal(await page.getByRole('heading',{name:'Big goals. Small steps.'}).count(),1,'Failed guide request must not overwrite another route');
  assert.deepEqual(errors,[],'No browser runtime errors');
  console.log('PASS: chat retry/context, formula rendering, quiz scoring/hints, review persistence, lesson completion, mobile routes, and async route isolation.');
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
