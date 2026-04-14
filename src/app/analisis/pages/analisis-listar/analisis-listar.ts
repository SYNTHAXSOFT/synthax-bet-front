import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalisisService } from '../../services/analisis.service';
import { CuotaService, IngestaCuotasResultado } from '../../services/cuota.service';
import { Analisis, LigaDisponible } from '../../interfaces/analisis.interface';
import { AuthService } from '../../../auth/services/auth.service';
import { CATEGORIA_ANALISIS, NIVEL_CONFIANZA } from '../../../utils/constantes-utils';

/** Clave de localStorage para recordar la última selección de ligas */
const LS_LIGAS_KEY = 'statbet_ligas_seleccionadas';

@Component({
  selector: 'app-analisis-listar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analisis-listar.html',
})
export class AnalisisListarPage implements OnInit {

  private readonly analisisService = inject(AnalisisService);
  private readonly cuotaService    = inject(CuotaService);
  private readonly authService     = inject(AuthService);

  // ── Datos ──────────────────────────────────────────────────────────────
  private analisisCompletos: Analisis[] = [];
  public  analisisList:      Analisis[] = [];

  // ── Estados de carga ────────────────────────────────────────────────────
  public cargando:    boolean = false;
  public ejecutando:  boolean = false;
  public ingiriendo:  boolean = false;
  public esAdmin:     boolean = false;

  // ── Filtros de tabla ────────────────────────────────────────────────────
  public categoriaFiltro:   string = '';
  public confianzaFiltro:   string = '';
  public mercadoFiltro:     string = '';
  public equipoFiltro:      string = '';
  public probabilidadMinima: number = 0;

  public readonly categorias:          string[] = Object.values(CATEGORIA_ANALISIS);
  public readonly nivelesConfianza:    string[] = Object.values(NIVEL_CONFIANZA);
  public readonly opcionesProbabilidad = [
    { label: 'Todas',  valor: 0    },
    { label: '≥ 50%',  valor: 0.50 },
    { label: '≥ 60%',  valor: 0.60 },
    { label: '≥ 70%',  valor: 0.70 },
    { label: '≥ 80%',  valor: 0.80 },
    { label: '≥ 90%',  valor: 0.90 },
  ];

  // ── Modal de selección de ligas ─────────────────────────────────────────
  public mostrarModal:      boolean = false;
  public cargandoLigas:     boolean = false;
  public ligasDisponibles:  LigaDisponible[] = [];
  public ligasSeleccionadas: Set<string> = new Set();

  /** 'analisis' | 'cuotas' — indica qué operación dispara el modal */
  public accionModal: 'analisis' | 'cuotas' = 'cuotas';

  // ── Computed ────────────────────────────────────────────────────────────
  get totalCompleto():    number  { return this.analisisCompletos.length; }
  get totalFiltrado():    number  { return this.analisisList.length; }
  get hayFiltrosActivos(): boolean {
    return !!(this.categoriaFiltro || this.confianzaFiltro ||
              this.mercadoFiltro   || this.equipoFiltro    || this.probabilidadMinima);
  }

  get tituloModal(): string {
    return this.accionModal === 'analisis'
      ? 'Seleccionar ligas para el análisis'
      : 'Seleccionar ligas para ingestar cuotas';
  }

  get descripcionModal(): string {
    return this.accionModal === 'analisis'
      ? 'El motor solo analizará los partidos de las ligas que selecciones.'
      : 'Solo se descargarán cuotas de la API para los partidos de las ligas seleccionadas.';
  }

  get ligasPorPais(): { pais: string; ligas: LigaDisponible[] }[] {
    const mapa = new Map<string, LigaDisponible[]>();
    for (const liga of this.ligasDisponibles) {
      const lista = mapa.get(liga.pais) ?? [];
      lista.push(liga);
      mapa.set(liga.pais, lista);
    }
    // Colombia siempre primero
    const paises = Array.from(mapa.keys()).sort((a, b) => {
      if (a === 'Colombia') return -1;
      if (b === 'Colombia') return  1;
      return a.localeCompare(b);
    });
    return paises.map(pais => ({ pais, ligas: mapa.get(pais)! }));
  }

  get totalSeleccionadas(): number { return this.ligasSeleccionadas.size; }

  // ────────────────────────────────────────────────────────────────────────
  // Ciclo de vida
  // ────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.esAdmin = ['ROOT', 'ADMINISTRADOR'].includes(this.authService.getUserRole() || '');
    this.cargarAnalisis();
  }

  // ────────────────────────────────────────────────────────────────────────
  // Tabla de análisis
  // ────────────────────────────────────────────────────────────────────────

  cargarAnalisis(): void {
    this.cargando = true;
    this.analisisService.obtenerHoy().subscribe({
      next: (data) => {
        this.analisisCompletos = data;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar análisis:', err);
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.analisisCompletos];

    if (this.categoriaFiltro)
      resultado = resultado.filter(a => a.categoriaMercado === this.categoriaFiltro);

    if (this.confianzaFiltro)
      resultado = resultado.filter(a => a.nivelConfianza === this.confianzaFiltro);

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

    if (this.probabilidadMinima > 0)
      resultado = resultado.filter(a => a.probabilidad >= this.probabilidadMinima);

    this.analisisList = resultado;
  }

  limpiarFiltros(): void {
    this.categoriaFiltro  = '';
    this.confianzaFiltro  = '';
    this.mercadoFiltro    = '';
    this.equipoFiltro     = '';
    this.probabilidadMinima = 0;
    this.analisisList = [...this.analisisCompletos];
  }

  // ────────────────────────────────────────────────────────────────────────
  // Modal de ligas
  // ────────────────────────────────────────────────────────────────────────

  /** Abre el modal cargando las ligas disponibles hoy desde la API. */
  abrirModalLigas(accion: 'analisis' | 'cuotas'): void {
    this.accionModal    = accion;
    this.mostrarModal   = true;
    this.cargandoLigas  = true;
    this.ligasDisponibles = [];

    this.cuotaService.ligasDisponiblesHoy().subscribe({
      next: (ligas) => {
        this.ligasDisponibles = ligas;
        this.cargandoLigas    = false;
        this.restaurarSeleccion(ligas);
      },
      error: (err) => {
        console.error('Error al cargar ligas:', err);
        this.cargandoLigas = false;
        alert('Error al cargar las ligas disponibles: ' + (err.error?.message || 'Error desconocido'));
        this.mostrarModal = false;
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  /** Restaura la selección desde localStorage; si no hay, pre-selecciona las favoritas. */
  private restaurarSeleccion(ligas: LigaDisponible[]): void {
    const guardadas = localStorage.getItem(LS_LIGAS_KEY);
    if (guardadas) {
      try {
        const ids: string[] = JSON.parse(guardadas);
        // Solo marcar las que sigan disponibles hoy
        this.ligasSeleccionadas = new Set(
          ids.filter(id => ligas.some(l => l.idLigaApi === id))
        );
        return;
      } catch { /* ignorar JSON inválido */ }
    }
    // Primera vez: pre-seleccionar las favoritas
    this.ligasSeleccionadas = new Set(
      ligas.filter(l => l.favorita).map(l => l.idLigaApi)
    );
  }

  toggleLiga(idLigaApi: string): void {
    if (this.ligasSeleccionadas.has(idLigaApi)) {
      this.ligasSeleccionadas.delete(idLigaApi);
    } else {
      this.ligasSeleccionadas.add(idLigaApi);
    }
    // Forzar detección de cambios en el Set
    this.ligasSeleccionadas = new Set(this.ligasSeleccionadas);
  }

  seleccionarTodas(): void {
    this.ligasSeleccionadas = new Set(this.ligasDisponibles.map(l => l.idLigaApi));
  }

  limpiarSeleccion(): void {
    this.ligasSeleccionadas = new Set();
  }

  estaSeleccionada(idLigaApi: string): boolean {
    return this.ligasSeleccionadas.has(idLigaApi);
  }

  /** Guarda la selección y ejecuta la acción correspondiente. */
  confirmarSeleccion(): void {
    if (this.ligasSeleccionadas.size === 0) {
      alert('Selecciona al menos una liga antes de continuar.');
      return;
    }

    const ligaIds = Array.from(this.ligasSeleccionadas);
    // Guardar selección para la próxima vez
    localStorage.setItem(LS_LIGAS_KEY, JSON.stringify(ligaIds));

    this.mostrarModal = false;

    if (this.accionModal === 'analisis') {
      this.ejecutarConLigas(ligaIds);
    } else {
      this.ingestarConLigas(ligaIds);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Ejecutar análisis
  // ────────────────────────────────────────────────────────────────────────

  ejecutarAnalisis(): void {
    // Verificar estado del presupuesto antes de abrir el modal de ligas
    this.cuotaService.estadoBudget().subscribe({
      next: (budget) => {
        if (budget.nivelAlerta === 'CRITICO') {
          const msg = `⚠️ PRESUPUESTO AGOTADO\n\n` +
            `Requests usados hoy: ${budget.requestsUsadosHoy}/${budget.requestsMaxDiarios}\n` +
            `Disponibles para análisis: ${budget.requestsDisponiblesUsoGeneral}\n\n` +
            `${budget.consejo ?? 'El cupo diario se resetea a medianoche.'}\n\n` +
            `¿Deseas continuar de todas formas?`;
          if (!confirm(msg)) return;
        } else if (budget.nivelAlerta === 'ADVERTENCIA') {
          const msg = `⚠️ Pocos requests disponibles\n\n` +
            `Requests usados: ${budget.requestsUsadosHoy}/${budget.requestsMaxDiarios} ` +
            `(${budget.porcentajeUsado}% consumido)\n` +
            `Disponibles para análisis: ${budget.requestsDisponiblesUsoGeneral}\n\n` +
            `${budget.consejo ?? ''}\n\n` +
            `¿Deseas ejecutar el análisis de todas formas?`;
          if (!confirm(msg)) return;
        }
        this.abrirModalLigas('analisis');
      },
      error: () => {
        // Si falla el check de budget, abrimos el modal de todas formas
        this.abrirModalLigas('analisis');
      }
    });
  }

  private ejecutarConLigas(ligaIds: string[]): void {
    const nombres = this.ligasDisponibles
      .filter(l => ligaIds.includes(l.idLigaApi))
      .map(l => l.nombre)
      .join(', ');

    if (!confirm(`¿Ejecutar análisis para:\n${nombres}?\n\nEsto puede tardar unos segundos.`)) return;

    this.ejecutando = true;
    this.analisisService.ejecutar(ligaIds).subscribe({
      next: (res) => {
        alert(`✓ Análisis ejecutado:\n${res.analisesGenerados} análisis generados para ${this.totalSeleccionadas} ligas.`);
        this.ejecutando = false;
        this.limpiarFiltros();
        this.cargarAnalisis();
      },
      error: (err) => {
        console.error('Error al ejecutar análisis:', err);
        alert('Error: ' + (err.error?.mensaje || err.error?.error || 'Error desconocido'));
        this.ejecutando = false;
      }
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // Ingestar cuotas
  // ────────────────────────────────────────────────────────────────────────

  ingestarCuotas(): void {
    this.abrirModalLigas('cuotas');
  }

  private ingestarConLigas(ligaIds: string[]): void {
    this.ingiriendo = true;
    this.cuotaService.ingestar(ligaIds).subscribe({
      next: (res: IngestaCuotasResultado) => {
        this.ingiriendo = false;
        const msg = this.construirMensajeIngesta(res);
        alert(msg);
      },
      error: (err) => {
        console.error('Error al ingestar cuotas:', err);
        alert('Error: ' + (err.error?.mensaje || err.error?.message || 'Error desconocido'));
        this.ingiriendo = false;
      }
    });
  }

  /**
   * Construye un mensaje amigable para el alert de resultado de ingesta,
   * aprovechando todos los campos del DTO detallado.
   */
  private construirMensajeIngesta(res: IngestaCuotasResultado): string {
    const icono = res.estado === 'ok' ? '✓' : res.estado === 'abortado' ? '✗' : '⚠';

    let msg = `${icono} ${res.mensaje}\n`;

    if (res.estado === 'abortado') {
      // Motivos de aborto → acción recomendada
      const acciones: Record<string, string> = {
        SIN_PROVEEDOR:  'Revisa la configuración del proveedor (statbet.proveedor.futbol).',
        SIN_PARTIDOS:   'Ejecuta primero el botón "Ejecutar análisis".',
        BUDGET_AGOTADO: 'El cupo de requests se resetea a medianoche.',
        SIN_ID_API:     'Vuelve a sincronizar los partidos del día.',
      };
      const accion = res.motivo ? acciones[res.motivo] : '';
      if (accion) msg += `\n👉 ${accion}`;
      return msg;
    }

    // Estado ok o ok_sin_cuotas → mostrar estadísticas de presupuesto
    msg += `\n─────────────────────────────`;
    msg += `\nPartidos consultados: ${res.partidosConsultados}`;
    if (res.partidosSinCuotasEnApi > 0) {
      msg += `\nPartidos sin cuotas en API: ${res.partidosSinCuotasEnApi}`;
      if (res.partidosSinCuotasMuestra?.length > 0) {
        msg += `\n  • ${res.partidosSinCuotasMuestra.slice(0, 5).join('\n  • ')}`;
      }
    }
    msg += `\nRequests consumidos: ${res.requestsConsumidosEnIngesta}`;
    msg += `\nRequests restantes para cuotas: ${res.requestsRestantesParaCuotas}/${res.requestsMaxDiarios}`;

    if (res.requestsRestantesParaCuotas < 10) {
      msg += `\n\n⚠️ Quedan muy pocos requests disponibles. El cupo se resetea a medianoche.`;
    }

    return msg;
  }

  // ────────────────────────────────────────────────────────────────────────
  // Diagnóstico
  // ────────────────────────────────────────────────────────────────────────

  diagnosticarCuotas(): void {
    this.cuotaService.diagnostico().subscribe({
      next: (res) => {
        const lineas = Object.entries(res)
          .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
          .join('\n');
        alert('─── Diagnóstico de cuotas ───\n\n' + lineas);
      },
      error: (err) => {
        console.error('Error en diagnóstico:', err);
        alert('Error al ejecutar diagnóstico: ' + (err.error?.message || 'Error desconocido'));
      }
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // Helpers de badge
  // ────────────────────────────────────────────────────────────────────────

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
