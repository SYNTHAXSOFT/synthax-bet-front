export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  password: string;
  rol: string;
  activo?: boolean;
  fechaCreacion?: string;
}
