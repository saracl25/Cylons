const { execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist', 'cylons', 'browser');
const CHROME = '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"';
const OUT_DIR = path.join(__dirname, '..', 'docs', 'evidencias');

// Servidor para capturar ERROR 404
const serverError = http.createServer((req, res) => {
  if (req.url.includes('cylons-data.json')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Fuente de datos no encontrada' }));
    return;
  }
  let p = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(p)) p = path.join(DIST_DIR, 'index.html');
  const ext = path.extname(p);
  const m = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
  res.writeHead(200, { 'Content-Type': m[ext] || 'application/octet-stream' });
  res.end(fs.readFileSync(p));
});

serverError.listen(4205, () => {
  const tmpDir = path.join(__dirname, '..', 'scratch_profile_error');
  try {
    execSync(`${CHROME} --headless --disable-gpu --user-data-dir="${tmpDir}" --virtual-time-budget=2000 --screenshot="${path.join(OUT_DIR, '04-estado-error-reintentar.png')}" --window-size=1440,900 http://localhost:4205`);
    console.log('04-estado-error-reintentar.png capturado exitosamente!');
  } catch (e) {
    console.error('Error al capturar error:', e);
  } finally {
    serverError.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
