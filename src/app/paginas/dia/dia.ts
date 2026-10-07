import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Calendario } from '../../calendario/calendario';
import { DadosService } from '../../dados/dados.service';
import { DataMesDia, Santo } from '../../dados/santo';
import { MESES, partes } from '../../datas/datas';
import { RelogioService } from '../../datas/relogio.service';
import { ErroCarga } from '../../erro-carga/erro-carga';
import { Faixa } from '../../faixa/faixa';
import { Ficha } from '../../ficha/ficha';
import { Proximos } from '../../proximos/proximos';

const FOCAVEIS = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Faz o Tab e o Shift+Tab darem a volta dentro do contêiner. */
function prenderFoco(conteiner: HTMLElement, evento: KeyboardEvent): void {
  if (evento.key !== 'Tab') return;
  const focaveis = [...conteiner.querySelectorAll<HTMLElement>(FOCAVEIS)].filter((el) => el.tabIndex >= 0);
  if (!focaveis.length) return;
  const primeiro = focaveis[0];
  const ultimo = focaveis[focaveis.length - 1];
  const ativo = document.activeElement;
  if (evento.shiftKey && (ativo === primeiro || !conteiner.contains(ativo))) {
    evento.preventDefault();
    ultimo.focus();
  } else if (!evento.shiftKey && (ativo === ultimo || !conteiner.contains(ativo))) {
    evento.preventDefault();
    primeiro.focus();
  }
}

/** Página `/dia/MM-DD`. A ficha chega pelo `fichaResolver`. */
@Component({
  selector: 'app-dia',
  imports: [RouterLink, Calendario, ErroCarga, Faixa, Ficha, Proximos],
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

  /** Painel do calendário no celular. */
  readonly calendarioAberto = signal(false);
  private readonly painel = viewChild.required<ElementRef<HTMLDialogElement>>('painel');
  /** Botão que abriu o painel, para devolver o foco ao fechar. */
  private origem: HTMLElement | null = null;

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

  constructor() {
    afterNextRender(() => {
      const dialogo = this.painel().nativeElement;
      // Clique no fundo escurecido fecha o painel (o equivalente de teclado é o Esc, nativo do <dialog>).
      dialogo.addEventListener('click', (evento) => {
        if (evento.target === dialogo) this.fecharCalendario();
      });
      // O modal já torna o resto da página inerte; aqui o Tab também não escapa para a barra do navegador.
      dialogo.addEventListener('keydown', (evento) => prenderFoco(dialogo, evento));
    });

    effect(() => {
      const dialogo = this.painel().nativeElement;
      if (this.calendarioAberto()) {
        if (!dialogo.open) dialogo.showModal();
      } else if (dialogo.open) {
        dialogo.close();
      }
    });
  }

  protected abrirCalendario(evento: MouseEvent): void {
    this.origem = evento.currentTarget as HTMLElement;
    this.calendarioAberto.set(true);
  }

  protected fecharCalendario(): void {
    this.calendarioAberto.set(false);
  }

  /** O `<dialog>` fechou (Esc, botão, fundo ou escolha de um dia): sincroniza o estado e devolve o foco. */
  protected aoFecharPainel(): void {
    this.calendarioAberto.set(false);
    this.origem?.focus();
    this.origem = null;
  }

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
