import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  linkedSignal,
  viewChild,
} from '@angular/core';
import { ImagemSanto } from '../dados/santo';

/**
 * Imagem do santo com crédito (PRD 4 e 5.4). Sem imagem, ou se ela falhar ao carregar,
 * mostra um espaço reservado neutro nas mesmas dimensões.
 */
@Component({
  selector: 'app-imagem',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './imagem.html',
  styleUrl: './imagem.css',
})
export class Imagem {
  readonly imagem = input.required<ImagemSanto | null>();
  readonly nome = input.required<string>();

  private readonly elemento = viewChild<ElementRef<HTMLImageElement>>('foto');

  /** Volta a `false` sempre que a imagem muda (troca de dia). */
  protected readonly falhou = linkedSignal({ source: this.imagem, computation: () => false });

  protected readonly visivel = computed(() => {
    const imagem = this.imagem();
    return imagem?.local && !this.falhou() ? imagem : null;
  });

  /** `local` vem dos dados como `/img/...`; sem a barra inicial, o endereço segue o `<base href>`. */
  protected readonly endereco = computed(() => this.visivel()?.local?.replace(/^\//, '') ?? '');

  protected readonly credito = computed(() => {
    const imagem = this.imagem();
    return imagem ? [imagem.autor, imagem.licenca].filter(Boolean).join(', ') || 'Wikimedia Commons' : '';
  });

  constructor() {
    // Uma falha anterior à hidratação não dispara o (error) do Angular; confere o estado na carga.
    afterNextRender(() => {
      const img = this.elemento()?.nativeElement;
      if (img?.complete && img.naturalWidth === 0) this.falhou.set(true);
    });
  }
}
