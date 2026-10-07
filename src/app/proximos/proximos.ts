import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DadosService } from '../dados/dados.service';
import { DataMesDia } from '../dados/santo';
import { DIAS_DA_SEMANA_CURTOS, deslocar, diaDaSemana, diaEMes } from '../datas/datas';
import { RelogioService } from '../datas/relogio.service';

/**
 * "Próximos dias" (PRD 5.5): três cartões com data e nome dos dias seguintes. Vêm no HTML
 * pré-renderizado (o nome sai do índice); o dia da semana entra depois da hidratação.
 * Aparece só no computador (CSS).
 */
@Component({
  selector: 'app-proximos',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="proximos" aria-labelledby="titulo-proximos">
      <h2 id="titulo-proximos">Próximos dias</h2>
      <ul>
        @for (dia of dias(); track dia.data) {
          <li>
            <a class="cartao" [routerLink]="['/dia', dia.data]">
              <span class="quando">
                @if (dia.semana) {
                  <span>{{ dia.semana }}, </span>
                }
                <span>{{ dia.diaEMes }}</span>
              </span>
              <span class="nome">{{ dia.nome }}</span>
            </a>
          </li>
        }
      </ul>
    </section>
  `,
  styleUrl: './proximos.css',
})
export class Proximos {
  private readonly dados = inject(DadosService);
  private readonly relogio = inject(RelogioService);

  readonly data = input.required<DataMesDia>();

  protected readonly dias = computed(() => {
    const ano = this.relogio.ano();
    return [1, 2, 3].map((passo) => {
      const data = deslocar(this.data(), passo, ano);
      return {
        data,
        diaEMes: diaEMes(data),
        semana: ano === null ? null : DIAS_DA_SEMANA_CURTOS[diaDaSemana(data, ano)],
        nome: this.dados.nome(data) ?? '',
      };
    });
  });
}
