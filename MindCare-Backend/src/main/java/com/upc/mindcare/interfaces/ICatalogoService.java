package com.upc.mindcare.interfaces;

import com.upc.mindcare.dtos.EspecialidadDTO;
import com.upc.mindcare.dtos.EstadoAnimoDTO;
import com.upc.mindcare.dtos.EstadoCitaDTO;
import com.upc.mindcare.dtos.PreguntaDTO;
import com.upc.mindcare.dtos.RolDTO;

import java.util.List;

public interface ICatalogoService {
    List<RolDTO> listarRoles();
    List<EstadoAnimoDTO> listarEstadosAnimo();
    List<EstadoCitaDTO> listarEstadosCita();
    List<PreguntaDTO> listarPreguntas();
    List<EspecialidadDTO> listarEspecialidades();
}