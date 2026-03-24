import { Routes } from '@angular/router';
import { PicksRegistrarPage } from './pages/picks-registrar/picks-registrar';
import { PicksListarPage } from './pages/picks-listar/picks-listar';

export const picksRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'registrar',
        title: 'Registrar pick',
        component: PicksRegistrarPage,
      },
      {
        path: 'listar',
        title: 'Listar picks',
        component: PicksListarPage,
      },
      {
        path: '**',
        redirectTo: 'registrar',
      },
    ],
  },
];
