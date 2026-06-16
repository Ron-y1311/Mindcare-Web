package com.upc.mindcare.dtos;

import jakarta.validation.constraints.NotBlank;
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
public class CitaDTO
{
    private Long idCita;

    @NotNull(message = "Fecha obligatoria")
    private LocalDateTime fecha;
    private String nombrePaciente;
    private String nombreProfesional;
    @NotBlank(message = "Motivo obligatorio")
    private String motivoConsulta;


    private String nota;
    private String observacionesClinicas;
    private String planAccion;
    private String estadoNota;
    private LocalDateTime fechaNota;

    @NotNull(message = "Paciente obligatorio")
    private Long pacienteId;

    @NotNull(message = "Profesional obligatorio")
    private Long profesionalId;

    private Long estadoCitaId;



}


