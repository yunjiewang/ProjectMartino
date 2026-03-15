# Harmonic Orbit

Screen-by-screen prototype script, based on:

- [integrated-concept-harmonic-orbit-v2.md](C:\Users\BW\DevPlayground\ProjectMartino\integrated-concept-harmonic-orbit-v2.md)
- [harmonic-orbit-wireframe-flow.md](C:\Users\BW\DevPlayground\ProjectMartino\harmonic-orbit-wireframe-flow.md)
- [harmonic-orbit-candidate-rules.md](C:\Users\BW\DevPlayground\ProjectMartino\harmonic-orbit-candidate-rules.md)

目标是让设计师、产品或原型制作者直接按这份脚本搭建一个 `desktop low-fi clickable prototype`，不再自行补关键交互决定。

## Prototype Scope

第一版原型只覆盖一个主任务：

`输入一个短循环 -> 设定落点 -> 调整 approach zone -> 改一个 dominant step -> 创建一个 mirror -> 与 base 比较 -> 保留更好的版本`

只演示 desktop。

## Demo Data

主演示 loop 固定为：

`Dm7 | G7 | Cmaj7 | A7`

备用 loop：

`Dm7 G7 | Cmaj7 A7`

默认 tempo 文案：

`Medium swing reference`

默认 landing 候选：

- `G7`
- `Cmaj7`
- `A7`

原型中实际流程只引导选择 `Cmaj7`。

## Screen List

原型总共做 `7` 个屏幕状态：

1. `S1 Empty Workspace`
2. `S2 Loop Loaded`
3. `S3 Landing Selected`
4. `S4 Step Selected`
5. `S5 Candidate Applied`
6. `S6 Create Mirror`
7. `S7 Compare Mirror`

如果工具支持 variables，也可以做成一张画板里的 state variants；如果不支持，就按 7 张静态 screen 处理。

## S1 Empty Workspace

### Purpose

让用户理解这个工具从哪里开始，不展示复杂能力。

### Visible UI

- Header:
  - `Harmonic Orbit`
  - `Short-loop landing path editor`
  - toggle: `Loop On`
  - toggle: `Click Off`
- Input bar:
  - text field, empty
  - button: `Load Demo`
  - button: `Apply Loop` disabled
- Orbit area:
  - empty circular placeholder
  - empty state title: `Start with a short loop`
  - helper copy: `Enter 2-4 bars to shape how the music lands`
- Step Inspector:
  - hidden
- Mirror Dock:
  - disabled, text `No mirrors yet`
- Transport:
  - `Play Loop` disabled
  - `Solo Zone` disabled
  - `Bypass Edits` disabled
  - `Back to Base` disabled

### Default Values

- text field placeholder: `Dm7 | G7 | Cmaj7 | A7`
- Loop toggle = on
- Click toggle = off

### Interactions

- click `Load Demo` -> go to `S2 Loop Loaded`
- type any valid loop -> enable `Apply Loop`
- click disabled `Apply Loop` does nothing

### Notes For Prototype

- Orbit placeholder should already hint at circular workflow
- Do not show any theory terms yet

## S2 Loop Loaded

### Purpose

确认 loop 已经成为工作对象，但还没进入编辑。

### Visible UI

- Input bar filled with:
  - `Dm7 | G7 | Cmaj7 | A7`
- Orbit Loop shows 4 equal steps
- Playback head visible as thin marker on ring
- Inline orbit hint:
  - `Double-click a step to set the landing point`
- Step labels on ring:
  - `Dm7`
  - `G7`
  - `Cmaj7`
  - `A7`
- Mirror Dock still disabled
- Transport:
  - `Play Loop` enabled
  - others disabled

### Visual Rules

- all steps same brightness
- no approach zone yet
- no role labels yet

### Interactions

- double-click `Cmaj7` -> go to `S3 Landing Selected`
- single-click any step -> small highlight only, no inspector
- click `Play Loop` toggles label to `Pause`

### Notes For Prototype

- In demo, only `Cmaj7` needs an active hotspot
- Other steps can be non-progressing if needed

## S3 Landing Selected

### Purpose

显示系统建议的 approach zone，并让用户理解“现在我们围绕落点工作”。

### Visible UI

- `Cmaj7` becomes brightest node on ring
- arc before `Cmaj7` is highlighted as suggested `Approach Zone`
- Suggested zone covers:
  - `Dm7`
  - `G7`
- orbit helper text:
  - `Suggested approach zone`
  - `Drag edges to adjust`
- Step Inspector opens in passive state:
  - `Landing point set: Cmaj7`
  - `Pick a step inside the approach zone`
- Mirror Dock:
  - chip: `Base`
- Transport:
  - `Play Loop` enabled
  - `Solo Zone` enabled
  - `Bypass Edits` enabled
  - `Back to Base` disabled

### Interactions

- drag left edge of zone left/right -> stay in `S3`, but update zone width
- click `G7` -> go to `S4 Step Selected`
- click `Dm7` -> optional alternate `S4` state, but prototype can keep only `G7`
- click `Solo Zone` -> toggles pressed style only

### Notes For Prototype

- Zone edge should feel editable even in low-fi
- Keep the ring readable; this is where the concept becomes concrete

## S4 Step Selected

### Purpose

进入真正的 step-level editing。

### Visible UI

- `G7` selected inside approach zone
- Step Inspector fully expanded

Inspector content:

- `Step: G7`
- `Role: dominant`
- axis tabs:
  - `Color` selected
  - `Pull`
  - `Link`
- candidate list:
  - `Original` / `G7` / tag `stable` / buttons `Play` `Apply`
  - `Db7` / tag `more pull` / buttons `Play` `Apply`
  - `G7alt` / tag `brighter` / buttons `Play` `Apply`
- zone controls:
  - `Expand Left`
  - `Shrink`
  - `Exclude Step`

Mirror Dock:

- `Base`
- `+ New Mirror` disabled

### Interactions

- click tab `Pull` -> same screen variant but swap candidates to:
  - `Original / G7`
  - `Db7 / more pull`
  - `Bb7 / softer backdoor` or `G7alt` fallback
- click tab `Link` -> same screen variant but swap candidates to:
  - `Original / G7`
  - `Ab7 -> G7 / slippery`
  - `Bdim/G -> G7 / tighter link`
- click `Play` on any candidate -> temporary active state, remain on `S4`
- click `Apply` on `Db7` under `Pull` -> go to `S5 Candidate Applied`

### Notes For Prototype

- You only need to fully wire one candidate path
- Keep candidate count at exactly 3 for clarity

## S5 Candidate Applied

### Purpose

让用户看见“改动已经进入当前版本”，并产生创建 mirror 的动机。

### Visible UI

- Orbit Loop now shows modified step:
  - `Dm7`
  - `Db7`
  - `Cmaj7`
  - `A7`
- Difference from base visibly highlighted:
  - changed step glows or uses alternative color
- Inspector reflects new current step:
  - `Step: Db7`
  - `Role: dominant substitute`
  - axis remains `Pull`
- status line:
  - `1 change applied to current version`

Mirror Dock:

- `Base`
- button `+ New Mirror` enabled

Transport:

- `Back to Base` enabled

### Interactions

- click `Back to Base` -> return to `S4 Step Selected`
- click `+ New Mirror` -> go to `S6 Create Mirror`
- click another candidate -> optional alternate branch, not required

### Notes For Prototype

- This screen needs to make the diff obvious before comparison starts

## S6 Create Mirror

### Purpose

强制用户把当前改动收束成“单轴版本”。

### Visible UI

Inline sheet anchored above Mirror Dock:

- title: `Create mirror from current version`
- helper: `This mirror can only edit one axis`
- axis radio group:
  - `Color`
  - `Timing`
  - `Link`
- name input
  - default value: `tritone`
- actions:
  - `Create`
  - `Cancel`

Background UI remains visible but dimmed slightly.

### Default Values

- `Pull` is not shown as a mirror axis
- if current change came from `Pull`, only the normalized mirror axis is enabled

For this prototype, use:

- `Color` enabled and preselected
- `Timing` disabled
- `Link` disabled
- name = `tritone`

### Interactions

- click `Create` -> go to `S7 Compare Mirror`
- click `Cancel` -> return to `S5 Candidate Applied`

### Important Note

This sheet is where normalization becomes visible:

- prototype should present only allowed mirror axes
- for this demo path, only `Color` is active because `G7 -> Db7` is a `Pull` exploration that compares as a `Color` difference

## S7 Compare Mirror

### Purpose

完成核心价值：在 base 和 mirror 之间无缝比较，并收敛到一个决定。

### Visible UI

Mirror Dock:

- `Base`
- `Color: tritone`
- optional disabled chip: `+ New Mirror`

Current selected chip:

- `Color: tritone`

Orbit Loop:

- current mirror diff visible on changed step
- base/mirror compare hint:
  - `Compare against base`

Inspector:

- compact compare state
- top line:
  - `Editing: Color mirror`
- compare summary:
  - `1 diff from base`
  - `Changed step: G7 -> Db7`

Transport:

- `Back to Base`
- `Bypass Edits`
- `Save Mirror`

### Interactions

- click `Base` -> switch to base compare view
- click `Color: tritone` -> switch back to mirror
- shift-click `Color: tritone` -> flash compare state
- click `Save Mirror` -> confirmation toast:
  - `Mirror saved`
- click `Back to Base` -> end on base view while mirror remains in dock

### End State For Demo

Demo should end with:

- `Base` still available
- `Color: tritone` saved
- user clearly seeing one stable comparison

## Prototype Branches To Fake

不需要真的把所有分支做完，但应假装这些能力存在：

- selecting `Dm7` would show `pre-dominant`
- choosing `Link` would show `Ab7 -> G7`
- shrinking zone would remove `Dm7` from highlighted arc

这些可以只做 hotspot 或静态替换。

## Click Map

如果交给设计师，这些 hotspot 必须优先做：

### Required Hotspots

- `Load Demo`
- `Cmaj7` double-click target
- `G7` step target
- axis tab `Pull`
- candidate `Apply` for `Db7`
- `+ New Mirror`
- `Create`
- `Base`
- `Color: tritone`
- `Back to Base`

### Optional Hotspots

- `Play Loop`
- `Solo Zone`
- candidate `Play`
- zone edge drag simulation

## Visual Tokens For Low-Fi

低保真阶段也要统一符号，否则比较层会乱。

- `Landing Point`: brightest fill
- `Approach Zone`: thick arc
- `Selected Step`: outline ring
- `Changed Step`: alt fill or hatch
- `Base Version`: neutral chip
- `Mirror Version`: labeled chip with axis prefix

## Prototype Success Criteria

一个没有参与设计的人看完这个 prototype，应该能复述出这 4 句话：

- 这是一个专门改“怎么回去”的工具
- 我先选落点，再改落点前的一小段
- 每次改的是一个 step，而且有明确轴
- 我可以把一个版本存成 mirror 跟 base 比较

如果看完之后他们只记得“一个圆形和弦编辑器”，那原型就还不够好。

## What To Design Next

在这份脚本之后，最值得继续补的是：

- `mirror axis normalization` 规则
- `Pull` 与 `Color` 在 UI 上的区分方式
- 第一版视觉语气板，不是高保真，而是交互语气板
