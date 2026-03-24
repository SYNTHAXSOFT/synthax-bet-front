export enum Rol {
  ROOT = 'ROOT',
  ADMINISTRADOR = 'ADMINISTRADOR'
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    activo: boolean;
  };
  token: string;
  mensaje: string;
}