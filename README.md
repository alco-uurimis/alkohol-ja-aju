# Alkohol ja aju

An Estonian educational single-page website for a gymnasium practical project: **Alkoholi mõju noorte mälule ja tähelepanule**. Built from the supplied specification, for students aged approximately 16–19. The tone is neutral and educational.

## Run and build

Requires Node.js 22 or newer and npm. From this directory:

```sh
npm install
npm run dev
npm run test
npm run build
npm run preview
```

`npm run build` checks TypeScript and produces the static `dist/` directory. `npm run preview` serves that output. The development server listens on loopback by default. No environment variables, account, API keys or database are needed. This delivery also includes a `pnpm-lock.yaml`; to reproduce its exact dependency resolution use pnpm 11.19.0 and `pnpm install --frozen-lockfile`. npm supports the same scripts but resolves from package.json on its first installation.

Stack: React 19, TypeScript 5.8, Vite 6, plain CSS. Vitest is used only for development tests. No external fonts, images, analytics or tracking scripts are loaded by the application.

## Structure

```text
src/
  App.tsx                Page composition, menu and active-section tracking
  components/Shared.tsx  Section, InfoCard, ProgressBar, ResultCard, SourceReference
  components/Quiz.tsx    Reusable Quiz and QuizQuestion
  sections/Brain.tsx     Four interactive topics and evidence distinctions
  sections/Memory.tsx    Study → distraction → recognition → result
  sections/Attention.tsx Search grid, timer and result
  sections/Closing.tsx   Summary, references, project and privacy information
  data/content.ts        Scientific copy, quiz, verified sources, project metadata
  data/words.ts          Neutral Estonian word pool
  hooks/                 Focus management and optional WebMCP read-only tool
  utils/tasks.ts         Randomization, selection and scoring
  utils/tasks.test.ts    Logic and source-integrity tests
  styles.css             Responsive layout, focus and reduced-motion styles
public/favicon.svg       Local site icon
docs/                    Editorial source template and verification record
```

## Edit scientific content and sources

Edit `src/data/content.ts`. Scientific explanations are separate from the UI. The six linked institutional sources were opened and checked on **25 September 2026**. `sources` stores organization, translated title, original title, publication/review year if known, URL, access date and scope notes. Missing years are `null`, never invented. MedlinePlus's year is explicitly a review year.

Each topic/question/summary has a `refs` array containing actual source IDs. `SourceReference` turns IDs into keyboard-accessible links to the corresponding reference. External reference links open a new tab and announce that behavior. These are institutional summaries, not a systematic literature review or a claim to have independently reviewed every cited primary study.

For a new claim:

1. Check the actual source, population, exposure, outcome and limitations.
2. Preserve the distinction between acute effects and repeated/heavy-use findings, and between association and causation.
3. Add the real metadata and URL. Use `docs/source-template.example.json` as an **unpublished template**, not as a reference.
4. Add source IDs to the claim. Do not invent percentages, precise dose thresholds, names, years or references.
5. If unverified, use exactly **[ALLIKAS VAJALIK]** in the data and in any displayed uncertain claim. Do not present it as an established fact.

`pendingClaims` contains an explicitly marked editorial TODO for a task-switching-specific claim. It is **not published as a scientific fact**. The attention detail defines switching in plain language, but only makes source-supported claims about divided attention, visual search and information processing. No unverified statement is used as a scored quiz answer.

Before using this as a submitted school project, the author/supervisor should review the Estonian scientific wording and the institutional summaries' applicability to the intended age group. The tasks are custom educational exercises, not psychometrically validated tests. Their limitations are shown on the site. No score indicates intoxication, brain damage, or fitness to drive.

## Change questions

Edit `questions` in `src/data/content.ts`: stable unique ID, Estonian statement, boolean `fact`, explanation, `refs`, and verification status. The quiz is data-driven; progress and scoring use the supplied question count. All eight current answers are sourced. Repeated answers are locked; feedback appears immediately; final results include an expandable answer review. Restart clears the attempt.

`Quiz` accepts a `questions` array and optional `onComplete(score)` callback. This supports later pre/post evaluation. The specification's **optional pre/post comparison and localStorage feature is not enabled or implemented** in this version. There is no storage to disable. To add it, make the feature opt-in, version question sets, explain what is saved, and offer deletion. Repeated-question improvement should not be interpreted automatically as a learning effect: practice and answer feedback can change scores.

## Exercise logic

- **Memory:** sample 8 distinct targets and 8 distinct distractors without overlap; shuffle 16 recognition choices. Study for 12 seconds, or select untimed mode before starting. A separate numerical distraction must be answered before recognition. Its correctness does not affect the memory score. Points = max(0, hits − false selections), out of 8. Misses and false selections are also shown. Selecting everything earns zero. The exercise involves delayed recognition and does not isolate working-memory capacity.
- **Attention:** shuffle a 6×6 grid with 12 T, 12 L and 12 I letters. 45-second mode or untimed mode. Report hits, false selections, missed T letters, elapsed time and selection precision. Precision = hits / all selected letters; no selections means 0%. Precision is shown beside misses because selecting one correct letter alone does not demonstrate overall success.
- Timers use monotonic deadlines, not a count of interval callbacks. Finishing, restarting or cancelling cleans up the relevant interval. Refresh deliberately resets all attempts; there is no resumable or persisted state.
- Do not use the exercises to compare sober and intoxicated performance. Instructions explicitly discourage drinking to try them.

## Accessibility and privacy

Semantic sections and headings, skip link, native buttons and checkboxes, visible focus, named controls, disclosure summaries, selected-state announcements and focused stage headings. The mobile menu supports Escape. In the attention grid, arrows/Home/End move focus, Space/Enter toggles a selection, and Tab exits the grid. Both exercises have an untimed mode. Reduced-motion preferences disable animation and smooth scrolling; the decorative animation otherwise ends after four seconds.

The app collects no names, age, alcohol-consumption information or other personal data. Exercise answers exist only in React memory; no cookies or localStorage are used. Hosting may have its own infrastructure logs and private-access authentication, separate from this application.

The optional experimental WebMCP tool `read_quiz_progress` returns the same current question and progress available in the UI. It does not answer questions, expose future answers or send data to a server. It is feature-detected and unsupported browsers work normally.

## Deployment

This is a fully static Vite site. Build and upload **the contents of `dist/`** to a static host. Root hosting works without rewrites because navigation uses fragment links. For hosting under a subdirectory, set Vite's `base` accordingly and build again. Do not upload node_modules, source credentials, or development caches.

`.openai/hosting.json` identifies this private Sites project and its `dist` output. Sites publication is separate from local Vite build. To create an unrelated Site, remove the old project identity before registering a new one; do not overwrite this project's identity.

## Editable project details

Replace `project.author`, `school`, `supervisor`, and `year` in `src/data/content.ts`. The visible bracketed Estonian placeholders are intentional; no names were invented.

See `docs/VERIFICATION.md` for executed checks and remaining limits.
