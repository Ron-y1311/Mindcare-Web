package com.upc.mindcare.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ResumenEmocionalDTO {
    private Long pacienteId;
    private Integer registrosEmocionales;
    private Integer encuestasRegistradas;
    private Integer citasRegistradas;
    private Long medicacionesActivas;
    private String interpretacion;
    private Boolean datosSuficientes;
}