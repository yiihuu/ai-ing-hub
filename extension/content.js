// AI 会话中枢 —— 捕获层（content script）
// 交互：在 AI 对话页注入一个常驻浮点 dot，每个页面始终存在。
//   形态：小圆球 = 已收纳；大圆球 = 未收纳 / 已移除收纳。
//   主交互：点击 dot → 收纳「当前对话」；再次点击 → 移除收纳（看板卡片消失，圆球放大）。
//   附带：选中对话文字拖到 dot 上 → 带预览收纳。
//   收纳状态按 url 持久化；图库里移除卡片时，圆球也会自动长回大球。
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

let dotEl = null;

function markSaved() {
  if (!dotEl) return;
  dotEl.classList.add('is-saved');
  dotEl.title = '已收纳 · 再次点击移除';
  const h = dotEl.querySelector('.ai-ing-dot__hint');
  if (h) h.textContent = '已收纳 · 再次点击移除';
}
function markUnsaved() {
  if (!dotEl) return;
  dotEl.classList.remove('is-saved');
  dotEl.title = '点击收纳当前对话（或选中文字拖到这里）';
  const h = dotEl.querySelector('.ai-ing-dot__hint');
  if (h) h.textContent = '点击收纳当前对话';
}

function buildDot() {
  const dot = document.createElement('div');
  dot.id = 'ai-ing-dot';
  dot.className = 'ai-ing-dot';
  dot.title = '点击收纳当前对话（或选中文字拖到这里）';
  dot.innerHTML =
    '<span class="ai-ing-dot__hint">点击收纳当前对话</span>' +
    '<span class="ai-ing-dot__core"></span>';
  document.body.appendChild(dot);
  dotEl = dot;

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
    const wasClick = drag && !moved;     // 没拖动 = 点击
    drag = null;
    try { dot.releasePointerCapture(e.pointerId); } catch (_) {}
    if (wasClick) {
      // 切换：已收纳 → 移除；未收纳 → 收纳
      if (dot.classList.contains('is-saved')) removeCapture();
      else capture('');
    }
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
  return dot;
}

function ensureDot() {
  if (!document.body) return;
  if (!document.getElementById('ai-ing-dot')) buildDot();
}

function syncSaved() {
  const dot = document.getElementById('ai-ing-dot');
  if (!dot) return;
  const url = location.href.split('?')[0];
  fetch(`${HUB}/api/sessions`).then(r => r.json()).then(list => {
    if (Array.isArray(list) && list.some(s => s.url === url)) markSaved();
    else markUnsaved();   // 未收纳，或已在图库移除 → 一律显示大圆球
  }).catch(() => {});
}

function capture(preview) {
  const dot = document.getElementById('ai-ing-dot') || dotEl;
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
    markSaved();
    dot.classList.remove('pulse');
    void dot.offsetWidth;            // 重启动画
    dot.classList.add('pulse');
  }).catch(() => {});
}

// 切换收纳的反向操作：从枢纽移除当前对话（看板卡片随之消失），圆球长回大球
function removeCapture() {
  const dot = document.getElementById('ai-ing-dot') || dotEl;
  if (!dot) return;
  const url = location.href.split('?')[0];
  fetch(`${HUB}/api/session?url=${encodeURIComponent(url)}`, { method: 'DELETE' })
    .then(() => {
      markUnsaved();
      dot.classList.remove('pulse');
      void dot.offsetWidth;            // 重启动画
      dot.classList.add('pulse');
    })
    .catch(() => {});
}

// —— 启动 ——
ensureDot();
syncSaved();

// 周期性保证 dot 存在 + 同步收纳状态
// 应对：SPA 重渲染冲掉 dot、切换对话、图库里移除卡片（圆球应长回大球）
setInterval(() => {
  ensureDot();
  syncSaved();
}, 1200);

// 监听 dot 被页面重渲染移除 → 立即重建（不等待轮询），并恢复正确形态
let moThrottle = false;
function startObserver() {
  if (!document.body) { setTimeout(startObserver, 300); return; }
  const mo = new MutationObserver(() => {
    if (moThrottle) return;
    moThrottle = true;
    setTimeout(() => {
      moThrottle = false;
      if (!document.getElementById('ai-ing-dot')) {
        buildDot();
        syncSaved();
      }
    }, 200);
  });
  mo.observe(document.body, { childList: true });
}
startObserver();
