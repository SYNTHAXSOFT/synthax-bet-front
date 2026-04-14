import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../utils/constantes-utils';
import { environment } from '../../../environments/environment';
import { LigaDisponible } from '../interfaces/analisis.interface';

/** Resultado detallado de una ejecución de ingesta de cuotas. */
export interface IngestaCuotasResultado {
  /** "ok" | "ok_sin_cuotas" | "abortado" */
  estado: string;
  /** Mensaje legible para mostrar al usuario. */
  mensaje: string;
  /** Motivo de aborto (solo si estado = "abortado"). */
  motivo?: string;

  // ── Presupuesto ──
  requestsUsadosAntes: number;
  requestsUsadosDespues: number;
  requestsConsumidosEnIngesta: number;
  requestsRestantesParaCuotas: number;
  requestsMaxDiarios: number;

  // ── Partidos ──
  totalPartidosConAnalisis: number;
  partidosFiltradosPorLiga: number;
  partidosConsultados: number;
  partidosSinCuotasEnApi: number;
  partidosSinCuotasMuestra: string[];

  // ── Resultado ──
  cuotasPersistidas: number;
}

/** Estado del presupuesto diario de requests de API-Football. */
export interface EstadoBudget {
  requestsUsadosHoy: number;
  requestsMaxDiarios: number;
  requestsDisponiblesUsoGeneral: number;
  requestsDisponiblesParaCuotas: number;
  reservaCuotas: number;
  porcentajeUsado: number;
  /** "OK" | "ADVERTENCIA" | "CRITICO" */
  nivelAlerta: string;
  consejo?: string;
}

@Injectable({ providedIn: 'root' })
export class CuotaService {

  private readonly http = inject(HttpClient);

  /**
   * POST /api/cuotas/ingestar
   * Descarga las cuotas del día desde API-Football y las guarda en BD.
   * Devuelve un DTO detallado con el resultado completo de la ingesta.
   * Si se pasan ligaIds, solo ingestiona cuotas para esas ligas.
   */
  ingestar(ligaIds?: string[]): Observable<IngestaCuotasResultado> {
    const body = ligaIds && ligaIds.length > 0 ? { ligaIds } : {};
    return this.http.post<IngestaCuotasResultado>(
      `${environment.URL}/${API_ENDPOINTS.CUOTAS}/ingestar`,
      body
    );
  }

  /**
   * GET /api/cuotas/estado-budget
   * Devuelve el estado actual del presupuesto diario de requests de API-Football.
   * Permite al front-end advertir al admin antes de ejecutar análisis masivo.
   */
  estadoBudget(): Observable<EstadoBudget> {
    return this.http.get<EstadoBudget>(
      `${environment.URL}/${API_ENDPOINTS.CUOTAS}/estado-budget`
    );
  }

  /**
   * GET /api/cuotas/ligas-disponibles-hoy
   * Devuelve las ligas con partidos para hoy, marcando las favoritas.
   */
  ligasDisponiblesHoy(): Observable<LigaDisponible[]> {
    return this.http.get<LigaDisponible[]>(
      `${environment.URL}/${API_ENDPOINTS.CUOTAS}/ligas-disponibles-hoy`
    );
  }

  /**
   * GET /api/cuotas/diagnostico
   * Devuelve el estado paso a paso de la ingesta para depurar fallos.
   */
  diagnostico(): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(
      `${environment.URL}/${API_ENDPOINTS.CUOTAS}/diagnostico`
    );
  }

  /**
   * GET /api/cuotas/diagnostico-raw/{idApi}
   * Consulta la API directamente para un fixture ID específico.
   * Consume 1 request del cupo diario. Útil para ver por qué un partido no tiene cuotas.
   */
  diagnosticoRaw(idApi: string): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(
      `${environment.URL}/${API_ENDPOINTS.CUOTAS}/diagnostico-raw/${idApi}`
    );
  }
}
