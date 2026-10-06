import { ConsoleMessage, Page } from '@playwright/test';

/** Junta avisos e erros do console (inclusive os de hidratação) para os testes conferirem. */
export function vigiarConsole(pagina: Page): string[] {
  const mensagens: string[] = [];
  pagina.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error' || msg.type() === 'warning') mensagens.push(msg.text());
  });
  pagina.on('pageerror', (erro) => mensagens.push(erro.message));
  return mensagens;
}

/** Hoje como MM-DD, pela data local do navegador do teste. */
export function hojeNoNavegador(pagina: Page): Promise<string> {
  return pagina.evaluate(() => {
    const d = new Date();
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
}

