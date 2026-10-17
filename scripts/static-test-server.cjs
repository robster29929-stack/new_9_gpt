// Local, read-only test server. No database or external credentials are used.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve('dist');
const contentTypes = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8' };
http.createServer(async (req,res) => {
  try {
    const requested=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
    const target=path.resolve(root,'.'+(requested==='/'?'/index.html':requested));
    if (!target.startsWith(root+path.sep)) {res.writeHead(403);res.end();return;}
    const bytes=await fs.readFile(target);
    res.writeHead(200,{'Content-Type':contentTypes[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);
  } catch {res.writeHead(404);res.end('ไม่พบหน้าเว็บ');}
}).listen(4178,'127.0.0.1');
