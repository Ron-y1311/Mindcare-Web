package com.upc.mindcare.controllers;

import com.upc.mindcare.dtos.EncuestaDTO;
import com.upc.mindcare.services.EncuestaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/encuestas")
@Tag(name = "Encuestas", description = "Gestión de encuestas de salud mental")
public class EncuestaController {

    @Autowired
    private EncuestaService encuestaService;

    //La encuesta inicial se realiza cuando el usuario paciente entra a su dashboard principal. Sirve para obtener informacion del estado de animo del paciente en el momento
    @PostMapping("/encuesta-inicial")
    @PreAuthorize("hasRole('PACIENTE')")
    public EncuestaDTO crearEncuestaInicial(@Valid @RequestBody EncuestaDTO dto) {
        return encuestaService.crearEncuestaInicial(dto);
    }

    @PostMapping("/encuesta-diaria")
    @PreAuthorize("hasRole('PACIENTE')")
    public EncuestaDTO crearEncuestaDiaria(@Valid @RequestBody EncuestaDTO dto) {
        return encuestaService.crearEncuestaDiaria(dto);
    }

    @PostMapping("/paciente/{pacienteId}/encuesta-diaria-pendiente")
    @PreAuthorize("hasRole('PACIENTE')")
    public EncuestaDTO crearEncuestaDiariaPendiente(@PathVariable Long pacienteId) {
        return encuestaService.crearEncuestaDiariaPendiente(pacienteId);
    }

    @PutMapping("/{encuestaId}/finalizar")
    @PreAuthorize("hasRole('PACIENTE')")
    public EncuestaDTO finalizarEncuesta(
            @PathVariable Long encuestaId,
            @Valid @RequestBody EncuestaDTO dto
    ) {
        return encuestaService.finalizarEncuesta(encuestaId, dto);
    }

    @GetMapping("/paciente/{pacienteId}")
    @PreAuthorize("hasRole('PACIENTE')")
    public List<EncuestaDTO> listarEncuestasPorPaciente(@PathVariable Long pacienteId) {
        return encuestaService.listarEncuestasPorPaciente(pacienteId);
    }

    @GetMapping("/paciente/{pacienteId}/iniciales")
    @PreAuthorize("hasRole('PACIENTE')")
    public List<EncuestaDTO> listarEncuestasInicialesPorPaciente(@PathVariable Long pacienteId) {
        return encuestaService.listarEncuestasInicialesPorPaciente(pacienteId);
    }

    @GetMapping("/paciente/{pacienteId}/diarias")
    @PreAuthorize("hasRole('PACIENTE')")
    public List<EncuestaDTO> listarEncuestasDiariasPorPaciente(@PathVariable Long pacienteId) {
        return encuestaService.listarEncuestasDiariasPorPaciente(pacienteId);
    }

    @GetMapping("/paciente/{pacienteId}/pendientes")
    @PreAuthorize("hasRole('PACIENTE')")
    public List<EncuestaDTO> listarPendientes(@PathVariable Long pacienteId) {
        return encuestaService.listarEncuestasPendientesPorPaciente(pacienteId);
    }

    @GetMapping("/paciente/{pacienteId}/resultados")
    @PreAuthorize("hasRole('PACIENTE')")
    public List<EncuestaDTO> consultarResultadosEncuestas(@PathVariable Long pacienteId) {
        return encuestaService.consultarResultadosEncuestas(pacienteId);
    }
}