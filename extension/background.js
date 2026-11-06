// AI-ing Hub —— 后台 service worker
// 职责：全局快捷键、右键菜单收纳、扩展徽章计数、聚焦已有标签页
const HUB = 'http://127.0.0.1:54321';
const MENU = {
  page: 'ai-ing-page',
  link: 'ai-ing-link',
  selection: 'ai-ing-selection',
  toggle: 'ai-ing-toggle-dot'
};

// —— 站点识别（与 content.js 保持一致）——
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
  'www.overleaf.com': 'Overleaf',
  'overleaf.com': 'Overleaf',
  'notion.so': 'Notion',
  'www.notion.so': 'Notion',
  'figma.com': 'Figma',
  'www.figma.com': 'Figma',
  'github.com': 'GitHub',
  'arxiv.org': 'arXiv',
  'www.google.com': 'Google'
};
function hostOf(u) {
  try { return new URL(u).hostname; } catch (_) { return ''; }
}
function siteOf(u) {
  const h = hostOf(u);
  for (const [re, name] of AI_HOST) if (re.test(h)) return { provider: name, type: 'ai' };
  let p = h.replace(/^www\./, '');
  if (p === 'docs.google.com') {
    const path = (() => { try { return new URL(u).pathname; } catch (_) { return ''; } })();
    if (path.includes('/spreadsheets/')) return { provider: 'Google Sheets', type: 'web' };
    if (path.includes('/presentation/')) return { provider: 'Google Slides', type: 'web' };
  }
  if (KNOWN_HOST[p]) return { provider: KNOWN_HOST[p], type: 'web' };
  const label = p.split('.').length > 2 ? p.split('.').slice(-2).join('.') : p;
  return { provider: label.charAt(0).toUpperCase() + label.slice(1), type: 'web' };
}
function faviconOf(u) {
  const h = hostOf(u);
  return h ? `https://www.google.com/s2/favicons?domain=${h}&sz=64` : '';
}
function titleFromUrl(u) {
  const h = hostOf(u);
  return h ? h.replace(/^www\./, '') : u;
}

// —— 上报到中枢 ——
async function pushTask(task) {
  try {
    const res = await fetch(`${HUB}/api/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    return res.ok;
  } catch (_) { return false; }
}
async function removeTask(url) {
  try {
    await fetch(`${HUB}/api/session?url=${encodeURIComponent(url)}`, { method: 'DELETE' });
  } catch (_) {}
}

// —— 收纳 ——
async function captureTab(tab, source) {
  if (!tab || !tab.url || !/^https?:/.test(tab.url)) return false;
  const site = siteOf(tab.url);
  const ok = await pushTask({
    provider: site.provider,
    type: site.type,
    title: (tab.title || titleFromUrl(tab.url)).trim(),
    url: tab.url,
    favicon: tab.favIconUrl || faviconOf(tab.url),
    preview: '',
    source: source || 'click'
  });
  if (ok) {
    refreshBadge();
    notifyTab(tab.id, 'ai-ing:refresh');
  }
  return ok;
}
function notifyTab(tabId, type) {
  if (!tabId) return;
  chrome.tabs.sendMessage(tabId, { type }).catch(() => {});
}

// —— 徽章计数 ——
async function refreshBadge() {
  try {
    const res = await fetch(`${HUB}/api/sessions`);
    const list = await res.json();
    const n = Array.isArray(list) ? list.length : 0;
    await chrome.action.setBadgeText({ text: n ? String(n) : '' });
    await chrome.action.setBadgeBackgroundColor({ color: '#4f46e5' });
  } catch (_) {
    await chrome.action.setBadgeText({ text: '' });
  }
}

// —— 右键菜单 ——
let menusReady = false;
function ensureMenus() {
  if (menusReady) return;
  menusReady = true;
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU.page,
      title: '收纳到 AI-ing Hub · Capture to AI-ing Hub',
      contexts: ['page']
    });
    chrome.contextMenus.create({
      id: MENU.link,
      title: '收纳此链接到 AI-ing Hub · Capture this link',
      contexts: ['link']
    });
    chrome.contextMenus.create({
      id: MENU.selection,
      title: '收纳选中文字到 AI-ing Hub · Capture selection',
      contexts: ['selection']
    });
    chrome.contextMenus.create({
      id: MENU.toggle,
      title: '显示 / 隐藏浮点 · Toggle floating dot',
      contexts: ['page']
    });
  });
}
ensureMenus();
chrome.runtime.onInstalled.addListener(() => { ensureMenus(); refreshBadge(); });
chrome.runtime.onStartup.addListener(() => { ensureMenus(); refreshBadge(); });

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === MENU.page) {
    await captureTab(tab, 'contextmenu');
  } else if (info.menuItemId === MENU.link) {
    const u = info.linkUrl;
    if (!u) return;
    const site = siteOf(u);
    await pushTask({
      provider: site.provider,
      type: site.type,
      title: (info.selectionText || info.linkUrl || titleFromUrl(u)).trim(),
      url: u,
      favicon: faviconOf(u),
      preview: '',
      source: 'contextmenu'
    });
    refreshBadge();
  } else if (info.menuItemId === MENU.selection) {
    const site = siteOf(tab.url);
    await pushTask({
      provider: site.provider,
      type: site.type,
      title: (tab.title || site.provider).trim(),
      url: tab.url,
      favicon: tab.favIconUrl || faviconOf(tab.url),
      preview: (info.selectionText || '').slice(0, 160),
      source: 'contextmenu'
    });
    refreshBadge();
  } else if (info.menuItemId === MENU.toggle) {
    chrome.storage.local.get({ dotEnabled: true }, ({ dotEnabled }) => {
      chrome.storage.local.set({ dotEnabled: !dotEnabled });
      notifyTab(tab.id, 'ai-ing:refresh');
    });
  }
});

// —— 快捷键 ——
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'open-hub') {
    chrome.tabs.create({ url: HUB });
    return;
  }
  if (command === 'capture-current') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) await captureTab(tab, 'hotkey');
  }
});

// —— 扩展图标：打开面板 ——
chrome.action.onClicked.addListener(() => { chrome.tabs.create({ url: HUB }); });

// —— 面板请求「聚焦已有标签页」——
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'focus-url') {
    focusTab(msg.url).then(sendResponse);
    return true;   // 异步响应
  }
  if (msg && msg.type === 'remove-url') {
    removeTask(msg.url).then(() => { refreshBadge(); sendResponse({ ok: true }); });
    return true;
  }
  return false;
});

async function focusTab(url) {
  if (!url) return { ok: false };
  const target = url.split('#')[0].replace(/\/+$/, '');
  const tabs = await chrome.tabs.query({});
  const hit = tabs.find(t => t.url && t.url.split('#')[0].replace(/\/+$/, '') === target);
  if (hit) {
    await chrome.tabs.update(hit.id, { active: true });
    try { await chrome.windows.update(hit.windowId, { focused: true }); } catch (_) {}
    return { ok: true, focused: true };
  }
  // 没开着这个页面 → 直接在扩展里开，避免被浏览器的弹窗拦截挡住
  await chrome.tabs.create({ url, active: true });
  return { ok: true, focused: false, opened: true };
}
