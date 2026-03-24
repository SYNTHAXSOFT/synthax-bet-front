import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SugerenciasService } from '../../services/sugerencias.service';
import { Sugerencia, SugerenciaLinea } from '../../interfaces/sugerencia.interface';

@Component({
  selector: 'app-sugerencias-hoy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sugerencias-hoy.html',
})
export class SugerenciasHoyPage implements OnInit {

  private sugerenciasService = inject(SugerenciasService);

  public sugerencias: Sugerencia[] = [];
  public cargando = false;
  public error = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.sugerenciasService.obtenerHoy().subscribe({
      next: (data) => {
        this.sugerencias = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando sugerencias:', err);
        this.error = 'No se pudieron cargar las sugerencias. Verifica que el análisis del día esté ejecutado.';
        this.cargando = false;
      },
    });
  }

  get sugerenciaDelDia(): Sugerencia | null {
    return this.sugerencias.find(s => s.descripcion.startsWith('⭐')) ?? this.sugerencias[0] ?? null;
  }

  get restoSugerencias(): Sugerencia[] {
    const delDia = this.sugerenciaDelDia;
    return this.sugerencias.filter(s => s !== delDia);
  }

  // ── Helpers de tipo ──────────────────────────────────────────────────────

  getBadgeTipo(tipo: string): string {
    switch (tipo) {
      case 'Simple': return 'badge bg-primary';
      case 'Doble':  return 'badge bg-warning text-dark';
      case 'Triple': return 'badge bg-danger';
      default:       return 'badge bg-secondary';
    }
  }

  getIconoTipo(tipo: string): string {
    switch (tipo) {
      case 'Simple': return 'fa-solid fa-circle-check';
      case 'Doble':  return 'fa-solid fa-layer-group';
      case 'Triple': return 'fa-solid fa-trophy';
      default:       return 'fa-solid fa-star';
    }
  }

  // ── Helpers de categoría ─────────────────────────────────────────────────

  getBadgeCategoria(cat: string): string {
    switch (cat) {
      case 'RESULTADO':        return 'badge bg-primary';
      case 'GOLES':            return 'badge bg-danger';
      case 'MARCADOR_EXACTO':  return 'badge bg-dark';
      case 'HANDICAP':         return 'badge bg-purple text-white';
      case 'CORNERS':          return 'badge bg-info text-dark';
      case 'TARJETAS':         return 'badge bg-warning text-dark';
      default:                 return 'badge bg-secondary';
    }
  }

  getLabelCategoria(cat: string): string {
    switch (cat) {
      case 'RESULTADO':        return 'Resultado';
      case 'GOLES':            return 'Goles';
      case 'MARCADOR_EXACTO':  return 'Marcador Exacto';
      case 'HANDICAP':         return 'Hándicap';
      case 'CORNERS':          return 'Corners';
      case 'TARJETAS':         return 'Tarjetas';
      default:                 return cat;
    }
  }

  // ── Helpers de probabilidad ──────────────────────────────────────────────

  probabilidadPct(prob: number): string {
    return (prob * 100).toFixed(1) + '%';
  }

  probabilidadCombinada(lineas: SugerenciaLinea[]): string {
    const prod = lineas.reduce((acc, l) => acc * l.probabilidad, 1);
    return (prod * 100).toFixed(1) + '%';
  }

  // ── Helpers de confianza (nueva métrica de calidad) ──────────────────────
  //
  // confianzaPromedio = promedio de probabilidades individuales por pata.
  // Escala de interpretación:
  //   ≥ 75% → ALTA (triple con patas ~78%)    → verde
  //   ≥ 65% → MEDIA-ALTA (doble con ~70%)     → azul
  //   ≥ 55% → MEDIA (doble conservador ~60%)  → amarillo
  //    < 55% → BAJA (single ~50-54%)           → naranja

  getColorConfianza(confianza: number): string {
    const pct = confianza * 100;
    if (pct >= 75) return '#4caf50';  // verde
    if (pct >= 65) return '#2196f3';  // azul
    if (pct >= 55) return '#ffc107';  // amarillo
    return '#ff9800';                 // naranja
  }

  getBgConfianza(confianza: number): string {
    const pct = confianza * 100;
    if (pct >= 75) return '#4caf50';
    if (pct >= 65) return '#2196f3';
    if (pct >= 55) return '#ffc107';
    return '#ff9800';
  }

  getLabelConfianza(confianza: number): string {
    const pct = confianza * 100;
    if (pct >= 75) return 'Confianza ALTA';
    if (pct >= 65) return 'Confianza MEDIA-ALTA';
    if (pct >= 55) return 'Confianza MEDIA';
    return 'Confianza BAJA';
  }
}
