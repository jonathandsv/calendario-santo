import { TestBed } from '@angular/core/testing';
import { ErroCarga } from './erro-carga';

describe('ErroCarga', () => {
  it('mostra a mensagem e emite ao clicar em "Tentar de novo"', async () => {
    const fixture = TestBed.createComponent(ErroCarga);
    let cliques = 0;
    fixture.componentInstance.tentarDeNovo.subscribe(() => cliques++);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const botao = el.querySelector('button') as HTMLButtonElement;
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Não foi possível carregar');
    expect(botao.textContent?.trim()).toBe('Tentar de novo');

    botao.click();
    expect(cliques).toBe(1);
  });

  it('desativa o botão enquanto carrega', async () => {
    const fixture = TestBed.createComponent(ErroCarga);
    fixture.componentRef.setInput('carregando', true);
    await fixture.whenStable();
    const botao = (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;
    expect(botao.disabled).toBe(true);
    expect(botao.textContent?.trim()).toBe('Carregando…');
  });
});
