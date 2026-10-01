import { AppError } from './providers.mjs';

export function questionAddress(q) {
  return `Test ${q.test} · ${q.section === 'math' ? 'Math' : 'Reading & Writing'} · Module ${q.module} · Question ${q.number}`;
}
export function identifyQuestion(messages, questions, selectedId) {
  if (/\b(?:new|different) (?:question|problem|topic)\b/i.test(messages.at(-1)?.content || '')) return null;
  if (selectedId) {
    const question = questions.find(q => q.id === selectedId);
    if (!question) throw new AppError(400, 'That question is not in your imported SAT bundles.', 'INVALID_QUESTION');
    const latest=messages.at(-1)?.content || '';
    const test=latest.match(/(?:test|bundle)\s*#?\s*(\d{1,2})\b/i), module=latest.match(/module\s*#?\s*([12])\b/i), number=latest.match(/(?:question|q)\s*#?\s*(\d{1,2})\b/i);
    const section=/\bmath\b/i.test(latest)?'math':/reading|writing|english|\brw\b/i.test(latest)?'rw':null;
    const different=(test&&+test[1]!==question.test)||(module&&+module[1]!==question.module)||(number&&+number[1]!==question.number)||((test||module||number)&&section&&section!==question.section);
    if(!different) return question;
  }
  // Use only complete addresses, with all four coordinates. Never guess a module.
  for (const message of [...messages].reverse().filter(m => m.role === 'user')) {
    const test = message.content.match(/(?:test|bundle)\s*#?\s*(\d{1,2})\b/i);
    const module = message.content.match(/module\s*#?\s*([12])\b/i);
    const number = message.content.match(/(?:question|q)\s*#?\s*(\d{1,2})\b/i);
    const section = /\bmath\b/i.test(message.content) ? 'math' : /reading|writing|english|\brw\b/i.test(message.content) ? 'rw' : null;
    if (test && module && number && section) {
      const found = questions.find(q => q.test === +test[1] && q.module === +module[1] && q.number === +number[1] && q.section === section);
      if (!found) throw new AppError(400, 'That full question address was not found. Check the test, section, module, and question number.', 'QUESTION_NOT_FOUND');
      return found;
    }
    // A newly mentioned incomplete address must not silently reuse an older question.
    if (test || module || number) return null;
  }
  return null;
}
export function officialContext(q) {
  if (!q) return '';
  return `\n<official_question_reference>\nADDRESS: ${questionAddress(q)}\nQUESTION TEXT (PDF extraction; mathematical notation and diagrams may be incomplete):\n${q.text}\nOFFICIAL COLLEGE BOARD EXPLANATION:\n${q.explanation}\n</official_question_reference>\nThis reference applies only to the official question at the stated address. Follow the latest user message and conversation when deciding what to explain. If the student is answering your original transfer exercise, its answer is separate from this official answer key. Do not grade a transfer answer against the official key or replace a newly asked problem with this older one. Cite the address above in your explanation. The official explanation is the authoritative answer reference. Use its mathematical expressions to resolve extraction errors; if essential information is still missing, say so and ask the learner to check the original image. Do not invent a graph, number, passage sentence, or answer choice. Do not output unrelated neighboring questions. In hint mode do not reveal the answer or quote the explanation. In detailed mode explain the official reasoning in simpler steps, teach the underlying skill, explain the learner's chosen-answer error when provided, and check the result. Do not merely copy the explanation.`;
}
export function questionSources(q) {
  return q ? [
    { id:q.id, title:questionAddress(q), url:`/api/bundle-asset?file=${encodeURIComponent(q.testFile)}#page=${q.page}` },
    { id:`${q.id}-answer`, title:'Official answer explanation', url:`/api/bundle-asset?file=${encodeURIComponent(q.answerFile)}#page=${q.answerPages[0]}` },
  ] : [];
}
