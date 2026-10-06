import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('cria o componente raiz com o router-outlet', () => {
    const fixture = TestBed.createComponent(App);
    const el = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance).toBeTruthy();
    expect(el.querySelector('router-outlet')).not.toBeNull();
  });
});
