import {skills,questions,selectQuestions,summarize} from './grammar-data.js';
const key='margin-grammar-v1';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let saved={attempts:{},lessons:[],runs:[]};
try{const s=JSON.parse(localStorage.getItem(key));if(s&&typeof s.attempts==='object'&&s.attempts&&!Array.isArray(s.attempts)&&Array.isArray(s.lessons))saved={...s,runs:Array.isArray(s.runs)?s.runs:[]};}catch{}
let session=null,notice='';
function persist(){try{localStorage.setItem(key,JSON.stringify(saved));}catch{notice='Progress could not be saved. Keep this tab open or download a backup.';}}
const button=(label,action,extra='')=>`<button class="button ${extra}" data-g="${action}">${label}</button>`;
const formatTime=ms=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
// Only updates a mounted clock; no timer submits answers or mutates progress.
setInterval(()=>{const clock=document.querySelector('#grammar-clock');if(clock&&session)clock.textContent=formatTime(Date.now()-session.started);},1000);
export function renderGrammar(root){
 const missed=questions.filter(q=>saved.attempts[q.id]?.correct===false).length;
 const tried=questions.filter(q=>saved.attempts[q.id]).length;
 root.innerHTML=`<div class="page-heading"><div><div class="eyebrow">DIGITAL SAT / STANDARD ENGLISH CONVENTIONS</div><h1>SAT grammar.<br>Every choice needs a reason.</h1><p>For students targeting high Reading and Writing scores. Train on the structures that hide behind difficult sentences.</p></div></div>
 <div class="grammar-banner"><div><div class="eyebrow">ADVANCED PRACTICE / ORIGINAL SAT-STYLE MATERIAL</div><h2>Find the clause.<br>Expose the trap. Commit.</h2><p>Dense passages. Close distractors. A structural explanation for every answer.</p><div class="inline-actions">${button('Start advanced diagnostic · 8 questions','diagnostic','primary')}${button('Mixed benchmark · 8 questions','benchmark')}</div><p class="grammar-banner-note">Benchmark: aim for 8 minutes as a training target. Feedback appears after submission. This is a grammar drill, not a full SAT module.</p></div><span class="grammar-symbol" aria-hidden="true">[S]<br><span>→ [V]</span></span></div>
 <div class="grammar-stats"><span><strong>16</strong> advanced items</span><span><strong>24</strong> foundation items</span><span><strong>${tried}/40</strong> attempted</span></div>
 <div class="grammar-session-actions">${button(`Review mistakes & uncertainty · ${missed}`,'review')}${saved.runs.length?`<span class="muted">Last benchmark: ${Number(saved.runs[0].correct)||0}/8 correct · ${escape(formatTime(saved.runs[0].elapsed||0))}</span>`:''}</div>
 ${notice?`<p role="status">${escape(notice)}</p>`:''}<section id="grammar-work" aria-live="polite"></section>
 <div class="section-top"><h2>The SAT grammar playbook</h2><span>Advanced first. Foundations when you need them.</span></div>
 <div class="grammar-grid">${skills.map((s,i)=>{const a=s.advanced.filter(q=>saved.attempts[q.id]);const correct=a.filter(q=>saved.attempts[q.id].correct).length;return `<article class="grammar-skill"><div class="eyebrow">${String(i+1).padStart(2,'0')} / ${s.domain}</div><h3>${s.title}</h3><p>${s.playbook.trap}</p><small>${a.length?`${correct}/${a.length} advanced items secure on latest attempts`:'Advanced items not attempted'} · ${saved.lessons.includes(s.id)?'Playbook studied':'Structure + elimination'}</small><div class="inline-actions">${button('Open playbook',`learn:${s.id}`)}${button('Advanced drill →',`practice:${s.id}`,'ghost')}${button('Foundation',`foundation:${s.id}`,'ghost small')}</div></article>`;}).join('')}</div>
 <section class="grammar-transfer"><div class="eyebrow">TRANSFER TO OFFICIAL QUESTIONS</div><h2>Prove the method on real SAT material.</h2><p>Use College Board’s Student Question Bank: choose SAT → Reading and Writing → Standard English Conventions, then filter for hard questions. Practice both Boundaries and Form, Structure, and Sense. This course’s difficulty labels are editorial, not College Board ratings.</p><a class="button primary" href="https://satsuitequestionbank.collegeboard.org/" target="_blank" rel="noopener noreferrer">Open official Student Question Bank ↗</a> <a class="button" href="#bundles">Open Margin’s official practice tests →</a></section>
 <details class="grammar-glossary"><summary>Quick reference: the terms used in explanations</summary><p><strong>Head subject:</strong> the main noun a verb agrees with. <strong>Finite verb:</strong> a verb marked for tense, such as “reveals” or “was”; an -ing form alone is not finite. <strong>Independent clause:</strong> a complete thought with a subject and finite verb. <strong>Supplement:</strong> extra information removable without breaking the sentence.</p>${skills.map(s=>`<p>${escape(s.glossary)}</p>`).join('')}</details>
 <div class="grammar-tools"><h3>Keep your training history.</h3><p>Progress stays in this browser. Download a grammar backup to move it to another device.</p>${button('Download grammar backup','export')} <label class="button">Restore grammar backup<input type="file" id="grammar-import" accept="application/json" hidden></label><p id="grammar-import-status" role="status"></p></div>
 <p class="footnote">40 original practice questions. Grammar practice alone does not cover the full Reading and Writing section or predict a score. <a href="https://satsuite.collegeboard.org/practice/content-domains" target="_blank" rel="noopener noreferrer">See College Board’s content domains ↗</a></p>`;
 root.onclick=e=>{
  const action=e.target.closest('[data-g]')?.dataset.g;if(!action)return;
  const [type,id]=action.split(':');
  if(type==='learn')lesson(id);
  else if(['diagnostic','benchmark','practice','foundation','review'].includes(type)){
   session={mode:type,items:selectQuestions(type,id,saved.attempts),index:0,answers:[],drafts:[],selected:null,confidence:null,checked:false,hint:false,started:Date.now()};work();
  }else if(type==='choose'&&session&&!session.checked){session.selected=Number(id);work(false);}
  else if(type==='confidence'&&session&&!session.checked){session.confidence=id;work(false);}
  else if(type==='hint'&&session&&session.mode!=='benchmark'){session.hint=true;work(false);}
  else if(type==='check')check();
  else if(type==='next'&&session){session.index++;loadDraft();work();}
  else if(type==='back'&&session&&session.index>0){session.drafts[session.index]={selected:session.selected,confidence:session.confidence};session.index--;loadDraft();work();}
  else if(type==='review-item'&&session){explain(session.items.find(q=>q.id===id));}
  else if(type==='results'&&session)results();
  else if(type==='close'){session=null;renderGrammar(root);}
  else if(type==='complete'){if(!saved.lessons.includes(id))saved.lessons.push(id);persist();renderGrammar(root);lesson(id);}
  else if(type==='export'){const blob=new Blob([JSON.stringify({version:1,...saved},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='margin-grammar-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 };
 root.querySelector('#grammar-import').onchange=async e=>{const status=root.querySelector('#grammar-import-status');try{
  const file=e.target.files[0];if(!file)return;if(file.size>1000000)throw Error('Choose a grammar backup under 1 MB.');const s=JSON.parse(await file.text());if(s.version!==1||!s.attempts||typeof s.attempts!=='object'||!Array.isArray(s.lessons))throw Error('Choose a Margin grammar backup.');const attempts={};
  for(const q of questions){const a=s.attempts[q.id];if(a&&typeof a.correct==='boolean'&&Number.isFinite(a.time)&&a.time>=0)attempts[q.id]={correct:a.correct,time:a.time};}
  const runs=Array.isArray(s.runs)?s.runs.filter(r=>r&&Number.isInteger(r.correct)&&r.correct>=0&&r.correct<=8&&Number.isFinite(r.elapsed)&&r.elapsed>=0).slice(0,20):[];
  saved={attempts,lessons:s.lessons.filter(id=>skills.some(x=>x.id===id)),runs};persist();renderGrammar(root);root.querySelector('#grammar-import-status').textContent='Grammar progress restored.';
 }catch(err){status.textContent=err.message;}};
 function target(){return root.querySelector('#grammar-work');}
 function show(html,focus=true){target().innerHTML=`<div class="grammar-work-card" tabindex="-1">${html}</div>`;if(focus){target().firstElementChild.focus({preventScroll:true});target().scrollIntoView({behavior:'smooth',block:'start'});}}
 function structure(q){return q.structure?`<div class="grammar-structure"><div class="eyebrow">SENTENCE STRUCTURE</div><p><strong>${escape(q.structure[0])}</strong></p><span aria-hidden="true">↓</span><p><strong>${escape(q.structure[1])}</strong></p><p>${escape(q.structure[2])}</p></div>`:'';}
 function feedback(q,selected){return `${structure(q)}<div class="grammar-feedback"><h3>Answer ${'ABCD'[q.answer]} · ${escape(q.trap||'Rule application')}</h3>${q.reasons.map((r,i)=>`<p><strong>${'ABCD'[i]}${i===q.answer?' · correct':''}${i===selected?' · your choice':''}:</strong> ${escape(r)}</p>`).join('')}</div>`;}
 function lesson(id){const s=skills.find(s=>s.id===id);if(!s)return;const q=s.advanced[0];show(`<div class="eyebrow">${s.domain} / ADVANCED PLAYBOOK</div><h2>${s.title}</h2><p class="grammar-rule">${escape(s.rule)}</p><div class="grammar-method"><strong>Recognize the question</strong><p>${escape(s.playbook.signal)}</p><ol>${s.playbook.steps.map(step=>`<li>${escape(step)}</li>`).join('')}</ol><p><strong>The trap:</strong> ${escape(s.playbook.trap)}</p></div><h3>Worked SAT-style example</h3><p class="grammar-passage">${escape(q.text)}</p><div class="grammar-example-choices">${q.choices.map((c,i)=>`<p><strong>${'ABCD'[i]}.</strong> ${escape(c)}</p>`).join('')}</div>${feedback(q)}<div class="inline-actions">${button(saved.lessons.includes(id)?'Playbook studied ✓':'Mark playbook studied',`complete:${id}`)}${button('Apply it · advanced drill →',`practice:${id}`,'primary')}${button('Rebuild the basics',`foundation:${id}`,'ghost')}</div>`);}
 function loadDraft(){const d=session.drafts[session.index];session.selected=d?.selected??null;session.confidence=d?.confidence??null;session.checked=false;session.hint=false;}
 function record(q,a){saved.attempts[q.id]={correct:a.correct&&!a.hint&&a.confidence!=='unsure',time:Date.now()};}
 function check(){
  if(!session||session.checked||session.selected===null||!session.confidence)return;
  const q=session.items[session.index];
  const a={id:q.id,skill:q.skill,selected:session.selected,correct:session.selected===q.answer,hint:session.hint,confidence:session.confidence};
  session.answers[session.index]=a;session.drafts[session.index]={selected:session.selected,confidence:session.confidence};
  if(session.mode==='benchmark'){
   session.index++;loadDraft();if(session.index>=session.items.length){for(const [i,item] of session.items.entries())record(item,session.answers[i]);session.elapsed=Date.now()-session.started;saved.runs=[{correct:summarize(session.answers).correct,elapsed:session.elapsed,date:Date.now()},...saved.runs].slice(0,20);persist();}work();
  }else{record(q,a);persist();session.checked=true;work(false);}
 }
 function results(){
  const stats=summarize(session.answers);const elapsed=session.elapsed??Date.now()-session.started;session.elapsed=elapsed;
  show(`<div class="eyebrow">${session.mode==='benchmark'?'BENCHMARK':'TRAINING'} / DEBRIEF</div><h2>${stats.correct} of ${session.items.length} correct.</h2><div class="grammar-stats"><span><strong>${stats.independent}</strong> confident, without hints</span><span><strong>${stats.uncertain}</strong> uncertain</span><span><strong>${formatTime(elapsed)}</strong> elapsed</span></div><p>${stats.weak.length?'Your next work: explain the structure in these skills before increasing speed.':'All answers were confident and correct. Check transfer on unseen official questions before treating the skill as secure.'}</p><div class="inline-actions">${stats.weak.map(s=>button(s.title,`learn:${s.id}`)).join('')}</div><h3>Review every decision</h3><div class="grammar-result-list">${session.items.map((q,i)=>{const a=session.answers[i];return button(`${i+1}. ${a.correct?'Correct':'Missed'}${a.confidence==='unsure'?' · uncertain':''}${a.hint?' · hint used':''} — ${q.trap||skills.find(s=>s.id===q.skill).title}`,`review-item:${q.id}`);}).join('')}</div><p>Repeated items test recall as well as grammar. No result here estimates your SAT score.</p>${button('Update my roadmap','close','primary')}`);
 }
 function explain(q){if(!q)return;const a=session.answers.find(a=>a.id===q.id);show(`<div class="eyebrow">SESSION REVIEW / ${escape(q.level||'FOUNDATION')}</div><h2>${escape(q.trap||'Review your reasoning')}</h2><p class="grammar-passage">${escape(q.text)}</p><div class="grammar-example-choices">${q.choices.map((c,i)=>`<p><strong>${'ABCD'[i]}.</strong> ${escape(c)}</p>`).join('')}</div>${feedback(q,a?.selected)}${button('Back to debrief','results','primary')}`);}
 function work(focus=true){
  if(!session)return;const {items,index}=session;
  if(!items.length){show(`<h2>No mistakes or uncertain answers waiting.</h2><p>Try the advanced diagnostic or a skill drill. Incorrect, uncertain, and hint-assisted answers will appear here.</p>${button('Back to roadmap','close')}`);return;}
  if(index>=items.length){results();return;}
  const q=items[index],s=skills.find(s=>s.id===q.skill),exam=session.mode==='benchmark';
  show(`<div class="grammar-question-top"><div class="eyebrow">${exam?'MIXED BENCHMARK':session.mode==='diagnostic'?'ADVANCED DIAGNOSTIC':s.title} / ${index+1} OF ${items.length}</div><span>Elapsed <strong id="grammar-clock">${formatTime(Date.now()-session.started)}</strong></span></div><progress max="${items.length}" value="${index}" aria-label="Session progress"></progress><h2>Which choice completes the text so that it conforms to the conventions of Standard English?</h2><p class="grammar-passage">${escape(q.text)}</p><div class="grammar-choices" role="group" aria-label="Answer choices">${q.choices.map((c,i)=>`<button class="grammar-choice ${session.selected===i?'selected':''} ${session.checked&&i===q.answer?'correct':''}" data-g="choose:${i}" aria-pressed="${session.selected===i}" ${session.checked?'disabled':''}><span>${'ABCD'[i]}</span>${escape(c)}</button>`).join('')}</div>
  ${session.checked?`${feedback(q,session.selected)}${button(index===items.length-1?'See my next steps →':'Next question →','next','primary')}`:`<div class="grammar-confidence" role="group" aria-label="Confidence"><strong>How certain are you?</strong>${['confident','unsure'].map(c=>`<button class="button ${session.confidence===c?'primary':''}" data-g="confidence:${c}" aria-pressed="${session.confidence===c}">${c==='confident'?'I can explain the rule':'Unsure / guessing'}</button>`).join('')}</div>${!exam?(session.hint?`<p class="grammar-method"><strong>Structural hint:</strong> ${s.playbook.steps[0]}</p>`:button('Reveal a structural hint','hint','ghost')):'<p class="muted">Answers and explanations unlock after all eight questions.</p>'} <button class="button primary" data-g="check" ${session.selected===null||!session.confidence?'disabled':''}>${exam?(index===items.length-1?'Submit benchmark':'Save & continue →'):'Check answer'}</button>`}
  <div class="inline-actions">${exam&&index>0?button('← Previous question','back','ghost'):''}${button('Leave session','close','ghost')}</div>`,focus);
 }
}
