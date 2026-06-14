package com.upc.mindcare.repositories;

import com.upc.mindcare.entities.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PacienteRepositorio extends JpaRepository<Paciente, Long>
{

    boolean existsByUsuario_IdUsuario(Long usuarioId);
}

