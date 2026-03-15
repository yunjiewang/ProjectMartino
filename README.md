# Harmonic Orbit MVP

Static desktop prototype for the `Harmonic Orbit` concept.

## Open It

- Open [index.html](C:\Users\BW\DevPlayground\ProjectMartino\index.html) directly in a browser
- or serve the folder locally with a simple static server

## Demo Flow

1. Click `Load Demo`
2. Double-click `Cmaj7` in the orbit to set the landing point
3. Click `G7` inside the highlighted approach zone
4. Try `Color`, `Pull`, and `Link` candidates
5. Apply one change
6. Create a mirror
7. Compare the mirror against `Base`

Input is intentionally loose in this MVP:

- `|` separates bars
- spaces inside a bar create extra steps
- example: `Dm7 G7 | Cmaj7 A7`

## Added MVP Conveniences

- local session save / restore / clear
- session export / import as JSON
- named snapshots and lightweight undo / redo
- compare tools now work on both saved mirrors and unsaved base edits
- diff summaries include per-step `Play` audition buttons
- diff summaries now explain `role transition` and `arrival quality`, not just symbol swaps
- candidate cards now preview role and arrival impact before you apply a change
- candidate cards now support `Before/After` audition against the current step
- candidate and diff previews now support `To Landing / Path` cadence-context audition
- recent auditions are stored in an `Audition Trail` with replay and clear
- auditions can now be `Pinned`, and `Clear Trail` only removes unpinned items
- pinned auditions can carry a short `why it worked` note
- pinned auditions with full context can be promoted directly to a mirror
- mirrors now show lightweight provenance for draft saves and audition promotions
- mirror dock now groups nearby versions into lightweight `stacks` by step and axis
- each mirror stack can now `Cycle Stack` to audition nearby versions in sequence
- stacks can now carry soft user labels like `backdoor family` or `late settle`
- stacks can also carry a one-line summary note describing what the family is testing
- draft cleanup and version management: `Reset Draft`, `Rename Mirror`, `Delete Mirror`, snapshot delete
- keyboard shortcuts:
  - `Space`: play or pause
  - `1 / 2 / 3`: switch `Color / Pull / Link`
  - `S`: toggle solo zone
  - `B`: back to base
  - `M`: open mirror dialog
  - `F`: flash compare against base
  - `U`: undo
  - `R`: redo
  - `X`: reset current draft back to base

## Files

- [index.html](C:\Users\BW\DevPlayground\ProjectMartino\index.html): app structure
- [app.css](C:\Users\BW\DevPlayground\ProjectMartino\app.css): visual system and layout
- [app.js](C:\Users\BW\DevPlayground\ProjectMartino\app.js): state, interaction logic, and Web Audio previews
