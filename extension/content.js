// AI 会话中枢 —— 捕获层（content script）
// 在 chatgpt.com / claude.ai 页面抽取会话元数据，周期性上报到本地中枢。
const HUB = 'http://127.0.0.1:54321/api/session';
const POLL_MS = 4000;

let lastUrl = '';
let lastSent = 0;

function providerOf() {
  const h = location.hostname;
  if (h.includes('chatgpt.com')) return 'ChatGPT';
  if (h.includes('claude.ai')) return 'Claude';
  if (h.includes('gemini')) return 'Gemini';
  return 'AI';
}

function extractTitle(provider) {
  // 优先取页面主标题元素
  const h1 = document.querySelector('h1');
  if (h1 && h1.innerText.trim()) return h1.innerText.trim();
  // 退而求其次：去掉站点后缀的 document.title
  return (document.title || provider)
    .replace(/[-–—]\s*(ChatGPT|Claude|Gemini).*$/i, '')
    .trim() || provider;
}

function extractPreview() {
  const root = document.querySelector('main') || document.body;
  const nodes = [...root.querySelectorAll('p, span, div, li')]
    .map(n => (n.innerText || '').replace(/\s+/g, ' ').trim())
    .filter(t => t.length > 24 && t.length < 400);
  return nodes.length ? nodes[nodes.length - 1].slice(0, 140) : '';
}

function collect() {
  const provider = providerOf();
  const url = location.href.split('?')[0];
  return {
    provider,
    title: extractTitle(provider),
    url,
    favicon: `https://www.google.com/s2/favicons?domain=${location.hostname}&sz=64`,
    preview: extractPreview(),
    ts: Date.now()
  };
}

function send() {
  const data = collect();
  if (!data.url) return;
  // 同一 URL 节流：避免每个轮询都打扰服务端
  if (data.url === lastUrl && Date.now() - lastSent < 3000) return;
  lastUrl = data.url;
  lastSent = Date.now();
  fetch(HUB, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(() => {/* 中枢未启动则静默忽略 */});
}

// 初次加载 + 周期性轮询（覆盖 SPA 内 URL 变化 / 新对话）
send();
setInterval(() => {
  if (location.href !== lastUrl) lastUrl = ''; // URL 变化 → 强制重新上报
  send();
}, POLL_MS);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) send();
});

// 新开对话时，新标签会重新注入本脚本，自动完成上报
