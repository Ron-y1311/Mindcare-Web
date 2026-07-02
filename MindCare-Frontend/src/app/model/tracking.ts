export interface Tracking {
  idTracking?: number;
  pacienteId?: number;
  estadoAnimoId?: number;
  estadoAnimoNombre?: string;
  estadoAnimo?: { idEstadoAnimo?: number; nombre?: string; descripcion?: string };
  fecha?: string;
  nota?: string;
  numeroIntensidad?: number;
  reflexionDescripcion?: string;
}
