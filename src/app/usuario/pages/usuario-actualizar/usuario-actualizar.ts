import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../interfaces/usuario.interface';

@Component({
  selector: 'app-actualizar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario-actualizar.html'
})
export class ActualizarUsuarioPageComponent implements OnInit {

  rolesDisponibles: string[] = ['ROOT', 'ADMINISTRADOR'];

  usuario: Usuario = {
    nombre:   '',
    email:    '',
    password: '',
    rol:      '',
    activo:   true,
  };

  cargando = true;
  usuarioId: number = 0;

  constructor(
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.usuarioId = idParam ? Number(idParam) : 0;
    this.cargarUsuario();
  }

  cargarUsuario(): void {
    this.usuarioService.obtenerPorId(this.usuarioId).subscribe({
      next: (data) => {
        this.usuario = data;
        this.cargando = false;
      },
      error: () => {
        alert('Error al cargar el usuario');
        this.router.navigate(['/statbet/usuario/listar']);
      }
    });
  }

  actualizarUsuario(): void {
    if (!this.usuario.nombre || !this.usuario.email || !this.usuario.rol) {
      alert('Debe completar todos los campos obligatorios');
      return;
    }

    this.usuarioService.actualizar(this.usuarioId, this.usuario).subscribe({
      next: () => {
        alert('Usuario actualizado exitosamente');
        this.router.navigate(['/statbet/usuario/listar']);
      },
      error: (err) => {
        alert('Error al actualizar el usuario: ' + (err.error?.mensaje || 'Error desconocido'));
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/statbet/usuario/listar']);
  }
}
