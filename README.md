# Margin SAT Studio

A complete SAT study website for Math and Reading and Writing. Built around official practice bundles 4–11, with a browser AI tutor, original lessons, skill checks, and spaced review.

Published site: **https://subeomy15-del.github.io/sat-studio/**

## Grammar Academy

Open **Grammar Academy** from the sidebar or visit `#grammar`. The course targets students pursuing high Reading and Writing scores, with 16 original advanced SAT-style items and 24 separate foundation items. Eight structural playbooks teach recognition, clause analysis, and distractor elimination. Difficulty is editorial, not calibrated by College Board.

The eight-question advanced diagnostic and eight-question mixed benchmark use different questions. The benchmark tracks elapsed time, allows previous-question edits, and withholds explanations until submission. Its eight-minute target is a training choice, not official SAT timing. Confidence is recorded before submission; guesses, mistakes, and hint-assisted answers enter targeted review. The debrief shows correct answers separately from confident independent answers. Repeated items are not evidence of transfer; use the linked official Student Question Bank for unseen hard questions.

No account or model download is required. Grammar progress has its own download/restore controls and stays in browser storage. Lessons are in English. Grammar drills cover part of Reading and Writing; results do not predict SAT scores.

Run `node tests/grammar-review.mjs` for diagnostic, benchmark, answer editing, uncertainty review, and mobile checks.

## What you can do

- Browse **960 official practice questions** by test, section, module, and question number. See original question images, including graphs and mathematical notation.
- Attempt a question before checking its official explanation. Printed Math explanations are preserved as images to avoid PDF text errors.
- Ask the AI for a hint, a step-by-step solution, or a simpler explanation. The selected question and official explanation accompany the request. Source links let you inspect the originals.
- Read **22 lessons** and the complete study manual, with worked examples, common traps, calculator decisions, and practice methods.
- Use **56 original practice questions**, custom AI quizzes, or a **16-question diagnostic across eight SAT content domains**.
- Track incorrect answers, guesses, uncertainty, and hint-assisted answers. Record official attempts and error causes, then revisit questions on an expanding schedule.
- Set a daily time budget, test date, and goal. Use a study plan informed by the review log.

## Browser AI

Open Connection settings and select **Download & start AI**. The first use downloads model files. They are cached by the browser when storage is available; refreshes still require reinitialization. Current Chrome or Edge with WebGPU on a computer is recommended.

The default model is Qwen3 4B. Qwen3 8B is available for computers with more GPU memory; Qwen3 1.7B uses less memory. Model and context memory requirements vary by device. The site automatically chooses the full-precision variant if the GPU lacks half-precision support. Answers stream as they are generated, and you can stop generation.

The tutor processes prompts on your device. It does not require an API key. Model downloads contact the model hosting services; chats and learning progress stay in browser storage. It cannot browse the web or inspect Finder. It receives only the study content and question reference supplied by this site.

The browser model is not ChatGPT and does not promise equivalent performance. Official explanations remain the answer reference. AI-generated questions are original practice and can contain errors. The diagnostic is a small sample, not a score prediction or proof of mastery.

## Study first

1. Start with **Find my weak skills** on the Overview page.
2. Study one skill from the library, then attempt questions independently.
3. Explain the reason for every miss and uncertain correct answer.
4. Record official attempts and use **Study plan** for later retries.
5. Use official **Bluebook adaptive practice** for digital timing and interface practice.

The imported PDFs are nonadaptive paper practice: 33 Reading and Writing or 27 Math questions per module. Standard digital modules have 27 Reading and Writing or 22 Math questions and different timing. Do not treat paper raw scores or this site's quizzes as digital SAT score estimates. Use each official scoring guide for that paper test.

## Build and publish

Requires Node.js 24+.

```sh
npm ci
npm run build
```

`docs/` is the GitHub Pages output. Serve the `main` branch's `/docs` directory. All URLs are relative, so the site works beneath a GitHub repository path. No backend, secret, or account setup is needed for the public site.

Source files live in `public/`, `lib/`, `data/`, and `scripts/`. `scripts/build.mjs` bundles the WebLLM engine and worker, copies the study data and imported assets, and enables hosted mode. The checked-in `docs/` includes the built assets and official source PDFs.

The original ZIPs are not modified. To rebuild the import locally, place the bundles in `~/Downloads/SAT` and run `scripts/import-bundles.py`, then `scripts/answer-images.py` with Python containing pdfplumber, pypdfium2, and Pillow. A clean checkout can copy its published `docs/bundles/` to `data/bundles/` before rebuilding.

## Optional local server

Double-click **Open Margin.command**, or run `npm start` and open `http://127.0.0.1:4317`. The local server supports an installed Ollama model. It can also use an OpenAI key configured in a private `.env`; this optional server mode is not used by GitHub Pages. `.env` is excluded from Git and is never included in `docs/`.

## Verification

- `npm test`: provider handling, quiz validation, official retrieval, input validation, and local server boundaries.
- `node tests/frontend-review.mjs`: chat retries, context, formulas, quizzes, confidence review, persistence, and responsive layouts.
- `node tests/pages-review.mjs`: real static deployment paths, official materials, study plans, diagnostics, and mobile layouts.
- `RUN_REAL_AI=1 node tests/pages-review.mjs`: additionally downloads a browser model and checks actual Math and Reading answers. Set `AI_TEST_MODEL` to select another supported model.

Browser tests use Playwright from the local Codex runtime; adjust its import path for another development environment.

## Sources and licenses

SAT is a registered trademark of College Board. This independent educational site is not affiliated with or endorsed by College Board. Official test material retains its printed copyright and attribution. Original teaching content is distinguished from official questions.

- [College Board test structure](https://satsuite.collegeboard.org/sat/whats-on-the-test/structure)
- [Official paper practice and explanations](https://satsuite.collegeboard.org/practice/practice-tests/paper)
- [Bluebook practice](https://satsuite.collegeboard.org/practice/practice-tests)
- [WebLLM documentation](https://webllm.mlc.ai/docs/user/get_started.html)

Bundled Markdown, KaTeX, and WebLLM license notices are in `docs/vendor/`. The model weights retain their upstream licenses and are downloaded separately.
