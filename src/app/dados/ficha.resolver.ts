import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { DadosService } from './dados.service';
import { Santo } from './santo';

/**
 * Carrega a ficha do dia da rota antes de exibi-la.
 * Em caso de falha devolve `null`, para a página mostrar a mensagem com "Tentar de novo".
 */
export const fichaResolver: ResolveFn<Santo | null> = (rota) =>
  inject(DadosService)
    .ficha(rota.paramMap.get('data') ?? '')
    .pipe(catchError(() => of(null)));
