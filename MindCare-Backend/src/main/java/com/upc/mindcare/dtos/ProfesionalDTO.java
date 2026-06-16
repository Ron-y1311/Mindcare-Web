package com.upc.mindcare.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProfesionalDTO {
    private Long idProfesional;

    @NotBlank(message = "Especialidad obligatoria")
    private String especialidad;

    private String numeroColegiatura;

    @Min(value = 0, message = "Experiencia invalida")
    private Integer aniosExperiencia;

    private String etiquetas;
    private String descripcionPerfil;
    private String documentoValidacion;
    private String estadoValidacion;
    private String motivoRechazo;
    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaValidacion;
    private Long usuarioId;
    private List<Long> especialidadIds;
    private List<String> especialidades;
    private String nombre;
    private String username;
    private String correo;
    private String password;
}