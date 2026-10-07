# US-17 — Notas

## Decisões

- **Teste do fluxo principal** em `e2e/fluxo-principal.spec.ts`, nos perfis de celular e computador:
  1. abre `/` e confere que chegou ao dia de hoje (URL, faixa e ficha);
  2. troca para o dia seguinte pela faixa;
  3. escolhe um dia pelo calendário (painel no celular, que fecha ao escolher; coluna no computador);
  4. volta com "Hoje" e confere o santo de hoje.

  O console precisa terminar sem avisos ou erros. As datas são calculadas a partir do relógio do navegador do teste, então o teste vale em qualquer dia do ano, inclusive na virada de mês.
- **Contra o build estático:** todos os e2e usam o `webServer` do Playwright com `scripts/servir.mjs`, que serve `dist/santo-do-dia/browser` como uma hospedagem estática (pasta → `index.html`, inexistente → `404.html` com status 404). O `ng serve` não é usado.
- Teste extra: `/dia/10-06/` (barra final, que algumas hospedagens acrescentam) abre normalmente, sem avisos.
- **README:** seção "Publicação" com o que gerar, a estrutura da pasta, os requisitos da hospedagem (índice por pasta, `404.html` com status 404, sem modo SPA, cabeçalhos de cache) e exemplos para Netlify, Cloudflare Pages, Vercel, GitHub Pages, Nginx e Apache. A seção "Testes" resume os tipos de teste.

## Desvios em relação ao PRD

- Nenhum.

## Pendências (antes de publicar)

- Definir o domínio em `src/app/site.ts` (`URL_DO_SITE`, hoje provisório).
- Rodar a busca completa de imagens (US-18) com um `User-Agent` de contato e versionar o resultado.
- Pendências de conteúdo da seção 8 do PRD (revisão de textos, registros `conferido: false`, data do Beato Inácio de Azevedo).
