# US-10 — Notas

## Decisões

- **Componente `Calendario` (`src/app/calendario/`)** com título do mês (Spectral; ano depois da hidratação), setas "Mês anterior"/"Próximo mês" (botões de 44px) e a dica "Escolha um dia para ver o santo".
- **Grade como `<table>`** (semana começando no domingo, cabeçalho com `<abbr title="Domingo">Dom</abbr>` etc.). Cada dia é um link real (`routerLink` para `/dia/MM-DD`) com `aria-label` por extenso ("Terça-feira, 6 de outubro").
- **Só no navegador:** a grade depende do ano (alinhamento e 29/02), então só é montada quando `RelogioService.ano()` existe, depois da hidratação. Antes disso, `.grade` reserva a altura final (cabeçalho e 6 semanas); o e2e confere que a altura não muda com a hidratação.
- **Destaques:** selecionado com fundo azul-noite e `aria-current="date"`; hoje com contorno dourado (`box-shadow` interno de 2px) sobre fundo branco.
- **Mês exibido** é um `linkedSignal` do mês do dia selecionado: as setas mudam o mês (dão a volta, de dezembro para janeiro e vice-versa) e uma nova seleção volta a acompanhar a rota.
- **Teclado:** roving tabindex (só um dia tabulável: o focado, o selecionado ou o dia 1). As setas movem o foco (±1 e ±7 dias), atravessando para o mês vizinho quando preciso, e Enter segue o link. O tratamento fica no host do componente.
- **Saída `escolheu`:** emitida ao clicar num dia, para o painel do celular fechar (US-11). Uma projeção de conteúdo `[acoes]` no topo permite ao painel incluir o botão de fechar.
- **Posição provisória:** por enquanto o calendário aparece abaixo da ficha, num cartão `<aside aria-label="Calendário do mês">`. O painel do celular vem na US-11 e a coluna fixa à direita na US-12.
- **Testes:** unitários (grade, alinhamento, destaques, 12 meses, fevereiro nos dois tipos de ano, mês acompanhando a seleção, teclado, `escolheu`) e e2e no perfil de computador (espaço reservado, navegação, fevereiro do ano corrente, teclado com Enter).

## Desvios em relação ao PRD

- Nenhum.

## Pendências

- Nenhuma.
