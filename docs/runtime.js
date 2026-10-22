import { hosted } from './site-config.js';
import { retrieveLessons, tutorPrompt, validateChat, validateQuizRequest, practiceQuiz, generateQuiz, diagnosticQuiz } from './core/study.mjs';
import { identifyQuestion, officialContext, questionSources } from './core/bundles.mjs';
export { hosted };
let engine, worker, loading = false, model = '', busy = false;
const cache = new Map();
async function data(name) {
  if (!cache.has(name)) cache.set(name, fetch(new URL(`./data/${name}`, import.meta.url)).then(r => { if(!r.ok) throw Error('Study file unavailable. Refresh and try again.'); return name.endsWith('.json') ? r.json() : r.text(); }).catch(e=>{cache.delete(name);throw e;}));
  return cache.get(name);
}
export function assetURL(file) { return hosted ? `./bundles/${encodeURIComponent(file)}` : `/api/bundle-asset?file=${encodeURIComponent(file)}`; }
export function sourceURL(source) {
  if (!source.url || !source.url.startsWith('/api/bundle-asset?')) return `#library/${encodeURIComponent(source.id || '')}`;
  const url=new URL(source.url,location.origin),file=url.searchParams.get('file');
  if(!/^(?:sat-practice-test-\d+(?:-answers)?-digital|scoring-sat-practice-test-\d+-digital)\.pdf$/.test(file || '')) return '#bundles';
  const hash=/^#page=\d+$/.test(url.hash)?url.hash:'';
  return assetURL(file)+hash;
}
export async function startBrowserAI(selected, progress) {
  if (loading || busy) throw Error('Your tutor is busy. Wait for the current task to finish.');
  if (!navigator.gpu) throw Error('Browser AI needs WebGPU. Open this site in current Chrome or Edge on a computer. You can still use every lesson and official explanation here.');
  loading = true;
  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw Error('No compatible graphics adapter was found. Try Chrome or Edge on a computer.');
    if (!adapter.features.has('shader-f16')) selected = selected.replace('q4f16','q4f32');
    if (engine) await engine.unload();
    worker?.terminate(); engine = undefined;
    const { CreateWebWorkerMLCEngine } = await import('./vendor/browser-ai.js');
    for(let attempt=1;attempt<=3;attempt++){
      worker = new Worker(new URL('./vendor/ai-worker.js', import.meta.url), {type:'module'});
      try { engine = await CreateWebWorkerMLCEngine(worker, selected, {initProgressCallback:progress, logLevel:'ERROR'}, {context_window_size:8192}); break; }
      catch(error){
        worker.terminate();engine=undefined;
        if(attempt===3 || !/network|fetch|connection|ssl|timeout/i.test(error?.message || String(error))) throw error;
        progress?.({progress:0,text:`Connection interrupted. Retrying (${attempt+1}/3); completed model files stay cached.`});
        await new Promise(resolve=>setTimeout(resolve,2000));
      }
    }
    model = selected;
  } catch (e) {
    worker?.terminate(); engine = undefined;
    console.error('Browser AI initialization failed',e);
    throw Error(`AI could not start: ${e?.message || String(e)}. If this is a memory error, choose the smaller model. Lessons and official explanations remain available.`);
  } finally { loading = false; }
}
export function stopBrowserAI() { if(busy) engine?.interruptGenerate(); }
function fitMessages(messages, system) {
  // Keep recent turns without truncating the current question or official reference.
  const remaining = 20000 - system.length;
  let chars = 0; const out = [];
  for (const m of [...messages].reverse()) { if(chars + m.content.length > remaining && out.length) break; out.unshift({...m}); chars += m.content.length; }
  while(out[0]?.role === 'assistant') out.shift();
  out.at(-1).content += '\n/no_think';
  return out;
}
async function generate({system,messages,maxTokens=2000,schema}, onToken) {
  if (!engine) throw Error('Start the browser AI in Connection settings first. The first model download can take several minutes.');
  const stream = await engine.chat.completions.create({messages:[{role:'system',content:system},...fitMessages(messages,system)],temperature:0.2,max_tokens:Math.min(maxTokens,3000),stream:true,...(schema?{response_format:{type:'json_object',schema:JSON.stringify(schema)}}:{})});
  let reply=''; let finished;
  for await(const chunk of stream) { reply += chunk.choices[0]?.delta?.content || ''; finished = chunk.choices[0]?.finish_reason || finished; onToken?.(reply.replace(/<think>[\s\S]*?<\/think>/g,'')); }
  reply = reply.replace(/<think>[\s\S]*?<\/think>/g,'').trim();
  if (!reply) throw Error('The model returned no explanation. Try a shorter question.');
  if(finished==='length' && !schema) reply += '\n\n*Response reached its length limit. Ask “continue” for the remaining explanation.*';
  return {reply,provider:'browser',model};
}
export async function requestAPI(path, body, signal, onToken) {
  if (!hosted) {
    const r = await fetch(path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal});
    const result = await r.json(); if(!r.ok) throw Error(result.message || result.error || 'Request failed.'); return result;
  }
  const url = new URL(path, location.origin);
  if(url.pathname==='/api/health') return {ready:!!engine,provider:'browser',model,message:engine?'Browser AI ready. Your questions are processed on this device.':'Start your browser AI below. The model downloads once and is cached by your browser when space permits. Use Chrome or Edge with WebGPU.',version:'3.0'};
  if(url.pathname==='/api/practice-bank') return {questions:await data('practice.json')};
  if(url.pathname==='/api/library') return {lessons:await data('lessons.json')};
  if(url.pathname==='/api/diagnostic') return diagnosticQuiz(await data('practice.json'));
  if(url.pathname==='/api/guide') return {content:await data('guide.md')};
  if(url.pathname==='/api/bundles') {const b=await data('bundles.json');return {count:b.questions.length,documents:b.documents,questions:b.questions.map(({id,test,section,module,number,page})=>({id,test,section,module,number,page}))};}
  if(url.pathname==='/api/bundle-question') {const b=await data('bundles.json');const q=b.questions.find(q=>q.id===url.searchParams.get('id'));if(!q)throw Error('Question not found.');return {...q,address:`Test ${q.test} · ${q.section==='math'?'Math':'Reading & Writing'} · Module ${q.module} · Question ${q.number}`,sources:questionSources(q)};}
  if(busy) throw Error('Your tutor is already working. Wait for it to finish.');
  if(url.pathname==='/api/quiz') {const req=validateQuizRequest(body);if(req.source==='practice')return practiceQuiz(await data('practice.json'),req);busy=true;try{return await generateQuiz({generate},req);}finally{busy=false;}}
  if(url.pathname==='/api/chat') {
    const req=validateChat(body);const b=await data('bundles.json');
    const q=identifyQuestion(req.messages,b.questions,req.questionId);
    const relevant=retrieveLessons(await data('lessons.json'),req.messages.at(-1).content,req.lessonId).slice(0,2).map(l=>({...l,content:l.content.slice(0,1800)}));
    const system=tutorPrompt({style:req.style,lessons:relevant,guide:'',query:req.messages.at(-1).content,learner:req.learner})+officialContext(q);
    busy=true;try{return {...await generate({system,messages:req.messages,maxTokens:req.style==='quick'?700:req.style==='socratic'?400:2000},onToken),questionId:q?.id,sources:[...questionSources(q),...relevant.map(l=>({id:l.id,title:l.title}))]};}finally{busy=false;}
  }
  throw Error('That feature is unavailable.');
}
