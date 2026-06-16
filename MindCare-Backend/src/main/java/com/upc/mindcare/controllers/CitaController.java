package com.upc.mindcare.controllers;

import com.upc.mindcare.dtos.CitaDTO;
import com.upc.mindcare.services.CitaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citas")
@Tag(name = "Citas", description = "Gestión de citas entre pacientes y profesionales")
public class CitaController {

    @Autowired
    private CitaService citaService;

    @PostMapping
    @PreAuthorize("hasRole('PACIENTE')")
    public CitaDTO agendar(@Valid @RequestBody CitaDTO dto) {
        return citaService.agendarCita(dto);
    }

    @GetMapping("/paciente/{id}")
    @PreAuthorize("hasAnyRole('PACIENTE', 'PROFESIONAL')")
    public List<CitaDTO> listarPorPaciente(@PathVariable Long id) {
        return citaService.listarCitasPorPaciente(id);
    }

    @GetMapping("/profesional/{id}")
    @PreAuthorize("hasRole('PROFESIONAL')")
    public List<CitaDTO> listarPorProfesional(@PathVariable Long id) {
        return citaService.listarCitasPorProfesional(id);
    }
    //Confirmar cita puede ser accedido solo por el profesional
    @PutMapping("/{id}/confirmar")
    @PreAuthorize("hasRole('PROFESIONAL')")
    public void confirmarCita(@PathVariable Long id) {
        citaService.confirmarCita(id);
    }

    @PutMapping("/{id}/reprogramar")
    @PreAuthorize("hasAnyRole('PACIENTE', 'PROFESIONAL')")
    public void reprogramar(@PathVariable Long id, @RequestBody CitaDTO dto) {
        citaService.reprogramarCita(id, dto.getFecha());
    }
    //Cancelar cita puede ser ejecutado por un paciente, el profesional puede acceder pero solo para recibir la informacion de cancelacion
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PACIENTE', 'PROFESIONAL')")
    public void cancelar(@PathVariable Long id) {
        citaService.cancelarCita(id);
    }

    @PutMapping("/{id}/finalizar")
    @PreAuthorize("hasRole('PROFESIONAL')")
    public void finalizarCita(@PathVariable Long id) {
        citaService.finalizarCita(id);
    }

    @PutMapping("/{id}/estado/{estadoId}")
    @PreAuthorize("hasRole('PROFESIONAL')")
    public void cambiarEstado(@PathVariable Long id, @PathVariable Long estadoId) {
        citaService.cambiarEstadoCita(id, estadoId);
    }

    @PostMapping("/{id}/nota-clinica")
    @PreAuthorize("hasRole('PROFESIONAL')")
    public void registrarNotaClinica(@PathVariable Long id, @RequestBody CitaDTO dto) {
        citaService.registrarNotaClinica(id, dto);
    }

    @PutMapping("/{id}/nota-clinica")
    @PreAuthorize("hasRole('PROFESIONAL')")
    public void actualizarNotaClinica(@PathVariable Long id, @RequestBody CitaDTO dto) {
        citaService.actualizarNotaClinica(id, dto);
    }

    @GetMapping("/{id}/nota-clinica")
    @PreAuthorize("hasRole('PROFESIONAL')")
    public CitaDTO obtenerNotaClinica(@PathVariable Long id) {
        return citaService.obtenerNotaClinicaPorCita(id);
    }
}