import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { DadosService } from './dados.service';
import { dataValida } from '../datas/datas';

/** Só deixa a rota `dia/:data` casar com datas que têm registro; as demais caem na página 404. */
export const diaValidoGuard: CanMatchFn = (_rota, segmentos) => {
  const data = segmentos[1]?.path ?? '';
  return dataValida(data) && inject(DadosService).existe(data);
};
