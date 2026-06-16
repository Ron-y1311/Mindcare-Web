package com.upc.mindcare.controllers;

import com.upc.mindcare.dtos.DashboardDTO;
import com.upc.mindcare.dtos.ResumenEmocionalDTO;
import com.upc.mindcare.dtos.TrackingDTO;
import com.upc.mindcare.services.DashboardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Resumen y metricas del estado del paciente")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/paciente/{pacienteId}")
    @PreAuthorize("hasRole('PACIENTE')")
    public DashboardDTO visualizarDashboardPersonal(@PathVariable Long pacienteId) {
        return dashboardService.visualizarDashboardPersonal(pacienteId);
    }

    @GetMapping("/paciente/{pacienteId}/evolucion-emocional")
    @PreAuthorize("hasRole('PACIENTE')")
    public List<TrackingDTO> consultarEvolucionEmocional(@PathVariable Long pacienteId) {
        return dashboardService.consultarEvolucionEmocional(pacienteId);
    }

    @GetMapping("/paciente/{pacienteId}/resumen")
    @PreAuthorize("hasRole('PACIENTE')")
    public ResumenEmocionalDTO obtenerResumenEmocional(@PathVariable Long pacienteId) {
        return dashboardService.obtenerResumenEmocional(pacienteId);
    }
}