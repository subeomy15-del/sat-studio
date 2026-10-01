"""Import only the user's SAT ZIPs; preserve PDFs and render exact question crops.
Run with the bundled Python (pdfplumber, pypdfium2, Pillow).
No originals are modified. Extraction fails closed on missing/duplicate questions.
"""
import json, re, zipfile, hashlib
from pathlib import Path
import pdfplumber
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path.home() / 'Downloads/SAT'
DEST = ROOT / 'data/bundles'
DEST.mkdir(parents=True, exist_ok=True)
records, documents = [], []
for number in range(4, 12):
    archives = sorted(SOURCE.glob(f'*bundle-{number}*.zip'))
    if not archives: raise ValueError(f'Missing bundle {number}')
    with zipfile.ZipFile(archives[0]) as archive:
        for name in archive.namelist():
            basename = Path(name).name
            if not re.fullmatch(r'(sat-practice-test-\d+(?:-answers)?-digital|scoring-sat-practice-test-\d+-digital)\.pdf', basename): continue
            content = archive.read(name)
            (DEST / basename).write_bytes(content)
            documents.append({'file': basename, 'test': number, 'sha256': hashlib.sha256(content).hexdigest(), 'archive': archives[0].name})
    answers = DEST / f'sat-practice-test-{number}-answers-digital.pdf'
    explanations = {}
    section, module, current = None, None, None
    with pdfplumber.open(answers) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            text = page.extract_text() or ''
            header = re.search(r'(READING AND WRITING|MATH):?\s*MODULE\s*(\d)', text, re.I)
            if header:
                new = ('rw' if 'READING' in header[1].upper() else 'math', int(header[2]))
                if new != (section, module): current = None
                section, module = new
            for line in text.splitlines():
                match = re.fullmatch(r'QUESTION\s+(\d+)', line.strip())
                if match:
                    current = (section, module, int(match[1]))
                    if current in explanations: raise ValueError(f'Duplicate answer {number} {current}')
                    explanations[current] = {'text': '', 'pages': [page_num]}
                elif current and not re.search(r'SAT ANSWER EXPLANATIONS|SAT PRACTICE TEST #|^\s*\d+\s*$', line):
                    explanations[current]['text'] += line + '\n'
                    if page_num not in explanations[current]['pages']: explanations[current]['pages'].append(page_num)
    questions = {}
    section, module = 'rw', 1
    test_path = DEST / f'sat-practice-test-{number}-digital.pdf'
    renderer = pdfium.PdfDocument(str(test_path))
    with pdfplumber.open(test_path) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            text = page.extract_text() or ''
            heading = re.search(r'Module\s+(\d)', text)
            if heading: module = int(heading[1])
            if re.search(r'\bMath\s+\d+ QUESTIONS', text): section = 'math'
            starts = []
            for rect in page.rects:
                width, height = rect['x1']-rect['x0'], rect['bottom']-rect['top']
                if not (14 < width < 24 and 9 < height < 16): continue
                chars = [c for c in page.chars if rect['x0']-1 <= c['x0'] < rect['x1'] and rect['top']-2 <= c['top'] < rect['bottom'] and c['text'].isdigit() and c['non_stroking_color'] in [(0,0,0,0),(1,),(1,1,1)]]
                label = ''.join(c['text'] for c in sorted(chars, key=lambda c:c['x0'])).strip()
                if label.isdigit() and 1 <= int(label) <= 33:
                    col = 0 if rect['x0'] < page.width/2 else 1
                    if not any(c == col and q == int(label) for c,y,q in starts): starts.append((col, rect['top'], int(label)))
            # Some question bars are vector paths, not PDF rectangles. Their
            # white number glyphs still provide an exact, independent anchor.
            groups = []
            for c in sorted(page.chars, key=lambda c:(c['top'],c['x0'])):
                if 'MinionPro' not in c['fontname']: continue
                if not c['text'].isdigit() or c['non_stroking_color'] not in [(0,0,0,0),(1,),(1,1,1)]: continue
                if not (90 < c['top'] < page.height-60 and 9 < c['size'] < 12): continue
                group = next((g for g in groups if abs(g['top']-c['top']) < 1 and abs(g['right']-c['x0']) < 7), None)
                if group: group['text'] += c['text']; group['right'] = c['x1']
                else: groups.append({'top':c['top'],'left':c['x0'],'right':c['x1'],'text':c['text']})
            for g in groups:
                col = 0 if g['left'] < page.width/2 else 1
                if 1 <= int(g['text']) <= 33 and not any(c == col and q == int(g['text']) for c,y,q in starts): starts.append((col,g['top']-2,int(g['text'])))
            if not starts: continue
            image = renderer[page_num-1].render(scale=1.8).to_pil()
            for col, top, qnum in starts:
                bottom = min([y-8 for c,y,q in starts if c == col and y > top+5] or [page.height-53])
                left, right = (28, page.width/2-8) if col == 0 else (page.width/2+7, page.width-28)
                meaningful = [c for c in page.chars if left <= c['x0'] < right and top-5 <= c['top'] < bottom and c['text'].strip() and c['text'] not in '.-_~|']
                if meaningful: bottom = min(bottom, max(c['bottom'] for c in meaningful)+12)
                bbox = (left, top-5, right, bottom)
                cropped = page.crop(bbox)
                qtext = cropped.extract_text() or ''
                continuation = col == 0 and not any(c == 1 for c,y,q in starts) and top == max(y for c,y,q in starts if c == 0)
                if continuation:
                    right_left,right_right = page.width/2+7,page.width-28
                    right_chars = [c for c in page.chars if right_left <= c['x0'] < right_right and 95 <= c['top'] < page.height-53 and c['text'].strip() and c['text'] not in '.-_~|']
                    right_top = max(95,min((c['top'] for c in right_chars),default=95)-5)
                    right_bottom = min(page.height-53,max((c['bottom'] for c in right_chars),default=page.height-65)+12)
                    right_box = (right_left, right_top, right_right, right_bottom)
                    qtext += '\n' + (page.crop(right_box).extract_text() or '')
                key = (section, module, qnum)
                if key in questions: raise ValueError(f'Duplicate question {number} {key} page {page_num}, prior {questions[key]["page"]}, text {qtext[:100]}')
                id = f't{number}-{section}-m{module}-q{qnum}'
                image_file = f'{id}.png'
                output = image.crop(tuple(round(v*1.8) for v in bbox))
                if continuation:
                    from PIL import Image
                    right_image = image.crop(tuple(round(v*1.8) for v in right_box))
                    combined = Image.new('RGB', (max(output.width,right_image.width),output.height+right_image.height+20),'white')
                    combined.paste(output,(0,0)); combined.paste(right_image,(0,output.height+20)); output=combined
                output.save(DEST / image_file)
                questions[key] = {'id':id,'test':number,'section':section,'module':module,'number':qnum,'page':page_num,'text':qtext,'image':image_file,'testFile':test_path.name,'answerFile':answers.name}
    expected = {('rw',m,q) for m in [1,2] for q in range(1,34)} | {('math',m,q) for m in [1,2] for q in range(1,28)}
    if set(questions) != expected: raise ValueError(f'Test {number}: missing {expected-set(questions)}, extra {set(questions)-expected}')
    if set(explanations) != expected: raise ValueError(f'Test {number}: missing explanations {expected-set(explanations)}')
    for key, item in questions.items():
        item['explanation'] = explanations[key]['text'].strip()
        item['answerPages'] = explanations[key]['pages']
        match = re.search(r'Choice ([ABCD]) is (?:the (?:best|correct) answer|correct)', item['explanation'])
        item['answer'] = match[1] if match else None
        records.append(item)
    print(f'Test {number}: {len(questions)} exact question images + official explanations', flush=True)
(ROOT / 'data/bundles.json').write_text(json.dumps({'version':1,'documents':documents,'questions':records}, ensure_ascii=False))
print(f'Imported {len(records)} questions from {len(documents)} PDFs.')
