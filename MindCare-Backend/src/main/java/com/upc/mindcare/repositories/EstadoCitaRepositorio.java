package com.upc.mindcare.repositories;
import com.upc.mindcare.entities.EstadoCita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstadoCitaRepositorio extends JpaRepository<EstadoCita, Long> {
    EstadoCita findByNombre(String nombre);
}

