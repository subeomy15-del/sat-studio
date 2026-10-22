export const DAY=86400000;
export function classify(q){
 if(q.category==='Math'){
  const t=q.topic.toLowerCase();
  if(/linear|slope|systems/.test(t))return 'Algebra';
  if(/quadratic|discriminant|absolute|exponen|radical|polynomial|rational|nonlinear|function/.test(t))return 'Advanced Math';
  if(/geometry|circle|triangle|trigon|volume|area/.test(t))return 'Geometry & Trigonometry';
  if(/percent|ratio|probab|statist|data|sampl|unit|scatter|proportion|margin of error|weighted mean|study design/.test(t))return 'Problem-Solving & Data Analysis';
  return 'Algebra';
 }
 const t=q.topic.toLowerCase();
 if(/transition|synthesis|notes|rhetorical/.test(t))return 'Expression of Ideas';
 if(/vocab|context|purpose|structure|paired|cross-text/.test(t))return 'Craft & Structure';
 if(/inferen|evidence|main idea|graph|claim|central|quantitative/.test(t))return 'Information & Ideas';
 return 'Standard English Conventions';
}
export function matches(q,f={},progress={}){
 const a=progress[q.id];
 return (!f.subject||f.subject==='All'||q.subject===f.subject)&&(!f.domain||f.domain==='All'||q.domain===f.domain)&&(!f.difficulty||f.difficulty==='All'||q.difficulty===f.difficulty)&&(!f.topic||f.topic==='All'||q.topic===f.topic)&&(!f.search||`${q.stem} ${q.topic} ${q.domain}`.toLowerCase().includes(f.search.toLowerCase()))&&(!f.status||f.status==='All'||(f.status==='Unseen'&&!a?.attempts?.length)||(f.status==='Review'&&a?.needsReview)||(f.status==='Saved'&&a?.starred));
}
export function seededShuffle(items,seed){let n=2166136261;for(const c of String(seed))n=Math.imul(n^c.charCodeAt(0),16777619);const out=[...items];for(let i=out.length-1;i>0;i--){n^=n<<13;n^=n>>>17;n^=n<<5;const j=(n>>>0)%(i+1);[out[i],out[j]]=[out[j],out[i]];}return out;}
export function schedule(previous={},answer,now=Date.now()){
 const secure=answer.correct&&answer.confidence==='confident'&&!answer.hint;
 const streak=secure?(previous.streak||0)+1:0;
 const days=secure?[1,3,7,14,30][Math.min(streak-1,4)]:1;
 const attempt={...answer,time:now};
 return {...previous,firstAttempt:previous.firstAttempt||previous.attempts?.[0]||attempt,attemptCount:Math.max(previous.attemptCount||0,previous.attempts?.length||0)+1,attempts:[...(previous.attempts||[]),{...answer,time:now}].slice(-30),streak,needsReview:!secure,due:now+days*DAY,last:now};
}
export function statistics(progress,ids){
 const rows=ids.map(id=>progress[id]).filter(p=>p?.attempts?.length);
 const first=rows.map(r=>r.firstAttempt||r.attempts[0]);const latest=rows.map(r=>r.attempts.at(-1));
 return {unique:rows.length,total:rows.reduce((n,r)=>n+(r.attemptCount||r.attempts.length),0),firstCorrect:first.filter(a=>a.correct).length,latestCorrect:latest.filter(a=>a.correct).length,review:rows.filter(r=>r.needsReview).length,confident:latest.filter(a=>a.correct&&a.confidence==='confident'&&!a.hint).length};
}
export function chooseSession(bank,progress,{count=8,mode='mixed',filters={},seed=Date.now()}={}){
 let pool=bank.filter(q=>matches(q,filters,progress));
 if(mode==='review')pool=pool.filter(q=>progress[q.id]?.needsReview||progress[q.id]?.due<=Date.now());
 if(mode==='saved')pool=pool.filter(q=>progress[q.id]?.starred);
 const shuffled=seededShuffle(pool,seed);
 if(!['review','saved'].includes(mode))shuffled.sort((a,b)=>Number(!!progress[a.id]?.attempts?.length)-Number(!!progress[b.id]?.attempts?.length));
 return shuffled.slice(0,count);
}
export function validateSession(s,bank){
 if(!s||!Array.isArray(s.ids)||!s.ids.length||s.ids.length>40||new Set(s.ids).size!==s.ids.length||!s.ids.every(id=>bank.some(q=>q.id===id))||!Number.isInteger(s.index)||s.index<0||s.index>=s.ids.length||!['learn','test'].includes(s.feedback)||!Array.isArray(s.answers)||!Array.isArray(s.drafts)||!Number.isFinite(s.elapsed)||s.elapsed<0)return null;
 if(s.answers.length>s.ids.length||s.drafts.length>s.ids.length)return null;
 for(let i=0;i<s.ids.length;i++){
  const draft=s.drafts[i],answer=s.answers[i];
  if(draft&&((draft.selected!==null&&(!Number.isInteger(draft.selected)||draft.selected<0||draft.selected>3))||(draft.confidence!==null&&!['confident','unsure'].includes(draft.confidence))||(draft.eliminated&&(!Array.isArray(draft.eliminated)||draft.eliminated.some(n=>!Number.isInteger(n)||n<0||n>3)))))return null;
  if(answer&&(!Number.isInteger(answer.selected)||answer.selected<0||answer.selected>3||!['confident','unsure'].includes(answer.confidence)||typeof answer.correct!=='boolean'))return null;
 }
 return s;
}
