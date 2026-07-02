export interface Recomendacion {
  pacienteId?: number;
  estadoEmocional?: string;
  nivelRiesgo?: string;
  tendencia?: string;
  puntajeRiesgo?: number;
  ultimoBienestar?: number;
  ultimaIntensidad?: number;
  promedioIntensidad?: number;
  promedioBienestar?: number;
  mensajePrincipal?: string;
  factoresDetectados?: string[];
  recomendaciones?: string[];
  accionesSugeridas?: string[];
  requiereAtencionProfesional?: boolean;
  alertaPreventiva?: string;
}
