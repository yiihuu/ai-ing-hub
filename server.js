// AI-ing Hub —— 本地中枢服务（零依赖 Node）
// 职责：托管前端 + 接收浏览器扩展上报的任务元数据 + SSE 实时推送
// 一个「任务」= 一条未完成工作的引用（AI 对话 / 任意网页），只存元数据，不存正文。
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 54321;
const ROOT = path.join(__dirname, 'src');
const DATA_FILE = path.join(__dirname, 'sessions.json');

// 规范化：去掉 hash（同一文档的不同位置算同一条），去掉常见噪声 query 参数
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
  } catch (_) {
    return String(raw).split('#')[0];
  }
}

// 内存索引：key -> task
const AI_NAMES = ['ChatGPT', 'Claude', 'Gemini', 'DeepSeek', 'Mistral'];
const sessions = new Map();
try {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  JSON.parse(raw).forEach(s => {
    if (!s || !s.url) return;
    s.key = s.key || normKey(s.url);
    if (!s.type) s.type = AI_NAMES.includes(s.provider) ? 'ai' : 'web';  // 兼容旧数据
    if (!s.source) s.source = 'legacy';
    sessions.set(s.key, s);
  });
} catch (_) { /* 首次运行无文件 */ }

const sseClients = new Set();

function persist() {
  fs.writeFile(DATA_FILE, JSON.stringify([...sessions.values()], null, 2), () => {});
}
function broadcast() {
  const payload = `event: sessions\ndata: ${JSON.stringify([...sessions.values()])}\n\n`;
  for (const res of sseClients) res.write(payload);
  persist();
}
function upsert(s) {
  if (!s || !s.url) return false;
  const key = s.key || normKey(s.url);
  if (!key) return false;
  const existing = sessions.get(key);
  if (existing) {
    Object.assign(existing, {
      provider: s.provider || existing.provider,
      title: s.title || existing.title,
      preview: s.preview !== undefined ? s.preview : existing.preview,
      favicon: s.favicon || existing.favicon,
      type: s.type || existing.type,
      source: s.source || existing.source,
      url: s.url,                       // 记录最新的一次完整 URL（带 hash，回到原位）
      updatedAt: Date.now()
    });
  } else {
    s.key = key;
    s.type = s.type || 'web';
    s.source = s.source || 'click';
    s.firstSeen = Date.now();
    s.updatedAt = Date.now();
    sessions.set(key, s);
  }
  broadcast();
  return true;
}
function remove(key) {
  if (sessions.delete(key)) { broadcast(); return true; }
  return false;
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function serveStatic(req, res) {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(ROOT, path.normalize(urlPath));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end('forbidden'); return; }
  fs.readFile(filePath, (err, buf) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(buf);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // 上报（浏览器扩展调用）
  if (url.pathname === '/api/session' && req.method === 'POST') {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => {
      try {
        const ok = upsert(JSON.parse(body));
        res.writeHead(ok ? 200 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok }));
      } catch { res.writeHead(400); res.end('bad json'); }
    });
    return;
  }
  // 移除（优先按 key，其次按 url 反推 key）
  if (url.pathname === '/api/session' && req.method === 'DELETE') {
    const key = url.searchParams.get('key') || normKey(url.searchParams.get('url'));
    const ok = remove(key);
    res.writeHead(ok ? 200 : 404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok, key }));
    return;
  }
  // 初始列表
  if (url.pathname === '/api/sessions' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([...sessions.values()]));
    return;
  }
  // SSE 实时推送
  if (url.pathname === '/api/events' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write(`event: sessions\ndata: ${JSON.stringify([...sessions.values()])}\n\n`);
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }
  serveStatic(req, res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`AI-ing Hub 已启动 → http://127.0.0.1:${PORT}`);
});
