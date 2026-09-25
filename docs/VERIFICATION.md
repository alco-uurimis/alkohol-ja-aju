# Verification record

Date: 25 September 2026. Target: local production source, React + TypeScript + Vite.

## Executed checks

- TypeScript compilation and Vite production build: passed.
- Vitest: 6 tests passed. Covers exact/empty/partial/duplicate selection scoring, the select-everything edge case, 100 generated memory rounds, attention target counts, deselection and quiz source-ID integrity.
- Browser: all eight quiz questions traversed using keyboard Enter; one deliberately wrong answer yielded 7/8. Correct/incorrect explanations, result and restart checked. Answer buttons lock after submission.
- Memory browser flow: untimed study, eight displayed words, incorrect distraction answer, recognition, keyboard selection/deselection, result 8/8 with zero false selections and misses. Timed study also automatically hid words and entered the distraction step after 12 seconds. Restart and cancellation checked.
- Attention browser flow: arrow navigation moved focus one column and one row as expected; Space selected targets; Tab exited the grid to the finish button. Selecting all 12 T letters and one L yielded 12 hits, 1 false selection, 0 misses and 92% selection precision. The 45-second deadline automatically produced 0 hits, 12 misses and 0% when no letters were selected.
- Refresh reset the tasks and quiz without errors or unwanted initial focus.
- Brain topic selection and the “Loe rohkem” disclosure worked using Enter.
- Mobile menu opened with Enter and closed with Escape, returning focus to its button.
- Responsive checks at 320, 390, 768 and 1280 CSS pixels. Inspected desktop/tablet and mobile screenshots, including the active attention grid and focus outline. Fixed a 320px overflow caused by topic-card minimum width; final document width fits each tested viewport.
- Browser console: no errors/warnings in the checked session.
- WebMCP `read_quiz_progress`: correct registration and read-back before/after quiz actions; unexpected input rejected without modifying quiz state.
- Content audit: page language `et`, Estonian interface, no invented names or statistics, real source URLs opened during research. Unknown source years remain null. No remote fonts/images, application analytics or storage.

## Accessibility scope and limitations

Manual keyboard and layout testing was performed, not a formal WCAG conformance audit. Native screen-reader announcements were not tested with NVDA/JAWS/VoiceOver. Reduced-motion CSS was inspected; the OS preference was not changed. The in-app browser did not apply attempted browser zoom shortcuts, so actual 200% browser/text zoom is not claimed as tested. The tested narrow viewports cover responsive reflow, but do not replace assistive-technology testing.

## Scientific scope and remaining editorial work

Sources are NIAAA, NHTSA and MedlinePlus institutional overviews, checked against the displayed claims. This is not independent replication or a systematic review of every original study. No numerical impairment threshold or individual risk prediction is offered.

An unpublished `[ALLIKAS VAJALIK]` editorial entry in `src/data/content.ts` records the need for a separate source before adding a task-switching-specific effect claim. Current scored quiz claims have source references. Project author, school, supervisor and year remain clearly marked placeholders.

The exercises are unvalidated educational tasks. Recognition accuracy does not isolate working memory. Attention results also depend on input method and visual access. Do not interpret scores medically or compare them to a population norm. The optional pre/post storage/comparison feature is omitted; the reusable Quiz supports a future completion callback.
