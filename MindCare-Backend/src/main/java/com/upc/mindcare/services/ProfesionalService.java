package com.upc.mindcare.services;

import com.upc.mindcare.interfaces.IProfesionalService;

import com.upc.mindcare.dtos.ProfesionalDTO;
import com.upc.mindcare.entities.Especialidad;
import com.upc.mindcare.entities.Profesional;
import com.upc.mindcare.entities.Usuario;
import com.upc.mindcare.repositories.EspecialidadRepositorio;
import com.upc.mindcare.repositories.ProfesionalRepositorio;
import com.upc.mindcare.repositories.UsuarioRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ProfesionalService implements IProfesionalService {
    private static final String ROL_PROFESIONAL = "PROFESIONAL";
    private static final String ESTADO_PENDIENTE = "PENDIENTE";
    private static final String ESTADO_APROBADO = "APROBADO";
    private static final String ESTADO_RECHAZADO = "RECHAZADO";

    @Autowired private ProfesionalRepositorio profesionalRepositorio;
    @Autowired private UsuarioRepositorio usuarioRepositorio;
    @Autowired private EspecialidadRepositorio especialidadRepositorio;

    @Transactional
    public ProfesionalDTO completarPerfilProfesional(ProfesionalDTO dto) {
        Usuario usuario = usuarioRepositorio.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        validarRolProfesional(usuario);
        if (profesionalRepositorio.existsByUsuario_IdUsuario(dto.getUsuarioId())) {
            throw new RuntimeException("El usuario ya tiene un perfil profesional registrado");
        }
        Profesional profesional = new Profesional();
        profesional.setUsuario(usuario);
        aplicarDatosPerfil(profesional, dto);
        profesional.setEstadoValidacion(ESTADO_PENDIENTE);
        profesional.setFechaSolicitud(LocalDateTime.now());
        return mapToDTO(profesionalRepositorio.save(profesional));
    }

    @Transactional
    public ProfesionalDTO actualizarPerfilProfesional(Long id, ProfesionalDTO dto) {
        Profesional profesional = buscarProfesional(id);
        aplicarDatosPerfil(profesional, dto);
        if (dto.getDocumentoValidacion() != null) {
            profesional.setEstadoValidacion(ESTADO_PENDIENTE);
            profesional.setMotivoRechazo(null);
            profesional.setFechaSolicitud(LocalDateTime.now());
            profesional.setFechaValidacion(null);
        }
        return mapToDTO(profesionalRepositorio.save(profesional));
    }

    @Transactional
    //Implementar Asiciacion de especialidades en services
    public ProfesionalDTO asociarEspecialidades(Long id, List<Long> especialidadIds) {
        Profesional profesional = buscarProfesional(id);
        profesional.setEspecialidades(obtenerEspecialidades(especialidadIds));
        return mapToDTO(profesionalRepositorio.save(profesional));
    }

    public List<ProfesionalDTO> listarProfesionales() {
        return profesionalRepositorio.findAll().stream().map(this::mapToDTO).toList();
    }

    public List<ProfesionalDTO> listarProfesionalesPorEspecialidad(Long especialidadId) {
        return profesionalRepositorio.findByEspecialidades_IdEspecialidad(especialidadId).stream().map(this::mapToDTO).toList();
    }

    public ProfesionalDTO buscarProfesionalPorId(Long id) { return mapToDTO(buscarProfesional(id)); }

    @Transactional
    public ProfesionalDTO cambiarEstadoValidacion(Long id, String estado) {
        Profesional profesional = buscarProfesional(id);
        validarEstadoValidacion(estado);
        profesional.setEstadoValidacion(estado.toUpperCase());
        profesional.setFechaValidacion(LocalDateTime.now());
        if (!ESTADO_RECHAZADO.equalsIgnoreCase(estado)) profesional.setMotivoRechazo(null);
        return mapToDTO(profesionalRepositorio.save(profesional));
    }

    @Transactional
    public ProfesionalDTO aprobarProfesional(Long id) {
        Profesional profesional = buscarProfesional(id);
        profesional.setEstadoValidacion(ESTADO_APROBADO);
        profesional.setMotivoRechazo(null);
        profesional.setFechaValidacion(LocalDateTime.now());
        if (profesional.getUsuario() != null) {
            profesional.getUsuario().setVerificado(Boolean.TRUE);
            usuarioRepositorio.save(profesional.getUsuario());
        }
        return mapToDTO(profesionalRepositorio.save(profesional));
    }

    @Transactional
    public ProfesionalDTO rechazarProfesional(Long id, String motivo) {
        if (motivo == null || motivo.trim().isEmpty()) {
            throw new RuntimeException("El motivo de rechazo es obligatorio");
        }
        Profesional profesional = buscarProfesional(id);
        profesional.setEstadoValidacion(ESTADO_RECHAZADO);
        profesional.setMotivoRechazo(motivo);
        profesional.setFechaValidacion(LocalDateTime.now());
        if (profesional.getUsuario() != null) {
            profesional.getUsuario().setVerificado(Boolean.FALSE);
            usuarioRepositorio.save(profesional.getUsuario());
        }
        return mapToDTO(profesionalRepositorio.save(profesional));
    }

    private void aplicarDatosPerfil(Profesional profesional, ProfesionalDTO dto) {
        if (dto.getEspecialidad() != null) profesional.setEspecialidad(dto.getEspecialidad());
        if (dto.getNumeroColegiatura() != null) profesional.setNumeroColegiatura(dto.getNumeroColegiatura());
        if (dto.getEtiquetas() != null) profesional.setEtiquetas(dto.getEtiquetas());
        if (dto.getAniosExperiencia() != null) profesional.setAniosExperiencia(dto.getAniosExperiencia());
        if (dto.getDescripcionPerfil() != null) profesional.setDescripcionPerfil(dto.getDescripcionPerfil());
        if (dto.getDocumentoValidacion() != null) profesional.setDocumentoValidacion(dto.getDocumentoValidacion());
        if (dto.getEspecialidadIds() != null) profesional.setEspecialidades(obtenerEspecialidades(dto.getEspecialidadIds()));
    }

    private Set<Especialidad> obtenerEspecialidades(List<Long> ids) {
        Set<Especialidad> especialidades = new HashSet<>();
        if (ids == null) return especialidades;
        for (Long id : ids) {
            especialidades.add(especialidadRepositorio.findById(id)
                    .orElseThrow(() -> new RuntimeException("Especialidad no encontrada: " + id)));
        }
        return especialidades;
    }

    private Profesional buscarProfesional(Long id) {
        return profesionalRepositorio.findById(id).orElseThrow(() -> new RuntimeException("Profesional no encontrado"));
    }

    private void validarRolProfesional(Usuario usuario) {
        if (usuario.getRol() == null || usuario.getRol().getNombre() == null) throw new RuntimeException("El usuario no tiene rol asignado");
        if (!usuario.getRol().getNombre().equalsIgnoreCase(ROL_PROFESIONAL)) throw new RuntimeException("El usuario no tiene rol de profesional");
    }

    private void validarEstadoValidacion(String estado) {
        if (estado == null) throw new RuntimeException("El estado de validacion es obligatorio");
        String e = estado.toUpperCase();
        if (!e.equals(ESTADO_PENDIENTE) && !e.equals(ESTADO_APROBADO) && !e.equals(ESTADO_RECHAZADO)) {
            throw new RuntimeException("Estado de validacion no valido");
        }
    }

    private ProfesionalDTO mapToDTO(Profesional profesional) {
        ProfesionalDTO dto = new ProfesionalDTO();
        dto.setIdProfesional(profesional.getIdProfesional());
        dto.setEspecialidad(profesional.getEspecialidad());
        dto.setNumeroColegiatura(profesional.getNumeroColegiatura());
        dto.setEtiquetas(profesional.getEtiquetas());
        dto.setAniosExperiencia(profesional.getAniosExperiencia());
        dto.setDescripcionPerfil(profesional.getDescripcionPerfil());
        dto.setDocumentoValidacion(profesional.getDocumentoValidacion());
        dto.setEstadoValidacion(profesional.getEstadoValidacion());
        dto.setMotivoRechazo(profesional.getMotivoRechazo());
        dto.setFechaSolicitud(profesional.getFechaSolicitud());
        dto.setFechaValidacion(profesional.getFechaValidacion());
                if (profesional.getUsuario() != null) {
            dto.setUsuarioId(profesional.getUsuario().getIdUsuario());
            dto.setNombre(profesional.getUsuario().getNombre());
            dto.setUsername(profesional.getUsuario().getUsername());
            dto.setCorreo(profesional.getUsuario().getCorreo());
        }
        dto.setEspecialidadIds(profesional.getEspecialidades().stream().map(Especialidad::getIdEspecialidad).toList());
        dto.setEspecialidades(profesional.getEspecialidades().stream().map(Especialidad::getNombre).toList());
        return dto;
    }
}
