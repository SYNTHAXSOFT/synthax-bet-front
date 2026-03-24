import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalisisService } from '../../services/analisis.service';
import { Analisis } from '../../interfaces/analisis.interface';
import { AuthService } from '../../../auth/services/auth.service';
import { CATEGORIA_ANALISIS, NIVEL_CONFIANZA } from '../../../utils/constantes-utils';

@Component({
  selector: 'app-analisis-listar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analisis-listar.html',
})
export class AnalisisListarPage implements OnInit {

  private readonly analisisService = inject(AnalisisService);
  private readonly authService = inject(AuthService);

  // Lista completa traída del backend (sin filtrar)
  private analisisCompletos: Analisis[] = [];

  // Lista que se muestra en la tabla (filtrada)
  public analisisList: Analisis[] = [];

  public cargando: boolean = false;
  public ejecutando: boolean = false;
  public esAdmin: boolean = false;

  // Filtros
  public categoriaFiltro: string = '';
  public confianzaFiltro: string = '';
  public mercadoFiltro: string = '';
  public equipoFiltro: string = '';
  public probabilidadMinima: number = 0;

  public readonly categorias: string[] = Object.values(CATEGORIA_ANALISIS);
  public readonly nivelesConfianza: string[] = Object.values(NIVEL_CONFIANZA);
  public readonly opcionesProbabilidad = [
    { label: 'Todas',   valor: 0   },
    { label: '≥ 50%',  valor: 0.50 },
    { label: '≥ 60%',  valor: 0.60 },
    { label: '≥ 70%',  valor: 0.70 },
    { label: '≥ 80%',  valor: 0.80 },
    { label: '≥ 90%',  valor: 0.90 },
  ];

  get totalCompleto(): number { return this.analisisCompletos.length; }
  get totalFiltrado(): number { return this.analisisList.length; }
  get hayFiltrosActivos(): boolean {
    return !!(this.categoriaFiltro || this.confianzaFiltro || this.mercadoFiltro || this.equipoFiltro || this.probabilidadMinima);
  }

  ngOnInit(): void {
    this.esAdmin = ['ROOT', 'ADMINISTRADOR'].includes(this.authService.getUserRole() || '');
    this.cargarAnalisis();
  }

  cargarAnalisis(): void {
    this.cargando = true;
    this.analisisService.obtenerHoy().subscribe({
      next: (data) => {
        this.analisisCompletos = data;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar análisis:', error);
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.analisisCompletos];

    if (this.categoriaFiltro) {
      resultado = resultado.filter(a => a.categoriaMercado === this.categoriaFiltro);
    }

    if (this.confianzaFiltro) {
      resultado = resultado.filter(a => a.nivelConfianza === this.confianzaFiltro);
    }

    if (this.equipoFiltro.trim()) {
      const texto = this.equipoFiltro.trim().toLowerCase();
      resultado = resultado.filter(a =>
        a.partido.equipoLocal.toLowerCase().includes(texto) ||
        a.partido.equipoVisitante.toLowerCase().includes(texto)
      );
    }

    if (this.mercadoFiltro.trim()) {
      const texto = this.mercadoFiltro.trim().toLowerCase();
      resultado = resultado.filter(a =>
        a.nombreMercado?.toLowerCase().includes(texto)
      );
    }

    if (this.probabilidadMinima > 0) {
      resultado = resultado.filter(a => a.probabilidad >= this.probabilidadMinima);
    }

    this.analisisList = resultado;
  }

  limpiarFiltros(): void {
    this.categoriaFiltro = '';
    this.confianzaFiltro = '';
    this.mercadoFiltro = '';
    this.equipoFiltro = '';
    this.probabilidadMinima = 0;
    this.analisisList = [...this.analisisCompletos];
  }

  ejecutarAnalisis(): void {
    if (!confirm('¿Ejecutar análisis completo del día? Esto puede tardar unos segundos.')) return;
    this.ejecutando = true;
    this.analisisService.ejecutar().subscribe({
      next: () => {
        alert('Análisis ejecutado exitosamente');
        this.ejecutando = false;
        this.limpiarFiltros();
        this.cargarAnalisis();
      },
      error: (error) => {
        console.error('Error al ejecutar análisis:', error);
        alert('Error: ' + (error.error?.mensaje || 'Error desconocido'));
        this.ejecutando = false;
      }
    });
  }

  getBadgeConfianza(nivel: string): string {
    switch (nivel) {
      case 'MUY_ALTA': return 'badge bg-success';
      case 'ALTA':     return 'badge bg-primary';
      case 'MEDIA':    return 'badge bg-warning text-dark';
      case 'BAJA':     return 'badge bg-secondary';
      default:         return 'badge bg-secondary';
    }
  }

  getBadgeCategoria(categoria: string): string {
    switch (categoria) {
      case 'RESULTADO':       return 'badge bg-primary';
      case 'GOLES':           return 'badge bg-danger';
      case 'MARCADOR_EXACTO': return 'badge bg-dark';
      case 'HANDICAP':        return 'badge bg-purple text-white';
      case 'CORNERS':         return 'badge bg-info text-dark';
      case 'TARJETAS':        return 'badge bg-warning text-dark';
      default:                return 'badge bg-secondary';
    }
  }

  getLabelCategoria(categoria: string): string {
    switch (categoria) {
      case 'RESULTADO':       return 'Resultado';
      case 'GOLES':           return 'Goles';
      case 'MARCADOR_EXACTO': return 'Marcador Exacto';
      case 'HANDICAP':        return 'Hándicap';
      case 'CORNERS':         return 'Corners';
      case 'TARJETAS':        return 'Tarjetas';
      case 'TIROS':           return 'Tiros';
      case 'FALTAS':          return 'Faltas';
      case 'JUGADOR':         return 'Jugador';
      default:                return categoria;
    }
  }
}
