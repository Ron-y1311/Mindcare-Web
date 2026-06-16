package com.upc.mindcare.interfaces;

import com.upc.mindcare.dtos.ValoracionesDTO;

import java.util.List;

public interface IValoracionService {
    ValoracionesDTO registrarValoracion(ValoracionesDTO dto);
    List<ValoracionesDTO> listarValoracionesPorProfesional(Long profesionalId);
    Double calcularPromedioValoracion(Long profesionalId);
}