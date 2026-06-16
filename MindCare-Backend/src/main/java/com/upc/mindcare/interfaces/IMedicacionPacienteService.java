package com.upc.mindcare.interfaces;

import com.upc.mindcare.dtos.MedicacionPacienteDTO;

import java.util.List;

public interface IMedicacionPacienteService {
    MedicacionPacienteDTO registrarMedicacion(MedicacionPacienteDTO dto);
    List<MedicacionPacienteDTO> listarMedicacionesPorPaciente(Long pacienteId);
    MedicacionPacienteDTO actualizarMedicacion(Long id, MedicacionPacienteDTO dto);
    void eliminarMedicacion(Long id);
}