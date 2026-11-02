// AI 会话中枢 —— 本地中枢服务（零依赖 Node）
// 职责：托管前端 + 接收浏览器扩展上报的会话元数据 + SSE 实时推送
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 54321;
const ROOT = path.join(__dirname, 'src');
const DATA_FILE = path.join(__dirname, 'sessions.json');

// 内存索引：url -> session
const sessions = new Map();
try {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  JSON.parse(raw).forEach(s => sessions.set(s.url, s));
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
  const existing = sessions.get(s.url);
  if (existing) {
    Object.assign(existing, {
      provider: s.provider, title: s.title,
      preview: s.preview, favicon: s.favicon, updatedAt: Date.now()
    });
  } else {
    s.firstSeen = Date.now();
    s.updatedAt = Date.now();
    sessions.set(s.url, s);
  }
  broadcast();
  return true;
}
function remove(url) {
  if (sessions.delete(url)) { broadcast(); return true; }
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
  // 移除
  if (url.pathname === '/api/session' && req.method === 'DELETE') {
    const ok = remove(url.searchParams.get('url'));
    res.writeHead(ok ? 200 : 404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok }));
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
  console.log(`AI 会话中枢已启动 → http://127.0.0.1:${PORT}`);
});
