import { Component, inject, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SugerenciasService } from '../../services/sugerencias.service';
import { FiltroSugerencia, Sugerencia, SugerenciaLinea } from '../../interfaces/sugerencia.interface';

@Component({
  selector: 'app-personalizar-sugerencias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personalizar-sugerencias.html',
})
export class PersonalizarSugerenciasPage implements OnInit {

  private sugerenciasService = inject(SugerenciasService);
  private el = inject(ElementRef);

  // ── Estado general ────────────────────────────────────────────────────────
  public resultados: Sugerencia[] = [];
  public cargando = false;
  public error = '';
  public buscado = false;

  // ── Ligas (select buscable) ───────────────────────────────────────────────
  public todasLasLigas: string[]   = [];   // lista completa cargada del backend
  public ligasFiltradas: string[]  = [];   // lista que se muestra según lo escrito
  public ligaTexto      = '';              // texto visible en el input
  public ligaSeleccionada = '';            // valor que se envía al backend
  public mostrarDropdownLiga = false;      // controla si el panel está abierto

  // ── Categorías disponibles ───────────────────────────────────────────────
  public categoriaOpciones = [
    { valor: 'GOLES',           label: 'Goles',          icono: 'fa-solid fa-futbol' },
    { valor: 'RESULTADO',       label: 'Resultado',       icono: 'fa-solid fa-ranking-star' },
    { valor: 'CORNERS',         label: 'Corners',         icono: 'fa-solid fa-flag' },
    { valor: 'TARJETAS',        label: 'Tarjetas',        icono: 'fa-solid fa-square' },
    { valor: 'HANDICAP',        label: 'Hándicap',        icono: 'fa-solid fa-scale-balanced' },
    { valor: 'MARCADOR_EXACTO', label: 'Marcador Exacto', icono: 'fa-solid fa-bullseye' },
  ];
  public categoriasSeleccionadas: string[] = [];

  // ── Filtros (con valores por defecto) ────────────────────────────────────
  public filtro = {
    probMinima:       50,
    probMaxima:       100,
    cuotaMinimaTotal: 1.80,
    equipoBuscado:    '',
    tipoApuesta:      '',
  };

  // ── Ciclo de vida ─────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.sugerenciasService.obtenerLigas().subscribe({
      next: (ligas) => {
        this.todasLasLigas  = ligas;
        this.ligasFiltradas = ligas;
      },
      error: () => { /* sin ligas disponibles, el campo sigue funcionando como texto libre */ }
    });
  }

  // ── Lógica del select buscable ────────────────────────────────────────────

  /** Cuando el usuario escribe en el campo de liga */
  onLigaInput(): void {
    const texto = this.ligaTexto.toLowerCase().trim();
    this.ligasFiltradas = texto
      ? this.todasLasLigas.filter(l => l.toLowerCase().includes(texto))
      : this.todasLasLigas;
    this.ligaSeleccionada = '';          // se limpia hasta que elija una opción
    this.mostrarDropdownLiga = true;
  }

  /** Cuando el usuario hace foco en el campo */
  onLigaFocus(): void {
    this.ligasFiltradas    = this.todasLasLigas;
    this.mostrarDropdownLiga = true;
  }

  /** Cuando el usuario elige una liga de la lista */
  seleccionarLiga(liga: string): void {
    this.ligaTexto        = liga;
    this.ligaSeleccionada = liga;
    this.mostrarDropdownLiga = false;
  }

  /** Limpiar la liga seleccionada */
  limpiarLiga(): void {
    this.ligaTexto           = '';
    this.ligaSeleccionada    = '';
    this.ligasFiltradas      = this.todasLasLigas;
    this.mostrarDropdownLiga = false;
  }

  /** Cerrar el dropdown si el usuario hace click fuera del componente */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.mostrarDropdownLiga = false;
    }
  }

  // ── Acciones principales ──────────────────────────────────────────────────

  buscar(): void {
    this.cargando = true;
    this.error    = '';
    this.buscado  = true;
    this.resultados = [];

    const payload: FiltroSugerencia = {
      probMinima:       this.filtro.probMinima / 100,
      probMaxima:       this.filtro.probMaxima / 100,
      cuotaMinimaTotal: this.filtro.cuotaMinimaTotal,
      equipoBuscado:    this.filtro.equipoBuscado.trim() || null,
      ligaBuscada:      this.ligaSeleccionada || this.ligaTexto.trim() || null,
      tipoApuesta:      this.filtro.tipoApuesta || null,
      categorias:       this.categoriasSeleccionadas,
    };

    this.sugerenciasService.personalizar(payload).subscribe({
      next: (data) => {
        this.resultados = data;
        this.cargando   = false;
      },
      error: (err) => {
        console.error('Error en sugerencias personalizadas:', err);
        this.error    = 'No se pudieron obtener sugerencias con esos filtros.';
        this.cargando = false;
      },
    });
  }

  limpiar(): void {
    this.filtro = {
      probMinima:       50,
      probMaxima:       100,
      cuotaMinimaTotal: 1.80,
      equipoBuscado:    '',
      tipoApuesta:      '',
    };
    this.categoriasSeleccionadas = [];
    this.limpiarLiga();
    this.resultados = [];
    this.error      = '';
    this.buscado    = false;
  }

  toggleCategoria(valor: string): void {
    const idx = this.categoriasSeleccionadas.indexOf(valor);
    if (idx >= 0) {
      this.categoriasSeleccionadas.splice(idx, 1);
    } else {
      this.categoriasSeleccionadas.push(valor);
    }
  }

  categoriaSeleccionada(valor: string): boolean {
    return this.categoriasSeleccionadas.includes(valor);
  }

  // ── Helpers de presentación ───────────────────────────────────────────────

  probabilidadPct(prob: number): string {
    return (prob * 100).toFixed(1) + '%';
  }

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

  getBgConfianza(confianza: number): string {
    const pct = confianza * 100;
    if (pct >= 75) return '#4caf50';
    if (pct >= 65) return '#2196f3';
    if (pct >= 55) return '#ffc107';
    return '#ff9800';
  }

  getColorBarraCuota(cuota: number): string {
    if (cuota >= 3.0) return 'bg-danger';
    if (cuota >= 2.0) return 'bg-warning';
    return 'bg-success';
  }

  getAnchoBarra(cuota: number): string {
    const pct = Math.min(100, ((cuota - 1.0) / 4.0) * 100);
    return pct.toFixed(0) + '%';
  }
}
