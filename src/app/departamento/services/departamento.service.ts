import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Departamento } from '../interfaces/departamento.interface';

// Módulo legacy — no utilizado en Synthax Bet
const ENDPOINT = 'departamentos';

@Injectable({ providedIn: 'root' })
export class DepartamentoService {
  private readonly http = inject(HttpClient);

  crearDepartamento(departamento: Departamento): Observable<Departamento> {
    return this.http.post<Departamento>(`${environment.URL}/${ENDPOINT}`, departamento);
  }

  obtenerTodos(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(`${environment.URL}/${ENDPOINT}`);
  }

  obtenerPorId(id: string): Observable<Departamento> {
    return this.http.get<Departamento>(`${environment.URL}/${ENDPOINT}/${id}`);
  }

  actualizar(id: string, departamento: Departamento): Observable<Departamento> {
    return this.http.put<Departamento>(`${environment.URL}/${ENDPOINT}/${id}`, departamento);
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete(`${environment.URL}/${ENDPOINT}/${id}`);
  }

  desactivar(id: string): Observable<Departamento> {
    return this.http.patch<Departamento>(`${environment.URL}/${ENDPOINT}/${id}/desactivar`, {});
  }
}
