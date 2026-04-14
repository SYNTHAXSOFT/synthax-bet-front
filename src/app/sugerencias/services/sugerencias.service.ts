import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FiltroSugerencia, Sugerencia } from '../interfaces/sugerencia.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SugerenciasService {
  private http = inject(HttpClient);
  private base = `${environment.URL}/sugerencias`;

  obtenerHoy(): Observable<Sugerencia[]> {
    return this.http.get<Sugerencia[]>(`${this.base}/hoy`);
  }

  personalizar(filtro: FiltroSugerencia): Observable<Sugerencia[]> {
    return this.http.post<Sugerencia[]>(`${this.base}/personalizada`, filtro);
  }

  obtenerLigas(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/ligas`);
  }

  obtenerEquipos(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/equipos`);
  }
}
