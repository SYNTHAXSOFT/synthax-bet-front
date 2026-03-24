import { Routes } from '@angular/router';
import { PartidosListarPage } from './pages/partidos-listar/partidos-listar';

export const partidosRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'listar',
        title: 'Listar partidos',
        component: PartidosListarPage,
      },
      {
        path: '**',
        redirectTo: 'listar',
      },
    ],
  },
];
