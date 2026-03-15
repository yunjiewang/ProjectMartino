# Harmonic Orbit Progress

## Milestone 0 — Static MVP Foundation
- 完成基础静态结构：`index.html` + `app.css` + `app.js`。
- 完成 loop 输入、landing 选择、zone 可视化与 step inspector。

## Milestone 1 — Candidate & Compare Core
- 支持 `Color / Pull / Link` 候选探索。
- 支持 Draft 与 Mirror 对比、diff 摘要与试听。
- 增加 role transition / arrival quality 等解释信息。

## Milestone 2 — Session & History
- 支持 local session save/restore/clear。
- 支持 JSON export/import。
- 支持 snapshot、undo/redo、snapshot delete。

## Milestone 3 — Audition Trail
- 支持 audition trail 记录、replay、clear unpinned。
- 支持 pin/unpin、pinned note。
- 支持 pinned audition promote 为 mirror。
- 支持 trail 过滤（all/pinned/promotable）与相对时间。
- 支持批量 pin filtered / unpin all。
- 支持 unpin keep-notes 偏好并持久化。

## Milestone 4 — Mirror Stack Workflow
- 支持 mirror provenance。
- 支持 stack compare-selected（可选包含 Base 参考）。
- 支持 stack 内镜像重排（左右移动）。
- 支持 mirror favorite 标记（提升到前列显示）。
- 增加 mirror detail panel（last change / provenance / stack context）。
- 支持 stack 分组、stack label、stack note。
- 支持 stack cycle audition。
- 支持 mirror rename/delete 与 draft reset。

## Milestone 5 — UX & Onboarding Polish
- compare-selected 新增 `Select All / Clear Selection` 控件。
- 单条 unpin 文案已与 keep-notes 偏好语义对齐（明确 notes kept/cleared）。
- 扩展更多 hover hints（transport/compare/audition 批量控件）。
- mirror detail 支持显示来源 audition 标签与 pinned 状态。
- 增加首屏 onboarding banner（可 dismiss 并持久化）。
- 增加 current mode cue（Base/Draft/Mirror）。
- 增加 compare axis pill 与轴向视觉区分。
- 增加 hover hints（stack label/note/provenance）。
- 增加 review markdown 导出。

## Milestone 6 — Quality Checks (Partial)
- mirror detail 新增 `Jump to Source Audition` 动作（可定位到 trail 源条目）。
- 新增跨浏览器 smoke checklist 脚本：`scripts/smoke_checklist.sh`。
- 已完成真实浏览器 smoke（加载 demo、应用 loop、镜像创建、新控件交互）。
- 已完成桌面+移动窄屏 overflow 检查（未发现横向溢出）。
- 已进行语法检查（`node --check app.js`）。
- 已进行浏览器可视化检查与桌面/移动端截图验证（持续中）。


## Iteration Log
### Iteration 2026-03 (latest)
- 已将上次版本完成项从 `TODO.md` 移入 `PROGRESS.md`：
  - per-stack `Select All / Clear Selection`
  - single-unpin 与 keep-notes 文案一致性
  - 扩展 hover hints 到更多关键控件
  - mirror detail 显示来源 audition 标签与 pinned 状态
- TODO 已重构为“pending + major version plan”，支持下一步大版本推进。

### Iteration 2026-03 (version decision)
- 明确版本结论：当前为 `v0.10-dev`，暂不进入 `v1.0`。
- 文档已补齐版本升级门槛（P0 清零 + 验收项全绿）。

### Iteration 2026-03 (workflow + checklist script)
- 已从 TODO 迁移完成项到 PROGRESS：source audition 跳转、smoke checklist 脚本。
- TODO 已加入下一步重大动作：跨浏览器首轮 checklist 实测。
