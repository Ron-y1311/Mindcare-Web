export interface Cita {
  idCita?: number;
  pacienteId?: number;
  profesionalId?: number;
  estadoCitaId?: number;
  fecha?: string;
  motivoConsulta?: string;
  nombrePaciente?: string;
  nombreProfesional?: string;
  nota?: string;
  observacionesClinicas?: string;
  planAccion?: string;
  estadoNota?: string;
  fechaNota?: string;
  edad?: number;
  genero?: string;
  telefono?: string;
}