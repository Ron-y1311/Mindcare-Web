package com.upc.mindcare.repositories;

import com.upc.mindcare.entities.Encuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EncuestaRepositorio extends JpaRepository<Encuesta, Long> {
    List<Encuesta> findByPaciente_PacienteId(Long pacienteId);
    List<Encuesta> findByPaciente_PacienteIdAndTipoEncuesta(Long pacienteId, String tipoEncuesta);
    List<Encuesta> findByPaciente_PacienteIdAndEstado(Long pacienteId, String estado);
}