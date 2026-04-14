export interface Pick {
  id?: number;
  partido: {
    id: number;
    equipoLocal: string;
    equipoVisitante: string;
    fechaPartido: string;
    liga?: string;
  };
  analisis?: { id: number };
  nombreMercado: string;
  categoriaMercado?: string;
  probabilidad: number;
  edge?: number;
  valorCuota: number;
  casaApuestas: string;
  canal: string;
  publicadoEn?: string;
  resultado: string;
  liquidadoEn?: string;
}

export interface CrearPickRequest {
  partidoId: number;
  analisisId?: number;
  nombreMercado: string;
  probabilidad: number;
  edge?: number;
  valorCuota: number;
  casaApuestas: string;
  canal: string;
  categoriaMercado?: string;
}

export interface RendimientoResolucion {
  picksResueltos:         number;
  ganados:                number;
  perdidos:               number;
  nulos:                  number;
  pendientesAun:          number;
  estadisticasActualizadas: EstadisticasPick;
}

export interface EstadisticasPick {
  totalPicks:       number;
  ganados:          number;
  perdidos:         number;
  nulos:            number;
  pendientes:       number;
  winRate:          number;
  roi:              number;
  rachaActual:      number;
  rachaDescripcion: string;
}
