package com.upc.mindcare.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RecomendacionDTO {
    private Long pacienteId;
    private String estadoEmocional;
    private String nivelRiesgo;
    private String tendencia;
    private Integer puntajeRiesgo;
    private Integer ultimoBienestar;
    private Integer ultimaIntensidad;
    private Double promedioIntensidad;
    private Double promedioBienestar;
    private String mensajePrincipal;
    private List<String> factoresDetectados;
    private List<String> recomendaciones;
    private List<String> accionesSugeridas;
    private Boolean requiereAtencionProfesional;
    private String alertaPreventiva;
}
