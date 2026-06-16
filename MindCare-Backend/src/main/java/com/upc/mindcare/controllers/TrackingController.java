package com.upc.mindcare.controllers;

import com.upc.mindcare.dtos.TrackingDTO;
import com.upc.mindcare.services.TrackingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracking")
@Tag(name = "Tracking", description = "Seguimiento emocional de pacientes")
public class TrackingController {

    @Autowired
    private TrackingService trackingService;

    @PostMapping("/estado-emocional")
    @PreAuthorize("hasRole('PACIENTE')")
    public TrackingDTO registrarEstadoEmocional(@Valid @RequestBody TrackingDTO dto) {
        return trackingService.registrarEstadoEmocional(dto);
    }

    @PutMapping("/{id}/reflexion-diaria")
    @PreAuthorize("hasRole('PACIENTE')")
    public TrackingDTO registrarReflexionDiaria(
            @PathVariable Long id,
            @RequestBody TrackingDTO dto
    ) {
        return trackingService.registrarReflexionDiaria(id, dto);
    }

    @GetMapping("/paciente/{pacienteId}/historial")
    @PreAuthorize("hasAnyRole('PACIENTE', 'PROFESIONAL')")
    public List<TrackingDTO> consultarHistorialEmocional(@PathVariable Long pacienteId) {
        return trackingService.consultarHistorialEmocional(pacienteId);
    }

    @GetMapping("/paciente/{pacienteId}/ultimo")
    @PreAuthorize("hasAnyRole('PACIENTE', 'PROFESIONAL')")
    public TrackingDTO obtenerUltimoTracking(@PathVariable Long pacienteId) {
        return trackingService.obtenerUltimoTracking(pacienteId);
    }
}


