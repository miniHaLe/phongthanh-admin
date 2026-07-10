---
phase: 6
title: News Semantics and Test Noise
status: completed
priority: P2
dependencies:
  - 1
  - 3
---

# Phase 6: News Semantics and Test Noise

## Overview

Fix invalid nested buttons on the news page and remove avoidable iframe-related test noise without hiding real console failures.

## Requirements

- Functional: news row navigation and mark-seen action both work with mouse, touch, and keyboard.
- Non-functional: semantic HTML; no `validateDOMNesting` warning; tests fail on unexpected console errors but ignore or prevent irrelevant iframe subresource loading.

## Architecture

Separate row navigation from mark-seen action. Use a non-button container plus link/button children, or make the title/body link and keep mark-seen as a sibling button. Do not nest interactive elements.

## Related Code Files

- Modify: `src/pages/tin-tuc/TinTucPage.tsx`
- Modify: `src/pages/tin-tuc/TinTucPage.test.tsx`
- Modify: `src/components/shell/BranchMapModal.tsx`
- Modify: `src/components/shell/BranchMapModal.test.tsx`
- Modify: `src/test/setup.ts`
- Modify: `vite.config.ts` only if current Happy DOM iframe suppression still logs
- Modify: `tests/e2e/uiux-runtime.spec.ts`

## Tests Before

1. Add a TinTucPage test that fails on current nested `<button>` structure:
   - no button descendant inside another button
   - row/link navigation marks seen and navigates
   - mark-seen button does not also navigate
2. Add console-warning gate for `validateDOMNesting`.
3. Reproduce Happy DOM iframe noise from BranchMapModal tests if still present.

## Refactor

1. Replace news row button wrapper with semantic container/link/action structure.
2. Add keyboard-visible focus and sufficient touch target for mark-seen.
3. Make BranchMapModal iframe test-safe by lazy rendering iframe only when open and/or by test-environment guard that does not affect runtime behavior.
4. Keep console-error filtering narrow; do not blanket-suppress React warnings.

## Tests After

1. Run focused news and BranchMapModal tests.
2. Run `npm run test:e2e:uiux` console-warning gate.
3. Run `npm run type-check && npm run lint && npm run test && npm run build`.

## Implementation Steps

1. Write failing semantic and console tests.
2. Refactor TinTucPage markup and event handling.
3. Fix iframe test noise at source.
4. Verify news interactions in browser at mobile and desktop.
5. Remove nested-button and iframe-noise known failures from baseline list.

## Success Criteria

- [x] No nested interactive controls on `/tin-tuc`.
- [x] No `validateDOMNesting` warning in runtime or tests.
- [x] Mark-seen and row/detail navigation remain distinct and keyboard-accessible.
- [x] Happy DOM iframe noise removed without hiding unrelated console errors.

## Risk Assessment

- Risk: changing row semantics reduces clickable area. Mitigation: make the link/focus area cover the content region and keep explicit action button.
- Risk: test-noise fix hides real map failures. Mitigation: keep runtime iframe behavior verified by browser test, not Happy DOM.
