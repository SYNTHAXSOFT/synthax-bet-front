export interface SugerenciaLinea {
  idPartido:    number;
  partido:      string;
  liga:         string;
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
  equipoBuscado:    string | null;
  ligaBuscada:      string | null;   // liga completa, ej: "Premier League"
  tipoApuesta:      string | null;   // "Simple" | "Doble" | "Triple" | null = todos
  categorias:       string[];        // [] = todas
}
