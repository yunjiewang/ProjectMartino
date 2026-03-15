# Harmonic Orbit PRD (High-Level)

## 0) Release Channel
- Current channel: **v0.10-dev**
- Target stable channel: **v1.0** (after P0 stabilization + acceptance checks pass)

## 1) Product Vision
Harmonic Orbit 是一个可试听的和声改写工具，用于帮助音乐人围绕“落点（landing）”快速探索、比较并保存多个和声路径版本。

## 2) Target Users
- 作曲者 / 编曲者：快速比较不同和声走向的情绪与功能。
- 练习者 / 教学场景：理解 `role`、`arrival`、`cadence` 在短 loop 中的变化。
- 原型研究者：验证 reharm 工作流与版本管理模型。

## 3) Core User Value
- **听得到**：每个候选、diff、路径都可直接 audition。
- **比得清**：Base / Draft / Mirror 对比明确，有 diff 摘要与来源信息。
- **记得住**：支持 session、snapshot、audition trail、stack label/note 的轻量沉淀。

## 4) Scope (Current Product Boundary)
- 输入 2–4 bars loop，按 step 设 landing 与 approach zone。
- 在 `Color / Pull / Link` 维度探索候选并应用。
- 以 Mirror 保存对比版本（含来源 provenance、stack 分组）。
- 通过 Audition Trail 记录试听历史，可 pin / note / promote。
- 会话与检查点：save/restore、import/export JSON、snapshot、undo/redo。

## 5) Functional Requirements (High-Level)
### FR-1 Loop & Harmonic Structure
- 支持 loop 文本输入解析与校验。
- 支持 landing 指定与 wrap-aware zone 操作。

### FR-2 Candidate Exploration
- 基于当前 step 与 axis 给出候选。
- 支持候选试听、A/B、到落点路径试听与应用。

### FR-3 Compare & Versioning
- 支持 Base / Draft / Mirror 切换。
- 支持 diff 摘要与按步试听。
- 支持 Mirror 新建、重命名、删除，及 stack 组织。

### FR-4 Audition Memory
- 记录 audition trail，支持 replay、pin/unpin、note。
- 支持从 pinned audition promote 成 mirror。
- 支持 trail 过滤与批量 pin/unpin。

### FR-5 Persistence
- 支持 localStorage 保存与恢复。
- 支持 JSON 导入导出。
- 支持 snapshot + undo/redo 历史能力。

### FR-6 Onboarding & Readability
- 首次使用提示（可关闭并记忆）。
- 当前模式提示、空状态提示、来源提示、轴向视觉区分。

## 6) Non-Functional Requirements
- 纯静态前端可运行（HTML/CSS/JS）。
- 关键交互响应应即时可感知（候选试听与基础 UI 反馈）。
- 主要流程可在桌面浏览器直接使用。

## 7) Success Criteria (MVP)
- 用户可在 5 分钟内完成：输入 loop → 设落点 → 应用候选 → 保存 mirror → 对比试听。
- 用户可导出 session/review 并在后续恢复上下文。
