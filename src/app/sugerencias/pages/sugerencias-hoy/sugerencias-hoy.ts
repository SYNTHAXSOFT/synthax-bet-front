import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SugerenciasService } from '../../services/sugerencias.service';
import { Sugerencia, SugerenciaLinea } from '../../interfaces/sugerencia.interface';
import { PickService } from '../../../picks/services/pick.service';
import { AuthService } from '../../../auth/services/auth.service';
import { MercadoPipe } from '../../../shared/pipes/mercado.pipe';

@Component({
  selector: 'app-sugerencias-hoy',
  standalone: true,
  imports: [CommonModule, FormsModule, MercadoPipe],
  templateUrl: './sugerencias-hoy.html',
})
export class SugerenciasHoyPage implements OnInit {

  private sugerenciasService = inject(SugerenciasService);
  private pickService        = inject(PickService);
  private authService        = inject(AuthService);

  public sugerencias: Sugerencia[] = [];
  public cargando  = false;
  public publicando = false;
  public error     = '';
  public esAdmin   = false;

  // ── Modal publicar pick ────────────────────────────────────────────────
  public mostrarModalPick  = false;
  public lineaSeleccionada: SugerenciaLinea | null = null;

  // Campos editables en el modal
  public pickCuota:       number  = 0;
  public pickCanal:       string  = 'FREE';
  public pickCasa:        string  = '';

  public readonly canales = [
    { value: 'FREE',    label: 'FREE — pick público' },
    { value: 'VIP',     label: 'VIP — suscriptores' },
    { value: 'PREMIUM', label: 'PREMIUM — máxima confianza' },
  ];

  // ────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.esAdmin = ['ROOT', 'ADMINISTRADOR'].includes(this.authService.getUserRole() || '');
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.sugerenciasService.obtenerHoy().subscribe({
      next: (data) => { this.sugerencias = data; this.cargando = false; },
      error: (err) => {
        console.error('Error cargando sugerencias:', err);
        this.error = 'No se pudieron cargar las sugerencias. Verifica que el análisis del día esté ejecutado.';
        this.cargando = false;
      },
    });
  }

  // ── Sugerencia del día ───────────────────────────────────────────────────

  get sugerenciaDelDia(): Sugerencia | null {
    return this.sugerencias.find(s => s.descripcion.startsWith('⭐')) ?? this.sugerencias[0] ?? null;
  }

  get restoSugerencias(): Sugerencia[] {
    const delDia = this.sugerenciaDelDia;
    return this.sugerencias.filter(s => s !== delDia);
  }

  // ── Modal publicar pick ──────────────────────────────────────────────────

  abrirModalPick(linea: SugerenciaLinea): void {
    this.lineaSeleccionada = linea;
    this.pickCuota         = linea.cuota;
    this.pickCanal         = 'FREE';
    this.pickCasa          = '';
    this.mostrarModalPick  = true;
  }

  cerrarModalPick(): void {
    this.mostrarModalPick  = false;
    this.lineaSeleccionada = null;
  }

  publicarPick(): void {
    if (!this.lineaSeleccionada) return;
    if (!this.pickCuota || this.pickCuota < 1) {
      alert('La cuota debe ser mayor a 1.00');
      return;
    }

    this.publicando = true;
    const linea = this.lineaSeleccionada;

    this.pickService.crear({
      partidoId:    linea.idPartido,
      nombreMercado: linea.mercado,
      probabilidad:  linea.probabilidad,
      valorCuota:    this.pickCuota,
      casaApuestas:  this.pickCasa || 'Sin especificar',
      canal:         this.pickCanal,
    }).subscribe({
      next: () => {
        alert(`✓ Pick publicado correctamente en canal ${this.pickCanal}`);
        this.publicando = false;
        this.cerrarModalPick();
      },
      error: (err) => {
        console.error('Error publicando pick:', err);
        alert('Error: ' + (err.error?.error || err.error?.message || 'Error desconocido'));
        this.publicando = false;
      }
    });
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

  probabilidadPct(prob: number): string { return (prob * 100).toFixed(1) + '%'; }

  probabilidadCombinada(lineas: SugerenciaLinea[]): string {
    const prod = lineas.reduce((acc, l) => acc * l.probabilidad, 1);
    return (prod * 100).toFixed(1) + '%';
  }

  // ── Helpers de confianza ─────────────────────────────────────────────────

  getColorConfianza(confianza: number): string {
    const pct = confianza * 100;
    if (pct >= 75) return '#4caf50';
    if (pct >= 65) return '#2196f3';
    if (pct >= 55) return '#ffc107';
    return '#ff9800';
  }

  getBgConfianza(confianza: number): string { return this.getColorConfianza(confianza); }

  getLabelConfianza(confianza: number): string {
    const pct = confianza * 100;
    if (pct >= 75) return 'Confianza ALTA';
    if (pct >= 65) return 'Confianza MEDIA-ALTA';
    if (pct >= 55) return 'Confianza MEDIA';
    return 'Confianza BAJA';
  }

  // ── Edge ─────────────────────────────────────────────────────────────────

  edgePct(edge: number | undefined): string {
    if (!edge) return '';
    return (edge >= 0 ? '+' : '') + (edge * 100).toFixed(1) + '%';
  }

  getColorEdge(edge: number | undefined): string {
    if (!edge || edge === 0) return '#6c757d';
    if (edge >= 0.10) return '#4caf50';
    if (edge >= 0.05) return '#8bc34a';
    if (edge >= 0)    return '#ffc107';
    return '#f44336';
  }

  // ── Cuota real vs estimada ────────────────────────────────────────────────

  /**
   * Clase CSS del badge de cuota según si es real o estimada.
   * Real   → fondo dorado (text-bg-warning fw-bold)
   * Estimada → borde naranja + texto naranja, sin fondo sólido
   */
  getBadgeCuota(linea: SugerenciaLinea): string {
    return linea.cuotaReal === false
      ? 'badge rounded-pill fw-bold'
      : 'badge rounded-pill text-bg-warning fw-bold';
  }

  getEstiloCuota(linea: SugerenciaLinea): string {
    return linea.cuotaReal === false
      ? 'border: 1.5px solid #fd7e14; color: #fd7e14; background: transparent;'
      : '';
  }

  /** Prefijo de la cuota: ~ para estimada, vacío para real */
  getCuotaPrefix(linea: SugerenciaLinea): string {
    return linea.cuotaReal === false ? '~' : '';
  }

  /** Tooltip explicativo según el tipo de cuota */
  getTooltipCuota(linea: SugerenciaLinea): string {
    return linea.cuotaReal === false
      ? 'Cuota estimada por el modelo (prob. inversa). La API no incluye este mercado para esta liga en el plan actual. Verifica la cuota real en tu casa de apuestas antes de apostar.'
      : 'Cuota real obtenida de bookmaker. El edge muestra tu ventaja vs. la casa.';
  }

  /** ¿Mostrar badge de edge? Solo si cuotaReal=true y edge != 0 */
  mostrarEdge(linea: SugerenciaLinea): boolean {
    return linea.cuotaReal === true
        && linea.edge !== undefined
        && linea.edge !== null
        && linea.edge !== 0;
  }

  /** Cantidad de patas con cuota real en una sugerencia */
  countCuotasReales(sug: { selecciones: SugerenciaLinea[] }): number {
    return sug.selecciones.filter(l => l.cuotaReal === true).length;
  }

  /** ¿Todas las patas tienen cuota real? */
  todasReales(sug: { selecciones: SugerenciaLinea[] }): boolean {
    return sug.selecciones.every(l => l.cuotaReal === true);
  }
}
