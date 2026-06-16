package com.upc.mindcare.interfaces;

public interface IRecomendacionService {
    String generarRecomendacionesPersonalizadas(Long pacienteId);
    String evaluarEstadoEmocional(Long pacienteId);
    String generarAlertaPreventiva(Long pacienteId);
}