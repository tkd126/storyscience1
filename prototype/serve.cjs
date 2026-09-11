// Optional preview server. The game also works by opening index.html directly.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.ttf':'font/ttf'};
http.createServer((req,res)=>{
  let name;
  try { name=decodeURIComponent(new URL(req.url,'http://localhost').pathname); }
  catch { res.writeHead(400);res.end();return; }
  const file=path.resolve(__dirname,'.'+(name==='/'?'/index.html':name));
  if(!file.startsWith(__dirname+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(file,(error,data)=>{
    if(error){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(data);
  });
}).listen(4173,'127.0.0.1',()=>console.log('Game: http://127.0.0.1:4173'));
