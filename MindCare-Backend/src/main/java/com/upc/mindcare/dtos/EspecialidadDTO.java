package com.upc.mindcare.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EspecialidadDTO {
    private Long idEspecialidad;

    @NotBlank(message = "Nombre obligatorio")
    private String nombre;

    private String descripcion;
}