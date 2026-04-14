import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pick, CrearPickRequest, EstadisticasPick, RendimientoResolucion } from '../interfaces/pick.interface';
import { API_ENDPOINTS } from '../../utils/constantes-utils';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PickService {

  private readonly http = inject(HttpClient);

  listar(): Observable<Pick[]> {
    return this.http.get<Pick[]>(`${environment.URL}/${API_ENDPOINTS.PICKS}`);
  }

  listarPendientes(): Observable<Pick[]> {
    return this.http.get<Pick[]>(`${environment.URL}/${API_ENDPOINTS.PICKS}/pendientes`);
  }

  listarPorCanal(canal: string): Observable<Pick[]> {
    return this.http.get<Pick[]>(`${environment.URL}/${API_ENDPOINTS.PICKS}/canal/${canal}`);
  }

  obtenerPorId(id: number): Observable<Pick> {
    return this.http.get<Pick>(`${environment.URL}/${API_ENDPOINTS.PICKS}/${id}`);
  }

  crear(pick: CrearPickRequest): Observable<Pick> {
    return this.http.post<Pick>(`${environment.URL}/${API_ENDPOINTS.PICKS}`, pick);
  }

  liquidar(id: number, resultado: string): Observable<Pick> {
    return this.http.patch<Pick>(
      `${environment.URL}/${API_ENDPOINTS.PICKS}/${id}/liquidar`,
      { resultado }
    );
  }

  estadisticas(): Observable<EstadisticasPick> {
    return this.http.get<EstadisticasPick>(`${environment.URL}/${API_ENDPOINTS.PICKS}/estadisticas`);
  }

  resolverPendientes(): Observable<RendimientoResolucion> {
    return this.http.post<RendimientoResolucion>(
      `${environment.URL}/${API_ENDPOINTS.PICKS}/resolver-pendientes`, {}
    );
  }
}
