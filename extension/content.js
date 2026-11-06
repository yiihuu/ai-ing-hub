// AI-ing Hub —— 捕获层（content script）
// 交互：任意网页都注入一个常驻浮点 dot。
//   形态：小圆球 = 已收纳；大圆球 = 未收纳 / 已移除。
//   点击 dot → 收纳「当前页面」；再次点击 → 移除收纳（图库卡片消失，圆球放大）。
//   拖拽链接到 dot → 收纳那个链接（源页面保持打开）。
//   拖动 dot 本身 → 挪位置（位置会被记住，下次还在原地）。
//   快捷键 Alt+Shift+S → 收纳当前标签页（无需找 dot）。
//   面板页面（127.0.0.1:54321）不显示 dot，只做「聚焦已有标签页」的桥接。
const HUB = 'http://127.0.0.1:54321';
const HUB_ORIGIN = 'http://127.0.0.1:54321';
const POLL_MS = 2000;

// —— 站点识别 ——
const AI_HOST = [
  [/chatgpt\.com/i, 'ChatGPT'],
  [/claude\.ai/i, 'Claude'],
  [/gemini/i, 'Gemini'],
  [/deepseek\.com/i, 'DeepSeek'],
  [/chat\.mistral\.ai/i, 'Mistral'],
  [/perplexity\.ai/i, 'Perplexity'],
  [/workbuddy\.ai/i, 'WorkBuddy']
];
const KNOWN_HOST = {
  'docs.google.com': 'Google Docs',
  'drive.google.com': 'Google Drive',
  'mail.google.com': 'Gmail',
  'calendar.google.com': 'Google Calendar',
  'scholar.google.com': 'Google Scholar',
  'overleaf.com': 'Overleaf',
  'notion.so': 'Notion',
  'figma.com': 'Figma',
  'github.com': 'GitHub',
  'arxiv.org': 'arXiv',
  'google.com': 'Google'
};
function siteOf(url, hostname, pathname) {
  const h = hostname || (() => { try { return new URL(url).hostname; } catch (_) { return ''; } })();
  const p = pathname || (() => { try { return new URL(url).pathname; } catch (_) { return ''; } })();
  for (const [re, name] of AI_HOST) if (re.test(h)) return { provider: name, type: 'ai' };
  let bare = h.replace(/^www\./, '');
  if (bare === 'docs.google.com') {
    if (p.includes('/spreadsheets/')) return { provider: 'Google Sheets', type: 'web' };
    if (p.includes('/presentation/')) return { provider: 'Google Slides', type: 'web' };
  }
  if (KNOWN_HOST[bare]) return { provider: KNOWN_HOST[bare], type: 'web' };
  const label = bare.split('.').length > 2 ? bare.split('.').slice(-2).join('.') : bare;
  return { provider: label.charAt(0).toUpperCase() + label.slice(1), type: 'web' };
}
function currentSite() { return siteOf(location.href, location.hostname, location.pathname); }
function faviconFor(url) {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`; }
  catch (_) { return ''; }
}
function cleanTitle() {
  const t = (document.title || '').trim();
  if (t) return t.replace(/\s*[-–—]\s*(ChatGPT|Claude|Gemini|DeepSeek|Mistral|Perplexity|WorkBuddy)\s*$/i, '').trim() || t;
  return currentSite().provider;
}

// —— 规范化键（与 server.js 保持一致）——
const NOISE_PARAM = /^(utm_|fbclid$|gclid$|dclid$|ref$|referrer$|source$|usp$|spm$|mc_cid$|mc_eid$|igshid$|_hsenc$|_hsmi$|si$)/i;
function normKey(raw) {
  if (!raw) return '';
  try {
    const u = new URL(raw);
    u.hash = '';
    [...u.searchParams.keys()].forEach(k => { if (NOISE_PARAM.test(k)) u.searchParams.delete(k); });
    let s = u.toString();
    if (u.pathname !== '/' && s.endsWith('/')) s = s.slice(0, -1);
    return s;
  } catch (_) { return String(raw).split('#')[0]; }
}

let dotEl = null;
let saved = false;
let offline = false;

// —— 浮点状态 ——
function setSaved(on) {
  saved = on;
  if (!dotEl) return;
  dotEl.classList.toggle('is-saved', on);
  const site = currentSite();
  const hint = dotEl.querySelector('.ai-ing-dot__hint');
  const text = on ? '已收纳 · 再次点击移除' : `点击收纳 · ${site.provider}`;
  dotEl.title = text;
  if (hint) hint.textContent = text;
}
function setOffline(on) {
  offline = on;
  if (dotEl) dotEl.classList.toggle('is-offline', on);
}

// —— 浮点构建 ——
function buildDot() {
  const dot = document.createElement('div');
  dot.id = 'ai-ing-dot';
  dot.className = 'ai-ing-dot';
  dot.innerHTML =
    '<span class="ai-ing-dot__hint">点击收纳</span>' +
    '<span class="ai-ing-dot__core"></span>';
  document.body.appendChild(dot);
  dotEl = dot;

  // 恢复上次位置（固定位置 = 启动门槛更低）
  try {
    chrome.storage.local.get({ dotPos: null }, ({ dotPos }) => {
      if (!dotPos || !dotEl) return;
      dot.style.right = 'auto';
      dot.style.bottom = 'auto';
      dot.style.left = dotPos.x + 'px';
      dot.style.top = dotPos.y + 'px';
    });
  } catch (_) {}

  // 拖动 dot 自身 = reposition；未移动则视为「点击 = 收纳」
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
    const x = Math.max(8, Math.min(innerWidth - 64, drag.l + e.clientX - drag.x));
    const y = Math.max(8, Math.min(innerHeight - 64, drag.t + e.clientY - drag.y));
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
  });
  const endDrag = e => {
    const wasClick = drag && !moved;
    drag = null;
    try { dot.releasePointerCapture(e.pointerId); } catch (_) {}
    if (wasClick) {
      if (saved) removeCapture();
      else captureCurrent('', 'click');
    } else if (moved) {
      try {
        chrome.storage.local.set({ dotPos: { x: parseInt(dot.style.left, 10) || 24, y: parseInt(dot.style.top, 10) || 24 } });
      } catch (_) {}
    }
  };
  dot.addEventListener('pointerup', endDrag);
  dot.addEventListener('pointercancel', endDrag);

  // 拖拽收纳（增强路径）：把链接 / 选中文字拖到 dot 上
  dot.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    dot.classList.add('is-target');
  });
  dot.addEventListener('dragleave', () => dot.classList.remove('is-target'));
  dot.addEventListener('drop', e => {
    e.preventDefault();
    dot.classList.remove('is-target');
    handleDrop(e);
  });

  setSaved(saved);
  return dot;
}

function handleDrop(e) {
  const uri = (e.dataTransfer.getData('text/uri-list') || '').trim().split('\n')[0].trim();
  const plain = (e.dataTransfer.getData('text/plain') || '').trim();
  const html = (e.dataTransfer.getData('text/html') || '').trim();
  const hrefM = html.match(/href\s*=\s*["']([^"']+)["']/i);
  const titleM = html.match(/>([^<>]{1,120})</);
  const linkTitle = titleM ? titleM[1].trim() : '';

  let url = uri;
  if (!url && /^https?:\/\//i.test(plain)) url = plain.split(/\s+/)[0];
  if (!url && hrefM) url = hrefM[1];

  if (url) {
    const site = siteOf(url);
    postTask({
      provider: site.provider,
      type: site.type,
      title: linkTitle || cleanTitle() || site.provider,
      url,
      favicon: faviconFor(url),
      preview: '',
      source: 'drag'
    }, true);
  } else if (plain) {
    captureCurrent(plain.slice(0, 160), 'drag');
  }
}

// —— 与中枢通信 ——
function postTask(task, pulseDot) {
  return fetch(`${HUB}/api/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  }).then(res => {
    if (pulseDot) pulse();
    setOffline(false);
    return res.ok;
  }).catch(() => { setOffline(true); return false; });
}
function pulse() {
  const dot = document.getElementById('ai-ing-dot');
  if (!dot) return;
  dot.classList.remove('pulse');
  void dot.offsetWidth;
  dot.classList.add('pulse');
}

function captureCurrent(preview, source) {
  const site = currentSite();
  return postTask({
    provider: site.provider,
    type: site.type,
    title: cleanTitle(),
    url: location.href,
    favicon: faviconFor(location.href),
    preview: preview || '',
    source: source || 'click'
  }, true);
}

function removeCapture() {
  const url = location.href;
  return fetch(`${HUB}/api/session?url=${encodeURIComponent(url)}`, { method: 'DELETE' })
    .then(() => { setSaved(false); pulse(); })
    .catch(() => { setOffline(true); });
}

// —— 状态同步 ——
function syncSaved() {
  const key = normKey(location.href);
  return fetch(`${HUB}/api/sessions`)
    .then(r => r.json())
    .then(list => {
      setOffline(false);
      const hit = Array.isArray(list) && list.some(s => (s.key || normKey(s.url)) === key);
      if (hit !== saved) setSaved(hit);
    })
    .catch(() => setOffline(true));
}

function ensureDot() {
  if (!document.body) return;
  chrome.storage.local.get({ dotEnabled: true }, ({ dotEnabled }) => {
    const existing = document.getElementById('ai-ing-dot');
    if (!dotEnabled) { if (existing) existing.remove(); dotEl = null; return; }
    if (!existing) { buildDot(); syncSaved(); }
    else dotEl = existing;
  });
}

// —— 面板页桥接：点卡片时聚焦已有标签页 ——
function installHubBridge() {
  window.addEventListener('message', e => {
    const d = e.data;
    if (!d) return;
    if (d.type === 'ai-ing:probe') {
      window.postMessage({ type: 'ai-ing:probe-result' }, '*');
      return;
    }
    if (d.type !== 'ai-ing:focus') return;
    try {
      chrome.runtime.sendMessage({ type: 'focus-url', url: d.url }, res => {
        window.postMessage({ type: 'ai-ing:focus-result', reqId: d.reqId, ok: !!(res && res.ok) }, '*');
      });
    } catch (_) {
      window.postMessage({ type: 'ai-ing:focus-result', reqId: d.reqId, ok: false }, '*');
    }
  });
  // 告诉面板：桥接可用（于是「跳回」= 聚焦已有标签页，而不是新开标签）
  window.postMessage({ type: 'ai-ing:bridge-ready' }, '*');
}

// —— 启动 ——
const ON_HUB = location.origin === HUB_ORIGIN ||
  (location.hostname === '127.0.0.1' && location.port === '54321') ||
  (location.hostname === 'localhost' && location.port === '54321');

if (ON_HUB) {
  installHubBridge();
} else {
  ensureDot();
  syncSaved();
  setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    ensureDot();
    syncSaved();
  }, POLL_MS);

  chrome.runtime.onMessage.addListener(msg => {
    if (!msg) return;
    if (msg.type === 'ai-ing:refresh') { ensureDot(); syncSaved(); }
  });

  // SPA 重渲染冲掉 dot → 立即重建
  let moThrottle = false;
  const mo = new MutationObserver(() => {
    if (moThrottle) return;
    moThrottle = true;
    setTimeout(() => {
      moThrottle = false;
      if (!document.getElementById('ai-ing-dot')) {
        ensureDot();
        syncSaved();
      }
    }, 200);
  });
  const startObserver = () => {
    if (!document.body) { setTimeout(startObserver, 300); return; }
    mo.observe(document.body, { childList: true });
  };
  startObserver();
}
