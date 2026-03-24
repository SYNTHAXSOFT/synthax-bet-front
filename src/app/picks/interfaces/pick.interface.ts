export interface Pick {
  id?: number;
  partido: {
    id: number;
    equipoLocal: string;
    equipoVisitante: string;
    fechaPartido: string;
  };
  analisis?: { id: number };
  nombreMercado: string;
  probabilidad: number;
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
  valorCuota: number;
  casaApuestas: string;
  canal: string;
}
