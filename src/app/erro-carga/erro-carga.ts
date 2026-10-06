import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Mensagem exibida quando a ficha do dia não pôde ser carregada. */
@Component({
  selector: 'app-erro-carga',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="erro" role="alert">
      <p>Não foi possível carregar o santo deste dia. Verifique sua conexão.</p>
      <button type="button" (click)="tentarDeNovo.emit()" [disabled]="carregando()">
        {{ carregando() ? 'Carregando…' : 'Tentar de novo' }}
      </button>
    </div>
  `,
  styles: `
    .erro {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border: 1px solid var(--borda);
      border-radius: var(--raio-botao);
      background: var(--superficie);
    }
    p {
      margin: 0;
      color: var(--tinta-suave);
    }
    button {
      min-height: 44px;
      padding: 0 20px;
      border: 0;
      border-radius: 22px;
      background: var(--azul-noite);
      color: #fff;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.7;
      cursor: progress;
    }
  `,
})
export class ErroCarga {
  readonly carregando = input(false);
  readonly tentarDeNovo = output();
}
