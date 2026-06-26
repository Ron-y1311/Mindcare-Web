package com.upc.mindcare.interfaces;

import com.upc.mindcare.dtos.EncuestaDTO;

import java.util.List;
//Elaboracoin de IEncuestaService
public interface IEncuestaService {
    EncuestaDTO crearEncuestaDiariaPendiente(Long pacienteId);
    EncuestaDTO finalizarEncuesta(Long encuestaId, EncuestaDTO dto);
    List<EncuestaDTO> listarEncuestasPorPaciente(Long pacienteId);
    List<EncuestaDTO> listarEncuestasInicialesPorPaciente(Long pacienteId);
    List<EncuestaDTO> listarEncuestasDiariasPorPaciente(Long pacienteId);
    List<EncuestaDTO> listarEncuestasPendientesPorPaciente(Long pacienteId);
    List<EncuestaDTO> consultarResultadosEncuestas(Long pacienteId);
}