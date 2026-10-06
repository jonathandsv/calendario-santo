import { Routes } from '@angular/router';
import { diaValidoGuard } from './dados/dia-valido.guard';
import { fichaResolver } from './dados/ficha.resolver';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./paginas/inicio/inicio').then((m) => m.Inicio),
  },
  {
    path: 'dia/:data',
    canMatch: [diaValidoGuard],
    resolve: { ficha: fichaResolver },
    loadComponent: () => import('./paginas/dia/dia').then((m) => m.Dia),
  },
  {
    path: '404',
    loadComponent: () => import('./paginas/nao-encontrada/nao-encontrada').then((m) => m.NaoEncontrada),
  },
  {
    path: '**',
    loadComponent: () => import('./paginas/nao-encontrada/nao-encontrada').then((m) => m.NaoEncontrada),
  },
];
