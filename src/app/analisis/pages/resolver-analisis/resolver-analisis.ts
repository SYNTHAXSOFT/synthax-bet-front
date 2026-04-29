import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalisisService } from '../../services/analisis.service';
import { ResolucionAnalisis } from '../../interfaces/analisis.interface';

type Filtro = 'todos' | 'gano' | 'fallo' | 'nulo' | 'sinResultado';

interface CatStat {
  categoria:   string;
  label:       string;
  evaluados:   number;
  ganados:     number;
  perdidos:    number;
  pct:         number | null;
  badge:       string;
}

@Component({
  selector: 'app-resolver-analisis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resolver-analisis.html',
})
export class ResolverAnalisisPage implements OnInit {

  private readonly analisisService = inject(AnalisisService);

  // ── Estado ──────────────────────────────────────────────────────────────
  public readonly cargando              = signal(false);
  public readonly descargando           = signal(false);
  public readonly error                 = signal('');
  public readonly items                 = signal<ResolucionAnalisis[]>([]);
  public readonly fechasDisponibles     = signal<string[]>([]);
  public readonly fechaSeleccionada     = signal<string | null>(null);  // null = en vivo

  // ── Filtros ──────────────────────────────────────────────────────────────
  public filtroActivo: Filtro = 'todos';
  public categoriaBusqueda = '';
  public mercadoBusqueda   = '';
  public partidoBusqueda   = '';

  // ── Items filtrados ───────────────────────────────────────────────────────
  public readonly itemsFiltrados = computed(() => {
    let lista = this.items();

    switch (this.filtroActivo) {
      case 'gano':        lista = lista.filter(i => i.verificable && i.acerto === true);  break;
      case 'fallo':       lista = lista.filter(i => i.verificable && i.acerto === false); break;
      case 'nulo':        lista = lista.filter(i => i.verificable && i.acerto === null);  break;
      case 'sinResultado': lista = lista.filter(i => !i.verificable);                     break;
    }

    const cat = this.categoriaBusqueda.toLowerCase();
    const mer = this.mercadoBusqueda.toLowerCase();
    const par = this.partidoBusqueda.toLowerCase();

    if (cat) lista = lista.filter(i => i.categoria?.toLowerCase().includes(cat));
    if (mer) lista = lista.filter(i => i.mercado?.toLowerCase().includes(mer));
    if (par) lista = lista.filter(i => i.partido?.toLowerCase().includes(par));

    return lista;
  });

  // ── Estadísticas globales ──────────────────────────────────────────────
  public readonly stats = computed(() => {
    const all          = this.items();
    const conResultado = all.filter(i => i.verificable);
    const ganados      = conResultado.filter(i => i.acerto === true);
    const perdidos     = conResultado.filter(i => i.acerto === false);
    const nulos        = conResultado.filter(i => i.acerto === null);
    const sinResultado = all.filter(i => !i.verificable);

    const pct = (ganados.length + perdidos.length) > 0
      ? Math.round(ganados.length / (ganados.length + perdidos.length) * 100)
      : null;

    return {
      total:        all.length,
      conResultado: conResultado.length,
      ganados:      ganados.length,
      perdidos:     perdidos.length,
      nulos:        nulos.length,
      sinResultado: sinResultado.length,
      pct,
    };
  });

  // ── Diagnóstico por categoría (solo sugerencias con resultado definitivo) ──
  public readonly catStats = computed<CatStat[]>(() => {
    const evaluados = this.items().filter(i => i.verificable && i.acerto !== null);
    const cats = [...new Set(evaluados.map(i => i.categoria))].filter(Boolean).sort();
    return cats.map(cat => {
      const del     = evaluados.filter(i => i.categoria === cat);
      const ganados = del.filter(i => i.acerto === true).length;
      const perdidos = del.filter(i => i.acerto === false).length;
      const pct = (ganados + perdidos) > 0
        ? Math.round((ganados / (ganados + perdidos)) * 100)
        : null;
      return {
        categoria: cat,
        label:     this.labelCategoria(cat),
        evaluados: del.length,
        ganados,
        perdidos,
        pct,
        badge: this.badgeCategoria(cat),
      };
    });
  });

  // ────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.cargarFechasDisponibles();
    this.cargar();
  }

  cargarFechasDisponibles(): void {
    this.analisisService.obtenerFechasHistorial().subscribe({
      next:  (fechas) => this.fechasDisponibles.set(fechas),
      error: ()       => { /* sin historial aún — ignorar */ },
    });
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    const fecha = this.fechaSeleccionada();
    const obs = fecha
      ? this.analisisService.obtenerHistorial(fecha)
      : this.analisisService.resolver();

    obs.subscribe({
      next:  (data) => { this.items.set(data); this.cargando.set(false); },
      error: (err)  => {
        this.error.set(err.error?.error ?? 'Error al cargar la resolución.');
        this.cargando.set(false);
      },
    });
  }

  seleccionarFecha(fecha: string | null): void {
    this.fechaSeleccionada.set(fecha);
    this.filtroActivo = 'todos';
    this.limpiarBusqueda();
    this.cargar();
  }

  /** Fecha de hoy en formato yyyy-MM-dd — usada como límite máximo del calendar picker */
  readonly today = new Date().toISOString().slice(0, 10);

  /** Maneja el cambio del <input type="date"> del calendar picker */
  seleccionarFechaDesdeCalendario(event: Event): void {
    const valor = (event.target as HTMLInputElement).value; // "yyyy-MM-dd" o ""
    this.seleccionarFecha(valor || null);
  }

  setFiltro(f: Filtro): void { this.filtroActivo = f; }

  formatFechaBoton(fecha: string): string {
    const [anio, mes, dia] = fecha.split('-');
    const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return `${dia} ${meses[parseInt(mes, 10) - 1]} ${anio}`;
  }

  esFechaHoy(fecha: string): boolean {
    return fecha === new Date().toISOString().slice(0, 10);
  }

  descargar(): void {
    this.descargando.set(true);
    this.analisisService.descargarDiagnostico().subscribe({
      next: (blob) => {
        const fecha = new Date().toISOString().slice(0, 10);
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = `diagnostico-sugerencias-${fecha}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.descargando.set(false);
      },
      error: () => { this.descargando.set(false); },
    });
  }

  limpiarBusqueda(): void {
    this.categoriaBusqueda = this.mercadoBusqueda = this.partidoBusqueda = '';
  }

  // ── Helpers de presentación ──────────────────────────────────────────────

  badgeCategoria(cat: string): string {
    const m: Record<string, string> = {
      RESULTADO:       'bg-success',
      GOLES:           'bg-primary',
      MARCADOR_EXACTO: 'bg-dark',
      HANDICAP:        'bg-secondary',
      CORNERS:         'bg-info text-dark',
      CORNERS_EQUIPO:  'bg-info text-dark',
      TARJETAS:        'bg-warning text-dark',
    };
    return `badge ${m[cat] ?? 'bg-light text-dark'}`;
  }

  labelCategoria(cat: string): string {
    const m: Record<string, string> = {
      RESULTADO:       'Resultado',
      GOLES:           'Goles',
      MARCADOR_EXACTO: 'Marcador Exacto',
      HANDICAP:        'Hándicap',
      CORNERS:         'Corners',
      CORNERS_EQUIPO:  'Corners Eq.',
      TARJETAS:        'Tarjetas',
    };
    return m[cat] ?? cat;
  }

  probPct(p: number): string { return (p * 100).toFixed(0) + '%'; }

  edgePct(e: number | null): string {
    if (e == null) return '—';
    return (e >= 0 ? '+' : '') + (e * 100).toFixed(1) + '%';
  }

  edgeClass(e: number | null): string {
    if (e == null)    return 'text-muted';
    if (e >= 0.05)    return 'text-success fw-semibold';
    if (e >= 0)       return 'text-warning';
    return 'text-danger';
  }

  iconoEstado(item: ResolucionAnalisis): string {
    if (!item.verificable)    return 'fa-solid fa-clock text-warning';
    if (item.acerto === null) return 'fa-solid fa-minus-circle text-secondary';
    if (item.acerto === true) return 'fa-solid fa-circle-check text-success';
    return 'fa-solid fa-circle-xmark text-danger';
  }

  textoEstado(item: ResolucionAnalisis): string {
    if (!item.verificable)    return 'Sin resultado';
    if (item.acerto === null) return 'Nulo/Push';
    if (item.acerto === true) return 'Ganó';
    return 'Falló';
  }

  claseFilaEstado(item: ResolucionAnalisis): string {
    if (!item.verificable)    return '';
    if (item.acerto === null) return 'table-secondary';
    if (item.acerto === true) return 'table-success';
    return 'table-danger';
  }

  clasePctCat(pct: number | null): string {
    if (pct == null) return 'text-muted';
    if (pct >= 60)   return 'text-success fw-bold';
    if (pct >= 45)   return 'text-warning fw-bold';
    return 'text-danger fw-bold';
  }

  claseBarraCat(pct: number | null): string {
    if (pct == null) return 'bg-secondary';
    if (pct >= 60)   return 'bg-success';
    if (pct >= 45)   return 'bg-warning';
    return 'bg-danger';
  }
}
