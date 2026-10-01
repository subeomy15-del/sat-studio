"""Preserve exact printed Math explanations; PDF text cannot represent every formula."""
import json,re
from pathlib import Path
import pdfplumber,pypdfium2 as pdfium
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'data/bundles.json'
b=json.loads(DATA.read_text()); qs={q['id']:q for q in b['questions']}
for q in qs.values():q['explanationImages']=[]
for test in range(4,12):
 path=ROOT/'data/bundles'/f'sat-practice-test-{test}-answers-digital.pdf'
 renderer=pdfium.PdfDocument(str(path)); current=None; section=None; module=None
 def segment(page,page_num,key,top,bottom):
  if not key or key not in qs or qs[key]['section']!='math' or bottom-top<15:return
  words=[c for c in page.chars if 25<c['x0']<page.width-25 and top<c['top']<bottom and c['text'].strip()]
  if not words:return
  top=max(top,min(c['top'] for c in words)-6);bottom=min(bottom,max(c['bottom'] for c in words)+12)
  name=f'{key}-answer-p{page_num}.png'
  renderer[page_num-1].render(scale=1.6).to_pil().crop(tuple(round(v*1.6) for v in (25,top,page.width-25,bottom))).save(ROOT/'data/bundles'/name)
  qs[key]['explanationImages'].append(name)
 with pdfplumber.open(path) as pdf:
  for num,page in enumerate(pdf.pages,1):
   text=page.extract_text() or ''
   header=re.search(r'(READING AND WRITING|MATH):?\s*MODULE\s*(\d)',text,re.I)
   if header:
    new=('rw' if 'READING' in header[1].upper() else 'math',int(header[2]))
    if new != (section,module):current=None
    section,module=new
   if section!='math':continue
   words=page.extract_words();markers=[]
   for i,w in enumerate(words[:-1]):
    if w['text']=='QUESTION' and words[i+1]['text'].isdigit():markers.append((w['top'],f't{test}-{section}-m{module}-q{words[i+1]["text"]}'))
   markers.sort()
   if current:segment(page,num,current,65,markers[0][0]-8 if markers else page.height-40)
   for i,(top,key) in enumerate(markers):
    end=markers[i+1][0]-8 if i+1<len(markers) else page.height-40
    segment(page,num,key,top-5,end);current=key
 print(f'Test {test}: exact Math explanation images saved.',flush=True)
DATA.write_text(json.dumps(b,ensure_ascii=False))
# Re-extract with page boundaries excluded, retaining isolated numeric glyphs.
# Dropping all numeric-only lines would incorrectly remove real formula values.
for q in qs.values():q['explanation']=''
for test in range(4,12):
 section,module,current=None,None,None
 with pdfplumber.open(ROOT/'data/bundles'/f'sat-practice-test-{test}-answers-digital.pdf') as pdf:
  for page in pdf.pages:
   raw=page.extract_text() or ''
   header=re.search(r'(READING AND WRITING|MATH):?\s*MODULE\s*(\d)',raw,re.I)
   if header:
    new=('rw' if 'READING' in header[1].upper() else 'math',int(header[2]))
    if new!=(section,module):current=None
    section,module=new
   text=page.crop((0,60,page.width,page.height-40)).extract_text() or ''
   for line in text.splitlines():
    match=re.fullmatch(r'QUESTION\s+(\d+)',line.strip())
    if match:current=f't{test}-{section}-m{module}-q{match[1]}'
    elif current in qs and not re.search(r'SAT ANSWER EXPLANATIONS|SAT PRACTICE TEST #',line):qs[current]['explanation']+=line+'\n'
for q in qs.values():q['explanation']=q['explanation'].strip()
DATA.write_text(json.dumps(b,ensure_ascii=False))
print('Retained all numeric explanation content.')
