export interface Partido {
  id?: number;
  idPartidoApi: number;
  equipoLocal: string;
  equipoVisitante: string;
  liga: string;
  pais: string;
  temporada: string;
  ronda?: string;
  fechaPartido: string;
  arbitro?: string;
  estado: string;
  logoLocal?: string;
  logoVisitante?: string;
  logoLiga?: string;
  golesLocal?: number;
  golesVisitante?: number;
  sincronizadoEn?: string;
}
