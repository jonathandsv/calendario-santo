import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ROTULOS_GRAU } from '../dados/rotulos';
import { Santo } from '../dados/santo';
import { DIAS_DA_SEMANA, diaDaSemana, diaEMes } from '../datas/datas';
import { RelogioService } from '../datas/relogio.service';
import { Imagem } from '../imagem/imagem';
import { fatosDo } from './fatos';

/**
 * Ficha do santo (PRD 5.4). Tudo vem no HTML pré-renderizado, exceto o dia da semana,
 * que depende do ano corrente e só aparece depois da hidratação.
 */
@Component({
  selector: 'app-ficha',
  imports: [Imagem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ficha.html',
  styleUrl: './ficha.css',
})
export class Ficha {
  private readonly relogio = inject(RelogioService);

  readonly santo = input.required<Santo>();

  protected readonly diaEMes = computed(() => diaEMes(this.santo().data));
  protected readonly diaDaSemana = computed(() => {
    const ano = this.relogio.ano();
    return ano === null ? null : DIAS_DA_SEMANA[diaDaSemana(this.santo().data, ano)];
  });
  protected readonly fatos = computed(() => fatosDo(this.santo()));
  protected readonly grau = computed(() => {
    const grau = this.santo().grau;
    return grau ? ROTULOS_GRAU[grau] : null;
  });
}
