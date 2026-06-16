package com.upc.mindcare.services;

import com.upc.mindcare.interfaces.IValoracionService;

import com.upc.mindcare.dtos.ValoracionesDTO;
import com.upc.mindcare.entities.Cita;
import com.upc.mindcare.entities.Valoraciones;
import com.upc.mindcare.repositories.CitaRepositorio;
import com.upc.mindcare.repositories.ProfesionalRepositorio;
import com.upc.mindcare.repositories.ValoracionesRepositorio;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ValoracionService implements IValoracionService {

    @Autowired
    private ValoracionesRepositorio valoracionesRepositorio;

    @Autowired
    private CitaRepositorio citaRepositorio;

    @Autowired
    private ProfesionalRepositorio profesionalRepositorio;

    @Autowired
    private ModelMapper modelMapper;

    @Transactional
    public ValoracionesDTO registrarValoracion(ValoracionesDTO dto) {
        Cita cita = citaRepositorio.findById(dto.getCitaId())
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        if (valoracionesRepositorio.existsByCita_IdCita(dto.getCitaId())) {
            throw new RuntimeException("La cita ya tiene una valoracion registrada");
        }

        validarPuntuacion(dto.getPuntuacion());

        Valoraciones valoracion = new Valoraciones();
        valoracion.setCita(cita);
        valoracion.setPuntuacion(dto.getPuntuacion());
        valoracion.setComentario(dto.getComentario());
        valoracion.setFechaRegistro(LocalDateTime.now());

        return mapToDTO(valoracionesRepositorio.save(valoracion));
    }

    public List<ValoracionesDTO> listarValoracionesPorProfesional(Long profesionalId) {
        profesionalRepositorio.findById(profesionalId)
                .orElseThrow(() -> new RuntimeException("Profesional no encontrado"));

        return valoracionesRepositorio.findByCita_Profesional_IdProfesional(profesionalId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public Double calcularPromedioValoracion(Long profesionalId) {
        profesionalRepositorio.findById(profesionalId)
                .orElseThrow(() -> new RuntimeException("Profesional no encontrado"));

        List<Valoraciones> lista = valoracionesRepositorio.findByCita_Profesional_IdProfesional(profesionalId);
        if (lista.isEmpty()) return 0.0;

        return lista.stream()
                .filter(valoracion -> valoracion.getPuntuacion() != null)
                .mapToDouble(Valoraciones::getPuntuacion)
                .average()
                .orElse(0.0);
    }

    private void validarPuntuacion(Integer puntuacion) {
        if (puntuacion == null) {
            throw new RuntimeException("La puntuacion es obligatoria");
        }
        if (puntuacion < 1 || puntuacion > 5) {
            throw new RuntimeException("La puntuacion debe estar entre 1 y 5");
        }
    }

    private ValoracionesDTO mapToDTO(Valoraciones valoracion) {
        ValoracionesDTO dto = modelMapper.map(valoracion, ValoracionesDTO.class);
        if (valoracion.getCita() != null) {
            dto.setCitaId(valoracion.getCita().getIdCita());
            if (valoracion.getCita().getPaciente() != null) {
                dto.setPacienteId(valoracion.getCita().getPaciente().getPacienteId());
            }
            if (valoracion.getCita().getProfesional() != null) {
                dto.setProfesionalId(valoracion.getCita().getProfesional().getIdProfesional());
            }
        }
        return dto;
    }
}

