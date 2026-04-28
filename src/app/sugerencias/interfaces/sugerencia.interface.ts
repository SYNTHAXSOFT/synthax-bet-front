export interface SugerenciaLinea {
  idPartido:    number;
  partido:      string;
  liga:         string;
  horaPartido?: string | null;   // "15:00" hora colombiana — null si no está disponible
  categoria:    string;
  mercado:      string;
  probabilidad: number;
  cuota:        number;
  edge?:        number;
  cuotaReal?:   boolean;
}

export interface Sugerencia {
  tipo:                  string;   // "Simple" | "Doble" | "Triple"
  selecciones:           SugerenciaLinea[];
  probabilidadCombinada: number;
  cuotaCombinada:        number;
  descripcion:           string;
  confianzaPromedio:     number;   // promedio de probabilidad por pata (métrica de calidad real)
}

export interface FiltroSugerencia {
  probMinima:       number | null;
  probMaxima:       number | null;
  cuotaMinimaTotal: number | null;
  equiposBuscados:  string[];        // multi-selección de equipos
  ligasBuscadas:    string[];        // multi-selección de ligas
  tipoApuesta:      string | null;   // "Simple" | "Doble" | "Triple" | null = todos
  categorias:       string[];        // [] = todas
}
