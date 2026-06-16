package com.upc.mindcare.controllers;

import com.upc.mindcare.dtos.ValoracionesDTO;
import com.upc.mindcare.services.ValoracionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/valoraciones")
@Tag(name = "Valoraciones", description = "Valoración de profesionales por pacientes")
public class ValoracionController {

    @Autowired
    private ValoracionService valoracionService;

    @PostMapping
    @PreAuthorize("hasRole('PACIENTE')")
    public ValoracionesDTO registrarValoracion(@Valid @RequestBody ValoracionesDTO dto) {
        return valoracionService.registrarValoracion(dto);
    }

    @GetMapping("/profesional/{profesionalId}")
    @PreAuthorize("hasAnyRole('PACIENTE', 'PROFESIONAL')")
    public List<ValoracionesDTO> listarValoracionesPorProfesional(@PathVariable Long profesionalId) {
        return valoracionService.listarValoracionesPorProfesional(profesionalId);
    }

    @GetMapping("/profesional/{profesionalId}/promedio")
    @PreAuthorize("hasAnyRole('PACIENTE', 'PROFESIONAL')")
    public Double calcularPromedioValoracion(@PathVariable Long profesionalId) {
        return valoracionService.calcularPromedioValoracion(profesionalId);
    }
}