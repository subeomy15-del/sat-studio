import {schedule} from './practice-core.js';
const KEY='margin-learning-v3';
let state={version:3,questions:{},sessions:[],active:null,profile:{minutes:20,focus:'Reading & Writing'},completed:[]};
try{const s=JSON.parse(localStorage.getItem(KEY));if(s?.version===3&&s.questions&&typeof s.questions==='object'&&!Array.isArray(s.questions)&&Array.isArray(s.sessions))state={...state,...s};}catch{}
export const learning=()=>state;
let lastStorageNotice=0;
export function saveLearning(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{if(Date.now()-lastStorageNotice>10000){lastStorageNotice=Date.now();globalThis.dispatchEvent?.(new CustomEvent('margin-storage-error'));}return false;}}
export function recordAttempt(id,answer){state.questions[id]=schedule(state.questions[id],answer);saveLearning();}
export function updateQuestion(id,fields){state.questions[id]={...(state.questions[id]||{}),...fields};return saveLearning();}
export function setActive(session){state.active=session;saveLearning();}
export function completeSession(run){state.sessions=[run,...state.sessions].slice(0,100);state.active=null;saveLearning();}
export function markLesson(id){if(!state.completed.includes(id))state.completed.push(id);saveLearning();}
export function setProfile(fields){state.profile={...state.profile,...fields};saveLearning();}
export function exportLearning(){return JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2);}
export function importLearning(raw,validIds){
 const s=JSON.parse(raw);if(s?.version!==3||!s.questions||typeof s.questions!=='object'||Array.isArray(s.questions)||!Array.isArray(s.sessions)||!Array.isArray(s.completed))throw Error('Choose a Margin learning backup.');
 const questions={};
 for(const [id,p] of Object.entries(s.questions)){
  if(!validIds.has(id)||!p||typeof p!=='object')continue;
  const attempts=(Array.isArray(p.attempts)?p.attempts:[]).filter(a=>a&&typeof a.correct==='boolean'&&Number.isInteger(a.selected)&&a.selected>=0&&a.selected<=3&&['confident','unsure'].includes(a.confidence)&&Number.isFinite(a.time)&&a.time>=0).slice(-30).map(a=>({correct:a.correct,selected:a.selected,confidence:a.confidence,hint:!!a.hint,time:a.time}));
  const first=p.firstAttempt&&typeof p.firstAttempt.correct==='boolean'&&Number.isInteger(p.firstAttempt.selected)&&p.firstAttempt.selected>=0&&p.firstAttempt.selected<=3&&['confident','unsure'].includes(p.firstAttempt.confidence)&&Number.isFinite(p.firstAttempt.time)?{correct:p.firstAttempt.correct,selected:p.firstAttempt.selected,confidence:p.firstAttempt.confidence,hint:!!p.firstAttempt.hint,time:p.firstAttempt.time}:attempts[0];
  questions[id]={attempts,firstAttempt:first,attemptCount:Number.isInteger(p.attemptCount)?Math.max(attempts.length,Math.min(1000000,p.attemptCount)):attempts.length,starred:!!p.starred,note:typeof p.note==='string'?p.note.slice(0,3000):'',streak:Number.isInteger(p.streak)?Math.max(0,Math.min(30,p.streak)):0,needsReview:!!p.needsReview,due:Number.isFinite(p.due)?p.due:0,last:attempts.at(-1)?.time||0};
 }
 const sessions=s.sessions.filter(r=>r&&typeof r.id==='string'&&Number.isInteger(r.total)&&r.total>0&&r.total<=40&&Number.isInteger(r.correct)&&r.correct>=0&&r.correct<=r.total&&Number.isInteger(r.independent)&&r.independent>=0&&r.independent<=r.correct&&Number.isFinite(r.time)&&Number.isFinite(r.elapsed)&&r.elapsed>=0).slice(0,100).map(r=>({id:r.id,total:r.total,correct:r.correct,independent:r.independent,time:r.time,elapsed:r.elapsed,title:typeof r.title==='string'?r.title.slice(0,120):'Practice session',ids:Array.isArray(r.ids)?r.ids.filter(id=>validIds.has(id)):[]}));
 const previous=state;
 state={version:3,questions,sessions,active:null,profile:{minutes:[10,20,30,45].includes(s.profile?.minutes)?s.profile.minutes:20,focus:['Math','Reading & Writing','All'].includes(s.profile?.focus)?s.profile.focus:'Reading & Writing',goal:typeof s.profile?.goal==='string'?s.profile.goal.slice(0,160):'',testDate:/^\d{4}-\d{2}-\d{2}$/.test(s.profile?.testDate||'')?s.profile.testDate:''},completed:s.completed.filter(id=>typeof id==='string'&&id.length<100)};
 if(!saveLearning()){state=previous;throw Error('This browser could not store the restored progress. Your current session is unchanged.');}
}
