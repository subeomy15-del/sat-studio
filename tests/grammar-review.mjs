import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import os from 'node:os';
import {skills} from '../public/grammar-data.js';
const {chromium}=await import(`${os.homedir()}/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs`);
const root=resolve('docs');const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/sat-studio\//,'')||'index.html');assert.ok(path.startsWith(root+'/'));res.setHeader('Content-Type',mime[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/sat-studio/#grammar`);
 await page.getByRole('heading',{name:'SAT grammar. Every choice needs a reason.'}).waitFor();
 assert.equal(await page.locator('.grammar-skill').count(),8);
 await page.getByRole('button',{name:'Start advanced diagnostic'}).click();
 for(let i=0;i<8;i++){
  const answer=skills[i].advanced[0].answer;await page.locator(`[data-g="choose:${i===0?(answer+1)%4:answer}"]`).click();
  assert.ok(await page.getByRole('button',{name:'Check answer',exact:true}).isDisabled());
  await page.getByRole('button',{name:'I can explain the rule'}).click();await page.getByRole('button',{name:'Check answer',exact:true}).click();
  assert.equal(await page.locator('.grammar-feedback p').count(),4);await page.locator('.grammar-structure').waitFor();
  await page.getByRole('button',{name:i===7?'See my next steps →':'Next question →',exact:true}).click();
 }
 await page.getByRole('heading',{name:'7 of 8 correct.'}).waitFor();
 await page.getByRole('button',{name:'Update my roadmap'}).click();
 await page.getByRole('button',{name:'Review mistakes & uncertainty · 1'}).click();
 await page.locator(`[data-g="choose:${skills[0].advanced[0].answer}"]`).click();await page.getByRole('button',{name:'I can explain the rule'}).click();
 await page.getByRole('button',{name:'Check answer',exact:true}).click();await page.getByRole('button',{name:'See my next steps →'}).click();
 await page.getByRole('button',{name:'Update my roadmap'}).click();await page.reload();await page.getByRole('button',{name:'Review mistakes & uncertainty · 0'}).waitFor();
 await page.getByRole('button',{name:'Mixed benchmark'}).click();
 // Benchmark hides hints and feedback, preserves changed answers when navigating back.
 for(let i=0;i<8;i++){
  assert.equal(await page.locator('.grammar-feedback').count(),0);assert.equal(await page.getByRole('button',{name:'Reveal a structural hint'}).count(),0);
  await page.locator(`[data-g="choose:${skills[i].advanced[1].answer}"]`).click();
  await page.getByRole('button',{name:i===0?'Unsure / guessing':'I can explain the rule'}).click();
  if(i===1){await page.getByRole('button',{name:'← Previous question'}).click();assert.equal(await page.locator(`[data-g="choose:${skills[0].advanced[1].answer}"]`).getAttribute('aria-pressed'),'true');await page.getByRole('button',{name:'Save & continue →'}).click();}
  await page.getByRole('button',{name:i===7?'Submit benchmark':'Save & continue →'}).click();
 }
 await page.getByRole('heading',{name:'8 of 8 correct.'}).waitFor();assert.match(await page.locator('.grammar-stats').last().innerText(),/7.*confident/s);
 await page.locator('[data-g^="review-item:"]').first().click();await page.locator('.grammar-structure').waitFor();assert.equal(await page.locator('.grammar-feedback p').count(),4);
 await page.getByRole('button',{name:'Back to debrief'}).click();await page.getByRole('button',{name:'Update my roadmap'}).click();await page.getByRole('button',{name:'Review mistakes & uncertainty · 1'}).waitFor();
 await page.locator('[data-g="learn:boundaries"]').click();await page.getByRole('button',{name:'Mark playbook studied'}).click();await page.getByRole('button',{name:'Playbook studied ✓'}).waitFor();
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'/private/tmp/margin-advanced-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});await page.getByRole('button',{name:'Mixed benchmark'}).click();await page.screenshot({path:'/private/tmp/margin-advanced-desktop.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS: advanced diagnostic, structures, uncertainty review, deferred benchmark grading, previous answers, persistence, lessons, mobile overflow.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
