# Harmonic Orbit Iteration Playbook (agent.md)

## Run-end mandatory checklist (every continuation)
1. Update `TODO.md` status for items touched in the current iteration.
2. Move **completed items from previous iteration** out of `TODO.md` into `PROGRESS.md` milestones.
3. Add a **major next-version plan** section in `TODO.md` (not just micro-fixes).
4. Recompute and record **project completion score** (for stop/go decision).
5. Ensure at least one validation/check was executed in this run.

## Completion scoring rubric (for acceptance readiness)
Score is approximate and reported as a percentage:

- **Core workflow completeness (35%)**
  - Loop -> landing -> candidate -> apply -> mirror compare -> save/restore.
- **Stability coverage (25%)**
  - Browser smoke, dialog behavior, storage/import/export, happy-path verification.
- **Musical usefulness (20%)**
  - Parser realism, role-aware candidate quality, slash/bass handling, cadence richness.
- **Workflow depth (10%)**
  - Mirror stack compare/selection/order/favorite/detail usability.
- **Maintainability (10%)**
  - Test harness, serialization centralization, timing constants audit, modularization.

### Stop-development suggestion
- **>= 85% and no P0 blockers**: candidate for验收/冻结（feature freeze + bugfix only）
- **70%–84%**: continue targeted iterations
- **< 70%**: keep major capability development

## Next-version planning rule
Each run must add a **Version Plan** section in `TODO.md` with:
- version goal,
- 3–6 major deliverables,
- explicit acceptance checks.


## Current completion assessment (latest)
- Estimated completion: **79%**
- Breakdown:
  - Core workflow completeness: 32/35
  - Stability coverage: 15/25
  - Musical usefulness: 12/20
  - Workflow depth: 10/10
  - Maintainability: 10/10 (current prototype phase baseline)
- Practical interpretation:
  - Product workflow remains strong for guided demos and design review.
  - Still **not ready to stop development**: P0 browser/dialog/storage validations are not fully closed.
  - Recommended next move: execute `v0.10-dev` checklist run and close P0 before v1.0 gate review.

## Version decision (latest)
- Decision: **v0.10-dev** (continue development)
- Not v1.0 yet because P0 stabilization items are still open and checklist evidence is incomplete.
- Promote to v1.0 only after: completion >=85% and no P0 blockers.
