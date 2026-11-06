# AI-ing Hub · 未完成任务中枢

![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Built with](https://img.shields.io/badge/built%20with-Tauri-24C8D8)
![Stack](https://img.shields.io/badge/stack-Node%20%2B%20Rust-orange)
![Local-first](https://img.shields.io/badge/local--first-%E2%9C%93-brightgreen)
![Version](https://img.shields.io/badge/version-0.2.0-purple)

> 本地优先的「未完成任务中枢」：把**没做完的 AI 对话**和**没做完的网页**收进一个卡片网格视图。收纳后原网页照常开着，点一下即跳回原处。数据不出本机。
>
> A local-first hub for unfinished work: gather in-progress AI conversations **and** unfinished web pages into one card-grid view. The original page stays open; tap a card to jump straight back. Nothing leaves your machine.

📈 **进展 / Progress** → [PROGRESS.md](./PROGRESS.md) · 📓 开发日志 / Devlog → [DEVLOG.md](./DEVLOG.md)

## 问题背景 · Background

- 作为个人消费者，日常需要在 ChatGPT、Claude 等多个 AI 软件之间切换，回看自己进行中的任务变得碎片化、难以追踪。并且，作为ai coding的个人开发者或学生，日常需要在多个ai中进行切换。我们常希望榨干有限的ai——譬如这句话——我可以闲着，但ai不能闲着。我们在多任务处理时，常常需要在不同ai之间看，是否任务有所完成。有时候，ai的“已完成”信息也会弹出，迫使你原本在进行与一个ai的chat的打断——你会倾向选择去看一眼，查验一下这个任务完成情况如何。
- As an individual consumer, daily work spans multiple AIs (ChatGPT, Claude, …); tracking in-progress tasks becomes fragmented and hard to revisit. And as an AI-coding developer or a student, we switch between multiple AIs every day. We want to squeeze every bit out of limited AI capacity — as the saying goes, *I* can afford to be idle, but the AI cannot. When multitasking, we constantly have to check across different AIs whether a task has finished. Sometimes the AI's "done" notification pops up and interrupts the chat you were in — and you cannot help but glance at it to see how it went.
- 不只是 AI：Overleaf 的论文、Google Sheets 的访谈表、任何写到一半的网页，都散落在几十个标签页里，找回来本身就是负担。
- Not only AI: an Overleaf draft, a Sheets interview log, any half-written web page — they scatter across dozens of tabs, and finding them again is itself a burden.
- 同时挂着太多未完成的事，会压低「开始做下一件」的意愿；这里的目标是降低认知负担，而不是要求用户更自律。
- Too many unfinished things at once lower the willingness to start the next one. The goal here is to reduce cognitive load, not to demand more self-discipline.

## 功能特性 · Features

- **通用收纳**：任意网页都能收进来，不限 AI 对话（Overleaf / Sheets / 文档 / 后台系统…）。
- Universal capture: any web page can be filed in, not just AI chats (Overleaf / Sheets / docs / admin tools…).
- **三种收纳姿势，按省力程度排序**：① `Alt + Shift + S` 快捷键（不用找按钮）→ ② 点击常驻浮点 → ③ 右键菜单「收纳到 AI-ing Hub」。
- Three capture gestures, ordered by how little they cost: ① `Alt + Shift + S` hotkey (no hunting for a button) → ② click the persistent floating dot → ③ right-click → "Capture to AI-ing Hub".
- **浮点可拖动、位置被记住**：挪开不挡事，下次还在原地；把页面上的链接拖到浮点上也能收纳那个链接。
- Draggable dot with a remembered position: move it out of the way and it stays there next time; you can also drop a link onto it to file that link.
- **收纳 ≠ 关闭**：只留一条引用，原网页照常开着，随时回去接着做。
- Capture ≠ close: only a reference is stored — the original page stays open so you can resume at any time.
- **跳回即聚焦**：点卡片直接切回已开着的那个标签页（而不是新开一堆重复页）。
- Jump back = focus: tapping a card switches to the already-open tab instead of piling up duplicates.
- **同一文档的不同页签合并为一条**：Google Sheets 换个 sheet 页签不会多出一张卡片，但会记住你最后停在哪个页签。
- One card per document: switching sheets tabs inside a Google Sheets file does not create a duplicate card, yet the exact tab you left on is preserved.
- 面板按类型与站点筛选（AI 对话 / 网页任务 / 具体站点），可搜索。
- Filter the panel by type and site (AI chat / web task / specific site), with search.
- 本地优先、仅存元数据：不保存正文，隐私极简。
- Local-first, metadata-only: message bodies are never stored; minimal privacy surface.
- 轻量：中枢服务零依赖（Node），桌面壳可选（Tauri）。
- Lightweight: the hub server is zero-dependency (Node); the desktop shell is optional (Tauri).
- **已支持的多 AI 源**：ChatGPT / Claude / Gemini / DeepSeek / Perplexity / WorkBuddy；原生桌面 App 的对话可复制链接后在面板「＋ 添加链接」手动收纳。
- Supported AI sources: ChatGPT / Claude / Gemini / DeepSeek / Perplexity / WorkBuddy. Conversations from native desktop apps can be filed by pasting their link via the panel's "＋ Add link" box.

## 项目定位 · Positioning

- 面向 HCI 的原型研究：探查「如何为高认知负荷 / 低精力人群降低多任务并行的收纳负担」。
- An HCI-oriented prototype exploring how to reduce the bookkeeping burden of parallel, unfinished work for people under high cognitive load or low energy.
- 收纳交互的设计原则是**启动门槛最低**：主路径是「一键、零视觉搜寻、零精度动作」。
- The capture interaction is designed around the lowest possible initiation threshold: one action, no visual search, no fine motor precision.

## 相关工作与竞品定位 · Related Work & Competitors

- 现有跨 AI 工具多从「历史归档 / 全文搜索 / 记忆库」入手，而本项目的独特切入口是「进行中任务的实时切换」（live workspace switcher）。
- Existing cross-AI tools mostly start from history archiving / full-text search / memory; our unique entry point is real-time switching of in-progress tasks (a live workspace switcher).

| Tool | Type · 类型 | Core feature · 核心功能 | Difference · 与本项目的差异 |
|---|---|---|---|
| Chat Memo | 浏览器扩展 Extension | 本地私有、自动存档、全文搜索、周报 | 偏「存档/记忆」；本项目偏「跳回正在做的对话」 |
| Echoes | 跨 AI 会话管理器 Manager | 搜索/标签/导出/摘要，可跳回，需连账号 | 功能重、存全文；本项目更轻、仅存元数据 |
| Troves | 统一侧边栏 Sidebar | 文件夹/全文搜索/云同步/团队 | 偏团队云协作；本项目本地优先、隐私极简 |
| ChatHub / Poe | 多模型聚合 Multi-model | 一个界面同时问多个模型 | 是「替代 AI」，非「链接回原 AI」 |
| OneTab / Workona | 标签会话管理器 Tab manager | 把开着的标签页收起来、之后找回 | 不感知对话内容、不区分任务类型；本项目以「未完成的任务」为第一分类 |
| Quick Capture 类工具 | 随手捕获 Capture inbox | 几秒记下一条文字 | 捕获的是文字，不是「还开着的那个页面」 |

> 现有工具多从「历史归档与全文搜索」入手，或捕获文字；本项目以「进行中任务的实时切换」为切入点，用卡片网格与克制流畅的交互，把「多窗口翻找」降维成「在网格里点一张卡片」，并坚持本地优先、仅管理元数据。
> Existing tools start from history archiving and full-text search, or capture plain text; we start from real-time switching of in-progress tasks: a card grid with restrained, fluid interaction that reduces "hunting through windows" to "tapping a card in a grid" — local-first, metadata-only.

### 学术相关工作（待补充）· Academic related work (to be written)

- Microsoft Research Asia 的 **Huabu** —— 待补充 / to be written by author.

## 架构 · Architecture

```
未完成任务源 ──(浏览器扩展捕获)──▶ 本地中枢服务 ──▶ 卡片网格面板
 AI 对话 / 任意网页          标题/URL/类型        (Node, 54321)      (card grid)
        │   点击浮点 / 快捷键 / 右键菜单                │
        │                                    SSE 实时推送
        │                                          │
        └────────── 点卡片 ──▶ 聚焦已有标签页（chrome.tabs 桥接）
```

- 捕获层 Capture：扩展在**所有网页**注入常驻浮点；点击即收纳当前页面，拖链接到浮点则收纳该链接；抽取 `{provider, type, title, url, favicon, preview, source}` 并 POST 到本地服务。`url` 去掉 hash 与噪声参数后作 `key` 持久化，同一文档不重复建卡。
- Capture layer: the extension injects a persistent floating dot into **every** page; clicking it files the current page, dropping a link on it files that link. It extracts `{provider, type, title, url, favicon, preview, source}` and POSTs to the local hub, keyed by a hash/noise-stripped URL so one document never yields two cards.
- 快捷键与右键菜单 Hotkey & context menu：`background.js` 监听 `Alt + Shift + S`（收纳当前标签页）与右键菜单（页面 / 链接 / 选中文字 / 显示隐藏浮点），并在扩展图标上显示未完成任务数徽章。
- The background service worker handles the `Alt + Shift + S` command and the right-click menu (page / link / selection / toggle dot), and shows the number of unfinished tasks as a toolbar badge.
- 中枢服务 Hub server `server.js`：零依赖 Node；`POST /api/session` 上报、`DELETE /api/session?url=` 移除、`GET /api/events` SSE 实时推送；仅存元数据，不存正文。
- 面板界面 Panel `src/`：卡片网格前端，按类型/站点筛选 + 搜索，丝滑进出场动画；点卡片经扩展桥接聚焦已有标签页。
- Panel UI `src/`: card-grid frontend with type/site filter, search, springy enter/exit animations; tapping a card focuses the already-open tab through the extension bridge.

## 快速开始 · Getting Started

### 方式一 · 本地运行（推荐先验证）· Quick start — requires Node >= 18

```bash
cd ai-ing-hub
node server.js
# 打开 / open http://127.0.0.1:54321
```

### 方式二 · 浏览器扩展 · Browser extension

1. Chrome / Edge → 扩展管理 → 开启「开发者模式」。
2. 「加载已解压的扩展程序」→ 选择 `extension/` 目录。
3. **重新加载扩展**（改了代码必须重载一次）。
4. 打开任意网页（不只是 AI 对话），右下角出现浮点 dot。
5. 收纳的几种方式：
   - **点一下 dot** → 当前页面立即出现在面板；再点一下 → 取消收纳（dot 变小 = 已收纳，dot 变大 = 未收纳）。
   - **按 `Alt + Shift + S`** → 收纳当前标签页，连 dot 都不用找。
   - **右键 → 「收纳到 AI-ing Hub」** → 收纳当前页 / 选中的链接 / 选中的文字。
   - **把页面上的链接拖到 dot 上** → 收纳那个链接。
6. 点面板里的卡片 → 直接切回那个已开着的标签页。
7. `Alt + Shift + H` 或点扩展图标 → 打开面板。

### 方式三 · 桌面端（可选）· Desktop (Tauri, optional)

- 需要 Rust 工具链。`tauri build` 当前为脚手架形态；Node 原型已可完整演示概念。

## 项目结构 · Project Structure

```
ai-ing-hub/
├── server.js              # 本地中枢服务（零依赖）Hub server
├── package.json
├── src/                   # 面板前端 Panel frontend
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── extension/             # 浏览器扩展捕获层 Capture extension
│   ├── manifest.json
│   ├── content.js         # 全站浮点 + 拖拽收纳 + 面板桥接
│   ├── dot.css            # 浮点 dot 视觉 Injected floating-dot styles
│   └── background.js      # 快捷键 / 右键菜单 / 徽章 / 聚焦标签页
├── src-tauri/             # Tauri 桌面壳 Desktop shell
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── build.rs
│   ├── src/{main,lib}.rs
│   └── capabilities/default.json
├── DEVLOG.md              # 公开开发日志 Public devlog
├── PROGRESS.md            # 对外进展汇总 Progress summary
└── sessions.json          # 运行时生成（持久化索引，已 gitignore）Runtime index
```

## 路线规划 · Roadmap

- 当前形态为**网页版最小可用性测试（MVP）**：浏览器扩展 + 本地中枢，验证「一键收纳 → 卡片面板 → 跳回原处」的核心闭环。
- The current web build is a **minimum-usability test (MVP)**: browser extension + local hub validating the core loop "capture in one action → card panel → jump back".
- 后续阶段 / Next phases:
  - **低精力小样本评估 / Low-energy usability study**：用 NASA-TLX 之类的量表，测「收纳一次」的心智成本。
  - **桌面端形态 / Desktop build**：以 Tauri 封装为独立轻量软件，运行在用户自己的电脑里（local-first）。
  - **网页端与软件端一起收纳 / Unified collection**：web 与 desktop 收纳同一批任务。
  - **看板视图迭代 / Board view**：卡片网格布局将随时间迭代调整。

## 已知边界 · Known Limitations

- 浮点目前注入所有网页；可用右键菜单「显示 / 隐藏浮点」临时关掉，或把 `matches` 收窄到白名单域名。
- The dot is injected into every page today; right-click → "Toggle floating dot" turns it off, or narrow the `matches` list to an allowlist.
- 收纳仍依赖用户一次主动操作（快捷键 / 点击 / 右键）。后续可叠加「自动发现 + 手动确认」作为可选增强。
- Capture still takes one active gesture (hotkey / click / right-click). An optional "auto-discover + confirm" layer can be added later.
- 「跳回」依赖扩展桥接（`chrome.tabs`）；未安装扩展时退化为新开标签页。
- "Jump back" relies on the extension bridge (`chrome.tabs`); without the extension it falls back to opening a new tab.
- 桌面原生 App（本地 LLM 客户端、各 AI 的桌面端等）暂无法被浏览器扩展直接读取；当前可用面板「＋ 添加链接」粘贴对话链接作为轻量替代，后续可接其本地日志 / API。
- Native desktop apps (local LLM clients, each AI's desktop build, …) cannot be read by the browser extension directly yet; for now you can paste a conversation link in the panel's "＋ Add link" box as a lightweight alternative, with a local-log/API bridge as future work.
- 应用内中英文切换（i18n）为规划中功能。
