import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DadosService } from '../../dados/dados.service';
import { DataMesDia, Santo } from '../../dados/santo';
import { diaAnterior, diaSeguinte } from '../../datas/datas';
import { RelogioService } from '../../datas/relogio.service';
import { ErroCarga } from '../../erro-carga/erro-carga';

/** Página `/dia/MM-DD`. A ficha chega pelo `fichaResolver`. */
@Component({
  selector: 'app-dia',
  imports: [RouterLink, ErroCarga],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dia.html',
  styleUrl: './dia.css',
})
export class Dia {
  private readonly dados = inject(DadosService);
  private readonly relogio = inject(RelogioService);

  /** Parâmetro da rota. */
  readonly data = input.required<DataMesDia>();
  /** Resolvida pela rota; `null` se a requisição falhou. */
  readonly ficha = input.required<Santo | null>();

  protected readonly santo = linkedSignal(() => this.ficha());
  protected readonly recarregando = signal(false);

  protected readonly anterior = computed(() => diaAnterior(this.data(), this.relogio.ano()));
  protected readonly seguinte = computed(() => diaSeguinte(this.data(), this.relogio.ano()));

  protected tentarDeNovo(): void {
    this.recarregando.set(true);
    this.dados.ficha(this.data()).subscribe({
      next: (santo) => {
        this.santo.set(santo);
        this.recarregando.set(false);
      },
      error: () => this.recarregando.set(false),
    });
  }
}
