// Dependency-free loopback server. Start with: node serve.js
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8190);
const TYPES = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8',
  '.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'};
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end('Bad path'); return; }
  const file = path.resolve(ROOT, '.' + (pathname === '/' ? '/index.html' : pathname));
  const relative = path.relative(ROOT, file);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {'Content-Type':TYPES[path.extname(file)] || 'application/octet-stream',
      'Content-Length':stat.size,'Cache-Control':'no-cache'});
    const stream = fs.createReadStream(file);
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  });
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(PORT, '127.0.0.1', () => console.log(`2D Motion Study: http://127.0.0.1:${PORT}/`));
