package com.upc.mindcare.controllers;

import com.upc.mindcare.services.RecomendacionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recomendaciones")
@Tag(name = "Recomendaciones", description = "Generación de recomendaciones emocionales")
public class RecomendacionController {

    @Autowired
    private RecomendacionService recomendacionService;

    @GetMapping("/paciente/{pacienteId}")
    @PreAuthorize("hasRole('PACIENTE')")
    public String generarRecomendacionesPersonalizadas(@PathVariable Long pacienteId) {
        return recomendacionService.generarRecomendacionesPersonalizadas(pacienteId);
    }

    @GetMapping("/paciente/{pacienteId}/estado")
    @PreAuthorize("hasRole('PACIENTE')")
    public String evaluarEstadoEmocional(@PathVariable Long pacienteId) {
        return recomendacionService.evaluarEstadoEmocional(pacienteId);
    }

    @GetMapping("/paciente/{pacienteId}/alerta")
    @PreAuthorize("hasRole('PACIENTE')")
    public String generarAlertaPreventiva(@PathVariable Long pacienteId) {
        return recomendacionService.generarAlertaPreventiva(pacienteId);
    }
}