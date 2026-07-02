package com.upc.mindcare.services;

import com.upc.mindcare.interfaces.IMedicacionPacienteService;

import com.upc.mindcare.dtos.MedicacionPacienteDTO;
import com.upc.mindcare.entities.Cita;
import com.upc.mindcare.entities.MedicacionPaciente;
import com.upc.mindcare.repositories.CitaRepositorio;
import com.upc.mindcare.repositories.MedicacionPacienteRepositorio;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MedicacionPacienteService implements IMedicacionPacienteService {

    @Autowired
    private MedicacionPacienteRepositorio medicacionRepositorio;

    @Autowired
    private CitaRepositorio citaRepositorio;

    @Autowired
    private ModelMapper modelMapper;
    //Implementar gestion de medicacion en service
    @Transactional
    public MedicacionPacienteDTO registrarMedicacion(MedicacionPacienteDTO dto) {
        Cita cita = citaRepositorio.findById(dto.getCitaId())
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        MedicacionPaciente medicacion = new MedicacionPaciente();
        medicacion.setCita(cita);
        medicacion.setNombreMedicamento(dto.getNombreMedicamento());
        medicacion.setDosis(dto.getDosis());
        medicacion.setFrecuencia(dto.getFrecuencia());
        medicacion.setDuracion(dto.getDuracion());
        medicacion.setIndicaciones(dto.getIndicaciones());
        medicacion.setFechaInicio(dto.getFechaInicio());
        medicacion.setFechaFin(dto.getFechaFin());
        medicacion.setTratamientoActivo(dto.getTratamientoActivo() != null ? dto.getTratamientoActivo() : true);

        return mapToDTO(medicacionRepositorio.save(medicacion));
    }

    public List<MedicacionPacienteDTO> listarMedicacionesPorPaciente(Long pacienteId) {
        return medicacionRepositorio.findByCita_Paciente_PacienteId(pacienteId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional
    public MedicacionPacienteDTO actualizarMedicacion(Long id, MedicacionPacienteDTO dto) {
        MedicacionPaciente medicacion = medicacionRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicacion no encontrada"));

        if (dto.getCitaId() != null) {
            Cita cita = citaRepositorio.findById(dto.getCitaId())
                    .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
            medicacion.setCita(cita);
        }
        if (dto.getNombreMedicamento() != null) medicacion.setNombreMedicamento(dto.getNombreMedicamento());
        if (dto.getDosis() != null) medicacion.setDosis(dto.getDosis());
        if (dto.getFrecuencia() != null) medicacion.setFrecuencia(dto.getFrecuencia());
        if (dto.getDuracion() != null) medicacion.setDuracion(dto.getDuracion());
        if (dto.getIndicaciones() != null) medicacion.setIndicaciones(dto.getIndicaciones());
        if (dto.getFechaInicio() != null) medicacion.setFechaInicio(dto.getFechaInicio());
        if (dto.getFechaFin() != null) medicacion.setFechaFin(dto.getFechaFin());
        if (dto.getTratamientoActivo() != null) medicacion.setTratamientoActivo(dto.getTratamientoActivo());

        return mapToDTO(medicacionRepositorio.save(medicacion));
    }

    @Transactional
    public void eliminarMedicacion(Long id) {
        if (!medicacionRepositorio.existsById(id)) {
            throw new RuntimeException("Medicacion no encontrada");
        }
        medicacionRepositorio.deleteById(id);
    }

    private MedicacionPacienteDTO mapToDTO(MedicacionPaciente medicacion) {
        MedicacionPacienteDTO dto = modelMapper.map(medicacion, MedicacionPacienteDTO.class);
        dto.setIdMedicacion(medicacion.getIdMedicacion());
        if (medicacion.getCita() != null) {
            dto.setCitaId(medicacion.getCita().getIdCita());
            if (medicacion.getCita().getPaciente() != null) {
                dto.setPacienteId(medicacion.getCita().getPaciente().getPacienteId());
            }
            if (medicacion.getCita().getProfesional() != null) {
                dto.setProfesionalId(medicacion.getCita().getProfesional().getIdProfesional());
            }
        }
        return dto;
    }
}

