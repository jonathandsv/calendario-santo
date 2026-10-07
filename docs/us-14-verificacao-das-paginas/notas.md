# US-14 — Notas

## Decisões

- **Script `scripts/verificar-build.mjs`**, rodado em `postbuild` (depois de `pos-build.mjs`): se encontrar problemas, o `npm run build` falha.
  - Confere a existência de `index.html`, `404.html` e dos 366 `dia/MM-DD/index.html`.
  - Confere que o **texto visível** de cada página (sem `<script>`/`<style>`, sem tags e com as entidades decodificadas) contém o nome e a descrição do dia. O conteúdo dentro do `ng-state` (cache de transferência) não conta.
  - **Dia da semana:** procura nomes por extenso (domingo … sábado) no texto da interface, depois de retirar o conteúdo do próprio registro e dos três dias seguintes (nome, descrição, `obs`, `dados_referentes_a`). Isso é necessário porque há dados que mencionam "domingo" ou santos chamados Domingos (ex.: `08-08`, `12-20`). Também procura abreviações ("Dom", "Ter"…) como texto de elemento.
  - **"Hoje":** procura a classe `hoje` como token (a do calendário), sem confundir com `botao-hoje`/`hoje-painel`.
- **Testes do verificador** (`scripts/verificar-build.test.mjs`): página correta, nome/descrição ausentes, dia da semana por extenso e abreviado, conteúdo do dia que menciona "domingo", classe `hoje`, entidades e páginas faltando.
- **Hidratação limpa** (`e2e/hidratacao.spec.ts`): abre `10-06`, `02-29` e `12-31` nos dois perfis, espera o fim da hidratação (dia da semana visível e `ngh` removido da raiz) e exige console sem avisos nem erros.

## Desvios em relação ao PRD

- Nenhum.

## Pendências

- Nenhuma.
