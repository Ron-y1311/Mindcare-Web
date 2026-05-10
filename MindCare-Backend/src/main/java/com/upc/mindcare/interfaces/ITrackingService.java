package com.upc.mindcare.interfaces;

import com.upc.mindcare.dtos.TrackingDTO;

import java.util.List;

public interface ITrackingService {
    TrackingDTO registrarEstadoEmocional(TrackingDTO dto);
   //Se agrega en interfaces la funcion de consultar historial emocional para usarlo en los services
    List<TrackingDTO> consultarHistorialEmocional(Long pacienteId);
    TrackingDTO registrarReflexionDiaria(Long trackingId, TrackingDTO dto);
    TrackingDTO obtenerUltimoTracking(Long pacienteId);
}