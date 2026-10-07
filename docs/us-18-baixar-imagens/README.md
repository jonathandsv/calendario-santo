# US-18 — Baixar as imagens dos santos

- **Épico:** B — Ficha do santo
- **Ordem de execução:** 7 de 18
- **Depende de:** [US-02](../us-02-dados-por-dia/README.md)
- **Seções do PRD:** 4, 8 ([PRD](../PRD.md))
- **Mockup:** [Santo do Dia – mockup](https://claude.ai/artifact/K4CuuBocxWKjgkoY8rCd2e)

## História

Como responsável pelo conteúdo, quero rodar o script que busca as imagens no Wikimedia Commons, para que cada santo tenha imagem com crédito e licença.

## Critérios de aceite

- [x] O script `scripts/buscar-imagens.mjs` lê e regrava `dados/santos.json` (o caminho pode ser passado por argumento) e roda com `npm run imagens`.
- [x] Antes da execução completa, o script é validado contra a API real com três registros (`10-06`, `08-13` e `02-06`); ele só foi testado com respostas simuladas, então erros de formato da API devem ser corrigidos aqui.
- [x] Para cada registro com `wikipedia`, o script grava `wikidata` e, quando a imagem principal está no Wikimedia Commons, o objeto `imagem` com `arquivo`, `url`, `pagina_commons`, `licenca` e `autor`.
- [x] O script baixa o arquivo de 600px de largura para `public/img/santos/MM-DD.<ext>` e grava o caminho em `imagem.local`; uma nova execução não baixa de novo o que já existe.
- [x] Registros sem página, sem imagem ou com imagem fora do Commons ficam com `imagem: null`, sem interromper a execução.
- [x] As requisições usam `User-Agent` identificado e pausa entre lotes; falha de rede em um lote é registrada e a execução continua.
- [x] Ao final, o script gera `docs/us-18-baixar-imagens/relatorio-imagens.md` com o total de imagens e uma tabela de data, nome, licença e autor.
- [x] O relatório lista à parte as imagens cuja licença não seja domínio público, CC0, CC BY ou CC BY-SA, para revisão manual; essas ficam com `imagem: null` até serem aprovadas.
- [ ] O `santos.json` atualizado e as imagens baixadas são versionados no repositório; o formato dos demais campos não muda e continuam existindo 366 registros.

## Pronto quando

Todos os critérios acima estão atendidos, build, testes e lint passam, e o registro abaixo foi escrito.

## Registro

Ao concluir, crie `notas.md` nesta pasta com as decisões tomadas, os desvios em relação ao PRD e as pendências. Outros arquivos de apoio desta história (relatórios, capturas de tela) também ficam aqui.

## Como pedir ao Claude

> Implemente a US-18 conforme `docs/us-18-baixar-imagens/README.md` e `docs/PRD.md`, com os testes.
