import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PickService } from '../../services/pick.service';
import { PartidoService } from '../../../partidos/services/partido.service';
import { Partido } from '../../../partidos/interfaces/partido.interface';
import { CrearPickRequest } from '../../interfaces/pick.interface';
import { AuthService } from '../../../auth/services/auth.service';
import { PicksListarPage } from '../picks-listar/picks-listar';

@Component({
  selector: 'app-picks-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PicksListarPage],
  templateUrl: './picks-registrar.html',
})
export class PicksRegistrarPage implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly pickService = inject(PickService);
  private readonly partidoService = inject(PartidoService);
  private readonly authService = inject(AuthService);

  @ViewChild(PicksListarPage) listarComponent?: PicksListarPage;

  public partidos: Partido[] = [];
  public esAdmin: boolean = false;

  public readonly canalesDisponibles = ['TELEGRAM', 'WEB'];
  public readonly casasDisponibles = ['Bet365', 'Betway', 'William Hill', 'Bwin', '1xBet', 'Codere', 'Otra'];

  public myForm: FormGroup = this.fb.group({
    partidoId:     [null,  [Validators.required]],
    nombreMercado: ['',    [Validators.required, Validators.minLength(3)]],
    probabilidad:  [null,  [Validators.required, Validators.min(0.01), Validators.max(1)]],
    valorCuota:    [null,  [Validators.required, Validators.min(1)]],
    casaApuestas:  ['',    [Validators.required]],
    canal:         ['WEB', [Validators.required]],
  });

  ngOnInit(): void {
    this.esAdmin = ['ROOT', 'ADMINISTRADOR'].includes(this.authService.getUserRole() || '');
    this.cargarPartidos();
  }

  cargarPartidos(): void {
    this.partidoService.obtenerHoy().subscribe({
      next: (data) => {
        this.partidos = data;
      },
      error: (error) => {
        console.error('Error al cargar partidos:', error);
      }
    });
  }

  onSave(): void {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    }

    const pick: CrearPickRequest = this.myForm.value;

    this.pickService.crear(pick).subscribe({
      next: () => {
        alert('Pick creado exitosamente');
        this.myForm.reset({ canal: 'WEB' });
        this.listarComponent?.cargarPicks();
      },
      error: (error) => {
        console.error('Error al crear pick:', error);
        alert('Error al crear pick: ' + (error.error?.mensaje || 'Error desconocido'));
      }
    });
  }

  isValidField(field: string): boolean | null {
    return this.myForm.controls[field].errors
      && this.myForm.controls[field].touched;
  }

  getFieldError(field: string): string | null {
    if (!this.myForm.controls[field]) return null;

    const errors = this.myForm.controls[field].errors || {};
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':  return 'Este campo es requerido';
        case 'minlength': return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
        case 'min':       return `El valor mínimo es ${errors['min'].min}`;
        case 'max':       return `El valor máximo es ${errors['max'].max}`;
      }
    }
    return null;
  }
}
