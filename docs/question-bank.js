import {questions as grammar,skills} from './grammar-data.js';
import {rwPractice} from './rw-practice.js';
import {requestAPI} from './runtime.js';
import {classify} from './practice-core.js';
let promise;
export function loadBank(){
 promise??=requestAPI('/api/practice-bank').then(({questions:original})=>[
  ...grammar.map(q=>({id:q.id,subject:'Reading & Writing',domain:skills.find(s=>s.id===q.skill).domain==='Boundaries'?'Standard English Conventions':'Standard English Conventions',skill:skills.find(s=>s.id===q.skill).domain,topic:skills.find(s=>s.id===q.skill).title,difficulty:q.level?'Hard':'Easy',stem:q.text,choices:q.choices,answer:q.answer,reasons:q.reasons,explanation:q.reasons[q.answer],structure:q.structure,hint:skills.find(s=>s.id===q.skill).strategy,source:'Original practice',course:q.skill})),
  ...rwPractice,
  ...original.map(q=>({id:`bank-${q.id}`,subject:q.category==='Math'?'Math':'Reading & Writing',domain:classify(q),topic:q.topic,difficulty:q.difficulty,stem:q.question,choices:q.choices,answer:q.answerIndex,explanation:q.explanation,hint:q.hint,source:'Original practice'}))
 ]).catch(e=>{promise=null;throw e;});return promise;
}
