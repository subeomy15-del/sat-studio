import {test} from 'node:test';
import assert from 'node:assert/strict';
import {skills,questions,selectQuestions} from '../public/grammar-data.js';
test('grammar diagnostic covers every skill and original questions have complete feedback',()=>{
 assert.equal(skills.length,8);assert.equal(questions.length,24);assert.equal(new Set(questions.map(q=>q.id)).size,24);
 for(const q of questions){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert.equal(q.reasons.length,4);assert.ok(q.reasons.every(r=>r.length>20));assert.ok(q.answer>=0&&q.answer<4);}
 assert.equal(new Set(selectQuestions('diagnostic').map(q=>q.skill)).size,8);
});
test('targeted review excludes successful answers and practice prioritizes unseen items',()=>{
 const [a,b,c]=questions;const attempts={[a.id]:{correct:false,time:10},[b.id]:{correct:true,time:20}};
 assert.deepEqual(selectQuestions('review',null,attempts).map(q=>q.id),[a.id]);
 assert.equal(selectQuestions('practice',a.skill,attempts)[0].id,c.id);
 assert.ok(selectQuestions('practice',a.skill).every(q=>q.skill===a.skill));
});
