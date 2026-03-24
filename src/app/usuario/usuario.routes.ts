import { Routes } from "@angular/router";
import { ListarPage } from "./pages/usuario-listar/usuario-listar";
import { RegistrarPage } from "./pages/usuario-registrar/usuario-registrar";

export const usuarioRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'registrar',
        title: 'Usuarios',
        component: RegistrarPage,
      },
      {
        path: 'listar',
        title: 'Listar usuarios',
        component: ListarPage,
      },
      {
        path: '**',
        redirectTo: 'registrar',
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
