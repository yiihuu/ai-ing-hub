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
- 验证 / Verify：需 `node server.js` 起服务后，在 ChatGPT/Claude/Gemini 页面实测「选中文字拖到 dot → 图库出现卡片」。
- 下一步 / Next：应用内 i18n 切换；评估「自动发现 + 手动确认」增强；文档脚手架（private）。
