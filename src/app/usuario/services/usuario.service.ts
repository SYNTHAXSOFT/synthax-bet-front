import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../interfaces/usuario.interface';
import { API_ENDPOINTS } from '../../utils/constantes-utils';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly http = inject(HttpClient);

  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(
      `${environment.URL}/${API_ENDPOINTS.USUARIOS}`,
      usuario
    );
  }

  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(
      `${environment.URL}/${API_ENDPOINTS.USUARIOS}`
    );
  }

  obtenerPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(
      `${environment.URL}/${API_ENDPOINTS.USUARIOS}/${id}`
    );
  }

  actualizar(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${environment.URL}/${API_ENDPOINTS.USUARIOS}/${id}`,
      usuario
    );
  }

  activarInactivar(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(
      `${environment.URL}/${API_ENDPOINTS.USUARIOS}/${id}/estado`,
      {}
    );
  }
}
