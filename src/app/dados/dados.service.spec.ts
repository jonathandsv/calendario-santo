import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DadosService } from './dados.service';
import { Santo } from './santo';

describe('DadosService', () => {
  let servico: DadosService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    servico = TestBed.inject(DadosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('expõe o índice dos 366 dias de forma síncrona', () => {
    expect(servico.indice).toHaveLength(366);
    expect(servico.indice[0]).toEqual({ data: '01-01', nome: 'Santa Maria, Mãe de Deus' });
    expect(servico.nome('10-06')).toBe('São Bruno');
    expect(servico.existe('02-29')).toBe(true);
    expect(servico.existe('13-40')).toBe(false);
  });

  it.each([
    ['10-06', 'São Bruno'],
    ['02-29', 'Santo Osvaldo de Worcester'],
  ])('retorna a ficha de %s', (data, nome) => {
    let recebido: Santo | undefined;
    servico.ficha(data).subscribe((s) => (recebido = s));

    const req = http.expectOne(`/data/dias/${data}.json`);
    expect(req.request.method).toBe('GET');
    req.flush({ data, nome } as Santo);

    expect(recebido).toEqual({ data, nome });
  });
});
