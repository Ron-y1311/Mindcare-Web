export interface Profesional {
  idProfesional?: number;
  especialidad?: string;
  numeroColegiatura?: string;
  cmp?: string;
  aniosExperiencia?: number;
  etiquetas?: string;
  descripcionPerfil?: string;
  documentoValidacion?: string;
  estadoValidacion?: string;
  motivoRechazo?: string;
  fechaSolicitud?: string;
  fechaValidacion?: string;
  usuarioId?: number;
  nombre?: string;
  username?: string;
  correo?: string;
  password?: string;
  especialidadIds?: number[];
  especialidades?: string[];
}
