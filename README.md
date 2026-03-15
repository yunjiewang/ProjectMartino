# Harmonic Orbit

> 当前版本状态：**v0.10-dev**（开发迭代中，未到 v1.0 验收冻结）

一个面向 reharm 练习与对比的静态原型应用（HTML/CSS/JS）。

## 新人上手（Onboarding）

### 1. 先看什么
- 产品高层需求：[`PRD.md`](./PRD.md)
- 已实现历史：[`PROGRESS.md`](./PROGRESS.md)
- 当前待办：[`TODO.md`](./TODO.md)

### 2. 本地运行
你可以直接双击 `index.html` 打开，也可以本地起静态服务：

```bash
python -m http.server 4173 --directory .
```

然后访问：`http://127.0.0.1:4173/index.html`

### 3. 推荐首次操作路径（5分钟）
1. 点击 `Load Demo`
2. 点击 `Apply Loop`
3. 在 Orbit 中双击任一步设置 landing
4. 在 zone 内选 step，试听候选并 `Use This Move`
5. 创建 mirror 并切换到 compare
6. 在 Audition Trail 里 pin / note / promote
7. 试用 `Export Review` 导出当前复盘


## 迭代协作约定（Contributor Quick Rules）
- 每次迭代结束前：
  - 更新 `TODO.md` 当前迭代状态；
  - 将已完成项移动到 `PROGRESS.md`；
  - 在 `TODO.md` 增加下一版本重大规划（Version Plan）；
  - 在 `agent.md` 更新完成度评估与是否可停止开发建议。
- 评估口径与停止阈值：见 [`agent.md`](./agent.md)。

## 代码结构
- `index.html`：页面结构与主要控件
- `app.css`：视觉系统与布局样式
- `app.js`：状态管理、交互逻辑、WebAudio 试听
- `PRD.md`：高层功能需求
- `PROGRESS.md`：历史完成项
- `TODO.md`：待办事项（仅 pending）

## 常用验证
```bash
# JS 语法检查
node --check app.js

# 生成跨浏览器 smoke 检查模板
./scripts/smoke_checklist.sh
```

## 备注
- 当前为静态原型，优先验证交互与流程，不追求工程化最终形态。
