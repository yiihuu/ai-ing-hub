# 项目进展 · Progress

> 面向外部的进展汇总；逐日流水见 [DEVLOG.md](./DEVLOG.md)。
> External-facing progress summary; see [DEVLOG.md](./DEVLOG.md) for the day-by-day log.

## 里程碑 · Milestones

| 🟣 日期 · Date | 进展 · What happened |
|---|---|
| **2026-11-03** | • 圆球点击切换：已收纳时再点一下即移除（看板卡片消失、圆球放大）<br>• 新增本进展页 `PROGRESS.md` 并接入 README 顶部 |
| **2026-11-02** | • 浮点 dot 双形态：小圆球 = 已收纳，大圆球 = 未收纳 / 已移除<br>• 修复 dot 在 SPA 重渲染 / 切换对话时消失（改为始终保活 + 状态实时同步）<br>• 捕获交互改为主交互「点击 dot 收纳当前对话」（文字拖拽降为附带增强）<br>• 图库空状态自解释（内置「看示例 / 怎么装小圆点」引导）<br>• 交互从「自动轮询抓取」转向「手动收纳」<br>• README 双语 + 顶部徽章行 + Roadmap 区块 |
| **2026-11-01** | • 网页版 MVP 跑通：Node 中枢 + 卡片网格前端 + MV3 捕获扩展，curl 端到端验证通过 |

## 已验证 · Verified

- 本地中枢 API（上报 / 列表 / SSE 实时推送 / 移除）全部通过 curl 验证。
- 浮点 dot：始终存在、大小随收纳状态变化、点击可切换收纳与移除。

## 下一步 · Next

- 应用内中英文切换（i18n）
- 「精确聚焦已有标签」：点击卡片直接切回已开的标签页（`chrome.tabs` 桥接）
- 桌面端轻量软件（Tauri 封装，local-first）
- 更多 AI 源捕获 + 看板视图迭代

## 本页如何更新 · How this is updated

- 代码改动累积到一定量时，由维护者总结后更新本页；同一天的进展合并为一行。
- Refreshed by the maintainer after changes accumulate; same-day items are merged into one row.
