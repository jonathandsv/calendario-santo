import { afterNextRender, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { hojeMesDia } from '../../datas/datas';
import { MetadadosService } from '../../metadados/metadados.service';

/**
 * Página `/`: no navegador, leva ao dia de hoje substituindo a entrada do histórico.
 * Sem JavaScript, mostra um link para o calendário de janeiro.
 */
@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="inicio">
      <h1>Santo do Dia</h1>
      <p>Conheça o santo de cada dia do calendário católico do Brasil.</p>
      <p><a routerLink="/dia/01-01">Ver o calendário a partir de 1º de janeiro</a></p>
    </main>
  `,
  styles: `
    .inicio {
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
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      color: var(--azul-noite);
      font-weight: 600;
    }
  `,
})
export class Inicio {
  constructor() {
    inject(MetadadosService).daPagina({
      titulo: 'Santo do Dia',
      descricao: 'O santo de cada dia do calendário católico do Brasil, com origem, datas e uma breve história.',
      caminho: '/',
    });
    const router = inject(Router);
    afterNextRender(() => {
      router.navigate(['/dia', hojeMesDia()], { replaceUrl: true });
    });
  }
}
