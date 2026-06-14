package com.upc.mindcare.repositories;

import com.upc.mindcare.entities.Tracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrackingRepositorio extends JpaRepository<Tracking, Long> {
    List<Tracking> findByPaciente_PacienteId(Long pacienteId);
    List<Tracking> findByPaciente_PacienteIdOrderByFechaAsc(Long pacienteId);
    boolean existsByEstadoAnimo_IdEstadoAnimo(Long idEstadoAnimo);
}