# 开发日志 · Devlog

> 公开的工作记录，用于自我督促与进度追踪。深层研究思路见私有笔记（不在此公开仓库）。
> Public working log for self-accountability and progress tracking. Deep research thinking lives in private notes (not in this public repo).

## 2026-11-02
- 完成最小可跑原型：Node 中枢 + 卡片网格前端 + MV3 浏览器捕获扩展；curl 端到端验证通过。
- 仓库改名 ai-session-hub → ai-ing-hub。
- README 改为双语 + 顶部徽章行，补齐 GitHub 常见板块（Features / Getting Started / Structure 等）。
- 下一步 / Next：应用内 i18n 切换；扩展更多 AI 源（Gemini / 本地 LLM 客户端）。
- 待解 / Open：精确聚焦已有标签页需 chrome.tabs 桥接（扩展 background 与中枢通信）。
- 已知 / Known：DOM 抓取选择器随站点更新；当前仅抓标题/URL/短预览。

## 2026-11-03
- **交互转向 / Pivot**：从「扩展自动轮询抓取」改为「浮点 dot + 拖拽收纳」为主交互。评估结论：手动拖（拖一次按 url 记住）信噪比更高、来源无关、更隐私，契合「本地优先、仅管元数据」的卖点；自动抓取仅作可选增强。
- 实现 / Build：扩展新增 `dot.css`（浮点 dot 视觉），重写 `content.js`——注入常驻浮点、可拖动 reposition、dragover/drop 收纳、注入时查 `/api/sessions` 标记「已收纳」（拖一次就记住）。manifest 增加 `dot.css` 与 Gemini 源。
- **捕获交互再修正 / Capture fix**：实测发现 ChatGPT/Claude 等网页会拦截「选中文字拖拽」，文字拖不到 dot。改为主交互「点击 dot 收纳当前对话」，选中文字拖拽降为附带增强。dot.css 光标/动效改为点击反馈。
- README：Huabu 从定位句抽出，移入 `Related Work` 留待作者自写占位；全文「拖拽收纳」措辞改为「点击/拖拽收纳」。
- 验证 / Verify：`node server.js` 起服务后，在 AI 对话页点击 dot → 图库应即时出现该对话卡片（SSE 推送）。
- 下一步 / Next：应用内 i18n 切换；评估「自动发现 + 手动确认」增强；离线文档脚手架（private）。
- **浮点双形态 / Dual-state dot**: 已收纳的 dot 缩小（34px，核心 13px）以区别于未收纳（56px）；提示文字切换为「已收纳 · 点击更新」。强化「收纳过 vs 未收纳」的视觉区分。
- **产品路线确认 / Product framing**: 当前网页版 = 最小可用性测试（MVP）；后续依次为 桌面端独立轻量软件（local-first）、网页+软件一起收纳、多 AI 一起收纳、看板视图迭代。README 已增 Roadmap 区块。
- **圆球 toggle / Toggle**: 用户反馈「再次点击应放大并移除看板卡片」。已修正 `content.js`：点击逻辑改为切换——已收纳时点击 → `DELETE /api/session?url=` 移除、圆球长回大球；未收纳时点击 → POST 收纳。提示文字改为「已收纳 · 再次点击移除」。
- **进展页 / Progress page**: 新增 `PROGRESS.md`（对外进展汇总，区别于逐日流水 DEVLOG），并在 README 顶部加链接。约定：代码改动累积到一定量时由维护者总结更新本页。
- **PROGRESS 改版 / Progress restyle**: 改为表格化、同一天合并一行、日期用品牌紫 emoji 圆点 + 加粗使其醒目（GitHub markdown 不支持自定义文字色，故用 emoji 实现彩色）。
- **定位升级 / Scope expansion**: 从「跨 AI 会话收纳」扩展为「通用未完成任务收件箱」——AI 对话与任意未完成网页（Overleaf / Sheets / 任意标签页）统一收纳；原网页保持打开，只留一条引用。定位由「AI 聚合器」转向「降低多任务并行的认知负担、对低精力人群友好」。
- **交互定案 / Interaction decision**: 主路径按「省力程度」排序定为 ① 快捷键 `Alt+Shift+S`（零视觉搜寻）→ ② 点击常驻浮点 → ③ 右键菜单；拖拽降级为增强路径（浏览器原生只能拖链接 / 选中文字，无法真正拖入一个网页）。浮点可拖动且位置被记住。
- **实现 / Build**: 扩展改为全站注入（`<all_urls>`）；新增 `background.js` 的快捷键、右键菜单（页面 / 链接 / 选中文字 / 显示隐藏浮点）、任务数徽章、`chrome.tabs` 聚焦桥接；`content.js` 重写为通用收纳 + 拖拽收纳 + 位置持久化 + 面板页桥接；`server.js` 支持 `type` / `key` / `source`，URL 去 hash 与噪声参数后作键。
- **面板升级 / Panel upgrade**: 卡片网格支持混合任务，按「AI 对话 / 网页任务 / 具体站点」筛选，卡片带类型标签，计数区分两类；点卡片经扩展桥接聚焦已开着的标签页，未打开时由扩展代为新开。
- **验证 / Verify**: 后端 curl 端到端通过（上报 / 列表 / SSE / 移除 / 类型字段 / 同文档多页签合并）；headless Chrome 截图复核面板渲染，并修掉两个真实 bug —— `.empty` 的 `display:flex` 压过 `[hidden]` 导致空状态常驻挤压图库、grid 行被压扁导致卡片裁切（改用 `grid-auto-rows: max-content`）。
- 下一步 / Next：低精力小样本评估（NASA-TLX 一类量表）；应用内 i18n 切换；桌面端 Tauri 封装。

## 2026-11-06
- 扩展支持更多 AI 源：新增 **Perplexity** 与 **WorkBuddy** 的网页版自动识别；DeepSeek 检测从 `chat.deepseek.com` 扩到 `deepseek.com`（覆盖主页与对话页）。同步更新 `server.js` 的 AI_NAMES、面板 `PROVIDER_COLOR` 品牌色、标题清洗正则（`cleanTitle`）。
- 面板新增「＋ 添加链接」手动收纳入口（网页版 + Tauri 桌面版通用），用于把原生桌面 App 里能拿到链接的对话收进 Hub；provider/type 由服务端新增的 `siteOf()` 按 URL 自动归类，消除手动添加时的分类歧义。
- 已知技术债 / Tech debt：站点识别逻辑目前仍分散在 `extension/content.js`、`extension/background.js`、`server.js` 三处，后续应抽成单一共享模块（扩展内可借 `providers.js` 被 content/background 共同引用）。
- 下一步 / Next：低精力小样本评估（NASA-TLX）；应用内 i18n；桌面端 Tauri 封装。
