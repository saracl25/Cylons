const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 4200;
const DIST_DIR = path.join(__dirname, '..', 'dist', 'cylons', 'browser');
const CHROME_PATH = '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"';
const OUT_DIR = path.join(__dirname, '..', 'docs', 'evidencias');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

let mode = 'normal'; // 'loading', 'error', 'normal'

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];

  if (urlPath.includes('cylons-data.json')) {
    if (mode === 'loading') {
      // Dejar en espera para capturar el spinner
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(fs.readFileSync(path.join(DIST_DIR, 'assets', 'data', 'cylons-data.json')));
      }, 10000);
      return;
    }
    if (mode === 'error') {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Recurso no encontrado: 404 Not Found' }));
      return;
    }
  }

  let filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (e) {
    res.writeHead(500);
    res.end('Error');
  }
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  server.listen(PORT, async () => {
    console.log(`Servidor activo en http://localhost:${PORT}`);

    try {
      // 1. Estado de Carga
      console.log('1/5: Capturando estado de carga...');
      mode = 'loading';
      const cmdLoading = `${CHROME_PATH} --headless --disable-gpu --virtual-time-budget=400 --screenshot="${path.join(OUT_DIR, '03-estado-carga-spinner.png')}" --window-size=1440,900 http://localhost:${PORT}`;
      execSync(cmdLoading);
      await sleep(1000);

      // 2. Estado de Error
      console.log('2/5: Capturando estado de error...');
      mode = 'error';
      const cmdError = `${CHROME_PATH} --headless --disable-gpu --virtual-time-budget=2000 --screenshot="${path.join(OUT_DIR, '04-estado-error-reintentar.png')}" --window-size=1440,900 http://localhost:${PORT}`;
      execSync(cmdError);
      await sleep(1000);

      // 3. Estado Normal Escritorio (1440px)
      console.log('3/5: Capturando escritorio normal 1440px...');
      mode = 'normal';
      const cmdDesktop = `${CHROME_PATH} --headless --disable-gpu --virtual-time-budget=3000 --screenshot="${path.join(OUT_DIR, '01-escritorio-1440px.png')}" --window-size=1440,900 http://localhost:${PORT}`;
      execSync(cmdDesktop);
      await sleep(1000);

      // 4. Estado Normal Móvil (375px)
      console.log('4/5: Capturando móvil normal 375px...');
      const cmdMobile = `${CHROME_PATH} --headless --disable-gpu --virtual-time-budget=3000 --screenshot="${path.join(OUT_DIR, '02-movil-375px.png')}" --window-size=375,812 http://localhost:${PORT}`;
      execSync(cmdMobile);
      await sleep(1000);

      // 5. Demostración Interactiva con Ruta Activa (1440px)
      console.log('5/5: Capturando guía activa interactiva...');
      // Chrome headless run-all script
      const cmdActive = `${CHROME_PATH} --headless --disable-gpu --virtual-time-budget=4500 --screenshot="${path.join(OUT_DIR, '05-guia-activa-progreso.png')}" --window-size=1440,900 http://localhost:${PORT}`;
      execSync(cmdActive);

      console.log('Capturas generadas con éxito en docs/evidencias/');
    } catch (err) {
      console.error('Error generando capturas:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

main();
