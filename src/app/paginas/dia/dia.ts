import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DadosService } from '../../dados/dados.service';
import { DataMesDia, Santo } from '../../dados/santo';
import { Calendario } from '../../calendario/calendario';
import { MESES, partes } from '../../datas/datas';
import { RelogioService } from '../../datas/relogio.service';
import { ErroCarga } from '../../erro-carga/erro-carga';
import { Faixa } from '../../faixa/faixa';
import { Ficha } from '../../ficha/ficha';

/** Página `/dia/MM-DD`. A ficha chega pelo `fichaResolver`. */
@Component({
  selector: 'app-dia',
  imports: [RouterLink, Calendario, ErroCarga, Faixa, Ficha],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dia.html',
  styleUrl: './dia.css',
})
export class Dia {
  private readonly dados = inject(DadosService);
  private readonly router = inject(Router);
  protected readonly relogio = inject(RelogioService);

  /** Parâmetro da rota. */
  readonly data = input.required<DataMesDia>();
  /** Resolvida pela rota; `null` se a requisição falhou. */
  readonly ficha = input.required<Santo | null>();

  protected readonly santo = linkedSignal(() => this.ficha());
  protected readonly recarregando = signal(false);

  /** Painel do calendário no celular (US-11). */
  readonly calendarioAberto = signal(false);

  /** "Outubro"; o ano entra depois da hidratação. */
  protected readonly mes = computed(() => {
    const nome = MESES[partes(this.data()).mes - 1];
    return nome[0].toUpperCase() + nome.slice(1);
  });

  /** Antes da hidratação aponta para `/`, que leva a hoje; depois, direto para o dia de hoje. */
  protected readonly linkHoje = computed(() => {
    const hoje = this.relogio.hoje();
    return hoje ? ['/dia', hoje] : ['/'];
  });

  /** Vai para a data atual (relendo o relógio, caso a meia-noite tenha passado) e fecha o calendário. */
  protected irParaHoje(evento: MouseEvent): void {
    if (evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
    evento.preventDefault();
    this.relogio.atualizar();
    this.calendarioAberto.set(false);
    this.router.navigate(['/dia', this.relogio.hoje()]);
  }

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
