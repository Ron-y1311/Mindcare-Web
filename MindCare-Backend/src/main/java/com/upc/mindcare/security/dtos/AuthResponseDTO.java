package com.upc.mindcare.security.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponseDTO {
    private String jwt;
    private Long usuarioId;
    private String nombre;
    private String correo;
    private Set<String> roles;
    private Long pacienteId;
    private Long profesionalId;
}