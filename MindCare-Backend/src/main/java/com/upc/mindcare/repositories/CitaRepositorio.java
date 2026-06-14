package com.upc.mindcare.repositories;

import com.upc.mindcare.entities.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CitaRepositorio extends JpaRepository<Cita, Long> {
    List<Cita> findByPaciente_PacienteId(Long pacienteId);
    List<Cita> findByProfesional_IdProfesional(Long profesionalId);
    boolean existsByProfesional_IdProfesionalAndFecha(Long profesionalId, LocalDateTime fecha);
    boolean existsByEstadoCita_IdEstadoCita(Long idEstadoCita);
}