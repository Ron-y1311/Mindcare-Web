package com.upc.mindcare.interfaces;

import com.upc.mindcare.dtos.DashboardDTO;
import com.upc.mindcare.dtos.ResumenEmocionalDTO;
import com.upc.mindcare.dtos.TrackingDTO;

import java.util.List;

public interface IDashboardService {
    DashboardDTO visualizarDashboardPersonal(Long pacienteId);
    List<TrackingDTO> consultarEvolucionEmocional(Long pacienteId);
    ResumenEmocionalDTO obtenerResumenEmocional(Long pacienteId);
}