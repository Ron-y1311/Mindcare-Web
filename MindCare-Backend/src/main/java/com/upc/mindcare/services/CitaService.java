package com.upc.mindcare.services;

import com.upc.mindcare.interfaces.ICitaService;

import com.upc.mindcare.dtos.CitaDTO;
import com.upc.mindcare.entities.Cita;
import com.upc.mindcare.entities.EstadoCita;
import com.upc.mindcare.entities.Paciente;
import com.upc.mindcare.entities.Profesional;
import com.upc.mindcare.repositories.CitaRepositorio;
import com.upc.mindcare.repositories.EstadoCitaRepositorio;
import com.upc.mindcare.repositories.PacienteRepositorio;
import com.upc.mindcare.repositories.ProfesionalRepositorio;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CitaService implements ICitaService {

    private static final String ESTADO_PENDIENTE = "PENDIENTE";
    private static final String ESTADO_CONFIRMADA = "CONFIRMADA";
    private static final String ESTADO_REPROGRAMADA = "REPROGRAMADA";
    private static final String ESTADO_CANCELADO = "CANCELADO";
    private static final String ESTADO_FINALIZADA = "FINALIZADA";

    @Autowired
    private CitaRepositorio citaRepositorio;

    @Autowired
    private PacienteRepositorio pacienteRepositorio;

    @Autowired
    private ProfesionalRepositorio profesionalRepositorio;

    @Autowired
    private EstadoCitaRepositorio estadoCitaRepositorio;

    @Autowired
    private ModelMapper modelMapper;

    @Transactional
    public CitaDTO agendarCita(CitaDTO dto) {
        Paciente paciente = pacienteRepositorio.findById(dto.getPacienteId())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        Profesional profesional = profesionalRepositorio.findById(dto.getProfesionalId())
                .orElseThrow(() -> new RuntimeException("Profesional no encontrado"));

        validarFechaDisponible(profesional.getIdProfesional(), dto.getFecha());

        Cita cita = new Cita();
        cita.setPaciente(paciente);
        cita.setProfesional(profesional);
        cita.setEstadoCita(obtenerEstadoPorNombre(ESTADO_PENDIENTE));
        cita.setFecha(dto.getFecha());
        cita.setMotivoConsulta(dto.getMotivoConsulta());

        return mapToDTO(citaRepositorio.save(cita));
    }

    public List<CitaDTO> listarCitasPorPaciente(Long pacienteId) {
        pacienteRepositorio.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        return citaRepositorio.findByPaciente_PacienteId(pacienteId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<CitaDTO> listarCitasPorProfesional(Long profesionalId) {
        profesionalRepositorio.findById(profesionalId)
                .orElseThrow(() -> new RuntimeException("Profesional no encontrado"));
        return citaRepositorio.findByProfesional_IdProfesional(profesionalId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional
    public void confirmarCita(Long citaId) {
        cambiarEstadoPorNombre(citaId, ESTADO_CONFIRMADA);
    }

    @Transactional
    public void reprogramarCita(Long citaId, LocalDateTime nuevaFecha) {
        Cita cita = citaRepositorio.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
        if (nuevaFecha == null) {
            throw new RuntimeException("La nueva fecha es obligatoria");
        }
        validarFechaDisponible(cita.getProfesional().getIdProfesional(), nuevaFecha);
        cita.setFecha(nuevaFecha);
        cita.setEstadoCita(obtenerEstadoPorNombre(ESTADO_REPROGRAMADA));
        citaRepositorio.save(cita);
    }

    @Transactional
    public void cancelarCita(Long citaId) {
        cambiarEstadoPorNombre(citaId, ESTADO_CANCELADO);
    }

    @Transactional
    public void finalizarCita(Long citaId) {
        cambiarEstadoPorNombre(citaId, ESTADO_FINALIZADA);
    }

    @Transactional
    public void cambiarEstadoCita(Long citaId, Long estadoId) {
        Cita cita = citaRepositorio.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
        EstadoCita estado = estadoCitaRepositorio.findById(estadoId)
                .orElseThrow(() -> new RuntimeException("Estado no encontrado"));
        cita.setEstadoCita(estado);
        citaRepositorio.save(cita);
    }

    @Transactional
    public void registrarNotaClinica(Long citaId, CitaDTO citaDTO) {
        Cita cita = citaRepositorio.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        if (esVacio(citaDTO.getNota()) && esVacio(citaDTO.getObservacionesClinicas()) && esVacio(citaDTO.getPlanAccion())) {
            throw new RuntimeException("La nota clinica debe tener contenido valido");
        }

        cita.setNota(citaDTO.getNota());
        cita.setObservacionesClinicas(citaDTO.getObservacionesClinicas());
        cita.setPlanAccion(citaDTO.getPlanAccion());
        cita.setEstadoNota(citaDTO.getEstadoNota() != null ? citaDTO.getEstadoNota() : "REGISTRADA");
        cita.setFechaNota(LocalDateTime.now());
        citaRepositorio.save(cita);
    }

    @Transactional
    public void actualizarNotaClinica(Long citaId, CitaDTO dto) {
        registrarNotaClinica(citaId, dto);
    }

    public CitaDTO obtenerNotaClinicaPorCita(Long citaId) {
        Cita cita = citaRepositorio.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
        return mapToDTO(cita);
    }

    private void cambiarEstadoPorNombre(Long citaId, String nombreEstado) {
        Cita cita = citaRepositorio.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
        cita.setEstadoCita(obtenerEstadoPorNombre(nombreEstado));
        citaRepositorio.save(cita);
    }

    private void validarFechaDisponible(Long profesionalId, LocalDateTime fecha) {
        if (fecha == null) {
            throw new RuntimeException("La fecha de la cita es obligatoria");
        }
        if (citaRepositorio.existsByProfesional_IdProfesionalAndFecha(profesionalId, fecha)) {
            throw new RuntimeException("El horario seleccionado no esta disponible. Seleccione un horario alternativo");
        }
    }

    private EstadoCita obtenerEstadoPorNombre(String nombre) {
        EstadoCita estado = estadoCitaRepositorio.findByNombre(nombre);
        if (estado == null) {
            throw new RuntimeException("Estado " + nombre + " no encontrado");
        }
        return estado;
    }

    private boolean esVacio(String texto) {
        return texto == null || texto.trim().isEmpty();
    }

    private CitaDTO mapToDTO(Cita cita) {
        CitaDTO dto = modelMapper.map(cita, CitaDTO.class);
        if (cita.getPaciente() != null) {
            dto.setPacienteId(cita.getPaciente().getPacienteId());

            if (cita.getPaciente().getUsuario() != null) {
                dto.setNombrePaciente(cita.getPaciente().getUsuario().getNombre());
            }
        }

        if (cita.getProfesional() != null) {
            dto.setProfesionalId(cita.getProfesional().getIdProfesional());

            if (cita.getProfesional().getUsuario() != null) {
                dto.setNombreProfesional(cita.getProfesional().getUsuario().getNombre());
            }
        }
        if (cita.getEstadoCita() != null) dto.setEstadoCitaId(cita.getEstadoCita().getIdEstadoCita());
        return dto;
    }
}

