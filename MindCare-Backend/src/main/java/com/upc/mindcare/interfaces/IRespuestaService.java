package com.upc.mindcare.interfaces;

import com.upc.mindcare.dtos.RespuestaDTO;

import java.util.List;

public interface IRespuestaService {
    RespuestaDTO registrarRespuesta(RespuestaDTO dto);
    List<RespuestaDTO> listarRespuestasPorEncuesta(Long encuestaId);
}