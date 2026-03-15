# Harmonic Orbit v2

`Harmonic Orbit` 是一个围绕 `landing path` 工作的短循环和声器物。它不处理整首曲子，也不做开放式 reharm 生成，只专注一件事：帮助用户围绕一个目标落点，编辑并比较 `回去的那条路`。

这一版规格专门修正 v1 里的三个问题：

- `approach zone` 不能只靠系统猜，必须可见、可改
- 替代候选不能只是概念桶，必须基于清晰规则生成
- 镜面比较不能什么都一起改，必须强制单轴对比

## 产品定义

一句话定义：一个让乐手在 `2-4 小节循环` 内，围绕单一落点快速生成、微调并比较多条 `回返路径` 的屏幕原生和声工具。

核心价值不是“给你更多 chord”，而是：

- 更快找到通向目标和声的可用替代路
- 更快比较这些路的落地气质
- 更少进入 DAW 或手动复制版本的成本

## 核心对象

整个产品只处理 4 个对象：

- `Loop`：一个 2-4 小节的等分循环
- `Landing Point`：用户指定的唯一目标和声
- `Approach Zone`：落点前 2-4 个 step 的可编辑窗口
- `Mirror Variant`：只修改一个轴的候选版本

只要这 4 个对象保持清晰，产品就不会散成迷你编曲软件。

## 输入模型

MVP 输入必须收紧，不做自由时值解析。

支持：

- `2-4 小节`
- 每小节 `2` 或 `4` 个 step
- 每个 step 只允许 `chord symbol`
- 可选 `slash bass`

例如：

- `Dm7 | G7 | Cmaj7 | A7`
- `Dm7 G7 | Cmaj7 A7`
- `Dm7 | G7/B | Cmaj7 | Cmaj7`

不支持：

- swing 微时值
- pickup
- melody-aware 输入
- 复杂延音跨步

这样系统才能稳定地判断替代与比较范围。

## Approach Zone 规则

这是 v2 最关键的修正。

### 默认规则

当用户选定 `Landing Point` 后，系统只做一次 `suggested approach zone`：

- 默认取落点前连续 `2` 个 step
- 如果前一 step 已经是明显准备功能，才扩展到 `3-4` 个 step
- 系统只高亮建议，不自动锁定

### 用户控制

用户必须能直接调整这个窗口：

- 向左拖边界，扩大 zone
- 向右拖边界，缩小 zone
- 双击某一步，将其排除在 zone 外

### 视觉原则

- `Approach Zone` 永远是环上连续的一段
- 环外其他内容变暗，但仍继续播放
- 所有编辑手柄只出现在 zone 内

### 硬边界

- 同一时刻只允许一个 `Landing Point`
- 同一时刻只允许一个连续 `Approach Zone`
- 所有候选替代、插步与镜面都只作用于这个 zone

这样用户就不会和系统争夺“到底在改哪一段”。

## 替代生成模型

v1 的“色层家族”太松，这里改成规则驱动。

每次用户选中 `Approach Zone` 里的某一个 step，系统先识别它的 `step role`：

- `pre-dominant`
- `dominant`
- `tonic return`
- `passing / link`

然后只从对应角色允许的候选里出结果。

### 候选轴

每个 step 只沿一个轴生成候选：

- `Color`：同功能换颜色
- `Pull`：增强或延迟到达感
- `Link`：把当前 step 改成过渡连接

### 角色到候选的映射

`pre-dominant`

- Color：ii -> ivm、iiø、subdominant minor color
- Pull：ii -> secondary pre-dominant color
- Link：在前后插入 chromatic approach

`dominant`

- Color：plain dominant、alt dominant、lydian dominant
- Pull：tritone substitute、backdoor substitute、延迟 resolve
- Link：diminished link、side-slip dominant

`tonic return`

- Color：major tonic、major6/9、lydian tonic wash
- Pull：延迟完全落地，先给 suspended return
- Link：先落到 related tonic color 再回正

`passing / link`

- Color：planed color
- Pull：增强导向性
- Link：chromatic connector、diminished connector

### 候选数量

每次最多显示 `3` 个候选，不做滚动大列表。

排序原则：

- 功能最稳定的在前
- 色彩更强的在后
- 永远保留 `original` 作为第一个选项

这样试听是决策，不是搜索。

## 镜面规则

这是第二个关键修正。

每一个 `Mirror Variant` 必须声明自己属于哪个轴：

- `Color`
- `Timing`
- `Link`

补充规则：

- `Pull` 不是 mirror axis
- 任何来自 `Pull` 的改动，都必须先归一化成 `Color` 或 `Timing`

### 创建规则

当用户从当前版本创建镜面时，系统先要求选择：

- 这是一个颜色版本
- 这是一个时间版本
- 这是一个连接版本

选定后，这个镜面只允许该轴继续变化：

- `Color` 镜面可改替代色彩，但不能插步
- `Timing` 镜面可改步位与延迟，但不能换替代家族
- `Link` 镜面可插入或替换 passing link，但不能大改落地时机

### 比较规则

- 镜面栏最多 `4` 个版本
- 同一轴最多 `2` 个镜面
- 当前镜面与 base version 的差异必须被高亮

高亮方式：

- `Color`：改动 step 发光染色
- `Timing`：改动 step 显示位移尾迹
- `Link`：新增 step 显示虚线连接

这样用户在听见不同之前，先看见“不同发生在哪一层”。

## 主界面

主界面保持 4 区，但每区职责更明确。

### A. Orbit Loop

- 显示完整循环
- 显示播放头
- 显示唯一 `Landing Point`
- 高亮连续 `Approach Zone`

### B. Step Inspector

当选中 zone 内某一步时展开：

- 当前 chord
- 当前 step role
- 候选轴切换：`Color / Pull / Link`
- `Pull` 只用于探索候选，不直接作为 mirror 标签
- 3 个候选试听按钮

这会比单纯“井壁隐喻”更可用。

### C. Mirror Dock

- 显示 base version
- 显示最多 4 个镜面
- 每个镜面标出所属轴
- 悬停时预览差异，点击时切换试听

### D. Transport

- loop on/off
- click on/off
- solo approach zone
- bypass edits
- instant revert to base

`instant revert to base` 是必须补上的，因为用户需要快速确认“我到底改好了没有”。

## 核心流程

用户完成一次成功会话，必须稳定走完这 6 步：

1. 输入一个 2-4 小节 loop
2. 选择一个 `Landing Point`
3. 接受或手动调整 `Approach Zone`
4. 在 zone 内选中一个 step，试听 3 个候选
5. 基于一个轴创建至少 1 个镜面
6. 在 base 与镜面之间 A/B 后保留一个版本

如果这 6 步无法无说明完成，产品就还没成立。

## 一次具体用例

输入：

`Dm7 | G7 | Cmaj7 | A7`

目标：让 `G7 -> Cmaj7` 这次回返更有戏，但仍能稳定循环。

流程：

1. 用户选择 `Cmaj7` 为 `Landing Point`
2. 系统建议 `Approach Zone = [Dm7, G7]`
3. 用户保持不改
4. 选中 `G7`，系统识别为 `dominant`
5. 用户切到 `Color` 轴，看到：
   - `G7`
   - `Db7`
   - `G7alt`
6. 用户试听后选择 `Db7`
7. 用户创建一个 `Color` 镜面，命名为 `tritone`
8. 回到 base，改走 `Link` 轴，得到 `G7 -> Ab7 -> G7`
9. 用户创建一个 `Link` 镜面，命名为 `slip`
10. 循环播放，来回切换 `base / tritone / slip`
11. 最终保留 `tritone`

这个过程里，每一个比较都知道自己在比什么。

## MVP 验收标准

这部分改成可观察标准，不用主观词。

### 任务验收

第一次上手的目标用户应能在无帮助情况下完成：

- 输入一个 4-step loop
- 设定一个落点
- 修改一次 approach zone 范围
- 对一个 dominant step 做一次候选替代
- 创建一个 `Color` 镜面
- 在 `base` 和 `mirror` 间切换并回到 base

### 结果验收

一次会话结束时，应满足：

- 用户保留了至少 `2` 个可试听版本
- 每个版本差异都能被视觉高亮解释
- 用户能说出“这两个版本不同在颜色/时间/连接中的哪一轴”

### 失败信号

如果出现这些情况，说明设计仍然失焦：

- 用户不知道自己当前改的是整段还是局部
- 用户听见差异，但说不清差异来自哪里
- 用户创建镜面后，无法回到 base
- 用户为了比较版本，不得不停止循环播放

## 边界

v2 明确不做：

- 自动生成整段 reharm
- 多落点编辑
- 自由长度 phrase 编辑
- melody-aware 推荐
- 配器和音色设计
- 教学解释模式

它只做：`围绕一个落点，编辑并比较一小段回返路径。`

## 结论

`Harmonic Orbit v2` 比 v1 更窄，但也更真。

它放弃了“一个很美的总隐喻可以解决一切”，转而把最关键的 3 个规则钉死：

- 用户始终知道自己在改哪一段
- 系统始终知道自己为什么给出这些候选
- 版本比较始终只有一个清晰维度

只有这样，它才真的可能从一个好概念变成一个好工具。
