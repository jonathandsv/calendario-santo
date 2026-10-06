import { TestBed } from '@angular/core/testing';
import { PartialMatchRouteSnapshot, Route, UrlSegment } from '@angular/router';
import { diaValidoGuard } from './dia-valido.guard';

const casar = (data: string) =>
  TestBed.runInInjectionContext(() =>
    diaValidoGuard(
      {} as Route,
      [new UrlSegment('dia', {}), new UrlSegment(data, {})],
      {} as PartialMatchRouteSnapshot,
    ),
  );

describe('diaValidoGuard', () => {
  it('aceita datas com registro, inclusive 02-29', () => {
    expect(casar('10-06')).toBe(true);
    expect(casar('02-29')).toBe(true);
    expect(casar('12-31')).toBe(true);
  });

  it('recusa datas inexistentes ou mal formatadas', () => {
    expect(casar('13-40')).toBe(false);
    expect(casar('02-30')).toBe(false);
    expect(casar('6-10')).toBe(false);
    expect(casar('')).toBe(false);
  });
});
