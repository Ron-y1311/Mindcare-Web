export interface Usuario {
  idUsuario?: number;
  usuarioId?: number;
  nombre?: string;
  username?: string;
  correo: string;
  password?: string;
  rol?: any;
  roles?: string[];
  activo?: boolean;
  pacienteId?: number;
  profesionalId?: number;
}