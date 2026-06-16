package com.upc.mindcare.controllers;

import com.upc.mindcare.dtos.MedicacionPacienteDTO;
import com.upc.mindcare.services.MedicacionPacienteService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicacion-paciente")
@Tag(name = "Medicación", description = "Gestión de medicación de pacientes")
public class MedicacionPacienteController {

    @Autowired
    private MedicacionPacienteService medicacionPacienteService;

    @PostMapping
    @PreAuthorize("hasRole('PROFESIONAL')")
    public MedicacionPacienteDTO registrarMedicacion(@Valid @RequestBody MedicacionPacienteDTO dto) {
        return medicacionPacienteService.registrarMedicacion(dto);
    }

    @GetMapping("/paciente/{pacienteId}")
    @PreAuthorize("hasAnyRole('PACIENTE', 'PROFESIONAL')")
    public List<MedicacionPacienteDTO> listarMedicacionesPorPaciente(@PathVariable Long pacienteId) {
        return medicacionPacienteService.listarMedicacionesPorPaciente(pacienteId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROFESIONAL')")
    public MedicacionPacienteDTO actualizarMedicacion(
            @PathVariable Long id,
            @RequestBody MedicacionPacienteDTO dto
    ) {
        return medicacionPacienteService.actualizarMedicacion(id, dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROFESIONAL')")
    public void eliminarMedicacion(@PathVariable Long id) {
        medicacionPacienteService.eliminarMedicacion(id);
    }
}