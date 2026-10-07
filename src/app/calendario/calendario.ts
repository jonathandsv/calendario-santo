import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataMesDia } from '../dados/santo';
import {
  DIAS_DA_SEMANA,
  DIAS_DA_SEMANA_CURTOS,
  dataPorExtenso,
  deslocar,
  diaDaSemana,
  diasDoMes,
  MESES,
  montarData,
  partes,
} from '../datas/datas';
import { RelogioService } from '../datas/relogio.service';

interface Celula {
  data: DataMesDia;
  numero: number;
  rotulo: string;
  selecionado: boolean;
  hoje: boolean;
}

/**
 * Calendário mensal (PRD 5.3). A grade depende do ano corrente (alinhamento dos dias da
 * semana e 29/02), então só é montada no navegador, depois da hidratação; antes disso o
 * espaço fica reservado.
 */
@Component({
  selector: 'app-calendario',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendario.html',
  styleUrl: './calendario.css',
  host: { '(keydown)': 'teclar($event)' },
})
export class Calendario {
  private readonly relogio = inject(RelogioService);
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Dia selecionado (rota). */
  readonly data = input.required<DataMesDia>();
  readonly dica = input('Escolha um dia para ver o santo');
  /** Um dia foi escolhido (o painel do celular fecha). */
  readonly escolheu = output<DataMesDia>();

  protected readonly ano = this.relogio.ano;
  protected readonly cabecalho = DIAS_DA_SEMANA_CURTOS.map((curto, i) => ({ curto, longo: DIAS_DA_SEMANA[i] }));

  /** Mês exibido (1–12); acompanha o dia selecionado e muda pelas setas. */
  protected readonly mes = linkedSignal(() => partes(this.data()).mes);
  protected readonly titulo = computed(() => {
    const nome = MESES[this.mes() - 1];
    return nome[0].toUpperCase() + nome.slice(1);
  });

  /** Dia que recebe o foco do teclado (roving tabindex). */
  private readonly focado = signal<DataMesDia | null>(null);
  private pedirFoco = false;

  /** Semanas do mês exibido, começando no domingo; `null` são as casas vazias. */
  protected readonly semanas = computed<(Celula | null)[][] | null>(() => {
    const ano = this.ano();
    if (ano === null) return null;
    const selecionada = this.data();
    const hoje = this.relogio.hoje();
    const dias = diasDoMes(this.mes(), ano);
    const casas: (Celula | null)[] = Array.from({ length: diaDaSemana(dias[0], ano) }, () => null);
    for (const data of dias) {
      casas.push({
        data,
        numero: partes(data).dia,
        rotulo: dataPorExtenso(data, ano),
        selecionado: data === selecionada,
        hoje: data === hoje,
      });
    }
    while (casas.length % 7) casas.push(null);
    return Array.from({ length: casas.length / 7 }, (_, i) => casas.slice(i * 7, i * 7 + 7));
  });

  /** Dia tabulável do mês exibido: o focado, o selecionado ou o dia 1. */
  protected readonly tabulavel = computed(() => {
    const doMes = (d: DataMesDia | null) => d !== null && partes(d).mes === this.mes();
    const focado = this.focado();
    if (doMes(focado)) return focado;
    return doMes(this.data()) ? this.data() : montarData(this.mes(), 1);
  });

  constructor() {
    afterRenderEffect(() => {
      const alvo = this.tabulavel();
      if (!this.pedirFoco) return;
      this.pedirFoco = false;
      this.elemento.nativeElement.querySelector<HTMLElement>(`[data-dia="${alvo}"]`)?.focus();
    });
  }

  protected mudarMes(passo: number): void {
    this.mes.update((m) => ((m - 1 + passo + 12) % 12) + 1);
  }

  /** Setas movem o foco entre os dias (atravessando meses); Enter segue o link. */
  protected teclar(evento: KeyboardEvent): void {
    const passos: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const passo = passos[evento.key];
    const origem = (evento.target as HTMLElement).dataset?.['dia'];
    if (passo === undefined || !origem) return;
    evento.preventDefault();
    const destino = deslocar(origem, passo, this.ano());
    this.focado.set(destino);
    this.mes.set(partes(destino).mes);
    this.pedirFoco = true;
  }
}
