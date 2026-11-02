# 项目进展 · Progress

> 面向外部的进展汇总；逐日流水见 [DEVLOG.md](./DEVLOG.md)。
> External-facing progress summary; day-by-day log in [DEVLOG.md](./DEVLOG.md).

**当前状态 · Status**：网页版 MVP 已可端到端运行（扩展 + 本地中枢 + 卡片网格）。Web MVP runs end-to-end.

## 里程碑 · Milestones

<table>
  <thead>
    <tr><th>日期 · Date</th><th>改动 · Change</th></tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2" style="color:#d6336c;font-weight:700;vertical-align:top;white-space:nowrap;background:#fff0f6;border-radius:6px;padding:6px 10px"><b>2026-11-03</b></td>
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

## 下一步 · Next

- 应用内中英文切换（i18n）。
- 「精确聚焦已有标签」：点卡片直接切回已开标签页（`chrome.tabs`）。
- 桌面端轻量软件（Tauri 封装，local-first）。
- 更多 AI 源 + 看板视图迭代。

## 更新约定 · Convention

代码改动累积到一定量时，由维护者总结后更新本页。 Refreshed by maintainer after changes accumulate.
