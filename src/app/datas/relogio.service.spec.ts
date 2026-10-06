import { ApplicationRef, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RelogioService } from './relogio.service';

@Component({ template: '{{ relogio.hoje() ?? "" }}' })
class Hospedeiro {
  readonly relogio = inject(RelogioService);
}

describe('RelogioService', () => {
  it('começa com ano e hoje nulos e os preenche depois da renderização', async () => {
    const relogio = TestBed.inject(RelogioService);
    expect(relogio.ano()).toBeNull();
    expect(relogio.hoje()).toBeNull();

    const fixture = TestBed.createComponent(Hospedeiro);
    await fixture.whenStable();
    TestBed.inject(ApplicationRef).tick();

    const agora = new Date();
    expect(relogio.ano()).toBe(agora.getFullYear());
    expect(relogio.hoje()).toMatch(/^\d{2}-\d{2}$/);
  });

  it('atualiza a partir de uma data dada', () => {
    const relogio = TestBed.inject(RelogioService);
    relogio.atualizar(new Date(2028, 1, 29));
    expect(relogio.ano()).toBe(2028);
    expect(relogio.hoje()).toBe('02-29');
  });
});
