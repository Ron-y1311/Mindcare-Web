package com.upc.mindcare.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class ValoracionesDTO {
    private Long idValoracion;

    @NotNull(message = "Cita obligatoria")
    private Long citaId;

    private Long pacienteId;
    private Long profesionalId;

    @Min(1)
    @Max(5)
    private Integer puntuacion;

    private String comentario;
    private LocalDateTime fechaRegistro;
}
