// 会话中枢前端逻辑：SSE 实时同步 + 本地 diff 渲染 + 卡片网格图库
const PROVIDER = {
  ChatGPT: { color: '#10a37f', bg: 'rgba(16,163,127,.16)', initial: 'G' },
  Claude:   { color: '#d97757', bg: 'rgba(217,119,87,.16)',  initial: 'C' },
  Gemini:   { color: '#4285f4', bg: 'rgba(66,133,244,.16)',  initial: 'G' },
  AI:       { color: '#6b7280', bg: 'rgba(107,114,128,.16)', initial: '?' }
};

const gallery = document.getElementById('gallery');
const filtersEl = document.getElementById('filters');
const emptyEl = document.getElementById('empty');
const countEl = document.getElementById('count');
const searchEl = document.getElementById('search');

let sessions = [];          // 最新全量列表
const cardEls = new Map();  // url -> 卡片元素
let activeFilter = 'all';

// 由字符串生成稳定色调，做封面渐变
function hueOf(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
}
function providerOf(s) { return PROVIDER[s.provider] || PROVIDER.AI; }

function timeLabel(ts) {
  if (!ts) return '';
  const d = (Date.now() - ts) / 1000;
  if (d < 60) return '刚刚加入';
  if (d < 3600) return `${Math.floor(d / 60)} 分钟前加入`;
  if (d < 86400) return `${Math.floor(d / 3600)} 小时前加入`;
  return new Date(ts).toLocaleDateString('zh-CN');
}

function createCard(s) {
  const p = providerOf(s);
  const hue = hueOf(s.url);
  const el = document.createElement('article');
  el.className = 'card enter';
  el.dataset.url = s.url;
  el._session = s;
  el.innerHTML = `
    <div class="cover" style="background:linear-gradient(135deg, hsl(${hue} 78% 95%), hsl(${(hue + 38) % 360} 72% 86%))">
      <span class="cover-glyph">${p.initial}</span>
      <span class="badge" style="color:${p.color};background:${p.bg}">${s.provider || 'AI'}</span>
      <button class="remove" title="从图库移除">×</button>
    </div>
    <div class="meta">
      <div class="title">${escapeHtml(s.title || s.provider || '未命名对话')}</div>
      <div class="preview">${escapeHtml(s.preview || '')}</div>
      <div class="time">${timeLabel(s.firstSeen)}</div>
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
  el.querySelector('.title').textContent = s.title || s.provider || '未命名对话';
  el.querySelector('.preview').textContent = s.preview || '';
  el.querySelector('.time').textContent = timeLabel(s.firstSeen);
}

function escapeHtml(t) {
  return (t || '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function openSession(url) {
  // 在浏览器 / Tauri webview 中打开原对话（聚焦或新标签）
  window.open(url, '_blank');
}
function removeSession(url) {
  fetch(`/api/session?url=${encodeURIComponent(url)}`, { method: 'DELETE' }).catch(() => {});
}

// 同步全量列表：新增/更新/移除卡片
function syncSessions(list) {
  const seen = new Set();
  list.forEach(s => {
    seen.add(s.url);
    let el = cardEls.get(s.url);
    if (!el) {
      el = createCard(s);
      cardEls.set(s.url, el);
      gallery.appendChild(el);
      setTimeout(() => el.classList.remove('enter'), 400);
    } else {
      updateCard(el, s);
    }
  });
  for (const [url, el] of cardEls) {
    if (!seen.has(url)) {
      el.classList.add('leave');
      setTimeout(() => { el.remove(); }, 220);
      cardEls.delete(url);
    }
  }
  sessions = list;
  renderFilters();
  applyView();
}

// 筛选 chips（随出现的厂商动态生成）
function renderFilters() {
  const providers = [...new Set(sessions.map(s => s.provider).filter(Boolean))];
  const wanted = ['all', ...providers];
  const existing = [...filtersEl.children].map(c => c.dataset.f);
  if (existing.join() === wanted.join()) return;
  filtersEl.innerHTML = '';
  wanted.forEach(key => {
    const label = key === 'all' ? '全部' : key;
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

function applyView() {
  const q = searchEl.value.trim().toLowerCase();
  let visible = 0;
  for (const [, el] of cardEls) {
    const s = el._session;
    const matchFilter = activeFilter === 'all' || s.provider === activeFilter;
    const matchText = !q || `${s.title} ${s.preview || ''}`.toLowerCase().includes(q);
    const show = matchFilter && matchText;
    el.classList.toggle('hidden', !show);
    if (show) visible++;
  }
  emptyEl.hidden = visible !== 0;
  gallery.style.display = visible === 0 ? 'none' : 'grid';
  countEl.textContent = `${sessions.length} 个进行中`;
}

searchEl.addEventListener('input', applyView);

// 空状态：先看示例（不需要装任何东西）
const demoBtn = document.getElementById('demoBtn');
if (demoBtn) demoBtn.addEventListener('click', async () => {
  const samples = [
    { provider: 'ChatGPT', title: '论文综述思路整理', url: 'https://chatgpt.com/c/demo-1',
      preview: '帮我对比三种研究设计的优劣，并列出各自适合的场景与风险…' },
    { provider: 'Claude', title: 'Dashboard 交互稿', url: 'https://claude.ai/c/demo-2',
      preview: '给多模态数据一个统一入口：左侧导航、右侧详情、可拖拽重排…' },
    { provider: 'Gemini', title: '访谈提纲润色', url: 'https://gemini.google.com/c/demo-3',
      preview: '把这份预形成性研究的话术改得更自然，少一点引导性…' }
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
