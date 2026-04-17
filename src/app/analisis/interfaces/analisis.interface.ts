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
