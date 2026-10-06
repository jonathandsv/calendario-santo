import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { INDICE } from './dados/indice.gerado';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'dia/:data',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => INDICE.map(({ data }) => ({ data })),
    fallback: PrerenderFallback.None,
  },
  {
    path: '404',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
