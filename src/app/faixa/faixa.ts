import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DataMesDia } from '../dados/santo';
import {
  DIAS_DA_SEMANA,
  DIAS_DA_SEMANA_CURTOS,
  deslocar,
  diaAnterior,
  diaDaSemana,
  diaEMes,
  diaSeguinte,
  partes,
} from '../datas/datas';
import { RelogioService } from '../datas/relogio.service';

/** Dias de cada lado do selecionado. Tocar num dia recentraliza, então a faixa não tem fim. */
const ALCANCE = 21;

interface ItemFaixa {
  data: DataMesDia;
  numero: number;
  /** "Ter", só depois da hidratação. */
  semana: string | null;
  rotulo: string;
  selecionado: boolean;
}

/**
 * Faixa de dias (PRD 5.2). Os números e os links vêm no HTML pré-renderizado; os dias da
 * semana entram depois da hidratação, num espaço já reservado. Antes do JavaScript, o
 * dia selecionado é centralizado só com CSS (scroll-snap).
 */
@Component({
  selector: 'app-faixa',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './faixa.html',
  host: { '(keydown)': 'teclar($event)' },
  styleUrl: './faixa.css',
})
export class Faixa {
  private readonly relogio = inject(RelogioService);
  private readonly router = inject(Router);

  readonly data = input.required<DataMesDia>();

  private readonly lista = viewChild.required<ElementRef<HTMLElement>>('lista');
  /** Depois da hidratação a faixa rola livremente; antes, só o selecionado é ponto de encaixe. */
  protected readonly hidratada = signal(false);
  /** Pedido de foco no dia selecionado, atendido depois da próxima renderização. */
  private focarDepois = false;
  /** Destino de uma navegação por teclado ainda em andamento (teclas rápidas encadeiam a partir dele). */
  private destinoPendente: DataMesDia | null = null;

  protected readonly itens = computed<ItemFaixa[]>(() => {
    const selecionada = this.data();
    const ano = this.relogio.ano();
    const itens: ItemFaixa[] = [];
    for (let passo = -ALCANCE; passo <= ALCANCE; passo++) {
      const data = deslocar(selecionada, passo, ano);
      const semana = ano === null ? null : diaDaSemana(data, ano);
      itens.push({
        data,
        numero: partes(data).dia,
        semana: semana === null ? null : DIAS_DA_SEMANA_CURTOS[semana],
        rotulo: semana === null ? diaEMes(data) : `${DIAS_DA_SEMANA[semana]}, ${diaEMes(data)}`,
        selecionado: passo === 0,
      });
    }
    return itens;
  });

  constructor() {
    afterNextRender(() => this.hidratada.set(true));

    let primeira = true;
    afterRenderEffect(() => {
      this.itens();
      // Na primeira vez o CSS já centralizou; depois, anima até o novo dia.
      this.centralizar(primeira ? 'instant' : 'smooth');
      primeira = false;
      if (this.focarDepois) {
        this.focarDepois = false;
        this.selecionado()?.focus({ preventScroll: true });
      }
    });
  }

  /** Setas esquerda e direita mudam o dia quando a faixa tem foco. */
  protected teclar(evento: KeyboardEvent): void {
    if (evento.key !== 'ArrowLeft' && evento.key !== 'ArrowRight') return;
    evento.preventDefault();
    const ano = this.relogio.ano();
    const base = this.destinoPendente ?? this.data();
    const destino = evento.key === 'ArrowLeft' ? diaAnterior(base, ano) : diaSeguinte(base, ano);
    this.destinoPendente = destino;
    this.focarDepois = true;
    this.router.navigate(['/dia', destino]).finally(() => {
      if (this.destinoPendente === destino) this.destinoPendente = null;
    });
  }

  private selecionado(): HTMLElement | null {
    return this.lista().nativeElement.querySelector<HTMLElement>('[aria-current="date"]');
  }

  private centralizar(comportamento: ScrollBehavior): void {
    const lista = this.lista().nativeElement;
    const item = this.selecionado()?.parentElement;
    if (!item || typeof lista.scrollTo !== 'function') return;
    const esquerda = item.offsetLeft - lista.offsetLeft - (lista.clientWidth - item.offsetWidth) / 2;
    lista.scrollTo({ left: esquerda, behavior: comportamento });
  }
}
