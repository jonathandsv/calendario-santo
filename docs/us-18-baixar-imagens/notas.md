# US-18 — Notas

## Situação

O script está pronto, testado com respostas simuladas e **validado contra a API real** com `10-06`, `08-13` e `02-06`. A **execução completa ficou para depois**, por decisão do responsável: o Wikimedia passou a responder HTTP 429 (limite de taxa) em quase todos os downloads. Por isso `dados/santos.json` continua sem imagens e nenhuma imagem foi versionada. Enquanto isso, o site mostra o espaço reservado (`public/img/santo-placeholder.svg`, US-07).

Critério ainda pendente: "o `santos.json` atualizado e as imagens baixadas são versionados".

## Como fazer a execução completa

```bash
SANTO_USER_AGENT="SantoDoDia/1.0 (https://github.com/<usuario>/<repositorio>)" npm run imagens
```

- Use um `User-Agent` com contato (URL do repositório ou e-mail). A [política de User-Agent do Wikimedia](https://meta.wikimedia.org/wiki/User-Agent_policy) limita com mais rigor os clientes sem contato, e foi isso que travou a primeira tentativa.
- A execução é idempotente: imagens já existentes em `public/img/santos/` não são baixadas de novo, e lotes ou downloads que falharem podem ser completados rodando de novo.
- No fim, confira `docs/us-18-baixar-imagens/relatorio-imagens.md`, revise as licenças listadas à parte e versione `dados/santos.json` e `public/img/santos/`.

## Decisões

- **Argumentos:** caminho do `santos.json` (padrão `dados/santos.json`); `--so=MM-DD,...` para processar só algumas datas (usado na validação); `--imagens`, `--relatorio` e `--aprovadas` para trocar os caminhos.
- **Largura de 500px em vez de 600px (desvio):** na validação, `iiurlwidth=600` devolveu miniaturas de 960px, e pedir `600px-` direto responde HTTP 400. Hoje o Commons só gera miniaturas em larguras padrão (…, 330, 500, 960, …). 500px é a mais próxima, leve (cerca de 70 a 90 kB) e suficiente para a área da imagem (220px de altura no celular e 380px no computador).
- **URLs sem rastreio:** a API real acrescenta `utm_source`, `utm_campaign` e `utm_content` a `thumburl`; o script remove esses parâmetros antes de gravar `imagem.url`.
- **Gravação de `imagem.local`:** caminho público como `/img/santos/10-06.jpg`. A extensão vem da miniatura (a miniatura de SVG ou TIFF é PNG ou JPG).
- **Licenças livres** (domínio público, `PD-*`, CC0, CC BY e CC BY-SA em qualquer versão) entram direto. As demais ficam com `imagem: null` e vão para a seção de revisão do relatório. Para aprovar uma imagem, acrescente a data em `dados/imagens-aprovadas.json` e rode de novo.
- **Falhas:** cada requisição tem tempo limite de 30s e nova tentativa (até 5) em erro de rede, 429 e 5xx, com espera crescente (respeita `Retry-After`, no máximo 60s). Um lote da API que falha é registrado e os registros dele ficam como estavam; um download que falha deixa `imagem: null`. As falhas aparecem no log e no relatório.
- **Pausas:** 1s entre lotes da API e entre downloads.
- **Testes** em `scripts/buscar-imagens.test.mjs` (`node --test`), com `fetch` simulado no formato real da API (`formatversion=2`, `normalized`, `redirects`, página ausente, arquivo fora do Commons). Cobrem: gravação de `wikidata` e `imagem`, download e `local`, nulos, revisão de licença e aprovação, não baixar de novo, falha de lote, 429 com nova tentativa e `--so`.

## Pendências

- Rodar `npm run imagens` com `SANTO_USER_AGENT` de contato e versionar o resultado.
- Revisar à mão as licenças listadas no relatório (PRD 8.1).
