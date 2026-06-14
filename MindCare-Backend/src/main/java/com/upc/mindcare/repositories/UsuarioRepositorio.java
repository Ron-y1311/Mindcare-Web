package com.upc.mindcare.repositories;

import com.upc.mindcare.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepositorio extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByCorreo(String correo);
    Optional<Usuario> findByCorreoAndActivoTrue(String correo);
    List<Usuario> findByRol_Nombre(String nombreRol);
    Optional<Usuario> findByUsernameAndActivoTrue(String username);
    boolean existsByRol_IdRol(Long idRol);
}