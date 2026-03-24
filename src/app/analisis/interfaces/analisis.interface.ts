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
