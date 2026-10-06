// Servidor estático mínimo para o build, com o comportamento de uma hospedagem estática:
// `/dia/10-06` serve `dia/10-06/index.html` e endereços inexistentes recebem `404.html` com status 404.
// Uso: node scripts/servir.mjs [porta]   (padrão 4300)
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '../dist/santo-do-dia/browser');
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

async function arquivo(caminho) {
  try {
    const info = await stat(caminho);
    if (info.isFile()) return caminho;
    if (info.isDirectory()) return arquivo(join(caminho, 'index.html'));
  } catch {
    // não existe
  }
  return null;
}

export function servir(porta = 4300) {
  const servidor = createServer(async (req, res) => {
    const caminho = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
    const alvo = normalize(join(RAIZ, caminho));
    const encontrado = alvo.startsWith(RAIZ) ? await arquivo(alvo) : null;
    const final = encontrado ?? join(RAIZ, '404.html');
    res.writeHead(encontrado ? 200 : 404, { 'Content-Type': TIPOS[extname(final)] ?? 'application/octet-stream' });
    createReadStream(final).pipe(res);
  });
  return new Promise((ok) => servidor.listen(porta, () => ok(servidor)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const porta = Number(process.argv[2] ?? 4300);
  await servir(porta);
  console.log(`Servindo o build em http://localhost:${porta}`);
}
