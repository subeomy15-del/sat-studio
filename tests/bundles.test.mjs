import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {identifyQuestion,officialContext,questionSources} from '../lib/bundles.mjs';
import {diagnosticQuiz} from '../lib/study.mjs';
const bundles=JSON.parse(await readFile(new URL('../data/bundles.json',import.meta.url),'utf8'));
test('all 960 full question addresses have distinct images and matching explanations',async()=>{
 assert.equal(bundles.questions.length,960);assert.equal(new Set(bundles.questions.map(q=>q.id)).size,960);
 for(const q of bundles.questions){assert.ok(q.text.length>20,q.id);assert.ok(q.explanation.length>100,q.id);assert.ok(q.answerPages.length,q.id);if(q.section==='math')assert.ok(q.explanationImages.length,q.id);}
 for(const file of [...new Set(bundles.questions.flatMap(q=>[q.image,...(q.explanationImages||[])]))])assert.ok((await stat(new URL('../docs/bundles/'+file,import.meta.url))).size>1000,file);
 for(let test=4;test<=11;test++)for(const section of ['math','rw'])for(let module=1;module<=2;module++)assert.equal(bundles.questions.filter(q=>q.test===test&&q.section===section&&q.module===module).length,section==='math'?27:33);
});
test('exact retrieval preserves the source and follow-ups, while incomplete addresses never guess',()=>{
 const q=identifyQuestion([{role:'user',content:'Test 6, Math, Module 1, Question 10'}],bundles.questions);assert.equal(q.id,'t6-math-m1-q10');assert.equal(q.answer,'B');assert.match(q.text,/1,700/);assert.match(q.explanation,/70/);assert.match(officialContext(q),/authoritative answer reference/);assert.equal(questionSources(q).length,2);
 assert.equal(identifyQuestion([{role:'user',content:'Test 6, Math, Module 1, Question 10'},{role:'assistant',content:'40 days'},{role:'user',content:'Why subtract first?'}],bundles.questions).id,q.id);
 assert.equal(identifyQuestion([{role:'user',content:'Test 6, Math, Module 1, Question 10'},{role:'user',content:'Test 7 question 5'}],bundles.questions),null);
 assert.equal(identifyQuestion([{role:'user',content:'Module 2, question 3'}],bundles.questions,q.id),null);
 assert.equal(identifyQuestion([{role:'user',content:'A new problem: 1200 bags, 25 used per day.'}],bundles.questions,q.id),null);
 assert.throws(()=>identifyQuestion([],bundles.questions,'t99-math-m1-q1'));
});
test('diagnostic samples all eight domains without repeated questions',async()=>{const bank=JSON.parse(await readFile(new URL('../data/practice.json',import.meta.url),'utf8'));const quiz=diagnosticQuiz(bank);assert.equal(quiz.questions.length,16);assert.equal(new Set(quiz.questions.map(q=>q.id)).size,16);const groups=Map.groupBy(quiz.questions,q=>q.domain);assert.equal(groups.size,8);for(const group of groups.values())assert.equal(group.length,2);});
