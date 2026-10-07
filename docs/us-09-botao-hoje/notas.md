# US-09 — Notas

## Decisões

- **Barra superior** na página do dia, acima da faixa: nome do mês (Spectral, "Outubro"; o ano entra depois da hidratação) e o botão "Hoje" em pílula com contorno, como no mockup.
- **"Hoje" é um link real.** Antes da hidratação aponta para `/`, que já leva ao dia de hoje no navegador; depois, aponta direto para `/dia/<hoje>`. Funciona sem JavaScript e em nova aba (Ctrl/Cmd+clique segue o comportamento normal do link).
- **No clique** (botão principal sem modificadores): relê o relógio (`RelogioService.atualizar()`, caso a meia-noite tenha passado com a página aberta), fecha o calendário (`calendarioAberto`, sinal da página que o painel da US-11 vai usar) e navega para hoje.
- **Correção na faixa (US-08):** sob carga, duas setas seguidas às vezes levavam só um dia. A navegação do roteador termina antes de o `input` `data` ser atualizado, então a segunda tecla partia da data antiga. Agora o destino pendente só é liberado quando `data()` o alcança (ou se a navegação falhar). Reproduzido com instrumentação e conferido com 80 repetições paralelas.
- **Testes:** e2e em `e2e/hoje.spec.ts` (volta para a data atual depois de navegar; sem JS, o link aponta para `/`).

## Desvios em relação ao PRD

- Nenhum.

## Pendências

- O fechamento do calendário pelo "Hoje" só tem efeito visível quando o painel existir (US-11); o teste de ponta a ponta da US-17 cobre o fluxo completo.
