package com.upc.mindcare.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RespuestaDTO
{
    private Long idRespuesta;

    @NotBlank(message = "Contenido obligatorio")
    private String contenido;

    @NotNull(message = "Encuesta obligatoria")
    private Long encuestaId;

    @NotNull(message = "Pregunta obligatoria")
    private Long preguntaId;
}

