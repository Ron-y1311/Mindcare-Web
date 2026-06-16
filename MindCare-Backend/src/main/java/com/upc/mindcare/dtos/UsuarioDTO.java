package com.upc.mindcare.dtos;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UsuarioDTO
{
    private Long idUsuario;

    @NotBlank(message = "Nombre obligatorio")
    private String nombre;

    @NotBlank(message = "Username obligatorio")
    private String username;

    @NotBlank(message = "Correo obligatorio")
    @Email(message = "Correo invalido")
    private String correo;

    @NotBlank(message = "Password obligatorio")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private Boolean verificado;
    private LocalDateTime fechaRegistro;
    private Boolean activo;
    private LocalDateTime ultimoAcceso;
    private Long rolId;
    private Long profesionalId;
    private Long pacienteId;
}


