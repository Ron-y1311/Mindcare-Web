export interface Valoracion {
  idValoracion?: number;
  citaId: number;
  pacienteId?: number;
  profesionalId?: number;
  puntuacion: number;
  comentario: string;
  fechaRegistro?: string;
}
