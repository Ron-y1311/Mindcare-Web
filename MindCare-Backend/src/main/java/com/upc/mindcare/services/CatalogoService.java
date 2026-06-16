package com.upc.mindcare.services;

import com.upc.mindcare.interfaces.ICatalogoService;

import com.upc.mindcare.dtos.*;
import com.upc.mindcare.entities.*;
import com.upc.mindcare.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CatalogoService implements ICatalogoService {
    @Autowired private RolRepositorio rolRepositorio;
    @Autowired private EstadoAnimoRepositorio estadoAnimoRepositorio;
    @Autowired private EstadoCitaRepositorio estadoCitaRepositorio;
    @Autowired private PreguntaRepositorio preguntaRepositorio;
    @Autowired private EspecialidadRepositorio especialidadRepositorio;
    @Autowired private UsuarioRepositorio usuarioRepositorio;
    @Autowired private TrackingRepositorio trackingRepositorio;
    @Autowired private CitaRepositorio citaRepositorio;
    @Autowired private RespuestaRepositorio respuestaRepositorio;
    @Autowired private ProfesionalRepositorio profesionalRepositorio;

    public List<RolDTO> listarRoles() { return rolRepositorio.findAll().stream().map(r -> new RolDTO(r.getIdRol(), r.getNombre())).toList(); }
    public List<EstadoAnimoDTO> listarEstadosAnimo() { return estadoAnimoRepositorio.findAll().stream().map(e -> new EstadoAnimoDTO(e.getIdEstadoAnimo(), e.getNombre(), e.getDescripcion())).toList(); }
    public List<EstadoCitaDTO> listarEstadosCita() { return estadoCitaRepositorio.findAll().stream().map(e -> new EstadoCitaDTO(e.getIdEstadoCita(), e.getNombre())).toList(); }
    public List<PreguntaDTO> listarPreguntas() { return preguntaRepositorio.findAll().stream().map(p -> new PreguntaDTO(p.getIdPregunta(), p.getTexto())).toList(); }
    public List<EspecialidadDTO> listarEspecialidades() { return especialidadRepositorio.findAll().stream().map(this::mapEspecialidad).toList(); }

    @Transactional public RolDTO crearRol(RolDTO dto) { Rol rol = new Rol(null, dto.getNombre()); return new RolDTO(rolRepositorio.save(rol).getIdRol(), rol.getNombre()); }
    @Transactional public RolDTO actualizarRol(Long id, RolDTO dto) { Rol rol = rolRepositorio.findById(id).orElseThrow(() -> new RuntimeException("Rol no encontrado")); rol.setNombre(dto.getNombre()); return new RolDTO(rolRepositorio.save(rol).getIdRol(), rol.getNombre()); }
    @Transactional public void eliminarRol(Long id) { if (usuarioRepositorio.existsByRol_IdRol(id)) throw new RuntimeException("No se puede eliminar un rol en uso"); rolRepositorio.deleteById(id); }

    @Transactional public EstadoAnimoDTO crearEstadoAnimo(EstadoAnimoDTO dto) { EstadoAnimo e = new EstadoAnimo(null, dto.getNombre(), dto.getDescripcion()); e = estadoAnimoRepositorio.save(e); return new EstadoAnimoDTO(e.getIdEstadoAnimo(), e.getNombre(), e.getDescripcion()); }
    @Transactional public EstadoAnimoDTO actualizarEstadoAnimo(Long id, EstadoAnimoDTO dto) { EstadoAnimo e = estadoAnimoRepositorio.findById(id).orElseThrow(() -> new RuntimeException("Estado de animo no encontrado")); e.setNombre(dto.getNombre()); e.setDescripcion(dto.getDescripcion()); e = estadoAnimoRepositorio.save(e); return new EstadoAnimoDTO(e.getIdEstadoAnimo(), e.getNombre(), e.getDescripcion()); }
    @Transactional public void eliminarEstadoAnimo(Long id) { if (trackingRepositorio.existsByEstadoAnimo_IdEstadoAnimo(id)) throw new RuntimeException("No se puede eliminar un estado de animo en uso"); estadoAnimoRepositorio.deleteById(id); }

    @Transactional public EstadoCitaDTO crearEstadoCita(EstadoCitaDTO dto) { EstadoCita e = new EstadoCita(null, dto.getNombre()); e = estadoCitaRepositorio.save(e); return new EstadoCitaDTO(e.getIdEstadoCita(), e.getNombre()); }
    @Transactional public EstadoCitaDTO actualizarEstadoCita(Long id, EstadoCitaDTO dto) { EstadoCita e = estadoCitaRepositorio.findById(id).orElseThrow(() -> new RuntimeException("Estado de cita no encontrado")); e.setNombre(dto.getNombre()); e = estadoCitaRepositorio.save(e); return new EstadoCitaDTO(e.getIdEstadoCita(), e.getNombre()); }
    @Transactional public void eliminarEstadoCita(Long id) { if (citaRepositorio.existsByEstadoCita_IdEstadoCita(id)) throw new RuntimeException("No se puede eliminar un estado de cita en uso"); estadoCitaRepositorio.deleteById(id); }

    @Transactional public PreguntaDTO crearPregunta(PreguntaDTO dto) { Pregunta p = new Pregunta(null, dto.getTexto()); p = preguntaRepositorio.save(p); return new PreguntaDTO(p.getIdPregunta(), p.getTexto()); }
    @Transactional public PreguntaDTO actualizarPregunta(Long id, PreguntaDTO dto) { Pregunta p = preguntaRepositorio.findById(id).orElseThrow(() -> new RuntimeException("Pregunta no encontrada")); p.setTexto(dto.getTexto()); p = preguntaRepositorio.save(p); return new PreguntaDTO(p.getIdPregunta(), p.getTexto()); }
    @Transactional public void eliminarPregunta(Long id) { if (respuestaRepositorio.existsByPregunta_IdPregunta(id)) throw new RuntimeException("No se puede eliminar una pregunta en uso"); preguntaRepositorio.deleteById(id); }

    @Transactional public EspecialidadDTO crearEspecialidad(EspecialidadDTO dto) { especialidadRepositorio.findByNombreIgnoreCase(dto.getNombre()).ifPresent(e -> { throw new RuntimeException("La especialidad ya existe"); }); Especialidad e = new Especialidad(null, dto.getNombre(), dto.getDescripcion()); return mapEspecialidad(especialidadRepositorio.save(e)); }
    @Transactional public EspecialidadDTO actualizarEspecialidad(Long id, EspecialidadDTO dto) { Especialidad e = especialidadRepositorio.findById(id).orElseThrow(() -> new RuntimeException("Especialidad no encontrada")); e.setNombre(dto.getNombre()); e.setDescripcion(dto.getDescripcion()); return mapEspecialidad(especialidadRepositorio.save(e)); }
    @Transactional public void eliminarEspecialidad(Long id) { if (!profesionalRepositorio.findByEspecialidades_IdEspecialidad(id).isEmpty()) throw new RuntimeException("No se puede eliminar una especialidad en uso"); especialidadRepositorio.deleteById(id); }

    private EspecialidadDTO mapEspecialidad(Especialidad e) { return new EspecialidadDTO(e.getIdEspecialidad(), e.getNombre(), e.getDescripcion()); }
}
