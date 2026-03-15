# Harmonic Orbit

Candidate generation rules for MVP, based on [integrated-concept-harmonic-orbit-v2.md](C:\Users\BW\DevPlayground\ProjectMartino\integrated-concept-harmonic-orbit-v2.md) and [harmonic-orbit-wireframe-flow.md](C:\Users\BW\DevPlayground\ProjectMartino\harmonic-orbit-wireframe-flow.md).

目标是把 `Step Inspector` 里的候选生成从“灵感词”收紧成一组可实现、可调试、可解释的规则。

## Scope

这套规则只服务 MVP：

- `2-4 bars`
- 每小节 `2` 或 `4` 个 step
- 单一 `Landing Point`
- 单一连续 `Approach Zone`
- 每次只编辑 zone 内一个 step
- 每次只显示 `3` 个候选：`Original + 2 alternatives`

这不是完整 reharm engine。

## Internal Model

每个被选中 step 在生成候选前，先被标准化成这 6 个字段：

- `step_index`
- `step_chord`
- `step_bass`
- `landing_chord`
- `role`
- `zone_length`

可选的辅助字段：

- `prev_chord`
- `next_chord`
- `bar_position`

## Chord Parsing

MVP 只识别这些基础类别：

- `maj`
- `maj6`
- `maj7`
- `m`
- `m7`
- `m7b5`
- `7`
- `dim`
- `sus`

extensions 与 alterations 在 MVP 中只保留为轻量标签，不参与复杂语法树：

- `b9`
- `#9`
- `#11`
- `b13`
- `alt`

slash bass 单独存为 `step_bass`。

如果输入超出支持范围：

- 尝试降级到最近的基础类别
- 无法降级时，保留 `Original`，不出替代

## Role Detection

Role detection 必须可解释，不能黑箱。

### Priority Order

按下面顺序判断，命中后停止：

1. `tonic return`
2. `dominant`
3. `pre-dominant`
4. `passing / link`

### tonic return

判定条件：

- 当前 step 就是 `Landing Point`
- 或当前 step 与 `Landing Point` 同根音且同主质量

例：

- `Cmaj7` -> landing `Cmaj7`
- `C6` -> landing `Cmaj7`

### dominant

判定条件，满足任一：

- 当前 chord 是属七，根音在 landing 根音上方纯五度
- 当前 chord 是属七，功能上明显导向 landing
- 当前 chord 是 tritone substitute dominant，且 resolve 到 landing

例：

- `G7 -> Cmaj7`
- `Db7 -> Cmaj7`
- `E7 -> Am7`

### pre-dominant

判定条件，满足任一：

- 当前 chord 为 ii / iv / ivm 这类准备功能
- 当前 chord 位于 dominant 前一步，且不直接 resolve

例：

- `Dm7 -> G7 -> Cmaj7`
- `Fm6 -> G7 -> Cmaj7`

### passing / link

其余都归入：

- chromatic connector
- diminished connector
- side-slip link
- 语义不明确但位于 zone 内的中间步骤

## Candidate Axes

Inspector 中的 `Color / Pull / Link` 不是装饰词，而是三种不同的生成策略。这里的 `Pull` 是探索轴，不是 mirror 持久化轴。

### Color

目标：

- 保持 step 的大体功能
- 改变表面颜色
- 不改变 zone 长度

允许：

- dominant -> alt dominant
- dominant -> lydian dominant
- tonic -> major6/9
- pre-dominant -> ivm color

不允许：

- 直接新增 step
- 改变 landing 时机

### Pull

目标：

- 增强或延迟落地感
- 改变引力，不改总长度

允许：

- dominant -> tritone substitute
- dominant -> backdoor substitute
- tonic return -> suspended return
- pre-dominant -> stronger setup

不允许：

- 插入 connector step
- 同时改多个 step

### Link

目标：

- 把当前 step 变成连接动作
- 允许在局部插入一个短暂过渡

允许：

- chromatic approach
- diminished connector
- side-slip dominant

不允许：

- 改写整个 zone
- 一次插入超过一个 connector

## Candidate Table

下面这张表是 MVP 的核心。

| Detected role | Axis | Original preserved | Alternative A | Alternative B | Notes |
| --- | --- | --- | --- | --- | --- |
| `dominant` | `Color` | keep current dominant | `alt dominant` version | `lydian dominant` version | 同根音，改颜色，不改时值 |
| `dominant` | `Pull` | keep current dominant | `tritone sub dominant` | `backdoor dominant` if valid, else `delayed dominant` | 优先给最稳定替代 |
| `dominant` | `Link` | keep current dominant | `side-slip in/out` | `diminished approach` | 可临时拆成两个更短 step |
| `pre-dominant` | `Color` | keep current pre-dominant | `subdominant minor` color | `half-diminished prep` | 只在 landing 为 major/minor tonic 时启用 |
| `pre-dominant` | `Pull` | keep current pre-dominant | `secondary prep` | `stronger ii color` | 仍要指向后续 dominant 或 landing |
| `pre-dominant` | `Link` | keep current pre-dominant | `chromatic upper/lower approach` | `passing diminished` | 连接性优先于功能纯度 |
| `tonic return` | `Color` | keep current tonic | `major6/9` or equivalent | `lydian tonic wash` | 只做轻微色彩变化 |
| `tonic return` | `Pull` | keep current tonic | `suspended return` | `delayed settle` | 让落地更晚一点 |
| `tonic return` | `Link` | keep current tonic | `related tonic color then settle` | `upper-neighbor return` | 必须保证最终仍落回 landing |
| `passing / link` | `Color` | keep current link | `planed color` | `lighter altered color` | 只在不破坏落地时给 |
| `passing / link` | `Pull` | keep current link | `stronger connector` | `weaker connector` | 方向是更推或更松 |
| `passing / link` | `Link` | keep current link | `chromatic connector` | `diminished connector` | 最容易和原版并列比较 |

## Concrete Transform Rules

为了让原型更具体，MVP 先只支持这些硬变换。

### dominant / Color

- `G7 -> G7alt`
- `G7 -> G7(#11)`
- `D7 -> D7alt`
- `Bb7 -> Bb7(#11)`

### dominant / Pull

- `G7 -> Db7`
- `D7 -> Ab7`
- `E7 -> Bb7` only if target is `Am`
- `G7 -> Bb7` only when backdoor to `C` is valid in context

### dominant / Link

- `G7 -> Ab7 -> G7`
- `G7 -> Bdim/G -> G7`
- `D7 -> Eb7 -> D7`

### pre-dominant / Color

- `Dm7 -> Fm6`
- `Dm7 -> Dm7b5`
- `Am7 -> Am7b5` only in minor-oriented return

### pre-dominant / Pull

- `Dm7 -> Dm9` style stronger prep label
- `Dm7 -> A7/D` style secondary-prep flavor if parser allows slash

如果 parser 不支持结果格式，就回退到更简单的基础类别。

### pre-dominant / Link

- `Dm7 -> Ebm7 -> Dm7`
- `Dm7 -> F#dim -> G7`

### tonic return / Color

- `Cmaj7 -> C6/9`
- `Fmaj7 -> Fmaj7(#11)`
- `Am7 -> Am6/9`

### tonic return / Pull

- `Cmaj7 -> Csus(add9)` then settle label
- `Am7 -> Asus -> Am7`

### tonic return / Link

- `Cmaj7 -> D/C -> Cmaj7`
- `Am7 -> Bb/Am -> Am7`

### passing / link

- `Bdim -> Dbdim`
- `Ab7 -> A7` as chromatic push
- `Ebm7 -> Dm7` as upper approach

## Validity Filters

每个候选生成后必须过过滤器，否则丢弃。

### Filter 1: Landing Integrity

候选不能破坏唯一落点：

- landing step 不变
- resolve direction 仍然存在

### Filter 2: Zone Locality

候选不能把编辑外溢到 zone 外：

- 不改 zone 外 step
- Link 轴最多只新增一个局部 connector

### Filter 3: Readability

候选必须能用简单 chord label 显示：

- 不输出复杂 polychord
- 不输出超过一层嵌套 slash

### Filter 4: Distinctness

两个 alternative 必须彼此可区分：

- 不能只是拼写变化
- 不能只是 `G7alt` 与 `G7(b9#9b13)` 这种同义重复

如果过滤后不足两个可用候选：

- 保留 `Original`
- 只显示 `1` 个 alternative

## Candidate Ranking

排名只看 3 个因素：

1. 功能稳定性
2. 与 landing 的导向清晰度
3. 与 original 的可辨差异

排序规则：

- 第一个永远是 `Original`
- 第二个应是“最稳的变化”
- 第三个应是“更有个性但仍成立的变化”

例：

对于 `G7 -> Cmaj7`

- `Original: G7`
- `Alt 1: Db7`
- `Alt 2: G7alt`

如果用户当前在 `Color` 轴，则应改成：

- `Original: G7`
- `Alt 1: G7alt`
- `Alt 2: G7(#11)`

## Mirror Interaction Contract

候选一旦被 `Apply` 到当前版本，系统记录：

- `changed_step`
- `changed_axis`
- `old_value`
- `new_value`

创建 mirror 时，这些变更必须可序列化成单轴 diff。若 `changed_axis = Pull`，则必须先归一化成 `Color` 或 `Timing`，不能直接保存为 `Pull mirror`。

如果当前版本已经混入多个轴的变化：

- 禁止创建 mirror
- 弹出提示：`Mirrors can only capture one axis at a time`

这是保证比较质量的关键。

## UI Copy For Candidates

为减少 prototype 阶段漂移，候选副标签固定采用这一套：

- `Original`
- `Brighter`
- `Darker`
- `More pull`
- `Delayed`
- `Slippery`
- `Softer landing`
- `Stronger setup`

不要在 MVP 中动态生成一堆花哨描述。

## Example Walkthroughs

### Example 1

Input loop:

`Dm7 | G7 | Cmaj7 | A7`

Selected step:

- `G7`
- role = `dominant`
- axis = `Pull`

Output:

- `Original: G7`
- `Alt 1: Db7`
- `Alt 2: Bb7` if backdoor valid, else `G7alt`

### Example 2

Input loop:

`Dm7 | G7 | Cmaj7 | Cmaj7`

Selected step:

- `Cmaj7`
- role = `tonic return`
- axis = `Color`

Output:

- `Original: Cmaj7`
- `Alt 1: C6/9`
- `Alt 2: Cmaj7(#11)`

### Example 3

Input loop:

`Dm7 | G7 | Cmaj7 | A7`

Selected step:

- `Dm7`
- role = `pre-dominant`
- axis = `Color`

Output:

- `Original: Dm7`
- `Alt 1: Fm6`
- `Alt 2: Dm7b5`

## Failure Cases

MVP 应该明确接受这些失败：

- 无法识别 role
- 输入 chord 太复杂
- 替代候选会破坏 landing
- 当前轴下没有两个足够清晰的 alternatives

处理方式统一：

- 保留 `Original`
- 最多给 `1` 个替代
- Inspector 顶部显示：`Limited options for this step`

## Acceptance Criteria

如果候选规则正确，原型演示时应该满足：

- 同一 step 在不同 axis 下给出的候选明显不同
- 用户能从候选文案和 diff 看出“这次在改什么”
- 不会出现一次给 6-8 个理论上成立、但难以比较的选项
- 大多数常见 `ii-V-I`、`backdoor`、`turnaround` 场景都至少能给出 `Original + 2`

## Next Use

这份表下一步可以直接被拿去做两件事：

- 画 `Step Inspector` 的候选内容
- 写原型里的假数据与交互逻辑
