package com.upc.mindcare.repositories;
import com.upc.mindcare.entities.EstadoAnimo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstadoAnimoRepositorio extends JpaRepository<EstadoAnimo, Long> {
}

