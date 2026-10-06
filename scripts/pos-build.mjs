// Ajustes no resultado do build estático.
// Uso: node scripts/pos-build.mjs   (roda depois de npm run build)
// - Copia a página pré-renderizada /404 para 404.html, o nome que as hospedagens estáticas procuram.
import { copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SAIDA = join(RAIZ, 'dist/santo-do-dia/browser');

await copyFile(join(SAIDA, '404/index.html'), join(SAIDA, '404.html'));
console.log('pos-build: 404.html criado.');
