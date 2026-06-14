package com.upc.mindcare.repositories;

import com.upc.mindcare.entities.Valoraciones;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ValoracionesRepositorio extends JpaRepository<Valoraciones, Long> {
    List<Valoraciones> findByCita_Profesional_IdProfesional(Long profesionalId);
    boolean existsByCita_IdCita(Long citaId);
}
