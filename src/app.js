// AI-ing Hub 面板前端：SSE 实时同步 + 卡片网格 + 混合任务（AI 对话 / 网页）
const PROVIDER_COLOR = {
  ChatGPT: '#10a37f', Claude: '#d97757', Gemini: '#4285f4',
  DeepSeek: '#4d6bfe', Mistral: '#f97316'
};
const DEFAULT_COLOR = '#6b7280';
const AI_NAMES = ['ChatGPT', 'Claude', 'Gemini', 'DeepSeek', 'Mistral'];

const gallery = document.getElementById('gallery');
const filtersEl = document.getElementById('filters');
const emptyEl = document.getElementById('empty');
const countEl = document.getElementById('count');
const searchEl = document.getElementById('search');

let sessions = [];           // 最新全量列表
const cardEls = new Map();   // key -> 卡片元素
let activeFilter = 'all';
let bridgeReady = false;     // 扩展桥接是否可用（可用则「跳回」= 聚焦已有标签页）

// 由字符串生成稳定色调，做封面渐变
function hueOf(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
}
function typeOf(s) {
  if (s.type === 'ai' || s.type === 'web') return s.type;
  return AI_NAMES.includes(s.provider) ? 'ai' : 'web';
}
function keyOf(s) { return s.key || s.url; }

function timeLabel(ts) {
  if (!ts) return '';
  const d = (Date.now() - ts) / 1000;
  if (d < 60) return '刚刚加入';
  if (d < 3600) return `${Math.floor(d / 60)} 分钟前加入`;
  if (d < 86400) return `${Math.floor(d / 3600)} 小时前加入`;
  return new Date(ts).toLocaleDateString('zh-CN');
}

function escapeHtml(t) {
  return (t || '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function createCard(s) {
  const hue = hueOf(s.url);
  const isAI = typeOf(s) === 'ai';
  const badge = badgeStyle(s, hue);
  const el = document.createElement('article');
  el.className = 'card enter';
  el.dataset.key = keyOf(s);
  el._session = s;
  el.innerHTML = `
    <div class="cover" style="background:linear-gradient(135deg, hsl(${hue} 78% 95%), hsl(${(hue + 38) % 360} 72% 86%))">
      <span class="cover-glyph">${escapeHtml((s.provider || '?').charAt(0))}</span>
      <span class="badge" style="color:${badge.color};background:${badge.bg}">${escapeHtml(s.provider || '未知')}</span>
      <button class="remove" title="从面板移除">×</button>
    </div>
    <div class="meta">
      <div class="title">${escapeHtml(s.title || s.provider || '未命名任务')}</div>
      <div class="preview">${escapeHtml(s.preview || '')}</div>
      <div class="foot">
        <span class="kind ${isAI ? 'ai' : 'web'}">${isAI ? 'AI 对话' : '网页任务'}</span>
        <span class="time">${timeLabel(s.firstSeen)}</span>
      </div>
    </div>`;
  el.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove')) return;
    openSession(s.url);
  });
  el.querySelector('.remove').addEventListener('click', (e) => {
    e.stopPropagation();
    removeSession(s.url);
  });
  return el;
}

function updateCard(el, s) {
  el._session = s;
  el.querySelector('.title').textContent = s.title || s.provider || '未命名任务';
  el.querySelector('.preview').textContent = s.preview || '';
  el.querySelector('.time').textContent = timeLabel(s.firstSeen);
}

function hexA(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
// AI 站点用品牌色，网页任务用按 URL 生成的色相，便于一眼区分两类
function badgeStyle(s, hue) {
  if (typeOf(s) === 'ai') {
    const c = PROVIDER_COLOR[s.provider] || DEFAULT_COLOR;
    return { color: c, bg: hexA(c, .14) };
  }
  return { color: `hsl(${hue} 55% 34%)`, bg: `hsl(${hue} 72% 94%)` };
}

// —— 跳回：优先聚焦已有标签页（经扩展桥接），否则新开 ——
function openSession(url) {
  if (!bridgeReady) { window.open(url, '_blank'); return; }
  const reqId = 'r-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  let answered = false;
  const onMsg = (e) => {
    const d = e.data;
    if (!d || d.type !== 'ai-ing:focus-result' || d.reqId !== reqId) return;
    answered = true;
    window.removeEventListener('message', onMsg);
  };
  window.addEventListener('message', onMsg);
  window.postMessage({ type: 'ai-ing:focus', url, reqId }, '*');
  setTimeout(() => {
    window.removeEventListener('message', onMsg);
    if (!answered) window.open(url, '_blank');
  }, 400);
}

function removeSession(url) {
  fetch(`/api/session?url=${encodeURIComponent(url)}`, { method: 'DELETE' }).catch(() => {});
}

// 扩展桥接就绪信号
window.addEventListener('message', (e) => {
  const d = e.data;
  if (!d) return;
  if (d.type === 'ai-ing:bridge-ready') bridgeReady = true;
  if (d.type === 'ai-ing:probe-result') bridgeReady = true;
});
// 面板加载后主动探测一次桥接（覆盖「面板先开、扩展后装」的顺序）
window.postMessage({ type: 'ai-ing:probe' }, '*');

// 同步全量列表：新增/更新/移除卡片
function syncSessions(list) {
  const seen = new Set();
  list.forEach(s => {
    const k = keyOf(s);
    seen.add(k);
    let el = cardEls.get(k);
    if (!el) {
      el = createCard(s);
      cardEls.set(k, el);
      gallery.appendChild(el);
      setTimeout(() => el.classList.remove('enter'), 400);
    } else {
      updateCard(el, s);
    }
  });
  for (const [k, el] of cardEls) {
    if (!seen.has(k)) {
      el.classList.add('leave');
      setTimeout(() => { el.remove(); }, 220);
      cardEls.delete(k);
    }
  }
  sessions = list;
  renderFilters();
  applyView();
}

// 筛选 chips：先按类型（全部 / AI 对话 / 网页任务），再按具体站点
function renderFilters() {
  const providers = [...new Set(sessions.map(s => s.provider).filter(Boolean))].sort();
  const wanted = ['all', 'ai', 'web', ...providers.map(p => 'p:' + p)];
  const existing = [...filtersEl.children].map(c => c.dataset.f);
  if (existing.join() === wanted.join()) return;
  filtersEl.innerHTML = '';
  wanted.forEach(key => {
    const label = key === 'all' ? '全部' : key === 'ai' ? 'AI 对话' : key === 'web' ? '网页任务' : key.slice(2);
    const chip = document.createElement('button');
    chip.className = 'chip' + (key === activeFilter ? ' active' : '');
    chip.dataset.f = key;
    chip.textContent = label;
    chip.addEventListener('click', () => {
      activeFilter = key;
      [...filtersEl.children].forEach(c => c.classList.toggle('active', c.dataset.f === key));
      applyView();
    });
    filtersEl.appendChild(chip);
  });
}

function matchFilter(s) {
  if (activeFilter === 'all') return true;
  if (activeFilter === 'ai') return typeOf(s) === 'ai';
  if (activeFilter === 'web') return typeOf(s) === 'web';
  return s.provider === activeFilter.slice(2);
}

function applyView() {
  const q = searchEl.value.trim().toLowerCase();
  let visible = 0;
  for (const [, el] of cardEls) {
    const s = el._session;
    const show = matchFilter(s) && (!q || `${s.title} ${s.provider} ${s.preview || ''}`.toLowerCase().includes(q));
    el.classList.toggle('hidden', !show);
    if (show) visible++;
  }
  emptyEl.hidden = visible !== 0;
  gallery.style.display = visible === 0 ? 'none' : 'grid';
  const ai = sessions.filter(s => typeOf(s) === 'ai').length;
  const web = sessions.length - ai;
  countEl.textContent = `${sessions.length} 个未完成 · ${ai} AI · ${web} 网页`;
}

searchEl.addEventListener('input', applyView);

// 空状态：先看示例（不需要装任何东西）
const demoBtn = document.getElementById('demoBtn');
if (demoBtn) demoBtn.addEventListener('click', async () => {
  const samples = [
    { provider: 'ChatGPT', type: 'ai', title: '论文综述思路整理', url: 'https://chatgpt.com/c/demo-1',
      preview: '帮我对比三种研究设计的优劣，并列出各自适合的场景与风险…' },
    { provider: 'Claude', type: 'ai', title: 'Dashboard 交互稿', url: 'https://claude.ai/c/demo-2',
      preview: '给多模态数据一个统一入口：左侧导航、右侧详情、可拖拽重排…' },
    { provider: 'Overleaf', type: 'web', title: '排版模板 v3', url: 'https://www.overleaf.com/project/demo-3',
      preview: '' },
    { provider: 'Google Sheets', type: 'web', title: '预形成性访谈记录表', url: 'https://docs.google.com/spreadsheets/d/demo-4/edit',
      preview: '' }
  ];
  for (const s of samples) {
    await fetch('/api/session', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s)
    });
  }
});
// 空状态：展开安装说明
const howBtn = document.getElementById('howBtn');
if (howBtn) howBtn.addEventListener('click', () => {
  const h = document.getElementById('howto');
  h.hidden = !h.hidden;
});

// ---------- SSE + 兜底拉取 ----------
function connectSSE() {
  const es = new EventSource('/api/events');
  es.addEventListener('sessions', (e) => {
    try { syncSessions(JSON.parse(e.data)); } catch (_) {}
  });
  es.onerror = () => { /* 自动重连 */ };
}
fetch('/api/sessions').then(r => r.json()).then(syncSessions).catch(() => {});
connectSSE();
