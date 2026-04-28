import { Component, inject, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SugerenciasService } from '../../services/sugerencias.service';
import { MercadoPipe } from '../../../shared/pipes/mercado.pipe';
import { FiltroSugerencia, Sugerencia, SugerenciaLinea } from '../../interfaces/sugerencia.interface';
import { PickService } from '../../../picks/services/pick.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-personalizar-sugerencias',
  standalone: true,
  imports: [CommonModule, FormsModule, MercadoPipe],
  templateUrl: './personalizar-sugerencias.html',
})
export class PersonalizarSugerenciasPage implements OnInit {

  private sugerenciasService = inject(SugerenciasService);
  private pickService        = inject(PickService);
  private authService        = inject(AuthService);
  private el = inject(ElementRef);

  // ── Estado general ────────────────────────────────────────────────────────
  public resultados: Sugerencia[] = [];
  public cargando   = false;
  public publicando = false;
  public error      = '';
  public buscado    = false;
  public esAdmin    = false;

  // ── Modal publicar pick ───────────────────────────────────────────────────
  public mostrarModalPick  = false;
  public lineaSeleccionada: SugerenciaLinea | null = null;
  public pickCuota: number = 0;
  public pickCanal: string = 'FREE';
  public pickCasa:  string = '';

  public readonly canales = [
    { value: 'FREE',    label: 'FREE — pick público' },
    { value: 'VIP',     label: 'VIP — suscriptores' },
    { value: 'PREMIUM', label: 'PREMIUM — máxima confianza' },
  ];

  // ── Ligas (multi-select buscable) ────────────────────────────────────────
  public todasLasLigas: string[]    = [];
  public ligasFiltradas: string[]   = [];
  public ligaTexto                  = '';
  public ligasSeleccionadas: string[] = [];   // multi-selección
  public mostrarDropdownLiga        = false;

  // ── Equipos (multi-select buscable) ──────────────────────────────────────
  public todosLosEquipos: string[]    = [];
  public equiposFiltrados: string[]   = [];
  public equipoTexto                  = '';
  public equiposSeleccionados: string[] = [];  // multi-selección
  public mostrarDropdownEquipo        = false;

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
    cuotaMinimaTotal: null as number | null,
    tipoApuesta:      '',
  };

  // ── Ciclo de vida ─────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.esAdmin = ['ROOT', 'ADMINISTRADOR'].includes(this.authService.getUserRole() || '');

    this.sugerenciasService.obtenerLigas().subscribe({
      next: (ligas) => {
        this.todasLasLigas  = ligas;
        this.ligasFiltradas = ligas;
      },
      error: () => { /* sin ligas disponibles */ }
    });

    this.sugerenciasService.obtenerEquipos().subscribe({
      next: (equipos) => {
        this.todosLosEquipos  = equipos;
        this.equiposFiltrados = equipos;
      },
      error: () => { /* sin equipos disponibles */ }
    });
  }

  // ── Lógica del select buscable ────────────────────────────────────────────

  /** Cuando el usuario escribe en el campo de liga */
  onLigaInput(): void {
    const texto = this.ligaTexto.toLowerCase().trim();
    this.ligasFiltradas = texto
      ? this.todasLasLigas.filter(l => l.toLowerCase().includes(texto))
      : this.todasLasLigas;
    this.mostrarDropdownLiga = true;
  }

  onLigaFocus(): void {
    this.ligasFiltradas    = this.todasLasLigas.filter(l => !this.ligasSeleccionadas.includes(l));
    this.mostrarDropdownLiga = true;
  }

  seleccionarLiga(liga: string): void {
    if (!this.ligasSeleccionadas.includes(liga)) {
      this.ligasSeleccionadas.push(liga);
    }
    this.ligaTexto       = '';
    this.ligasFiltradas  = this.todasLasLigas.filter(l => !this.ligasSeleccionadas.includes(l));
    this.mostrarDropdownLiga = false;
  }

  quitarLiga(liga: string): void {
    this.ligasSeleccionadas = this.ligasSeleccionadas.filter(l => l !== liga);
  }

  limpiarLiga(): void {
    this.ligaTexto           = '';
    this.ligasSeleccionadas  = [];
    this.ligasFiltradas      = this.todasLasLigas;
    this.mostrarDropdownLiga = false;
  }

  // ── Lógica multi-select de Equipo ─────────────────────────────────────────

  onEquipoInput(): void {
    const texto = this.equipoTexto.toLowerCase().trim();
    this.equiposFiltrados = (texto
      ? this.todosLosEquipos.filter(e => e.toLowerCase().includes(texto))
      : this.todosLosEquipos
    ).filter(e => !this.equiposSeleccionados.includes(e));
    this.mostrarDropdownEquipo = true;
  }

  onEquipoFocus(): void {
    this.equiposFiltrados      = this.todosLosEquipos.filter(e => !this.equiposSeleccionados.includes(e));
    this.mostrarDropdownEquipo = true;
  }

  seleccionarEquipo(equipo: string): void {
    if (!this.equiposSeleccionados.includes(equipo)) {
      this.equiposSeleccionados.push(equipo);
    }
    this.equipoTexto         = '';
    this.equiposFiltrados    = this.todosLosEquipos.filter(e => !this.equiposSeleccionados.includes(e));
    this.mostrarDropdownEquipo = false;
  }

  quitarEquipo(equipo: string): void {
    this.equiposSeleccionados = this.equiposSeleccionados.filter(e => e !== equipo);
  }

  limpiarEquipo(): void {
    this.equipoTexto          = '';
    this.equiposSeleccionados = [];
    this.equiposFiltrados     = this.todosLosEquipos;
    this.mostrarDropdownEquipo = false;
  }

  /** Cerrar ambos dropdowns si el usuario hace click fuera del componente */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.mostrarDropdownLiga  = false;
      this.mostrarDropdownEquipo = false;
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
      equiposBuscados:  this.equiposSeleccionados,
      ligasBuscadas:    this.ligasSeleccionadas,
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
      cuotaMinimaTotal: null,
      tipoApuesta:      '',
    };
    this.categoriasSeleccionadas  = [];
    this.limpiarLiga();
    this.limpiarEquipo();
    this.ligasSeleccionadas   = [];
    this.equiposSeleccionados = [];
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

  // ── Modal publicar pick ───────────────────────────────────────────────────

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
      partidoId:        linea.idPartido,
      nombreMercado:    linea.mercado,
      probabilidad:     linea.probabilidad,
      edge:             linea.edge,
      valorCuota:       this.pickCuota,
      casaApuestas:     this.pickCasa || 'Sin especificar',
      canal:            this.pickCanal,
      categoriaMercado: linea.categoria,
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

  // ── Edge ─────────────────────────────────────────────────────────────────

  edgePct(edge: number | undefined): string {
    if (edge === undefined || edge === null) return '';
    return (edge >= 0 ? '+' : '') + (edge * 100).toFixed(1) + '%';
  }

  getColorEdge(edge: number | undefined): string {
    if (edge === undefined || edge === null || edge === 0) return '#6c757d';
    if (edge >= 0.10) return '#4caf50';
    if (edge >= 0.05) return '#8bc34a';
    if (edge >= 0)    return '#ffc107';
    return '#f44336';
  }

  mostrarEdge(linea: SugerenciaLinea): boolean {
    return linea.cuotaReal === true
        && linea.edge !== undefined
        && linea.edge !== null
        && linea.edge !== 0;
  }

  // ── Cuota real vs estimada ────────────────────────────────────────────────

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

  getCuotaPrefix(linea: SugerenciaLinea): string {
    return linea.cuotaReal === false ? '~' : '';
  }

  getTooltipCuota(linea: SugerenciaLinea): string {
    return linea.cuotaReal === false
      ? 'Cuota estimada por el modelo (prob. inversa). La API no incluye este mercado para esta liga en el plan actual. Verifica la cuota real en tu casa de apuestas antes de apostar.'
      : 'Cuota real obtenida de bookmaker. El edge muestra tu ventaja vs. la casa.';
  }

  countCuotasReales(sug: { selecciones: SugerenciaLinea[] }): number {
    return sug.selecciones.filter(l => l.cuotaReal === true).length;
  }

  todasReales(sug: { selecciones: SugerenciaLinea[] }): boolean {
    return sug.selecciones.every(l => l.cuotaReal === true);
  }
}
