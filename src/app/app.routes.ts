import { Routes } from '@angular/router';
import { HomePageComponent } from './shared/pages/home-page/home-page.component';
import { AuthGuard } from './auth/guards/auth.guard';
import { RoleGuard } from './auth/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },

  {
    path: 'statbet',
    loadComponent: () =>
      import('./shared/pages/dashboard-page/dashboard-page.component'),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'inicio',
        title: 'Inicio',
        loadComponent: () =>
          import('./shared/pages/inicio-page/inicio-page.component').then(
            (m) => m.InicioPageComponent
          ),
      },

      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'inicio',
      },

      {
        path: 'partidos',
        title: 'Partidos',
        loadChildren: () =>
          import('./partidos/partidos.routes').then(
            (m) => m.partidosRoutes
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ROOT', 'ADMINISTRADOR'] },
      },

      {
        path: 'analisis',
        title: 'Análisis',
        loadChildren: () =>
          import('./analisis/analisis.routes').then(
            (m) => m.analisisRoutes
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ROOT', 'ADMINISTRADOR'] },
      },

      {
        path: 'sugerencias',
        title: 'Sugerencias',
        loadChildren: () =>
          import('./sugerencias/sugerencias.routes').then(
            (m) => m.sugerenciasRoutes
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ROOT', 'ADMINISTRADOR'] },
      },

      {
        path: 'personalizar-sugerencias',
        title: 'Personalizar Sugerencias',
        loadComponent: () =>
          import('./sugerencias/pages/personalizar-sugerencias/personalizar-sugerencias').then(
            (m) => m.PersonalizarSugerenciasPage
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ROOT', 'ADMINISTRADOR'] },
      },

      {
        path: 'picks',
        title: 'Picks',
        loadChildren: () =>
          import('./picks/picks.routes').then(
            (m) => m.picksRoutes
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ROOT', 'ADMINISTRADOR'] },
      },

      {
        path: 'rendimiento',
        title: 'Rendimiento',
        loadComponent: () =>
          import('./rendimiento/pages/rendimiento/rendimiento').then(
            (m) => m.RendimientoPage
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ROOT', 'ADMINISTRADOR'] },
      },

      {
        path: 'usuario',
        title: 'Usuarios',
        loadChildren: () =>
          import('./usuario/usuario.routes').then(
            (modulo) => modulo.usuarioRoutes
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ROOT'] },
      },

      {
        path: '**',
        redirectTo: 'inicio',
      },
    ],
  },

  {
    path: 'auth',
    title: 'Auth',
    loadChildren: () => import('./auth/auth.routes'),
  },

  {
    path: '**',
    redirectTo: '',
  },
];
