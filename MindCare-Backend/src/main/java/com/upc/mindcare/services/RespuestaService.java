package com.upc.mindcare.services;

import com.upc.mindcare.interfaces.IRespuestaService;

import com.upc.mindcare.dtos.RespuestaDTO;
import com.upc.mindcare.entities.Encuesta;
import com.upc.mindcare.entities.Pregunta;
import com.upc.mindcare.entities.Respuesta;
import com.upc.mindcare.repositories.EncuestaRepositorio;
import com.upc.mindcare.repositories.PreguntaRepositorio;
import com.upc.mindcare.repositories.RespuestaRepositorio;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RespuestaService implements IRespuestaService {

    @Autowired
    private RespuestaRepositorio respuestaRepositorio;

    @Autowired
    private EncuestaRepositorio encuestaRepositorio;

    @Autowired
    private PreguntaRepositorio preguntaRepositorio;

    @Autowired
    private ModelMapper modelMapper;

    @Transactional
    public RespuestaDTO registrarRespuesta(RespuestaDTO dto) {
        Encuesta encuesta = encuestaRepositorio.findById(dto.getEncuestaId())
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada"));

        Pregunta pregunta = preguntaRepositorio.findById(dto.getPreguntaId())
                .orElseThrow(() -> new RuntimeException("Pregunta no encontrada"));

        if (respuestaRepositorio.existsByEncuesta_IdEncuestaAndPregunta_IdPregunta(
                dto.getEncuestaId(),
                dto.getPreguntaId()
        )) {
            throw new RuntimeException("La pregunta ya fue respondida en esta encuesta");
        }

        Respuesta respuesta = new Respuesta();
        respuesta.setEncuesta(encuesta);
        respuesta.setPregunta(pregunta);
        respuesta.setContenido(dto.getContenido());

        respuesta = respuestaRepositorio.save(respuesta);

        return mapToDTO(respuesta);
    }

    public List<RespuestaDTO> listarRespuestasPorEncuesta(Long encuestaId) {
        encuestaRepositorio.findById(encuestaId)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada"));

        return respuestaRepositorio.findByEncuesta_IdEncuesta(encuestaId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    private RespuestaDTO mapToDTO(Respuesta respuesta) {
        RespuestaDTO dto = modelMapper.map(respuesta, RespuestaDTO.class);

        if (respuesta.getEncuesta() != null) {
            dto.setEncuestaId(respuesta.getEncuesta().getIdEncuesta());
        }

        if (respuesta.getPregunta() != null) {
            dto.setPreguntaId(respuesta.getPregunta().getIdPregunta());
        }

        return dto;
    }
}


