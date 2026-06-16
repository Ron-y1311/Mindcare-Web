package com.upc.mindcare.interfaces;

import com.upc.mindcare.dtos.TrackingDTO;

import java.util.List;

public interface ITrackingService {
    TrackingDTO registrarEstadoEmocional(TrackingDTO dto);
    List<TrackingDTO> consultarHistorialEmocional(Long pacienteId);
    TrackingDTO registrarReflexionDiaria(Long trackingId, TrackingDTO dto);
    TrackingDTO obtenerUltimoTracking(Long pacienteId);
}