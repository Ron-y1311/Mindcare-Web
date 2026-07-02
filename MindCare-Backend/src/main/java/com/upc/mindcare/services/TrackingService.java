package com.upc.mindcare.services;

import com.upc.mindcare.interfaces.ITrackingService;

import com.upc.mindcare.dtos.TrackingDTO;
import com.upc.mindcare.entities.EstadoAnimo;
import com.upc.mindcare.entities.Paciente;
import com.upc.mindcare.entities.Tracking;
import com.upc.mindcare.repositories.EstadoAnimoRepositorio;
import com.upc.mindcare.repositories.PacienteRepositorio;
import com.upc.mindcare.repositories.TrackingRepositorio;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TrackingService implements ITrackingService {

    @Autowired
    private TrackingRepositorio trackingRepositorio;

    @Autowired
    private PacienteRepositorio pacienteRepositorio;

    @Autowired
    private EstadoAnimoRepositorio estadoAnimoRepositorio;

    @Autowired
    private ModelMapper modelMapper;


    @Transactional
    //Implementar registro emocional
    public TrackingDTO
    registrarEstadoEmocional(TrackingDTO dto) {
        Paciente paciente = pacienteRepositorio.findById(dto.getPacienteId())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        EstadoAnimo estado = estadoAnimoRepositorio.findById(dto.getEstadoAnimoId())
                .orElseThrow(() -> new RuntimeException("Estado de ÃƒÆ’Ã‚Â¡nimo no encontrado"));

        validarIntensidad(dto.getNumeroIntensidad());

        Tracking tracking = new Tracking();
        tracking.setPaciente(paciente);
        tracking.setEstadoAnimo(estado);
        tracking.setNumeroIntensidad(dto.getNumeroIntensidad());
        tracking.setNota(dto.getNota());
        tracking.setReflexionDescripcion(dto.getReflexionDescripcion());
        tracking.setFecha(LocalDateTime.now());

        tracking = trackingRepositorio.save(tracking);

        return mapToDTO(tracking);
    }

    //Se agrega una funcion para poder consultar el historial emocional en el service
    public List<TrackingDTO> consultarHistorialEmocional(Long pacienteId) {
        validarPacienteExiste(pacienteId);

        return trackingRepositorio.findByPaciente_PacienteIdOrderByFechaAsc(pacienteId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional
    //Implementar registro de reflexion diaria en services
    public TrackingDTO registrarReflexionDiaria(Long trackingId, TrackingDTO dto) {
        Tracking tracking = trackingRepositorio.findById(trackingId)
                .orElseThrow(() -> new RuntimeException("Tracking no encontrado"));

        if (dto.getNota() != null) {
            tracking.setNota(dto.getNota());
        }

        if (dto.getReflexionDescripcion() != null) {
            tracking.setReflexionDescripcion(dto.getReflexionDescripcion());
        }

        tracking = trackingRepositorio.save(tracking);

        return mapToDTO(tracking);
    }

    public TrackingDTO obtenerUltimoTracking(Long pacienteId) {
        validarPacienteExiste(pacienteId);

        return trackingRepositorio.findByPaciente_PacienteIdOrderByFechaAsc(pacienteId)
                .stream()
                .reduce((anterior, actual) -> actual)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("No hay registros de tracking"));
    }

    private void validarPacienteExiste(Long pacienteId) {
        pacienteRepositorio.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
    }

    private void validarIntensidad(Integer intensidad) {
        if (intensidad == null) {
            throw new RuntimeException("La intensidad emocional es obligatoria");
        }

        if (intensidad < 1 || intensidad > 10) {
            throw new RuntimeException("La intensidad emocional debe estar entre 1 y 10");
        }
    }

    private TrackingDTO mapToDTO(Tracking tracking) {
        TrackingDTO dto = modelMapper.map(tracking, TrackingDTO.class);

        if (tracking.getPaciente() != null) {
            dto.setPacienteId(tracking.getPaciente().getPacienteId());
        }

        if (tracking.getEstadoAnimo() != null) {
            dto.setEstadoAnimoId(tracking.getEstadoAnimo().getIdEstadoAnimo());
        }

        return dto;
    }
}


