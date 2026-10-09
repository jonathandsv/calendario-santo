# Santo do Dia

Site que mostra o santo do dia da Igreja Católica Apostólica Romana, segundo o calendário do Brasil. Cada dia do ano é uma página HTML gerada no build (Angular 22 com pré-renderização), servida por qualquer hospedagem de arquivos estáticos.

Requisitos e histórias: [`docs/PRD.md`](docs/PRD.md).

## Requisitos

- Node.js 24 (versão em `.nvmrc`; com nvm: `nvm use`)
- npm

## Comandos

```bash
npm install      # instala as dependências
npm start        # servidor de desenvolvimento em http://localhost:4200
npm run build    # build de produção estático em dist/santo-do-dia/browser
npm test         # testes unitários (Vitest) e dos scripts (node --test)
npm run lint     # ESLint
npm run e2e      # testes de navegador (Playwright) contra o build; rode o build antes
npm run servir   # serve o build em http://localhost:4300, como uma hospedagem estática
npm run verificar  # build, testes, lint e e2e em sequência
```

Na primeira vez, instale o navegador dos testes: `npx playwright install chromium`.

Os dados de cada dia (`public/data/dias/`) e o índice (`src/app/dados/indice.gerado.ts`) são gerados a partir de `dados/santos.json` por `npm run dados`, que roda sozinho antes de `start`, `build` e `test`.

O build não gera servidor: a pasta `dist/santo-do-dia/browser` contém apenas arquivos estáticos (HTML, CSS, JS, fontes e dados).

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `dados/` | Fonte dos dados (`santos.json`, 366 registros) |
| `docs/` | PRD, uma pasta por história e mockups |
| `scripts/` | Scripts Node de apoio ao build e ao conteúdo |
| `public/` | Arquivos estáticos copiados para o build |
| `src/app/` | Aplicação Angular |

## Testes

| Tipo | Onde | Comando |
|---|---|---|
| Unitários (lógica de datas, dados, componentes) | `src/**/*.spec.ts` | `npm test` |
| Scripts (geração de dados, imagens, verificação do build) | `scripts/*.test.mjs` | `npm test` |
| Verificação do build (366 páginas, conteúdo no HTML, nada que dependa da data) | `scripts/verificar-build.mjs` | roda sozinho no fim de `npm run build` |
| Navegador, incluindo o fluxo principal e acessibilidade (axe) | `e2e/*.spec.ts` | `npm run e2e` |

Os testes de navegador rodam contra o **build estático** servido por `scripts/servir.mjs` (que imita uma hospedagem estática), nos perfis de celular e computador, e não contra o `ng serve`.

## Publicação

O site é só arquivos estáticos: não há servidor Node em produção.

### 1. Antes do primeiro build de produção

- **Domínio:** troque `URL_DO_SITE` em `src/app/site.ts` pelo endereço definitivo (ex.: `https://santododia.com.br`). Ele é usado na URL canônica e nos metadados Open Graph de cada página.
- **Imagens (opcional):** rode `npm run imagens` (US-18) para baixar as imagens do Wikimedia Commons e versione `dados/santos.json` e `public/img/santos/`. Veja `docs/us-18-baixar-imagens/notas.md`.

### 2. Gerar o site

```bash
npm ci
npm run build
```

O resultado fica em `dist/santo-do-dia/browser/`. Publique **o conteúdo dessa pasta** na raiz do site:

```
dist/santo-do-dia/browser/
├── index.html              → /  (leva ao dia de hoje)
├── 404.html                → página "não encontrada"
├── dia/MM-DD/index.html    → /dia/MM-DD  (366 páginas)
├── data/dias/MM-DD.json    → ficha de cada dia (carregada ao trocar de dia)
├── img/                    → imagens
├── media/                  → fontes
└── *.js, *.css             → aplicação (nomes com hash)
```

### 3. O que a hospedagem precisa fazer

1. **Servir `index.html` de cada pasta:** `/dia/10-06` (ou `/dia/10-06/`) deve entregar `dia/10-06/index.html`. É o comportamento padrão de quase todas as hospedagens estáticas. O site funciona com e sem a barra final.
2. **Página 404 própria:** endereços inexistentes (ex.: `/dia/13-40`) devem receber `404.html` **com status 404**. Não configure "redirecionar tudo para `index.html`" (modo SPA): cada página já existe pronta.
3. **Cache (recomendado):** arquivos `*.js`, `*.css` e `media/*` têm hash no nome e podem ter cache longo (`Cache-Control: public, max-age=31536000, immutable`). Os `*.html` e `data/dias/*.json` devem ser revalidados (`Cache-Control: no-cache`).

### Exemplos de configuração

**GitHub Pages:** o workflow `.github/workflows/pages.yml` gera e publica o site a cada push na `main`.

1. No GitHub, em **Settings → Pages → Build and deployment → Source**, escolha **GitHub Actions** (uma vez só).
2. Faça push na `main`, ou rode o workflow manualmente na aba **Actions**.
3. O site fica em `https://<usuario>.github.io/<repositório>/`.

O workflow passa `--base-href "/<repositório>/"` para o build, então o site funciona nesse subcaminho. Com domínio próprio (configurado em Settings → Pages), o subcaminho some e o build usa `/`. Nos dois casos, ajuste `URL_DO_SITE` em `src/app/site.ts` para o endereço final. O GitHub Pages usa o `404.html` da raiz sozinho.

Para conferir localmente um build em subcaminho:

```bash
npm run build -- --base-href /calendario-santo/
node scripts/servir.mjs 4300 /calendario-santo/   # http://localhost:4300/calendario-santo/
```

**Netlify, Cloudflare Pages, Vercel:** pasta de publicação `dist/santo-do-dia/browser`, comando de build `npm run build`. Todas usam `404.html` da raiz automaticamente, sem configuração extra.

**Nginx:**

```nginx
server {
  root /var/www/santo-do-dia;

  location / {
    try_files $uri $uri/index.html =404;
  }
  error_page 404 /404.html;

  location ~* \.(js|css|woff2?)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
  location ~* \.(html|json)$ {
    add_header Cache-Control "no-cache";
  }
}
```

**Apache (`.htaccess` na raiz publicada):**

```apache
DirectoryIndex index.html
ErrorDocument 404 /404.html
```

### Conferir localmente antes de publicar

```bash
npm run build
npm run servir   # http://localhost:4300, com 404.html e status 404 como na hospedagem
npm run e2e
```
