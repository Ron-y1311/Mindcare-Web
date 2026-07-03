package com.upc.mindcare.interfaces;

import com.upc.mindcare.dtos.EspecialidadDTO;
import com.upc.mindcare.dtos.EstadoAnimoDTO;
import com.upc.mindcare.dtos.EstadoCitaDTO;
import com.upc.mindcare.dtos.PreguntaDTO;
import com.upc.mindcare.dtos.RolDTO;

import java.util.List;
//Contrato del servicio que define los métodos para la administración de los catálogos del sistema
public interface ICatalogoService {
    List<RolDTO> listarRoles();
    RolDTO crearRol(RolDTO dto);
    RolDTO actualizarRol(Long id, RolDTO dto);
    void eliminarRol(Long id);

    List<EstadoAnimoDTO> listarEstadosAnimo();
    EstadoAnimoDTO crearEstadoAnimo(EstadoAnimoDTO dto);
    EstadoAnimoDTO actualizarEstadoAnimo(Long id, EstadoAnimoDTO dto);
    void eliminarEstadoAnimo(Long id);

    List<EstadoCitaDTO> listarEstadosCita();
    EstadoCitaDTO crearEstadoCita(EstadoCitaDTO dto);
    EstadoCitaDTO actualizarEstadoCita(Long id, EstadoCitaDTO dto);
    void eliminarEstadoCita(Long id);

    List<PreguntaDTO> listarPreguntas();
    PreguntaDTO crearPregunta(PreguntaDTO dto);
    PreguntaDTO actualizarPregunta(Long id, PreguntaDTO dto);
    void eliminarPregunta(Long id);

    List<EspecialidadDTO> listarEspecialidades();
    EspecialidadDTO crearEspecialidad(EspecialidadDTO dto);
    EspecialidadDTO actualizarEspecialidad(Long id, EspecialidadDTO dto);
    void eliminarEspecialidad(Long id);
}