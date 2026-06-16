package com.upc.mindcare.interfaces;

import com.upc.mindcare.dtos.ProfesionalDTO;

import java.util.List;

public interface IProfesionalService {
    ProfesionalDTO completarPerfilProfesional(ProfesionalDTO dto);
    ProfesionalDTO actualizarPerfilProfesional(Long id, ProfesionalDTO dto);
    ProfesionalDTO asociarEspecialidades(Long id, List<Long> especialidadIds);
    List<ProfesionalDTO> listarProfesionales();
    List<ProfesionalDTO> listarProfesionalesPorEspecialidad(Long especialidadId);
    ProfesionalDTO buscarProfesionalPorId(Long id);
    ProfesionalDTO cambiarEstadoValidacion(Long id, String estado);
    ProfesionalDTO aprobarProfesional(Long id);
    ProfesionalDTO rechazarProfesional(Long id, String motivo);
}