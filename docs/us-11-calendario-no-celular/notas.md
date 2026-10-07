# US-11 — Notas

## Decisões

- **`<dialog>` nativo com `showModal()`** como painel inferior (bottom sheet), com `aria-label="Escolher dia do mês"`. O modal torna o resto da página inerte, fecha com Esc e tem fundo escurecido (`::backdrop`). O estado fica no sinal `calendarioAberto` da página do dia, sincronizado por um `effect` (`showModal`/`close`) e pelo evento `close` do diálogo.
- **Abertura:** pelo nome do mês (botão com seta, `aria-haspopup="dialog"`) e pelo ícone "Abrir calendário", como no mockup.
- **Fechamento:** botão "Fechar calendário" (projetado no topo do calendário), Esc, toque no fundo (clique cujo alvo é o próprio `<dialog>`, ouvinte registrado por código) e escolha de um dia (saída `escolheu` do `Calendario`).
- **Foco:** o modal leva o foco para dentro ao abrir. Um ciclo explícito de Tab/Shift+Tab impede que o foco escape para a barra do navegador (o modal nativo permite isso). Ao fechar, o foco volta ao botão que abriu o painel.
- **Dois calendários, um por contexto:** o do painel só é criado enquanto ele está aberto; a coluna lateral (`<aside>`) fica oculta abaixo de 1024px e é a do computador (US-12). A escolha evita depender da largura da tela no build (o HTML pré-renderizado é o mesmo para todos).
- **"Hoje" dentro do painel:** com o modal aberto, o "Hoje" do cabeçalho fica inerte. Para o critério da US-09 ("fecha o calendário, se aberto"), o rodapé do painel tem um "Hoje" que vai para a data atual e fecha o painel.
- **Calendário:** ganhou o `input` `dica` ("Toque em um dia para ver o santo" no painel) e um espaço `[rodape]` para conteúdo projetado.
- **Testes:** e2e no perfil de celular (`e2e/calendario-celular.spec.ts`): abrir pelo mês e pelo ícone; fechar por botão, Esc, fundo e escolha de dia; foco preso com Tab e Shift+Tab; devolução do foco; "Hoje" no painel.

## Desvios em relação ao PRD

- Botão "Hoje" também no rodapé do painel (não está no mockup), necessário para o critério da US-09 com o painel modal aberto.

## Pendências

- Nenhuma.
