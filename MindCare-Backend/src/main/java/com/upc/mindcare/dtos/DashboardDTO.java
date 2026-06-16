package com.upc.mindcare.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DashboardDTO {
    private Long pacienteId;
    private String estadoGeneral;
    private Double promedioIntensidad;
    private Integer totalRegistrosEmocionales;
    private Integer totalEncuestas;
    private Integer totalCitas;
    private Boolean tieneDatos;
    private String mensaje;
}