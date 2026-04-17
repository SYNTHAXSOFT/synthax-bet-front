import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PickService } from '../../../picks/services/pick.service';
import { Pick, EstadisticasPick, RendimientoResolucion } from '../../../picks/interfaces/pick.interface';

@Component({
  selector: 'app-rendimiento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rendimiento.html',
})
export class RendimientoPage implements OnInit {

  private readonly pickService = inject(PickService);

  public picks:        Pick[]                   = [];
  public estadisticas: EstadisticasPick | null  = null;
  public ultimaResolucion: RendimientoResolucion | null = null;

  public cargando:   boolean = false;
  public resolviendo: boolean = false;
  public mensaje:    string  = '';
  public tipoMensaje: 'success' | 'info' | 'warning' | '' = '';

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.pickService.listar().subscribe({
      next: (data) => {
        this.picks = data.sort((a, b) =>
          new Date(b.publicadoEn ?? 0).getTime() - new Date(a.publicadoEn ?? 0).getTime()
        );
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
    this.pickService.estadisticas().subscribe({
      next: (e) => { this.estadisticas = e; }
    });
  }

  resolverPendientes(): void {
    if (this.resolviendo) return;
    this.resolviendo = true;
    this.mensaje = '';
    this.pickService.resolverPendientes().subscribe({
      next: (res) => {
        this.ultimaResolucion = res;
        this.estadisticas = res.estadisticasActualizadas;
        this.resolviendo = false;
        if (res.picksResueltos === 0) {
          this.mensaje = `No hay picks nuevos para resolver. Quedan ${res.pendientesAun} pendiente(s) con partidos aún no finalizados.`;
          this.tipoMensaje = 'info';
        } else {
          this.mensaje = `✓ ${res.picksResueltos} pick(s) resueltos: ${res.ganados} ganado(s), ${res.perdidos} perdido(s), ${res.nulos} nulo(s).`;
          this.tipoMensaje = 'success';
        }
        // Recargar lista para reflejar resultados actualizados
        this.cargarDatos();
      },
      error: (err) => {
        this.resolviendo = false;
        this.mensaje = 'Error al resolver picks: ' + (err.error?.error || 'Error desconocido');
        this.tipoMensaje = 'warning';
      }
    });
  }

  reactivarPick(id: number): void {
    if (!confirm('¿Reactivar este pick como PENDIENTE para que sea re-evaluado?')) return;
    this.pickService.reactivar(id).subscribe({
      next: () => {
        this.mensaje = '✓ Pick reactivado a PENDIENTE. Pulsa "Actualizar resultados" para re-evaluarlo.';
        this.tipoMensaje = 'info';
        this.cargarDatos();
      },
      error: (err) => {
        this.mensaje = 'Error al reactivar: ' + (err.error?.error || 'Error desconocido');
        this.tipoMensaje = 'warning';
      }
    });
  }

  // ── Filtros ──────────────────────────────────────────────────────────────

  get picksPendientes(): Pick[] {
    return this.picks.filter(p => p.resultado === 'PENDIENTE');
  }

  get picksGanados(): Pick[] {
    return this.picks.filter(p => p.resultado === 'GANADO');
  }

  get picksPerdidos(): Pick[] {
    return this.picks.filter(p => p.resultado === 'PERDIDO');
  }

  // ── Helpers de formato ───────────────────────────────────────────────────

  getBadgeResultado(resultado: string): string {
    switch (resultado) {
      case 'GANADO':    return 'badge bg-success';
      case 'PERDIDO':   return 'badge bg-danger';
      case 'NULO':      return 'badge bg-secondary';
      case 'PENDIENTE': return 'badge bg-warning text-dark';
      default:          return 'badge bg-secondary';
    }
  }

  getBadgeCategoria(cat?: string): string {
    switch (cat) {
      case 'GOLES':          return 'badge bg-primary';
      case 'CORNERS':        return 'badge bg-info text-dark';
      case 'TARJETAS':       return 'badge bg-warning text-dark';
      case 'RESULTADO':      return 'badge bg-success';
      case 'MARCADOR_EXACTO': return 'badge bg-dark';
      case 'HANDICAP':       return 'badge bg-secondary';
      default:               return 'badge bg-light text-dark';
    }
  }

  getColorRoi(roi: number): string {
    if (roi > 10)  return 'text-success fw-bold';
    if (roi > 0)   return 'text-success';
    if (roi === 0) return 'text-muted';
    return 'text-danger';
  }

  getIconoRacha(racha: number): string {
    if (racha > 2)  return 'fa-solid fa-fire text-warning';
    if (racha > 0)  return 'fa-solid fa-arrow-trend-up text-success';
    if (racha < -2) return 'fa-solid fa-skull text-danger';
    if (racha < 0)  return 'fa-solid fa-arrow-trend-down text-danger';
    return 'fa-solid fa-minus text-muted';
  }

  formatFecha(fecha: string | undefined): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  edgePct(edge?: number): string {
    if (edge == null) return '—';
    return (edge * 100).toFixed(1) + '%';
  }
}
