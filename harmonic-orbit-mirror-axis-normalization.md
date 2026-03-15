# Harmonic Orbit

Mirror axis normalization rules for MVP, based on:

- [integrated-concept-harmonic-orbit-v2.md](C:\Users\BW\DevPlayground\ProjectMartino\integrated-concept-harmonic-orbit-v2.md)
- [harmonic-orbit-candidate-rules.md](C:\Users\BW\DevPlayground\ProjectMartino\harmonic-orbit-candidate-rules.md)
- [harmonic-orbit-prototype-script.md](C:\Users\BW\DevPlayground\ProjectMartino\harmonic-orbit-prototype-script.md)

这份文档解决一个具体问题：

`Step Inspector` 里有 `Color / Pull / Link` 三个探索轴，但 `Mirror Variant` 不能直接保存成 `Pull` 轴，否则比较语义会模糊。

MVP 的结论是：

- `Pull` 是探索轴，不是持久化轴
- 所有 mirror 只能保存成 `Color / Timing / Link`
- 任何来自 `Pull` 的改动，在保存 mirror 前都必须被归一化

## Core Principle

产品里存在两套不同用途的轴：

### 1. Exploration Axes

这些轴只用于 `Step Inspector` 里生成候选：

- `Color`
- `Pull`
- `Link`

它们回答的是：

- 换个颜色会怎样
- 更想落地或更想拖延会怎样
- 加一个连接动作会怎样

### 2. Mirror Axes

这些轴只用于版本比较：

- `Color`
- `Timing`
- `Link`

它们回答的是：

- 这个版本的差异主要是颜色
- 这个版本的差异主要是落地时间/重心
- 这个版本的差异主要是连接动作

`Mirror` 必须服务比较，所以它需要的是 `差异类型`，而不是 `生成意图`。

## Why Pull Cannot Be A Mirror Axis

`Pull` 的问题在于它天然混合了两种不同变化：

- 有些 `Pull` 改动本质上是 `Color`
- 有些 `Pull` 改动本质上是 `Timing`

例如：

- `G7 -> Db7` 更像颜色变化
- `Cmaj7` 先悬一下再稳定 更像时间变化

如果直接允许 `Pull mirror`，用户会遇到两个问题：

- 看见一个镜面，却不知道它是在比色彩还是比落地时机
- 听见变化，却无法稳定复述“这次改的是哪一层”

## Normalization Rule

任何由 `Pull` 轴生成并被应用到当前版本的改动，都必须在保存 mirror 前，映射到：

- `Color`
- 或 `Timing`

绝不映射到 `Link`。

`Link` 只接受显式 connector 型改动。

## Normalization Decision Tree

当用户从当前版本点击 `+ New Mirror` 时，系统先检查最近一次有效改动的类型。

### Step 1

如果最近一次改动来自 `Color`：

- mirror axis = `Color`

### Step 2

如果最近一次改动来自 `Link`：

- mirror axis = `Link`

### Step 3

如果最近一次改动来自 `Pull`，继续判断改动结果：

- 如果 chord label 改了，但 zone 长度与落点时机没变
  - mirror axis = `Color`
- 如果 landing 感改变主要来自延迟、停留、suspended settle
  - mirror axis = `Timing`
- 如果同时改了 chord 和 landing 时机
  - 当前版本不能直接保存为 mirror
  - 要求用户先回退到单轴状态

## Pull To Mirror Mapping Table

| Pull result type | Example | Saved mirror axis | Why |
| --- | --- | --- | --- |
| substitute dominant | `G7 -> Db7` | `Color` | 差异主要来自替代色彩 |
| backdoor dominant | `G7 -> Bb7` | `Color` | 差异主要来自和声家族变化 |
| altered push | `G7 -> G7alt` if surfaced under Pull | `Color` | 本质仍是 dominant color change |
| delayed dominant weight | same step, stronger hold | `Timing` | 不换家族，改的是落地重力 |
| suspended return | `Cmaj7` 先悬一下再稳定 | `Timing` | 核心差异是更晚 settle |
| delayed settle | tonic arrives but fully settles later | `Timing` | 比的是落地方式和时间感 |
| mixed substitution plus delay | `Db7` plus delayed landing | invalid for mirror | 差异跨两轴，不能直接存 |

## What Counts As Timing In MVP

MVP 中的 `Timing` 不是复杂节奏编辑，而是以下三类可比较差异：

- `delayed settle`
- `suspended landing`
- `same zone, different weight distribution`

更具体地说，`Timing mirror` 允许这些表现：

- landing 仍在原位置，但听感上更晚完全落下
- dominant 停留更强或更长
- 某一步的重心从“立即解决”改为“先悬一下再解决”

MVP 不允许这些内容被算作 `Timing`：

- 插入新的 connector
- 大幅重排 zone
- 改变 zone 长度

## What Counts As Link In MVP

`Link mirror` 只在出现明确连接动作时成立：

- `Ab7 -> G7`
- `Bdim/G -> G7`
- upper/lower chromatic connector

判断标准：

- 当前版本比 base 多了一个明确 connector
- 或某一步被改写成 connector 型功能

## Mirror Creation Contract

点击 `+ New Mirror` 时，系统读取当前版本与 `base` 的 diff。

允许保存 mirror 的前提：

- diff 只涉及 `1` 个 step
- diff 只涉及 `1` 个 mirror axis
- diff 可以被解释成 `Color` 或 `Timing` 或 `Link`

如果满足：

- 自动预选 mirror axis
- 用户只需命名并确认

如果不满足：

- 禁止创建 mirror
- 显示 inline message: `Mirrors can only capture one kind of change`

## UI Behavior

### In Step Inspector

轴标签仍显示：

- `Color`
- `Pull`
- `Link`

因为这符合探索时的思维方式。

### In Mirror Creation Sheet

轴标签只显示：

- `Color`
- `Timing`
- `Link`

并且：

- 如果当前改动来自 `Pull -> Color`
  - helper: `This pull change compares best as color`
- 如果当前改动来自 `Pull -> Timing`
  - helper: `This pull change compares best as timing`

### In Mirror Dock

镜面 chip 只允许这些前缀：

- `Color:`
- `Timing:`
- `Link:`

不允许：

- `Pull:`

## Diff Rendering Rules

三个 mirror axis 的视觉 diff 必须不同。

### Color Mirror

- 改动 step 染色
- chord label 变化直接可见
- 无尾迹

### Timing Mirror

- step 周围出现位移或延迟尾迹
- chord label 可相同
- 重点表现“更晚落下”

### Link Mirror

- connector 用虚线或细桥显示
- 主 step 仍然存在
- 重点表现“多了一段滑行”

## Prototype Mapping

对当前 prototype script 的主演示路径：

- 用户在 `Pull` 轴下对 `G7` 应用 `Db7`
- 点击 `+ New Mirror`
- 创建 sheet 里只显示：
  - `Color` active
  - `Timing` disabled
  - `Link` disabled
- 默认名称：`tritone`

因为这个改动虽然来自 `Pull` 轴，但比较时最清楚的差异是 `Color`。

## Acceptance Criteria

这条规则如果成立，prototype review 时应该满足：

- 团队成员不会问“Pull mirror 是什么意思”
- 任意一个 mirror 都能被一句话解释成颜色、时间或连接差异
- 从 `Pull` 轴出发探索候选，不会污染后续比较逻辑
- mirror dock 上的 chip 命名始终稳定

## Recommendation

MVP 不要试图把 `Pull` 做成第一类持久对象。

最稳妥的产品结构是：

- `Pull` 留在探索层，帮助用户找方向
- `Color / Timing / Link` 留在比较层，帮助用户做决定
