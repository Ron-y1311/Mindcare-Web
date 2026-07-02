export interface MedicacionPaciente {
  idMedicacion?: number;
  idMedicacionPaciente?: number;
  citaId?: number;
  pacienteId?: number;
  profesionalId?: number;
  paciente?: any;
  medicamento?: string;
  nombreMedicamento?: string;
  dosis?: string;
  frecuencia?: string;
  duracion?: string;
  indicaciones?: string;
  fechaInicio?: string;
  fechaFin?: string;
  activo?: boolean;
  tratamientoActivo?: boolean;
}
