import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PickService } from '../../services/pick.service';
import { Pick } from '../../interfaces/pick.interface';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-picks-listar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './picks-listar.html',
})
export class PicksListarPage implements OnInit {

  private readonly pickService = inject(PickService);
  private readonly authService = inject(AuthService);

  public picks: Pick[] = [];
  public cargando: boolean = false;
  public esAdmin: boolean = false;

  ngOnInit(): void {
    this.esAdmin = ['ROOT', 'ADMINISTRADOR'].includes(this.authService.getUserRole() || '');
    this.cargarPicks();
  }

  cargarPicks(): void {
    this.cargando = true;
    this.pickService.listar().subscribe({
      next: (data) => {
        this.picks = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar picks:', error);
        this.cargando = false;
      }
    });
  }

  liquidar(pick: Pick): void {
    if (!pick.id) return;
    const resultados = ['GANADO', 'PERDIDO', 'NULO'];
    const resultado = prompt(`Liquidar pick "${pick.nombreMercado}"\nResultado (${resultados.join(' / ')}):`);
    if (!resultado || !resultados.includes(resultado.toUpperCase())) {
      alert('Resultado inválido');
      return;
    }
    this.pickService.liquidar(pick.id, resultado.toUpperCase()).subscribe({
      next: () => {
        alert('Pick liquidado exitosamente');
        this.cargarPicks();
      },
      error: (error) => {
        console.error('Error al liquidar pick:', error);
        alert('Error al liquidar: ' + (error.error?.mensaje || 'Error desconocido'));
      }
    });
  }

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
      case 'TELEGRAM': return 'badge bg-info text-dark';
      case 'WEB':      return 'badge bg-primary';
      default:         return 'badge bg-secondary';
    }
  }
}
