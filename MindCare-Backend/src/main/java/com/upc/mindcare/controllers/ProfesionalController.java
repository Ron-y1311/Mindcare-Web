package com.upc.mindcare.controllers;

import com.upc.mindcare.dtos.ProfesionalDTO;
import com.upc.mindcare.services.ProfesionalService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profesionales")
@Tag(name = "Profesionales", description = "Gestión de profesionales de salud mental")
public class ProfesionalController {

    @Autowired
    private ProfesionalService profesionalService;

    //Solo los profesionales pueden ver como completan su perfil
    @PostMapping
    @PreAuthorize("hasRole('PROFESIONAL')")
    public ProfesionalDTO completarPerfilProfesional(@Valid @RequestBody ProfesionalDTO profesionalDTO) {
        return profesionalService.completarPerfilProfesional(profesionalDTO);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROFESIONAL')")
    public ProfesionalDTO actualizarPerfilProfesional(
            @PathVariable Long id,
            @RequestBody ProfesionalDTO profesionalDTO
    ) {
        return profesionalService.actualizarPerfilProfesional(id, profesionalDTO);
    }

    @PutMapping("/{id}/especialidades")
    @PreAuthorize("hasRole('PROFESIONAL')")
    public ProfesionalDTO asociarEspecialidades(
            @PathVariable Long id,
            @RequestBody List<Long> especialidadIds
    ) {
        return profesionalService.asociarEspecialidades(id, especialidadIds);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PACIENTE', 'ADMIN')")
    public List<ProfesionalDTO> listarProfesionales() {
        return profesionalService.listarProfesionales();
    }

    @GetMapping("/especialidad/{especialidadId}")
    @PreAuthorize("hasAnyRole('PACIENTE', 'ADMIN')")
    public List<ProfesionalDTO> listarPorEspecialidad(@PathVariable Long especialidadId) {
        return profesionalService.listarProfesionalesPorEspecialidad(especialidadId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PACIENTE', 'PROFESIONAL', 'ADMIN')")
    public ProfesionalDTO buscarProfesionalPorId(@PathVariable Long id) {
        return profesionalService.buscarProfesionalPorId(id);
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ProfesionalDTO cambiarEstadoValidacion(
            @PathVariable Long id,
            @RequestParam String estado
    ) {
        return profesionalService.cambiarEstadoValidacion(id, estado);
    }

    @PutMapping("/{id}/aprobar")
    @PreAuthorize("hasRole('ADMIN')")
    public ProfesionalDTO aprobarProfesional(@PathVariable Long id) {
        return profesionalService.aprobarProfesional(id);
    }

    @PutMapping("/{id}/rechazar")
    @PreAuthorize("hasRole('ADMIN')")
    public ProfesionalDTO rechazarProfesional(
            @PathVariable Long id,
            @RequestParam String motivo
    ) {
        return profesionalService.rechazarProfesional(id, motivo);
    }
}