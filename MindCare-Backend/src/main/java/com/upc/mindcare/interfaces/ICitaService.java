package com.upc.mindcare.interfaces;

import com.upc.mindcare.dtos.CitaDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface ICitaService {
    CitaDTO agendarCita(CitaDTO dto);
    List<CitaDTO> listarCitasPorPaciente(Long pacienteId);
    List<CitaDTO> listarCitasPorProfesional(Long profesionalId);
    void confirmarCita(Long citaId);
    void reprogramarCita(Long citaId, LocalDateTime nuevaFecha);
    void cancelarCita(Long citaId);
    void finalizarCita(Long citaId);
    void cambiarEstadoCita(Long citaId, Long estadoId);
    void registrarNotaClinica(Long citaId, CitaDTO citaDTO);
    void actualizarNotaClinica(Long citaId, CitaDTO dto);
    CitaDTO obtenerNotaClinicaPorCita(Long citaId);
}