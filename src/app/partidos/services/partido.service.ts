import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Partido } from '../interfaces/partido.interface';
import { API_ENDPOINTS } from '../../utils/constantes-utils';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PartidoService {

  private readonly http = inject(HttpClient);

  obtenerHoy(): Observable<Partido[]> {
    return this.http.get<Partido[]>(`${environment.URL}/${API_ENDPOINTS.PARTIDOS}/hoy`);
  }

  obtenerPorFecha(fecha: string): Observable<Partido[]> {
    return this.http.get<Partido[]>(`${environment.URL}/${API_ENDPOINTS.PARTIDOS}/fecha/${fecha}`);
  }

  obtenerPorId(id: number): Observable<Partido> {
    return this.http.get<Partido>(`${environment.URL}/${API_ENDPOINTS.PARTIDOS}/${id}`);
  }

  sincronizar(): Observable<any> {
    return this.http.post(`${environment.URL}/${API_ENDPOINTS.PARTIDOS}/sincronizar`, {});
  }
}
