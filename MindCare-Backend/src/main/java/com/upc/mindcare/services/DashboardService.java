package com.upc.mindcare.services;

import com.upc.mindcare.interfaces.IDashboardService;

import com.upc.mindcare.dtos.DashboardDTO;
import com.upc.mindcare.dtos.ResumenEmocionalDTO;
import com.upc.mindcare.dtos.TrackingDTO;
import com.upc.mindcare.entities.Cita;
import com.upc.mindcare.entities.Encuesta;
import com.upc.mindcare.entities.MedicacionPaciente;
import com.upc.mindcare.entities.Tracking;
import com.upc.mindcare.repositories.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class DashboardService implements IDashboardService {
    @Autowired private TrackingRepositorio trackingRepositorio;
    @Autowired private CitaRepositorio citaRepositorio;
    @Autowired private MedicacionPacienteRepositorio medicacionRepositorio;
    @Autowired private EncuestaRepositorio encuestaRepositorio;
    @Autowired private PacienteRepositorio pacienteRepositorio;
    @Autowired private ModelMapper modelMapper;

    //Implementar Dashboard del paciente personal
    public DashboardDTO visualizarDashboardPersonal(Long pacienteId) {
        validarPacienteExiste(pacienteId);
        List<Tracking> trackings = trackingRepositorio.findByPaciente_PacienteId(pacienteId);
        List<Encuesta> encuestas = encuestaRepositorio.findByPaciente_PacienteId(pacienteId);
        List<Cita> citas = citaRepositorio.findByPaciente_PacienteId(pacienteId);

        if (trackings.isEmpty() && encuestas.isEmpty()) {
            return new DashboardDTO(pacienteId, "SIN_DATOS", 0.0, 0, encuestas.size(), citas.size(), false, "Panel inicial: aun no existen registros emocionales");
        }

        double promedio = trackings.stream().filter(t -> t.getNumeroIntensidad() != null).mapToInt(Tracking::getNumeroIntensidad).average().orElse(0);
        String estado = clasificar(promedio);
        return new DashboardDTO(pacienteId, estado, promedio, trackings.size(), encuestas.size(), citas.size(), true, "Dashboard generado correctamente");
    }

    //Implementar metodo consultar Evolucion emocional en services
    public List<TrackingDTO> consultarEvolucionEmocional(Long pacienteId) {
        validarPacienteExiste(pacienteId);
        return trackingRepositorio.findByPaciente_PacienteId(pacienteId).stream()
                .sorted(Comparator.comparing(Tracking::getFecha))
                .map(this::mapTrackingToDTO)
                .toList();
    }

    //Implementar resumen emocional en service
    public ResumenEmocionalDTO obtenerResumenEmocional(Long pacienteId) {
        validarPacienteExiste(pacienteId);
        List<Tracking> trackings = trackingRepositorio.findByPaciente_PacienteId(pacienteId);
        List<Encuesta> encuestas = encuestaRepositorio.findByPaciente_PacienteId(pacienteId);
        List<Cita> citas = citaRepositorio.findByPaciente_PacienteId(pacienteId);
        List<MedicacionPaciente> medicaciones = medicacionRepositorio.findByCita_Paciente_PacienteId(pacienteId);

        boolean suficiente = !trackings.isEmpty() || !encuestas.isEmpty();
        double promedio = trackings.stream().filter(t -> t.getNumeroIntensidad() != null).mapToInt(Tracking::getNumeroIntensidad).average().orElse(0);
        String interpretacion = suficiente ? clasificar(promedio) : "No existen datos suficientes para generar el resumen emocional";

        return new ResumenEmocionalDTO(
                pacienteId,
                trackings.size(),
                encuestas.size(),
                citas.size(),
                medicaciones.stream().filter(m -> Boolean.TRUE.equals(m.getTratamientoActivo())).count(),
                interpretacion,
                suficiente
        );
    }

    private TrackingDTO mapTrackingToDTO(Tracking tracking) {
        TrackingDTO dto = modelMapper.map(tracking, TrackingDTO.class);

        if (tracking.getPaciente() != null) {
            dto.setPacienteId(tracking.getPaciente().getPacienteId());
        }

        if (tracking.getEstadoAnimo() != null) {
            dto.setEstadoAnimoId(tracking.getEstadoAnimo().getIdEstadoAnimo());
            dto.setEstadoAnimoNombre(tracking.getEstadoAnimo().getNombre());
        }

        return dto;
    }
    private String clasificar(double promedio) {
        if (promedio <= 0) return "SIN_DATOS";
        if (promedio <= 3) return "BAJO";
        if (promedio <= 6) return "MEDIO";
        return "ALTO";
    }

    private void validarPacienteExiste(Long pacienteId) {
        pacienteRepositorio.findById(pacienteId).orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
    }
}

