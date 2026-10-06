import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { INDICE } from './indice.gerado';
import { DataMesDia, ItemIndice, Santo } from './santo';

/** Entrega a ficha de cada dia (por HTTP) e o índice leve (síncrono). */
@Injectable({ providedIn: 'root' })
export class DadosService {
  private readonly http = inject(HttpClient);
  private readonly porData = new Map(INDICE.map((item) => [item.data, item]));

  /** Os 366 dias, de `01-01` a `12-31`, com data e nome. */
  readonly indice: readonly ItemIndice[] = INDICE;

  /** Ficha completa do dia. No build, a resposta é embutida no HTML pelo cache de transferência. */
  ficha(data: DataMesDia): Observable<Santo> {
    return this.http.get<Santo>(`/data/dias/${data}.json`);
  }

  /** Nome do santo do dia, sem requisição. */
  nome(data: DataMesDia): string | undefined {
    return this.porData.get(data)?.nome;
  }

  /** Indica se existe registro para a data (inclui `02-29`). */
  existe(data: DataMesDia): boolean {
    return this.porData.has(data);
  }
}
