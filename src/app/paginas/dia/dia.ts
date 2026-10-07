import { ChangeDetectionStrategy, Component, inject, input, linkedSignal, signal } from '@angular/core';
import { DadosService } from '../../dados/dados.service';
import { DataMesDia, Santo } from '../../dados/santo';
import { ErroCarga } from '../../erro-carga/erro-carga';
import { Faixa } from '../../faixa/faixa';
import { Ficha } from '../../ficha/ficha';

/** Página `/dia/MM-DD`. A ficha chega pelo `fichaResolver`. */
@Component({
  selector: 'app-dia',
  imports: [ErroCarga, Faixa, Ficha],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dia.html',
  styleUrl: './dia.css',
})
export class Dia {
  private readonly dados = inject(DadosService);

  /** Parâmetro da rota. */
  readonly data = input.required<DataMesDia>();
  /** Resolvida pela rota; `null` se a requisição falhou. */
  readonly ficha = input.required<Santo | null>();

  protected readonly santo = linkedSignal(() => this.ficha());
  protected readonly recarregando = signal(false);

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
