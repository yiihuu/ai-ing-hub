// AI 会话中枢 —— 捕获层（content script）
// 交互：在 AI 对话页注入一个常驻浮点 dot。
//   主交互：点击 dot → 收纳「当前对话」（最稳，不依赖选中文字拖拽）。
//   附带：选中对话文字拖到 dot 上 → 带预览收纳。
// 设计主张：手动「点/拖一次」即记住该任务（按 url 持久化），无需反复操作。
const HUB = 'http://127.0.0.1:54321';

function providerOf() {
  const h = location.hostname;
  if (h.includes('chatgpt.com')) return 'ChatGPT';
  if (h.includes('claude.ai')) return 'Claude';
  if (h.includes('gemini')) return 'Gemini';
  return 'AI';
}
function cleanTitle() {
  return (document.title || providerOf()).replace(/[-–—]\s*(ChatGPT|Claude|Gemini).*$/i, '').trim() || providerOf();
}

function ensureDot() {
  if (document.getElementById('ai-ing-dot')) return;
  const dot = document.createElement('div');
  dot.id = 'ai-ing-dot';
  dot.className = 'ai-ing-dot';
  dot.title = '点击收纳当前对话（或选中文字拖到这里）';
  dot.innerHTML =
    '<span class="ai-ing-dot__hint">点击收纳当前对话</span>' +
    '<span class="ai-ing-dot__core"></span>';
  document.body.appendChild(dot);

  // 拖动 dot 自身以 reposition（pointer 事件）；未移动则视为「点击 = 收纳」
  let drag = null, moved = false;
  dot.addEventListener('pointerdown', e => {
    if (e.target.closest('.ai-ing-dot__hint')) return;
    const rect = dot.getBoundingClientRect();
    drag = { x: e.clientX, y: e.clientY, l: rect.left, t: rect.top };
    moved = false;
    dot.style.right = 'auto';
    dot.style.bottom = 'auto';
    dot.setPointerCapture(e.pointerId);
  });
  dot.addEventListener('pointermove', e => {
    if (!drag) return;
    moved = true;
    dot.style.left = Math.max(8, Math.min(innerWidth - 64, drag.l + e.clientX - drag.x)) + 'px';
    dot.style.top  = Math.max(8, Math.min(innerHeight - 64, drag.t + e.clientY - drag.y)) + 'px';
  });
  dot.addEventListener('pointerup', e => {
    const wasClick = drag && !moved;     // 没拖动 = 点击 → 收纳当前对话
    drag = null;
    try { dot.releasePointerCapture(e.pointerId); } catch (_) {}
    if (wasClick) capture('');
  });

  // 拖拽收纳（附带增强）：把选中的对话文字拖到 dot 上
  dot.addEventListener('dragover', e => { e.preventDefault(); dot.classList.add('is-target'); });
  dot.addEventListener('dragleave', () => dot.classList.remove('is-target'));
  dot.addEventListener('drop', e => {
    e.preventDefault();
    dot.classList.remove('is-target');
    const text = (e.dataTransfer.getData('text/plain') ||
                  e.dataTransfer.getData('text/uri-list') || '').trim();
    capture(text);
  });

  // 已收纳则标记（点/拖一次就记住）
  fetch(`${HUB}/api/sessions`).then(r => r.json()).then(list => {
    if (Array.isArray(list) && list.some(s => s.url === location.href.split('?')[0])) {
      dot.classList.add('is-saved');
      dot.title = '已收纳 · 再点一下可更新预览';
      const h = dot.querySelector('.ai-ing-dot__hint'); if (h) h.textContent = '已收纳 · 点击更新';
    }
  }).catch(() => {});
}

function capture(preview) {
  const dot = document.getElementById('ai-ing-dot');
  if (!dot) return;
  const url = location.href.split('?')[0];
  const data = {
    provider: providerOf(),
    title: cleanTitle(),
    url,
    favicon: `https://www.google.com/s2/favicons?domain=${location.hostname}&sz=64`,
    preview: preview.slice(0, 160),
    ts: Date.now()
  };
  fetch(`${HUB}/api/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(() => {
    dot.classList.add('is-saved');
    dot.classList.remove('pulse');
    void dot.offsetWidth;            // 重启动画
    dot.classList.add('pulse');
    dot.title = '已收纳 · 再点一下可更新预览';
    const h = dot.querySelector('.ai-ing-dot__hint'); if (h) h.textContent = '已收纳 · 点击更新';
  }).catch(() => {});
}

// SPA 软导航后补注（部分 AI 站点是客户端路由）
let lastHref = location.href;
ensureDot();
setInterval(() => {
  if (location.href !== lastHref) { lastHref = location.href; ensureDot(); }
}, 1500);
