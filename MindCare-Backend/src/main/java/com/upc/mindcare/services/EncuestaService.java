package com.upc.mindcare.services;

import com.upc.mindcare.interfaces.IEncuestaService;

import com.upc.mindcare.dtos.EncuestaDTO;
import com.upc.mindcare.entities.Encuesta;
import com.upc.mindcare.entities.Paciente;
import com.upc.mindcare.repositories.EncuestaRepositorio;
import com.upc.mindcare.repositories.PacienteRepositorio;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EncuestaService implements IEncuestaService {
    private static final String TIPO_INICIAL = "INICIAL";
    private static final String TIPO_DIARIA = "DIARIA";
    private static final String ESTADO_COMPLETADA = "COMPLETADA";
    private static final String ESTADO_PENDIENTE = "PENDIENTE";

    @Autowired private EncuestaRepositorio encuestaRepositorio;
    @Autowired private PacienteRepositorio pacienteRepositorio;
    @Autowired private ModelMapper modelMapper;

    @Transactional public EncuestaDTO crearEncuestaInicial(EncuestaDTO dto)
    {
        return crearEncuesta(dto, TIPO_INICIAL, true); }
    @Transactional public EncuestaDTO crearEncuestaDiaria(EncuestaDTO dto) { return crearEncuesta(dto, TIPO_DIARIA, true); }

    @Transactional
    public EncuestaDTO crearEncuestaDiariaPendiente(Long pacienteId) {
        EncuestaDTO dto = new EncuestaDTO();
        dto.setPacienteId(pacienteId);
        return crearEncuesta(dto, TIPO_DIARIA, false);
    }
    @Transactional
    public EncuestaDTO finalizarEncuesta(Long encuestaId, EncuestaDTO dto) {
        Encuesta encuesta = encuestaRepositorio.findById(encuestaId)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada"));

        if (ESTADO_COMPLETADA.equals(encuesta.getEstado())) {
            throw new RuntimeException("La encuesta ya estÃ¡ completada");
        }

        validarResultado(dto.getResultadoTotal());

        encuesta.setResultadoTotal(dto.getResultadoTotal());
        encuesta.setInterpretacionResultado(dto.getInterpretacionResultado());
        encuesta.setEstado(ESTADO_COMPLETADA);

        return mapToDTO(encuestaRepositorio.save(encuesta));
    }

    private EncuestaDTO crearEncuesta(EncuestaDTO dto, String tipo, boolean completada) {
        Paciente paciente = pacienteRepositorio.findById(dto.getPacienteId())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        if (completada) validarResultado(dto.getResultadoTotal());

        Encuesta encuesta = new Encuesta();
        encuesta.setPaciente(paciente);
        encuesta.setTipoEncuesta(tipo);
        encuesta.setEstado(completada ? ESTADO_COMPLETADA : ESTADO_PENDIENTE);
        encuesta.setFechaRegistro(LocalDateTime.now());
        encuesta.setResultadoTotal(dto.getResultadoTotal());
        encuesta.setInterpretacionResultado(dto.getInterpretacionResultado());
        return mapToDTO(encuestaRepositorio.save(encuesta));
    }

    public List<EncuestaDTO> listarEncuestasPorPaciente(Long pacienteId)
    {
        validarPacienteExiste(pacienteId);
        return encuestaRepositorio.findByPaciente_PacienteId(pacienteId)
                .stream().map(this::mapToDTO).toList();
    }
    public List<EncuestaDTO> listarEncuestasInicialesPorPaciente(Long pacienteId)
    { validarPacienteExiste(pacienteId);
        return encuestaRepositorio.findByPaciente_PacienteIdAndTipoEncuesta(pacienteId, TIPO_INICIAL)
                .stream().map(this::mapToDTO).toList();
    }
    public List<EncuestaDTO> listarEncuestasDiariasPorPaciente(Long pacienteId)
    { validarPacienteExiste(pacienteId);
        return encuestaRepositorio.findByPaciente_PacienteIdAndTipoEncuesta(pacienteId, TIPO_DIARIA)
                .stream().map(this::mapToDTO).toList();
    }
    public List<EncuestaDTO> listarEncuestasPendientesPorPaciente(Long pacienteId)
    {
        validarPacienteExiste(pacienteId);
        return encuestaRepositorio.findByPaciente_PacienteIdAndEstado(pacienteId, ESTADO_PENDIENTE)
                .stream().map(this::mapToDTO).toList();
    }

    //Metodo que filtra mediante Java Streams las encuestas del paciente que estan en estado COMPLETADA
    public List<EncuestaDTO> consultarResultadosEncuestas(Long pacienteId)
    { return listarEncuestasPorPaciente(pacienteId)
            .stream().filter(e -> ESTADO_COMPLETADA.equals(e.getEstado())).toList();
    }

    private void validarPacienteExiste(Long pacienteId)
    { pacienteRepositorio.findById(pacienteId)
            .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
    }
    private void validarResultado(Integer resultado)
    {
        if (resultado == null) throw new RuntimeException("Resultado obligatorio para finalizar la encuesta");
    }

    private EncuestaDTO mapToDTO(Encuesta encuesta) {
        EncuestaDTO dto = modelMapper.map(encuesta, EncuestaDTO.class);
        dto.setEncuestaId(encuesta.getIdEncuesta());
        if (encuesta.getPaciente() != null) dto.setPacienteId(encuesta.getPaciente().getPacienteId());
        return dto;
    }
}
