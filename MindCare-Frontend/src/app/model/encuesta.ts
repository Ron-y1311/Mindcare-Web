export interface Encuesta {
  encuestaId?: number;
  fechaRegistro?: string;
  tipoEncuesta?: string;
  estado?: string;
  resultadoTotal?: number;
  interpretacionResultado?: string;
  pacienteId?: number;
}