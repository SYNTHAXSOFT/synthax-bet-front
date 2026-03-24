import { Component, inject, signal, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Usuario } from '../../interfaces/usuario.interface';

@Component({
  selector: 'app-listar-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuario-listar.html',
})
export class ListarPage implements OnInit {

  private readonly usuarioService = inject(UsuarioService);
  private readonly authService = inject(AuthService);

  @Output() solicitudEditar = new EventEmitter<Usuario>();

  isLoading = signal(false);
  isError = signal(false);
  errorMessage = signal<string | null>(null);
  usuariosList = signal<Usuario[]>([]);

  currentUserRole: string = '';

  ngOnInit(): void {
    this.currentUserRole = this.authService.getUserRole() || '';
    this.listarAction();
  }

  listarAction(): void {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.isError.set(false);
    this.errorMessage.set(null);

    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.isLoading.set(false);
        this.usuariosList.set(usuarios);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.isError.set(true);
        this.errorMessage.set(error.error?.mensaje || 'Error al cargar usuarios');
        this.usuariosList.set([]);
      }
    });
  }

  activarInactivarAction(usuario: Usuario): void {
    if (this.isLoading()) return;

    const accion = usuario.activo ? 'desactivar' : 'activar';
    if (!confirm(`¿Está seguro de ${accion} al usuario "${usuario.nombre}"?`)) return;

    this.isLoading.set(true);

    this.usuarioService.activarInactivar(usuario.id!).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.listarAction();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.isError.set(true);
        this.errorMessage.set(error.error?.mensaje || 'Error al actualizar estado');
      }
    });
  }

  editar(usuario: Usuario): void {
    this.solicitudEditar.emit(usuario);
  }
}
