import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Página 404: publicada como `404.html` e exibida para endereços inexistentes. */
@Component({
  selector: 'app-nao-encontrada',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="nao-encontrada">
      <h1>Página não encontrada</h1>
      <p>Este endereço não corresponde a nenhum dia do calendário.</p>
      <p><a routerLink="/">Ver o santo de hoje</a></p>
    </main>
  `,
  styles: `
    .nao-encontrada {
      max-width: 640px;
      margin: 0 auto;
      padding: 48px 16px;
    }
    h1 {
      margin: 0 0 8px;
      font-family: var(--fonte-titulo);
      font-weight: 600;
      color: var(--azul-noite);
    }
    a {
      color: var(--azul-noite);
      font-weight: 600;
    }
  `,
})
export class NaoEncontrada {}
