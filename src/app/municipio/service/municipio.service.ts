import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Municipio } from '../interfaces/municipio.interface';
import { environment } from '../../../environments/environment';

// Módulo legacy — no utilizado en Synthax Bet
const ENDPOINT = 'municipios';

@Injectable({
  providedIn: 'root'
})
export class MunicipioService {
  private readonly http = inject(HttpClient);

  crearMunicipio(municipio: Municipio): Observable<Municipio> {
    return this.http.post<Municipio>(`${environment.URL}/${ENDPOINT}`, municipio);
  }

  obtenerTodos(): Observable<Municipio[]> {
    return this.http.get<Municipio[]>(`${environment.URL}/${ENDPOINT}`);
  }

  obtenerPorId(id: string): Observable<Municipio> {
    return this.http.get<Municipio>(`${environment.URL}/${ENDPOINT}/${id}`);
  }

  obtenerPorDepartamento(departamentoId: string): Observable<Municipio[]> {
    return this.http.get<Municipio[]>(`${environment.URL}/${ENDPOINT}/departamento/${departamentoId}`);
  }

  actualizar(id: string, municipio: Municipio): Observable<Municipio> {
    return this.http.put<Municipio>(`${environment.URL}/${ENDPOINT}/${id}`, municipio);
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete(`${environment.URL}/${ENDPOINT}/${id}`);
  }

  desactivar(id: string): Observable<Municipio> {
    return this.http.patch<Municipio>(`${environment.URL}/${ENDPOINT}/${id}/desactivar`, {});
  }
}
