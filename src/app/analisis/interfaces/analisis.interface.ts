export interface Analisis {
  id?: number;
  partido: {
    id: number;
    equipoLocal: string;
    equipoVisitante: string;
    fechaPartido: string;
  };
  categoriaMercado: string;
  nombreMercado: string;
  probabilidad: number;
  nivelConfianza: string;
  variablesUsadas?: string;
  calculadoEn?: string;
}

export interface FiltroAnalisis {
  probabilidadMinima?: number;
  categoria?: string;
}

export interface LigaDisponible {
  idLigaApi: string;
  nombre: string;
  pais: string;
  partidosHoy: number;
  favorita: boolean;
}

/** Estado de ejecución del motor — se consulta vía polling para la barra de progreso */
export interface ProgresoAnalisis {
  ejecutando:  boolean;
  fase:        'ANALISIS' | 'CUOTAS' | 'IDLE';
  progreso:    number;
  total:       number;
  porcentaje:  number;
  detalle:     string;
}

/**
 * Resultado de comparar una predicción del motor contra el resultado real.
 *
 * acerto:
 *   true  → la predicción fue correcta
 *   false → la predicción fue incorrecta
 *   null  → push (AH en empate exacto) o partido no finalizado
 *
 * verificable:
 *   true  → categoría evaluable (RESULTADO, GOLES, MARCADOR_EXACTO, HANDICAP)
 *            Y partido ya finalizado
 *   false → categoría no evaluable (CORNERS, TARJETAS…) o sin resultado real
 */
export interface ResolucionAnalisis {
  idPartido:      number;
  partido:        string;   // "Real Madrid vs Barcelona"
  liga:           string;
  horaPartido:    string | null;
  fechaPartido:   string | null;  // "28/04/2025" formato dd/MM/yyyy
  categoria:      string;
  mercado:        string;
  probabilidad:   number;
  resultadoReal:  string | null;  // "2-1" | null si no finalizado
  golesLocal:     number | null;
  golesVisitante: number | null;
  acerto:           boolean | null;
  verificable:      boolean;
  // Datos de la casa de apuestas
  cuota:            number | null;
  edge:             number | null;
  candidataSugerida: boolean | null;
}
