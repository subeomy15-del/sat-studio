import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import os from 'node:os';
import {questions as grammar} from '../public/grammar-data.js';
import {rwPractice} from '../public/rw-practice.js';
import {chapters} from '../public/course-content.js';
const {chromium}=await import(`${os.homedir()}/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs`);
const root=resolve('docs');const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.pdf':'application/pdf','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost');assert.ok(u.pathname.startsWith('/sat-studio/'));const path=resolve(root,decodeURIComponent(u.pathname.slice(12))||'index.html');assert.ok(path.startsWith(root+sep));res.setHeader('Content-Type',mime[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'chrome',headless:true});
const all=[...grammar,...rwPractice];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1050},acceptDownloads:true});const errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`);});
 const go=async hash=>{await page.evaluate(h=>location.hash=h,hash);await page.waitForTimeout(150);};
 await page.goto(`http://127.0.0.1:${server.address().port}/sat-studio/`);
 await page.getByRole('heading',{name:'Big ambition. A clear next step.'}).waitFor();assert.match(await page.locator('.desk-stats').innerText(),/0/);
 await go('math');await page.getByRole('heading',{name:'Make the numbers make sense.'}).waitFor();
 await page.getByRole('link',{name:'Practice Math',exact:false}).click();await page.locator('#lab-subject').waitFor();assert.equal(await page.locator('#lab-subject').inputValue(),'Math');
 await go('english');await page.getByRole('heading',{name:'Read closely. Write clearly.'}).waitFor();
 await page.locator('#focus-toggle').click();assert.equal(await page.locator('#focus-toggle').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('.sidebar').isVisible(),false);
 const leavePrompt=page.waitForEvent('dialog');const reload=page.reload().catch(()=>null);const dialog=await leavePrompt;assert.equal(dialog.type(),'beforeunload');await dialog.dismiss();await reload;assert.equal(await page.locator('#focus-toggle').getAttribute('aria-pressed'),'true');

 await page.keyboard.press('Escape');assert.equal(await page.locator('#focus-toggle').getAttribute('aria-pressed'),'false');
 await page.locator('#global-tutor').click();await page.locator('#chat-input').waitFor();await page.locator('#tutor-setup').click();assert.equal(await page.locator('#settings-dialog').evaluate(d=>d.open),true);await page.locator('.dialog-close').click();
 await go('home');

 await page.screenshot({path:'/private/tmp/margin-v3-dashboard-desktop.png',fullPage:true});
 await page.locator('#global-search').click();await page.locator('#workspace-search').fill('boundaries');assert.ok(await page.locator('.search-result').count()>0);await page.locator('.search-result').first().click();await page.locator('.course-article').waitFor();
 await go('grammar');await page.getByRole('heading',{name:'Understand the rule. Own the sentence.'}).waitFor();assert.equal(await page.locator('.academy-course-card').count(),8);
 await page.screenshot({path:'/private/tmp/margin-v3-academy.png',fullPage:true});
 for(const id of Object.keys(chapters)){
  await go('course/'+id);await page.locator('.checkpoint').waitFor();assert.equal(await page.locator('.course-section').count(),5);
  await page.locator(`[data-a="pick:${chapters[id].check.answer}"]`).click();await page.locator('[data-a="check"]').click();await page.locator('[data-a="complete"]').click();assert.match(await page.locator('[data-a="complete"]').innerText(),/Lesson completed/);
 }
 await go('practice');await page.getByRole('heading',{name:'120 matching questions'}).waitFor();
 await page.locator('#lab-subject').selectOption('Math');await page.locator('#lab-difficulty').selectOption('Hard');assert.ok(await page.locator('.bank-row').count()>0);assert.ok((await page.locator('.bank-row-meta').allTextContents()).every(t=>!t.includes('Standard English')));
 await page.locator('[data-p="reset"]').click();await page.locator('#lab-search').fill('solar');assert.ok(await page.locator('.bank-row').count()>0);
 await go('practice?question=margin-sec-02');await page.locator('.practice-room').waitFor();await page.locator('[data-p="eliminate:0"]').click();assert.ok(await page.locator('.answer-option').first().evaluate(e=>e.classList.contains('eliminated')));
 await page.keyboard.press('b');await page.locator('#question-note').fill('However is not a coordinating conjunction.');
 await page.reload();await page.locator('.practice-room').waitFor(); // Deep links recover their matching unfinished set.
 assert.equal(await page.locator('#question-note').inputValue(),'However is not a coordinating conjunction.');
 await page.locator('[data-p="choose:1"]').click();await page.locator('[data-p="confidence:unsure"]').click();await page.locator('[data-p="star:margin-sec-02"]').click();
 await page.locator('[data-p="submit"]').click();await page.locator('.explanation-panel').waitFor();assert.equal(await page.locator('.reason-row').count(),4);
 await page.screenshot({path:'/private/tmp/margin-v3-practice-feedback.png',fullPage:true});
 await page.locator('[data-p="next"]').click();await page.getByRole('heading',{name:'Now make it stick.'}).waitFor();assert.match(await page.locator('.desk-stats').innerText(),/0\s+Correct without a hint/);
 await page.locator('[data-p="review-result:0"]').click();await page.locator('.review-detail').waitFor();await page.locator('[data-p="results"]').click();
 await go('insights');await page.getByRole('heading',{name:'Your work. Your way forward.'}).waitFor();assert.match(await page.locator('.desk-stats').innerText(),/100%/);
 const download=page.waitForEvent('download');await page.locator('#learning-export').click();assert.match((await download).suggestedFilename(),/margin-learning/);
 // Review includes a correct-but-uncertain answer. Learning it confidently clears the immediate queue.
 await go('practice?mode=review');await page.locator('.practice-room').waitFor();await page.locator('[data-p="choose:1"]').click();await page.locator('[data-p="confidence:confident"]').click();await page.locator('[data-p="submit"]').click();await page.locator('[data-p="next"]').click();
 await go('practice');await page.locator('[data-p="reset"]').click();await page.locator('#lab-subject').selectOption('Reading & Writing');await page.locator('#lab-count').selectOption('5');await page.locator('#lab-feedback').selectOption('test');await page.locator('[data-p="start"]').click();
 // Save an incomplete draft, leave the route, reload, and resume the same question.
 await page.locator('[data-p="choose:2"]').click();await page.locator('#question-note').fill('Session recovery check.');await page.locator('[data-p="exit"]').click();await page.reload();await page.locator('[data-p="resume"]').click();assert.equal(await page.locator('[data-p="choose:2"]').getAttribute('aria-pressed'),'true');
 for(let i=0;i<5;i++){
  assert.equal(await page.locator('.explanation-panel').count(),0);assert.equal(await page.locator('[data-p="hint"]').count(),0);
  const id=await page.evaluate(()=>JSON.parse(localStorage.getItem('margin-learning-v3')).active.ids[JSON.parse(localStorage.getItem('margin-learning-v3')).active.index]);
  const q=all.find(q=>q.id===id);const answer=q?.answer??0;
  await page.locator(`[data-p="choose:${answer}"]`).click();await page.locator('[data-p="confidence:confident"]').click();
  if(i===1){await page.locator('[data-p="previous"]').click();await page.locator('[data-p="submit"]').click();}
  await page.locator('[data-p="submit"]').click();
 }
 await page.getByRole('heading',{name:'Now make it stick.'}).waitFor();assert.equal(await page.locator('.debrief-row').count(),5);
 // Desktop captures and mobile overflow on every major route.
 for(const route of ['home','grammar','practice','insights','library','bundles','plan','tutor','quiz']){
  await go(route);if(route==='bundles')await page.locator('.question-image').waitFor();await page.waitForTimeout(100);
  await page.setViewportSize({width:390,height:844});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)){console.log('OVERFLOW',route,await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1&&getComputedStyle(e).display!=='none'}).slice(0,15).map(e=>[e.tagName,e.getAttribute('class'),e.parentElement?.getAttribute('class'),e.getBoundingClientRect().width,e.getBoundingClientRect().right])));await page.screenshot({path:'/private/tmp/margin-overflow.png',fullPage:true});}assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Mobile overflow on ${route}`);
  if(route==='home')await page.screenshot({path:'/private/tmp/margin-v3-dashboard-mobile.png',fullPage:true});
  await page.setViewportSize({width:1440,height:1050});
 }
 await go('plan');await page.locator('#plan-time').selectOption('10');await page.getByRole('heading',{name:'10 minutes. Three useful moves.'}).waitFor();await page.locator('#plan-goal').fill('Explain punctuation without guessing.');await go('home');await page.locator('.mission-card').waitFor();assert.match(await page.locator('.mission-card').innerText(),/YOUR NEXT 10 MINUTES/);
 await page.setViewportSize({width:390,height:844});await go('home');await page.locator('#mobile-menu').click();await page.locator('.sidebar').getByRole('link',{name:'Practice Lab',exact:true}).click();await page.locator('.lab-layout').waitFor();assert.equal(await page.locator('#mobile-menu').getAttribute('aria-expanded'),'false');
 await go('practice?question=margin-sec-13');await page.locator('.practice-room').waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'/private/tmp/margin-v3-practice-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);console.log('PASS: dashboard, global search, 8 lessons & checks, 120-question bank, filters, elimination, keyboard choices, notes, uncertain review, export, session recovery, test feedback, mobile layouts, official materials, navigation, and browser errors.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
