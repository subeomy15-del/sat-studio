# Margin — the SAT study desk

Published site: **https://subeomy15-del.github.io/sat-studio/**

Margin is a free study workspace for SAT Math and Reading and Writing. Version 3 connects a personal study desk, a focused practice room, deep grammar instruction, review scheduling, and official source materials. No account or AI model download is needed for the learning tools.

## The learning experience

- **Study desk:** a daily starting point driven by your own attempts, review queue, and section focus. Empty progress stays empty; no fabricated scores, streaks, or testimonials.
- **Practice Lab:** **120 original questions** across Math and Reading and Writing, including **24 newly authored grammar and Expression of Ideas items**. Search and filter by section, content domain, skill, difficulty, and progress status. A short filtered bank produces a shorter set, not unrelated substitutions.
- **Focus room:** learn mode with immediate feedback or test mode with explanations after the whole set. Cross out choices, bookmark questions, write saved reasoning notes, mark confidence, use keyboard answer selection, and save unfinished sessions. Active time pauses while the tab is hidden or you leave the practice room.
- **Review:** incorrect, uncertain, and hint-assisted answers remain available immediately. Confident correct answers are scheduled after 1, 3, 7, 14, then 30 days. Dashboard and progress distinguish first attempts from latest attempts so retries do not inflate first-attempt accuracy.
- **Grammar Academy:** **eight expanded chapters**, each with four teaching sections, a problem/repair contrast, a worked SAT-style example with choice explanations, and a separate understanding check. Course completion records a completed lesson, not mastery. The course separates Standard English Conventions from Expression of Ideas.
- **Study library:** **22 additional lessons** and a study manual across Math and Reading and Writing.
- **Study plan:** 10-, 20-, 30-, or 45-minute sessions, a section focus, optional test date, and a personal goal. Skill suggestions require at least two attempted items. Existing official review logs remain available.
- **Official practice:** **960 questions** from paper practice tests 4–11 with original question images, diagrams, explanations, PDFs, and scoring guides. These are nonadaptive paper materials; use Bluebook for digital adaptive practice.
- **Search:** find Academy lessons, library lessons, and individual practice questions from the header or with ⌘/Ctrl K.

Difficulty labels on original questions are editorial and uncalibrated. Practice accuracy is not an SAT score estimate. Foundation items may be shorter and simpler than SAT passages. Check transfer on unseen official questions.

## Progress and privacy

Learning data stays in browser storage. There are no cross-device accounts or synchronization. Download and restore **learning backups** from Learning progress; these include Practice Lab attempts, notes, bookmarks, session results, profile settings, and Academy completions. Restoring a learning backup replaces that learning record after validation.

Quiz Studio, chat, and official-test logs retain their existing storage and have a separate backup in Connection and settings. Existing data is not deleted by the redesign. Old Grammar Academy records remain in their original storage; its former eight-question results are not merged into new first-attempt statistics.

If storage is unavailable or full, learning continues in memory and the app reports that progress cannot be saved. Download a backup before leaving. Lessons are currently in English.

## Optional AI tutor

The browser tutor uses WebLLM. Start it explicitly in Connection and settings. Model files download from their hosting services; prompts are processed on the device. Chrome or Edge with WebGPU on a sufficiently capable computer is recommended. The balanced model is Qwen3 4B; smaller and larger options are available. Model availability, memory, and initialization vary by device.

The AI cannot browse the web or inspect local files, and it can make mistakes. Official explanations are the answer reference. AI-generated quizzes are original practice and can contain errors. The optional local server also supports Ollama or a server-only OpenAI key in a private `.env`.

## Build and publish

Requires Node.js 24+.

```sh
npm ci
npm run build
npm test
npm run test:browser
```

`docs/` is the checked-in GitHub Pages output. Publish the `main` branch’s `/docs` directory. Asset URLs are relative so the site works under `/sat-studio/`. No backend or secret is required for the hosted site.

Run `npm start` and open `http://127.0.0.1:4317` for the optional local server. `public/site-config.js` selects local mode; the build writes hosted mode into `docs/site-config.js`.

Main source modules:

- `public/workspace.js`: study desk and learning progress.
- `public/practice.js`: question catalog, focus room, session recovery, and debrief.
- `public/practice-core.js`, `public/practice-store.js`: selection, statistics, review scheduling, storage, and backups.
- `public/academy.js`, `public/course-content.js`: course navigation, lesson content, and checks.
- `public/rw-practice.js`: new grammar and Expression of Ideas questions.
- `public/question-bank.js`: normalizes original banks for Practice Lab.
- `public/study-plan.js`: time budgets and evidence-informed recommendations.
- `public/design.css`: shared visual system and responsive layouts.
- `public/app.js`, `public/runtime.js`, `lib/`: existing library, official materials, tutor, and Quiz Studio.

The official importer expects original bundles in `~/Downloads/SAT`. Existing published `docs/bundles/` can be copied into `data/bundles/` on a clean checkout before building. Import scripts require Python with pdfplumber, pypdfium2, and Pillow.

## Verification

`npm test` covers the server boundaries, providers, generated-quiz validation, official retrieval, content schemas, scheduling, first-attempt statistics, filtering, and session validation.

`npm run test:browser` serves the built site under `/sat-studio/` and verifies search, all eight course checks, question filtering, answer elimination, keyboard choice selection, saved notes, uncertain-answer review, learning backup download, partial-draft recovery, deferred test grading, responsive navigation, official assets, and mobile overflow across the main routes. Browser tests use Playwright from the installed Codex runtime; update the import path for another environment.

`node tests/grammar-review.mjs` runs the same current learning-flow suite. The older `frontend-review.mjs`, `pages-review.mjs`, and `live-review.mjs` retain version-specific smoke/real-model workflows; their former dashboard assertions do not describe the redesigned navigation.

Content was reviewed for ambiguous alternatives, unsupported inferences, and overbroad grammar rules. Original items are not official or psychometrically calibrated. The content bank should continue to be reviewed with educators and expanded using genuinely new structures.

## Sources and licenses

SAT is a registered trademark of College Board. Margin is independent and is not affiliated with or endorsed by College Board. Official materials retain their printed copyright and attribution. Original lessons and questions are distinguished from official content.

- [College Board Reading and Writing specifications](https://satsuite.collegeboard.org/sat/whats-on-the-test/reading-writing)
- [Official content domains](https://satsuite.collegeboard.org/practice/content-domains)
- [Official Student Question Bank](https://satsuitequestionbank.collegeboard.org/)
- [Bluebook full-length practice](https://satsuite.collegeboard.org/practice/practice-tests/bluebook)
- [Official paper practice](https://satsuite.collegeboard.org/practice/practice-tests/paper)
- [WebLLM documentation](https://webllm.mlc.ai/docs/user/get_started.html)

Bundled Markdown, KaTeX, and WebLLM notices are in `docs/vendor/`. Model weights retain their upstream licenses and download separately.
