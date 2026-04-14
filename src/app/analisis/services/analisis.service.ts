import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Analisis, FiltroAnalisis, LigaDisponible } from '../interfaces/analisis.interface';
import { API_ENDPOINTS } from '../../utils/constantes-utils';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalisisService {

  private readonly http = inject(HttpClient);

  obtenerHoy(): Observable<Analisis[]> {
    return this.http.get<Analisis[]>(`${environment.URL}/${API_ENDPOINTS.ANALISIS}/hoy`);
  }

  obtenerAltaConfianza(): Observable<Analisis[]> {
    return this.http.get<Analisis[]>(`${environment.URL}/${API_ENDPOINTS.ANALISIS}/hoy/alta-confianza`);
  }

  filtrar(filtro: FiltroAnalisis): Observable<Analisis[]> {
    return this.http.post<Analisis[]>(`${environment.URL}/${API_ENDPOINTS.ANALISIS}/filtrar`, filtro);
  }

  obtenerPorPartido(partidoId: number): Observable<Analisis[]> {
    return this.http.get<Analisis[]>(`${environment.URL}/${API_ENDPOINTS.ANALISIS}/partido/${partidoId}`);
  }

  ejecutar(ligaIds?: string[]): Observable<any> {
    const body = ligaIds && ligaIds.length > 0 ? { ligaIds } : {};
    return this.http.post(`${environment.URL}/${API_ENDPOINTS.ANALISIS}/ejecutar`, body);
  }

  ligasDisponiblesHoy(): Observable<LigaDisponible[]> {
    return this.http.get<LigaDisponible[]>(
      `${environment.URL}/${API_ENDPOINTS.CUOTAS}/ligas-disponibles-hoy`
    );
  }
}
