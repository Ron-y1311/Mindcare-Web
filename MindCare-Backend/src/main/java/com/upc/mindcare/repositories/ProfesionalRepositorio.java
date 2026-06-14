package com.upc.mindcare.repositories;

import com.upc.mindcare.entities.Profesional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProfesionalRepositorio extends JpaRepository<Profesional, Long> {
    boolean existsByUsuario_IdUsuario(Long usuarioId);
    List<Profesional> findByEspecialidades_IdEspecialidad(Long idEspecialidad);
}