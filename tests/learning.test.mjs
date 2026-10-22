import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DAY,schedule,statistics,chooseSession,matches,validateSession,seededShuffle} from '../public/practice-core.js';
import {rwPractice} from '../public/rw-practice.js';
import {chapters} from '../public/course-content.js';
import {questions as grammar} from '../public/grammar-data.js';
const original=JSON.parse(await readFile(new URL('../data/practice.json',import.meta.url)));
test('fresh original items and lesson checks have complete answer feedback',()=>{
 assert.equal(rwPractice.length,24);assert.equal(new Set(rwPractice.map(q=>q.id)).size,24);
 for(const q of rwPractice){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert.equal(q.reasons.length,4);assert.ok(q.reasons.every(r=>r.length>30));assert.ok(q.answer>=0&&q.answer<=3);assert.ok(q.hint.length>30);}
 assert.equal(original.length+grammar.length+rwPractice.length,120);
 for(const chapter of Object.values(chapters)){assert.equal(chapter.sections.length,4);assert.ok(chapter.sections.every(([title,text])=>title&&text.length>200));assert.equal(chapter.check.choices.length,4);assert.ok(chapter.check.why.length>50);}
});
test('uncertain correct answers stay in review and confident retries expand their interval',()=>{
 const now=1000000000;let p=schedule({}, {correct:true,confidence:'unsure',selected:1,hint:false},now);assert.equal(p.needsReview,true);assert.equal(p.streak,0);
 p=schedule(p,{correct:true,confidence:'confident',selected:1,hint:false},now+DAY);assert.equal(p.needsReview,false);assert.equal(p.due,now+2*DAY);
 p=schedule(p,{correct:true,confidence:'confident',selected:1,hint:false},now+2*DAY);assert.equal(p.due,now+5*DAY);
 p=schedule(p,{correct:true,confidence:'confident',selected:1,hint:true},now+3*DAY);assert.equal(p.needsReview,true);assert.equal(p.streak,0);
});
test('first-attempt statistics do not improve when the same question is retried',()=>{
 let p=schedule({}, {correct:false,confidence:'confident',selected:0},1);p=schedule(p,{correct:true,confidence:'confident',selected:1},2);
 const result=statistics({a:p},['a','unseen']);assert.equal(result.firstCorrect,0);assert.equal(result.latestCorrect,1);assert.equal(result.unique,1);assert.equal(result.total,2);
});
test('question selection respects all filters and does not fill a set with unrelated questions',()=>{
 const bank=rwPractice;const q=bank[0],progress={[q.id]:{attempts:[{correct:true}],starred:true}};
 assert.equal(matches(q,{subject:'Math'},progress),false);assert.ok(matches(q,{status:'Saved'},progress));assert.equal(matches(q,{status:'Unseen'},progress),false);
 assert.deepEqual(chooseSession(bank,progress,{mode:'saved',count:8}).map(q=>q.id),[q.id]);
 assert.equal(chooseSession(bank,progress,{filters:{subject:'Math'}}).length,0);
 assert.deepEqual(seededShuffle(bank,'today'),seededShuffle(bank,'today'));assert.equal(new Set(seededShuffle(bank,'today').map(q=>q.id)).size,bank.length);
});
test('resumable sessions accept unfinished drafts but reject invalid indices and choices',()=>{
 const bank=rwPractice,s={ids:[bank[0].id,bank[1].id],index:0,feedback:'test',answers:[],drafts:[{selected:1,confidence:null}],elapsed:100};
 assert.ok(validateSession(s,bank));assert.equal(validateSession({...s,index:2},bank),null);assert.equal(validateSession({...s,ids:['missing']},bank),null);assert.equal(validateSession({...s,drafts:[{selected:8,confidence:'confident'}]},bank),null);
});

test('first-attempt evidence survives more than thirty retries',()=>{
 let p=schedule({}, {correct:false,confidence:'confident',selected:0},1);
 for(let i=0;i<40;i++)p=schedule(p,{correct:true,confidence:'confident',selected:1},i+2);
 const result=statistics({a:p},['a']);assert.equal(p.attempts.length,30);assert.equal(result.firstCorrect,0);assert.equal(result.total,41);
});
