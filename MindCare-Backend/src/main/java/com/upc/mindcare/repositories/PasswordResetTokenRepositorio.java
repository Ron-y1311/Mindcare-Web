package com.upc.mindcare.repositories;

import com.upc.mindcare.entities.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

//Repositorio para reset del password
@Repository
public interface PasswordResetTokenRepositorio extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
}