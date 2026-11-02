# 开发日志 · Devlog

> 公开的工作记录，用于自我督促与进度追踪。深层研究思路见私有笔记（不在此公开仓库）。
> Public working log for self-accountability and progress tracking. Deep research thinking lives in private notes (not in this public repo).

## 2026-11-02
- 完成最小可跑原型：Node 中枢 + 卡片网格前端 + MV3 浏览器捕获扩展；curl 端到端验证通过。
- 仓库改名 ai-session-hub → ai-ing-hub。
- README 改为双语 + 顶部徽章行，补齐 GitHub 常见板块（Features / Getting Started / Structure 等）。
- 下一步 / Next：应用内 i18n 切换；整理材料；扩展更多 AI 源（Gemini / 本地 LLM 客户端）。
- 待解 / Open：精确聚焦已有标签页需 chrome.tabs 桥接（扩展 background 与中枢通信）。
- 已知 / Known：DOM 抓取选择器随站点更新；当前仅抓标题/URL/短预览。

## 2026-11-03
- **交互转向 / Pivot**：从「扩展自动轮询抓取」改为「浮点 dot + 拖拽收纳」为主交互。评估结论：手动拖（拖一次按 url 记住）信噪比更高、来源无关、更隐私，契合「本地优先、仅管元数据」的卖点；自动抓取仅作可选增强。
- 实现 / Build：扩展新增 `dot.css`（浮点 dot 视觉），重写 `content.js`——注入常驻浮点、可拖动 reposition、dragover/drop 收纳、注入时查 `/api/sessions` 标记「已收纳」（拖一次就记住）。manifest 增加 `dot.css` 与 Gemini 源。
- **捕获交互再修正 / Capture fix**：实测发现 ChatGPT/Claude 等网页会拦截「选中文字拖拽」，文字拖不到 dot。改为主交互「点击 dot 收纳当前对话」，选中文字拖拽降为附带增强。dot.css 光标/动效改为点击反馈。
- README：Huabu 从定位句抽出，移入 `Related Work` 留待作者自写占位；全文「拖拽收纳」措辞改为「点击/拖拽收纳」。
- 验证 / Verify：`node server.js` 起服务后，在 AI 对话页点击 dot → 图库应即时出现该对话卡片（SSE 推送）。
- 下一步 / Next：应用内 i18n 切换；评估「自动发现 + 手动确认」增强；文档脚手架（private）。
- **浮点双形态 / Dual-state dot**: 已收纳的 dot 缩小（34px，核心 13px）以区别于未收纳（56px）；提示文字切换为「已收纳 · 点击更新」。强化「收纳过 vs 未收纳」的视觉区分。
- **产品路线确认 / Product framing**: 当前网页版 = 最小可用性测试（MVP）；后续依次为 桌面端独立轻量软件（local-first）、网页+软件一起收纳、多 AI 一起收纳、看板视图迭代。README 已增 Roadmap 区块。
- **圆球 toggle / Toggle**: 用户反馈「再次点击应放大并移除看板卡片」。已修正 `content.js`：点击逻辑改为切换——已收纳时点击 → `DELETE /api/session?url=` 移除、圆球长回大球；未收纳时点击 → POST 收纳。提示文字改为「已收纳 · 再次点击移除」。
- **进展页 / Progress page**: 新增 `PROGRESS.md`（对外进展汇总，区别于逐日流水 DEVLOG），并在 README 顶部加链接。约定：代码改动累积到一定量时由维护者总结更新本页。
- **PROGRESS 改版 / Progress restyle**: 改为表格化、同一天合并一行、日期用品牌紫 emoji 圆点 + 加粗使其醒目（GitHub markdown 不支持自定义文字色，故用 emoji 实现彩色）。
