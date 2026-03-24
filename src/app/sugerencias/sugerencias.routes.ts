import { Routes } from '@angular/router';
import { SugerenciasHoyPage } from './pages/sugerencias-hoy/sugerencias-hoy';
import { PersonalizarSugerenciasPage } from './pages/personalizar-sugerencias/personalizar-sugerencias';

export const sugerenciasRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'hoy',
        title: 'Sugerencias del día',
        component: SugerenciasHoyPage,
      },
      {
        path: 'personalizar',
        title: 'Personalizar Sugerencias',
        component: PersonalizarSugerenciasPage,
      },
      {
        path: '**',
        redirectTo: 'hoy',
      },
    ],
  },
];
