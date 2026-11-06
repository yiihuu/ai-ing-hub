# 项目进展 · Progress

> 面向外部的进展汇总；逐日流水见 [DEVLOG.md](./DEVLOG.md)。
> External-facing progress summary; day-by-day log in [DEVLOG.md](./DEVLOG.md).

**当前状态 · Status**：网页版 MVP 已可端到端运行（扩展 + 本地中枢 + 卡片网格）；v0.2.0 起支持「AI 对话 + 任意网页」的通用收纳。 Web MVP runs end-to-end; v0.2.0 adds universal capture for AI chats and arbitrary web pages.

## 里程碑 · Milestones

<table>
  <thead>
    <tr><th>日期 · Date</th><th>改动 · Change</th></tr>
  </thead>
  <tbody>
    <tr>
      <td style="color:#1971c2;font-weight:700;vertical-align:top;white-space:nowrap;background:#e7f5ff;border-radius:6px;padding:6px 10px"><b>2026-11-06</b></td>
      <td>扩展更多 AI 源：新增 <b>Perplexity</b> 与 <b>WorkBuddy</b> 网页版自动识别（DeepSeek 主页域名一并覆盖）；面板新增「＋ 添加链接」手动收纳入口，用于把原生桌面 App 的对话链接收进 Hub，provider 由服务端按 URL 自动归类。 Added Perplexity &amp; WorkBuddy detection; added a manual "Add link" entry for desktop-app conversations.</td>
    </tr>

    <tr>
      <td rowspan="9" style="color:#d6336c;font-weight:700;vertical-align:top;white-space:nowrap;background:#fff0f6;border-radius:6px;padding:6px 10px"><b>2026-11-03</b></td>
      <td>定位扩展：从「跨 AI 会话收纳」升级为「通用未完成任务收件箱」——AI 对话与任意未完成网页（Overleaf / Sheets 等）统一收纳。 Scope expanded from cross-AI chat capture to a universal inbox of unfinished tasks (AI chats + any web page).</td>
    </tr>
    <tr>
      <td>浮点改为全站注入：任意网页都能收纳，不再限 AI 域名。 Floating dot now injected on every site, not only AI domains.</td>
    </tr>
    <tr>
      <td>新增全局快捷键 <code>Alt+Shift+S</code> 收纳当前标签页（零视觉搜寻），以及右键菜单（页面 / 链接 / 选中文字 / 显示隐藏浮点）。 Added a global hotkey plus right-click menu for page / link / selection capture.</td>
    </tr>
    <tr>
      <td>浮点可拖动且位置被记住；把页面上的链接拖到浮点上即可收纳该链接。 Draggable dot with a remembered position; dropping a link on it files that link.</td>
    </tr>
    <tr>
      <td>面板支持混合任务：按「AI 对话 / 网页任务 / 具体站点」筛选，卡片带类型标签，计数区分两类。 The panel now mixes AI chats and web tasks, filterable by type and site.</td>
    </tr>
    <tr>
      <td>「跳回」升级为聚焦已开着的标签页（<code>chrome.tabs</code> 桥接），未打开时由扩展代为新开。 Jump-back now focuses the already-open tab instead of opening duplicates.</td>
    </tr>
    <tr>
      <td>后端支持 <code>type</code> / <code>key</code> / <code>source</code> 字段；URL 去 hash 与噪声参数后作键，同一文档只留一条卡片但记住最后停留的页签位置。 Backend keys tasks by a hash-stripped URL so one document yields one card while preserving the last tab.</td>
    </tr>
    <tr>
      <td>圆球点击切换（toggle）：已收纳时点一下即移除看板卡片、圆球放大。 Click toggles capture/remove.</td>
    </tr>
    <tr>
      <td>新增 PROGRESS.md 进展页，并在 README 顶部链接。 Added progress page + README link.</td>
    </tr>

    <tr>
      <td rowspan="5" style="color:#d6336c;font-weight:700;vertical-align:top;white-space:nowrap;background:#fff0f6;border-radius:6px;padding:6px 10px"><b>2026-11-02</b></td>
      <td>浮点 dot 双形态：小圆球=已收纳，大圆球=未收纳/已移除。 Dual-state dot (small=saved, large=unsaved).</td>
    </tr>
    <tr>
      <td>修复 dot 在 SPA 重渲染 / 切换对话时消失（始终保活 + 状态实时同步）。 Fixed dot disappearing; now always-alive.</td>
    </tr>
    <tr>
      <td>图库空状态自解释：内置「看示例」「怎么装小圆点」引导。 Empty gallery shows self-explanatory guides.</td>
    </tr>
    <tr>
      <td>捕获交互从「自动轮询」转向「浮点 dot 手动收纳」。 Pivot: auto-poll → manual dot capture.</td>
    </tr>
    <tr>
      <td>README 双语 + 徽章行 + 标准板块；Huabu 移入 Related Work 占位。 Bilingual README; Huabu → related-work placeholder.</td>
    </tr>

    <tr>
      <td style="color:#d6336c;font-weight:700;vertical-align:top;white-space:nowrap;background:#fff0f6;border-radius:6px;padding:6px 10px"><b>2026-11-01</b></td>
      <td>网页版 MVP 跑通：Node 中枢 + 卡片网格前端 + MV3 捕获扩展，curl 端到端验证。 Web MVP working, verified via curl.</td>
    </tr>
  </tbody>
</table>

## 已验证 · Verified

- 本地中枢 API：上报 / 列表 / SSE 实时推送 / 移除，全部通过。
- 浮点 dot：始终存在、大小随收纳状态变化、点击可切换收纳与移除。
- 混合任务：AI 对话与网页任务共存；同一文档的多个页签合并为一条卡片并保留原页签位置；`type` / `key` / `source` 字段读写正确。
- Mixed-task pipeline: AI chats and web pages coexist; multiple tabs of one document collapse into a single card that still restores the exact tab.

## 下一步 · Next

- 低精力小样本评估：用 NASA-TLX 一类量表测「收纳一次」的心智成本。
- 应用内中英文切换（i18n）。
- 桌面端轻量软件（Tauri 封装，local-first）。
- 更多 AI 源 + 看板视图迭代。

## 更新约定 · Convention

代码改动累积到一定量时，由维护者总结后更新本页。 Refreshed by maintainer after changes accumulate.
