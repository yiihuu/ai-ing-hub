# 项目进展 · Progress

> 本页为面向外部的进展汇总；逐日流水见 [DEVLOG.md](./DEVLOG.md)。
> This page is an external-facing progress summary; see [DEVLOG.md](./DEVLOG.md) for the day-by-day log.

## 当前状态 · Current status

- 网页版 MVP 已可端到端运行：浏览器扩展 + 本地中枢 + 卡片网格界面。
- The web MVP runs end-to-end: browser extension + local hub + card-grid gallery.

## 近期里程碑 · Recent milestones

- **2026-11-02** · 浮点 dot 支持**点击切换**：已收纳时点一下即移除（看板卡片消失、圆球放大）。
  Floating dot now toggles: a second click removes the capture (card disappears, dot grows back).
- **2026-11-02** · 浮点 dot **双形态**上线：小圆球 = 已收纳，大圆球 = 未收纳 / 已移除。
  Dual-state dot shipped: small dot = captured, large dot = unsaved or removed.
- **2026-11-02** · 修复 dot 在 SPA 重渲染 / 切换对话时**消失**的问题（改为始终保活 + 状态实时同步）。
  Fixed dot disappearing on SPA re-render / conversation switch (always-alive + live state sync).
- **2026-11-02** · 图库空状态改为**自解释**：内置「看示例」「怎么装小圆点」引导。
  Empty gallery now self-explanatory with built-in "see demo" / "how to install" guides.
- **2026-11-02** · 捕获交互从「自动轮询」转向「手动收纳」：浮点 dot 点击/拖拽收纳当前对话。
  Capture model pivoted from auto-poll to manual collect via the floating dot.
- **2026-11-01** · 网页版 MVP 跑通：Node 中枢 + 卡片网格前端 + MV3 捕获扩展，curl 端到端验证通过。
  Web MVP working: Node hub + card-grid frontend + MV3 capture extension, verified end-to-end.

## 已验证 · What's verified

- 本地中枢 API：上报 / 列表 / SSE 实时推送 / 移除，全部通过 curl 验证。
  Hub API (ingest / list / SSE push / remove) verified via curl.
- 浮点 dot：始终存在、大小随收纳状态变化、点击可切换收纳与移除。
  Floating dot: always present, size tracks capture state, click toggles capture/remove.

## 下一步 · Next

- 应用内中英文切换（i18n）。
  In-app Chinese/English toggle.
- 「精确聚焦已有标签」：点击卡片直接切回那个已开的标签页（`chrome.tabs` 桥接）。
  Precise tab focus: tapping a card switches to the already-open tab.
- 桌面端轻量软件（Tauri 封装，local-first）。
  Lightweight desktop build via Tauri.
- 更多 AI 源捕获 + 看板视图迭代。
  More AI sources + board-view iteration.

## 本页如何更新 · How this page is updated

- 代码改动累积到一定量时，由维护者总结后更新本页。
- This page is refreshed by the maintainer after changes accumulate to a meaningful amount.
