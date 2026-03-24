import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartidoService } from '../../services/partido.service';
import { Partido } from '../../interfaces/partido.interface';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-partidos-listar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partidos-listar.html',
})
export class PartidosListarPage implements OnInit {

  private readonly partidoService = inject(PartidoService);
  private readonly authService = inject(AuthService);

  public partidosCompletos: Partido[] = [];

  public partidos: Partido[] = [];
  public cargando: boolean = false;
  public sincronizando: boolean = false;
  public esAdmin: boolean = false;
  public equipoFiltro: string = '';

  get hayFiltro(): boolean { return this.equipoFiltro.trim().length > 0; }

  ngOnInit(): void {
    this.esAdmin = ['ROOT', 'ADMINISTRADOR'].includes(this.authService.getUserRole() || '');
    this.cargarPartidos();
  }

  cargarPartidos(): void {
    this.cargando = true;
    this.partidoService.obtenerHoy().subscribe({
      next: (data) => {
        this.partidosCompletos = data;
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar partidos:', error);
        this.cargando = false;
      }
    });
  }

  aplicarFiltro(): void {
    const texto = this.equipoFiltro.trim().toLowerCase();
    if (!texto) {
      this.partidos = [...this.partidosCompletos];
      return;
    }
    this.partidos = this.partidosCompletos.filter(p =>
      p.equipoLocal.toLowerCase().includes(texto) ||
      p.equipoVisitante.toLowerCase().includes(texto)
    );
  }

  limpiarFiltro(): void {
    this.equipoFiltro = '';
    this.partidos = [...this.partidosCompletos];
  }

  sincronizar(): void {
    if (!confirm('¿Sincronizar partidos desde la API?')) return;
    this.sincronizando = true;
    this.partidoService.sincronizar().subscribe({
      next: () => {
        alert('Partidos sincronizados exitosamente');
        this.sincronizando = false;
        this.equipoFiltro = '';
        this.cargarPartidos();
      },
      error: (error) => {
        console.error('Error al sincronizar:', error);
        alert('Error al sincronizar: ' + (error.error?.mensaje || 'Error desconocido'));
        this.sincronizando = false;
      }
    });
  }

  getBadgeEstado(estado: string): string {
    switch (estado) {
      case 'PROGRAMADO':  return 'badge bg-secondary';
      case 'EN_VIVO':     return 'badge bg-danger';
      case 'FINALIZADO':  return 'badge bg-success';
      case 'CANCELADO':   return 'badge bg-warning text-dark';
      default:            return 'badge bg-secondary';
    }
  }
}
