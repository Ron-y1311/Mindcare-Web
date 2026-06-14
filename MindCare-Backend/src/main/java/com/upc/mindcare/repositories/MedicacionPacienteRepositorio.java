package com.upc.mindcare.repositories;

import com.upc.mindcare.entities.MedicacionPaciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicacionPacienteRepositorio extends JpaRepository<MedicacionPaciente, Long> {
    List<MedicacionPaciente> findByCita_Paciente_PacienteId(Long pacienteId);
    List<MedicacionPaciente> findByCita_Profesional_IdProfesional(Long profesionalId);
}
