import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PickService } from '../../services/pick.service';
import { Pick, EstadisticasPick } from '../../interfaces/pick.interface';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-picks-listar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './picks-listar.html',
})
export class PicksListarPage implements OnInit {

  private readonly pickService  = inject(PickService);
  private readonly authService  = inject(AuthService);

  public picks:        Pick[]              = [];
  public estadisticas: EstadisticasPick | null = null;
  public cargando:     boolean = false;
  public esAdmin:      boolean = false;

  // Confirmación de liquidación
  public pickEnLiquidacion: Pick | null = null;

  ngOnInit(): void {
    this.esAdmin = ['ROOT', 'ADMINISTRADOR'].includes(this.authService.getUserRole() || '');
    this.cargarTodo();
  }

  cargarTodo(): void {
    this.cargarPicks();
    this.cargarEstadisticas();
  }

  cargarPicks(): void {
    this.cargando = true;
    this.pickService.listar().subscribe({
      next: (data) => {
        // Más recientes primero
        this.picks = data.sort((a, b) =>
          new Date(b.publicadoEn ?? 0).getTime() - new Date(a.publicadoEn ?? 0).getTime()
        );
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar picks:', err);
        this.cargando = false;
      }
    });
  }

  cargarEstadisticas(): void {
    this.pickService.estadisticas().subscribe({
      next: (data) => { this.estadisticas = data; },
      error: (err) => console.error('Error al cargar estadísticas:', err)
    });
  }

  // ── Liquidación ──────────────────────────────────────────────────────────

  iniciarLiquidacion(pick: Pick): void {
    this.pickEnLiquidacion = pick;
  }

  cancelarLiquidacion(): void {
    this.pickEnLiquidacion = null;
  }

  confirmarLiquidacion(resultado: 'GANADO' | 'PERDIDO' | 'NULO'): void {
    if (!this.pickEnLiquidacion?.id) return;

    this.pickService.liquidar(this.pickEnLiquidacion.id, resultado).subscribe({
      next: () => {
        this.pickEnLiquidacion = null;
        this.cargarTodo();
      },
      error: (err) => {
        console.error('Error al liquidar:', err);
        alert('Error: ' + (err.error?.error || 'Error desconocido'));
        this.pickEnLiquidacion = null;
      }
    });
  }

  // ── Helpers de estilo ────────────────────────────────────────────────────

  getBadgeResultado(resultado: string): string {
    switch (resultado) {
      case 'GANADO':    return 'badge bg-success';
      case 'PERDIDO':   return 'badge bg-danger';
      case 'NULO':      return 'badge bg-secondary';
      case 'PENDIENTE': return 'badge bg-warning text-dark';
      default:          return 'badge bg-secondary';
    }
  }

  getBadgeCanal(canal: string): string {
    switch (canal) {
      case 'FREE':    return 'badge bg-secondary';
      case 'VIP':     return 'badge bg-primary';
      case 'PREMIUM': return 'badge bg-warning text-dark';
      default:        return 'badge bg-secondary';
    }
  }

  getColorRoi(roi: number): string {
    if (roi > 10)  return 'text-success fw-bold';
    if (roi > 0)   return 'text-success';
    if (roi === 0) return 'text-muted';
    return 'text-danger';
  }

  getColorRacha(racha: number): string {
    if (racha > 0) return 'text-success fw-bold';
    if (racha < 0) return 'text-danger fw-bold';
    return 'text-muted';
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
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}
