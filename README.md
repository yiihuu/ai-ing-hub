# AI-ing Hub · 跨 AI 会话中枢

![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Built with](https://img.shields.io/badge/built%20with-Tauri-24C8D8)
![Stack](https://img.shields.io/badge/stack-Node%20%2B%20Rust-orange)
![Local-first](https://img.shields.io/badge/local--first-%E2%9C%93-brightgreen)
![Version](https://img.shields.io/badge/version-0.1.0-purple)

> 本地优先的「跨 AI 会话中枢」：把你正在进行的 ChatGPT / Claude 对话收进一个卡片网格视图。点击卡片即跳回原对话，结束即移除。数据不出本机。
>
> A local-first cross-AI session hub that gathers your in-progress ChatGPT / Claude conversations into a card-grid view. Tap a card to jump back to the original chat; remove it when done. Nothing leaves your machine.

## 问题背景 · Background

- 作为个人消费者，日常需要在 ChatGPT、Claude 等多个 AI 软件之间切换，回看自己进行中的任务变得碎片化、难以追踪。
- As an individual consumer, daily work spans multiple AIs (ChatGPT, Claude, …); tracking in-progress tasks becomes fragmented and hard to revisit.

## 功能特性 · Features

- 跨 AI 统一视图：把多个进行中的对话收进一个卡片网格，点一下跳回。
- A unified cross-AI view: in-progress chats from multiple AIs gathered into one card grid; tap to jump back.
- 本地优先、仅存元数据：不保存对话正文，隐私极简。
- Local-first, metadata-only: message bodies are never stored; minimal privacy surface.
- 点击/拖拽收纳：在对话页注入一个常驻浮点，点击浮点即把当前对话收纳进图库；也可选中文字拖到浮点上（带预览）。点/拖一次即按 url 记住该任务，无需重复操作。
- Capture by click or drag: a persistent floating dot is injected into the chat page; click it to file the current conversation, or drag selected text onto it (with preview). One gesture pins the task by URL — no repeat needed.
- 轻量：中枢服务零依赖（Node），桌面壳可选（Tauri）。
- Lightweight: the hub server is zero-dependency (Node); the desktop shell is optional (Tauri).

## 项目定位 · Positioning

- 以项目为导向的 HCI 原型，解决「同时在多个 AI 之间切换、回看任务」的碎片化痛点。
- A project-oriented HCI prototype tackling the fragmentation of switching across multiple AIs while tracking in-progress tasks.

## 相关工作与竞品定位 · Related Work & Competitors

- 现有跨 AI 工具多从「历史归档 / 全文搜索 / 记忆库」入手，而本项目的独特切入口是「进行中任务的实时切换」（live workspace switcher）。
- Existing cross-AI tools mostly start from history archiving / full-text search / memory; our unique entry point is real-time switching of in-progress tasks (a live workspace switcher).

| Tool | Type · 类型 | Core feature · 核心功能 | Difference · 与本项目的差异 |
|---|---|---|---|
| Chat Memo | 浏览器扩展 Extension | 本地私有、自动存档、全文搜索、周报 | 偏「存档/记忆」；本项目偏「跳回正在做的对话」 |
| Echoes | 跨 AI 会话管理器 Manager | 搜索/标签/导出/摘要，可跳回，需连账号 | 功能重、存全文；本项目更轻、仅存元数据 |
| Troves | 统一侧边栏 Sidebar | 文件夹/全文搜索/云同步/团队 | 偏团队云协作；本项目本地优先、隐私极简 |
| ChatHub / Poe | 多模型聚合 Multi-model | 一个界面同时问多个模型 | 是「替代 AI」，非「链接回原 AI」 |

> 现有跨 AI 工具多从「历史归档与全文搜索」入手；本项目以「进行中任务的实时切换」为切入点，用卡片网格与克制流畅的交互，把跨 AI 的上下文切换从「多窗口翻找」降维成「在网格里点一张卡片」，并坚持本地优先、仅管理元数据。
> Existing cross-AI tools start from history archiving and full-text search. We start from real-time switching of in-progress tasks: a card grid with restrained, fluid interaction that reduces cross-AI context-switching from "hunting through windows" to "tapping a card in a grid" — local-first, metadata-only.

### 学术相关工作（待补充）· Academic related work (to be written)

- Microsoft Research Asia 的 **Huabu** —— 待补充 / to be written by author.

## 架构 · Architecture

```
AI 对话源 ──(浏览器扩展捕获)──▶ 本地中枢服务 ──▶ 卡片网格界面
 (ChatGPT/Claude)    标题/URL/预览         (Node, 54321)      (card grid)
                                                  │
                                          SSE 实时推送
                                                  │
                              点击卡片 ──▶ window.open 跳回原对话
```

- 捕获层 Capture：浏览器扩展在 AI 对话页注入常驻浮点 dot；点击 dot 即收纳当前对话（或选中文字拖到 dot 上，带预览），扩展抽取 `{provider, title, url, favicon, preview, ts}` 并 POST 到本地服务。按 url 持久化，点/拖一次即记住。
- Capture layer: the extension injects a persistent floating dot into AI chat pages; clicking it files the current conversation (or drag selected text onto it for a preview). It extracts `{provider, title, url, favicon, preview, ts}` and POSTs to the local hub, pinned by URL.
- Hub server `server.js`：零依赖 Node；`POST /api/session` 上报、`DELETE /api/session?url=` 移除、`GET /api/events` SSE 实时推送；仅存元数据，不存对话正文。
- 图库界面 Gallery `src/`：卡片网格前端，按厂商筛选 / 搜索，丝滑进出场动画。
- Gallery UI `src/`: card-grid frontend with vendor filter, search, springy enter/exit animations.

## 快速开始 · Getting Started

### 方式一 · 本地运行（推荐先验证）· Quick start — requires Node >= 18

```bash
cd ai-ing-hub
node server.js
# 打开 / open http://127.0.0.1:54321
```

### 方式二 · 浏览器扩展（点击收纳）· Browser extension

1. Chrome / Edge → 扩展管理 → 开启「开发者模式」。
2. 「加载已解压的扩展程序」→ 选择 `extension/` 目录。
3. 打开 ChatGPT / Claude / Gemini 对话，页面右下角出现浮点 dot。
4. **点击 dot** → 当前对话立即出现在图库；已收纳的 dot 会显示「已收纳」状态。
   （进阶：在对话中选中一段文字，拖到 dot 上可带上预览片段。）

### 方式三 · 桌面端（可选）· Desktop (Tauri, optional)

- 需要 Rust 工具链。`tauri build` 当前为脚手架形态；Node 原型已可完整演示概念。

## 项目结构 · Project Structure

```
ai-ing-hub/
├── server.js              # 本地中枢服务（零依赖）Hub server
├── package.json
├── src/                   # 图库前端 Gallery frontend
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── extension/             # 浏览器扩展捕获层 Capture extension
│   ├── manifest.json
│   ├── content.js
│   ├── dot.css            # 浮点 dot 视觉 Injected floating-dot styles
│   └── background.js
├── src-tauri/             # Tauri 桌面壳 Desktop shell
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── build.rs
│   ├── src/{main,lib}.rs
│   └── capabilities/default.json
├── DEVLOG.md              # 公开开发日志 Public devlog
└── sessions.json          # 运行时生成（持久化索引，已 gitignore）Runtime index
```

## 路线规划 · Roadmap

- 当前形态为**网页版最小可用性测试（MVP）**：浏览器扩展 + 本地中枢，验证「点击浮点收纳、卡片网格跳回」的核心闭环。
- The current web build is a **minimum-usability test (MVP)**: browser extension + local hub validating the core loop "click dot to capture, tap card to jump back".
- 后续阶段 / Next phases:
  - **桌面端形态 / Desktop build**：以 Tauri 封装为独立轻量软件，运行在用户自己的电脑里（local-first）。
  - **网页端与软件端一起收纳 / Unified collection**：web 与 desktop 收纳同一批会话。
  - **多个 AI 一起收纳 / Multi-AI at once**：并行从更多 AI 源捕获。
  - **看板视图迭代 / Board view**：卡片网格布局将随时间迭代调整。

## 已知边界 · Known Limitations

- 收纳依赖用户一次主动操作（点击浮点，或选中文字拖到浮点）。后续可叠加「自动发现 + 手动确认」作为可选增强。
- Capture requires one active gesture (click the dot, or drag selected text onto it). An optional "auto-discover + confirm" layer can be added later.
- 「跳回」目前用 `window.open` 打开 / 聚焦 URL；要做到「精确聚焦已有标签」需扩展 background 与中枢建立桥接（`chrome.tabs` API）。
- 桌面原生 AI App（本地 LLM 客户端等）需另接其本地日志 / API。
- 应用内中英文切换（i18n）为规划中功能。
