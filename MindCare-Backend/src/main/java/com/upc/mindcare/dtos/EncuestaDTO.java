package com.upc.mindcare.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EncuestaDTO {
    private Long encuestaId;
    private LocalDateTime fechaRegistro;
    private String tipoEncuesta;
    private String estado;
    private Integer resultadoTotal;
    private String interpretacionResultado;

    @NotNull(message = "Paciente obligatorio")
    private Long pacienteId;
}