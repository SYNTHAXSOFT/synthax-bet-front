import { Routes } from '@angular/router';
import { AnalisisListarPage } from './pages/analisis-listar/analisis-listar';

export const analisisRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'listar',
        title: 'Listar análisis',
        component: AnalisisListarPage,
      },
      {
        path: '**',
        redirectTo: 'listar',
      },
    ],
  },
];
