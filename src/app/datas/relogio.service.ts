import { afterNextRender, Injectable, signal } from '@angular/core';
import { DataMesDia } from '../dados/santo';
import { hojeMesDia } from './datas';

/**
 * Ano corrente e dia de hoje (PRD 3.1).
 *
 * Os signals começam `null` no servidor e na primeira renderização do navegador, para o
 * HTML hidratado ser igual ao pré-renderizado, e são preenchidos em `afterNextRender`.
 * Deve ser injetado cedo (no componente raiz) para o gancho ser registrado na carga.
 */
@Injectable({ providedIn: 'root' })
export class RelogioService {
  private readonly _ano = signal<number | null>(null);
  private readonly _hoje = signal<DataMesDia | null>(null);

  readonly ano = this._ano.asReadonly();
  readonly hoje = this._hoje.asReadonly();

  constructor() {
    afterNextRender(() => this.atualizar());
  }

  /** Relê o relógio do aparelho (ex.: ao tocar em "Hoje" depois da meia-noite). */
  atualizar(agora: Date = new Date()): void {
    this._ano.set(agora.getFullYear());
    this._hoje.set(hojeMesDia(agora));
  }
}
