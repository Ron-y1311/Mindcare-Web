package com.upc.mindcare.repositories;

import com.upc.mindcare.entities.Respuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RespuestaRepositorio extends JpaRepository<Respuesta, Long> {
    List<Respuesta> findByEncuesta_IdEncuesta(Long encuestaId);
    boolean existsByEncuesta_IdEncuestaAndPregunta_IdPregunta(Long encuestaId, Long preguntaId);
    boolean existsByPregunta_IdPregunta(Long idPregunta);
}