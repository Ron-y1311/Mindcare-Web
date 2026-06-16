package com.upc.mindcare.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MedicacionPacienteDTO {
    private Long idMedicacion;

    @NotNull(message = "Cita obligatoria")
    private Long citaId;

    private Long pacienteId;
    private Long profesionalId;

    @NotBlank(message = "Nombre del medicamento obligatorio")
    private String nombreMedicamento;

    @NotBlank(message = "Dosis obligatoria")
    private String dosis;

    @NotBlank(message = "Frecuencia obligatoria")
    private String frecuencia;

    private String duracion;
    private String indicaciones;

    @NotNull(message = "Fecha de inicio obligatoria")
    private LocalDate fechaInicio;

    private LocalDate fechaFin;
    private Boolean tratamientoActivo;
}
