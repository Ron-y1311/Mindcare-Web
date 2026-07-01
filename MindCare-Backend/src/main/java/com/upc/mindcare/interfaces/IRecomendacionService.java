package com.upc.mindcare.interfaces;

import com.upc.mindcare.dtos.RecomendacionDTO;

public interface IRecomendacionService {
    RecomendacionDTO generarRecomendacionesPersonalizadas(Long pacienteId);
    String evaluarEstadoEmocional(Long pacienteId);
    String generarAlertaPreventiva(Long pacienteId);
}
