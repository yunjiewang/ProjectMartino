# Harmonic Orbit TODO

## Current State

- [x] Static MVP exists in `index.html`, `app.css`, `app.js`
- [x] Loop input, landing selection, wrap-aware approach zone
- [x] Candidate exploration for `Color / Pull / Link`
- [x] Draft vs mirror compare, diff summaries, Web Audio previews
- [x] Session save/restore/export/import
- [x] Snapshots and lightweight undo/redo
- [x] Audition Trail with pin, notes, promote-to-mirror
- [x] Mirror provenance, stack grouping, stack labels, stack notes, stack cycle audition

## P0 Stabilization

- [ ] Do a real browser smoke test on `index.html`
- [ ] Verify Web Audio behavior in Chrome, Safari, and Edge
- [ ] Verify `<dialog>` fallback behavior and keyboard focus handling
- [ ] Verify `localStorage`, JSON export, and JSON import with real session data
- [ ] Test the full happy path end to end: demo loop -> edit -> audition -> pin -> promote -> compare -> save -> restore
- [ ] Check mobile and narrow-width layout for orbit, dock, and transport overflow

## P1 Product Readability

- [ ] Add an exportable review view that summarizes pinned auditions, promoted mirrors, stack labels, and stack notes
- [ ] Add a compact onboarding layer for first-run usage instead of relying on README only
- [ ] Add clearer empty states for stack labels, stack notes, and provenance
- [ ] Add lightweight confirmation or undo affordance for destructive actions beyond toast only
- [ ] Add a clearer “current mode” cue when user is on `Base`, `Draft`, or a specific mirror

## P1 Musical Usefulness

- [ ] Tighten chord parser coverage for more realistic jazz spellings
- [ ] Improve candidate generation so suggestions depend more explicitly on beat role and landing context
- [ ] Add better handling for slash chords and bass-directed voice leading
- [ ] Add stack-level summary heuristics so new stacks can start with a smart default label/note
- [ ] Add richer cadence audition modes beyond `step -> landing`, especially for two-step approach motion

## P1 Mirror / Stack Workflow

- [ ] Allow stack-level compare to optionally include `Base` plus selected mirrors only
- [ ] Add stack-level ordering so users can reorder mirrors inside a family
- [ ] Add stack-level “promote best to front” or favorite mirror behavior
- [ ] Let promoted mirrors retain a link back to the source pinned audition in the UI, not just provenance text
- [ ] Add a lightweight mirror detail panel for viewing last change, provenance, and stack context together

## P2 Audition Trail

- [ ] Add timestamps or relative age to audition entries
- [ ] Let users filter the trail to `all / pinned / promotable`
- [ ] Add batch actions for pinned auditions
- [ ] Decide whether unpinning should always clear notes, or whether notes should survive separately

## P2 UX Polish

- [ ] Refine button copy to be more musically legible than purely technical labels
- [ ] Add subtle motion for compare focus and stack cycling
- [ ] Improve visual differentiation between `Color`, `Timing`, and `Link` mirrors in dock and compare views
- [ ] Add hover hints for stack labels, stack notes, and provenance

## Technical Cleanup

- [ ] Break `app.js` into smaller modules once behavior stabilizes
- [ ] Add a small internal test harness for parser, role detection, and diff generation
- [ ] Centralize mirror and audition serialization helpers
- [ ] Audit for duplicated timing constants across compare and audition flows

## Open Questions

- [ ] Should `Pull` remain an exploration-only axis forever, or eventually become a first-class saved compare axis?
- [ ] Should mirror groups stay auto-derived from `step + axis`, or become user-defined collections later?
- [ ] Should the app stay a pure static prototype, or graduate into a small structured frontend app once the model hardens?
