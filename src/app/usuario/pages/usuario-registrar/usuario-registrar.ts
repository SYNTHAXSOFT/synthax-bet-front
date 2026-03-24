import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Formutils } from '../../../utils/form-utils';
import { Usuario } from '../../interfaces/usuario.interface';
import { UsuarioService } from '../../services/usuario.service';
import { ListarPage } from '../usuario-listar/usuario-listar';

@Component({
  selector: 'app-registrar-page',
  standalone: true,
  imports: [ReactiveFormsModule, ListarPage, CommonModule],
  templateUrl: './usuario-registrar.html',
})
export class RegistrarPage {

  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);

  formUtils = Formutils;

  @ViewChild(ListarPage) listarComponente?: ListarPage;

  rolesDisponibles: string[] = ['ROOT', 'ADMINISTRADOR'];

  modoEdicion = false;
  usuarioEditandoId: number | null = null;

  myform = this.fb.group({
    nombre:   ['', [Validators.required]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rol:      ['', Validators.required],
    activo:   [true],
  });

  // Llamado desde la tabla cuando se hace clic en Editar
  onEditarUsuario(usuario: Usuario): void {
    this.modoEdicion = true;
    this.usuarioEditandoId = usuario.id!;
    this.myform.patchValue({
      nombre:   usuario.nombre,
      email:    usuario.email,
      password: usuario.password ?? '',
      rol:      usuario.rol,
      activo:   usuario.activo,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.usuarioEditandoId = null;
    this.myform.reset({ nombre: '', email: '', password: '', rol: '', activo: true });
  }

  onSave(): void {
    if (this.myform.invalid) {
      this.myform.markAllAsTouched();
      return;
    }

    const usuario: Usuario = {
      nombre:   this.myform.value.nombre ?? '',
      email:    this.myform.value.email ?? '',
      password: this.myform.value.password ?? '',
      rol:      this.myform.value.rol ?? '',
      activo:   this.myform.value.activo ?? true,
    };

    if (this.modoEdicion && this.usuarioEditandoId !== null) {
      this.usuarioService.actualizar(this.usuarioEditandoId, usuario).subscribe({
        next: () => {
          alert('Usuario actualizado exitosamente');
          this.cancelarEdicion();
          this.listarComponente?.listarAction();
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
          alert('Error al actualizar: ' + (err.error?.mensaje || 'Error desconocido'));
        }
      });
    } else {
      this.usuarioService.crearUsuario(usuario).subscribe({
        next: () => {
          alert('Usuario creado exitosamente');
          this.myform.reset({ nombre: '', email: '', password: '', rol: '', activo: true });
          this.listarComponente?.listarAction();
        },
        error: (err) => {
          console.error('Error al crear el usuario:', err);
          alert('Error al crear el usuario: ' + (err.error?.mensaje || 'Error desconocido'));
        }
      });
    }
  }
}
