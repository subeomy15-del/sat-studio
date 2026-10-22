import {test} from 'node:test';
import assert from 'node:assert/strict';
import {skills,questions,selectQuestions,summarize} from '../public/grammar-data.js';
test('advanced diagnostic and benchmark cover every skill with disjoint questions',()=>{
 assert.equal(skills.length,8);assert.equal(questions.length,40);assert.equal(new Set(questions.map(q=>q.id)).size,40);
 for(const q of questions){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert.equal(q.reasons.length,4);assert.ok(q.reasons.every(r=>r.length>20));assert.ok(q.answer>=0&&q.answer<4);if(q.level){assert.equal(q.structure.length,3);assert.equal(q.text.split('____').length,2);}}
 const diagnostic=selectQuestions('diagnostic'),benchmark=selectQuestions('benchmark');
 assert.equal(new Set(diagnostic.map(q=>q.skill)).size,8);assert.equal(new Set(benchmark.map(q=>q.skill)).size,8);assert.ok(benchmark.every(q=>!diagnostic.some(d=>d.id===q.id)));
});
test('targeted review includes uncertain answers; advanced drills and foundations stay separate',()=>{
 const [a,b]=skills[0].advanced;const attempts={[a.id]:{correct:false,time:10},[b.id]:{correct:true,time:20}};
 assert.deepEqual(selectQuestions('review',null,attempts).map(q=>q.id),[a.id]);
 assert.ok(selectQuestions('practice',a.skill).every(q=>q.skill===a.skill&&q.level==='Advanced'));
 assert.equal(selectQuestions('foundation',a.skill).length,3);assert.ok(selectQuestions('foundation',a.skill).every(q=>!q.level));
});
test('a guessed correct answer does not count as independently secure',()=>{
 const result=summarize([{skill:'boundaries',correct:true,confidence:'unsure',hint:false},{skill:'verbs',correct:true,confidence:'confident',hint:false},{skill:'agreement',correct:true,confidence:'confident',hint:true},{skill:'pronouns',correct:false,confidence:'confident',hint:false}]);
 assert.equal(result.correct,3);assert.equal(result.independent,1);assert.equal(result.uncertain,1);assert.deepEqual(result.weak.map(s=>s.id),['boundaries','agreement','pronouns']);
});
