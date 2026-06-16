package com.upc.mindcare.controllers;

import com.upc.mindcare.dtos.*;
import com.upc.mindcare.services.CatalogoService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogos")
@Tag(name = "Catalogos", description = "Administración de roles, estados, preguntas y especialidades")
public class CatalogoController {

    @Autowired
    private CatalogoService catalogoService;


    //Listar roles (solo es posible con el rol ADMIN)
    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public List<RolDTO> listarRoles() {
        return catalogoService.listarRoles();
    }

    //Creacion de roles (solo es posible con el rol ADMIN)
    @PostMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public RolDTO crearRol(@Valid @RequestBody RolDTO dto) {
        return catalogoService.crearRol(dto);
    }

    @PutMapping("/roles/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public RolDTO actualizarRol(@PathVariable Long id, @Valid @RequestBody RolDTO dto) {
        return catalogoService.actualizarRol(id, dto);
    }

    @DeleteMapping("/roles/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminarRol(@PathVariable Long id) {
        catalogoService.eliminarRol(id);
    }

    /* =========================
       ESTADOS DE ÁNIMO
       GET: PACIENTE / PROFESIONAL
       CRUD: ADMIN
    ========================= */

    @GetMapping("/estados-de-animo")
    @PreAuthorize("hasAnyRole('PACIENTE', 'PROFESIONAL', 'ADMIN')")
    public List<EstadoAnimoDTO> listarEstadosAnimo() {
        return catalogoService.listarEstadosAnimo();
    }

    @PostMapping("/estados-de-animo")
    @PreAuthorize("hasRole('ADMIN')")
    public EstadoAnimoDTO crearEstadoAnimo(@Valid @RequestBody EstadoAnimoDTO dto) {
        return catalogoService.crearEstadoAnimo(dto);
    }

    @PutMapping("/estados-de-animo/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public EstadoAnimoDTO actualizarEstadoAnimo(@PathVariable Long id, @Valid @RequestBody EstadoAnimoDTO dto) {
        return catalogoService.actualizarEstadoAnimo(id, dto);
    }

    @DeleteMapping("/estados-de-animo/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminarEstadoAnimo(@PathVariable Long id) {
        catalogoService.eliminarEstadoAnimo(id);
    }

    /* =========================
       ESTADOS DE CITA
       GET: PACIENTE / PROFESIONAL
       CRUD: ADMIN
    ========================= */

    @GetMapping("/estados-de-cita")
    @PreAuthorize("hasAnyRole('PACIENTE', 'PROFESIONAL', 'ADMIN')")
    public List<EstadoCitaDTO> listarEstadosCita() {
        return catalogoService.listarEstadosCita();
    }

    @PostMapping("/estados-de-cita")
    @PreAuthorize("hasRole('ADMIN')")
    public EstadoCitaDTO crearEstadoCita(@Valid @RequestBody EstadoCitaDTO dto) {
        return catalogoService.crearEstadoCita(dto);
    }

    @PutMapping("/estados-de-cita/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public EstadoCitaDTO actualizarEstadoCita(@PathVariable Long id, @Valid @RequestBody EstadoCitaDTO dto) {
        return catalogoService.actualizarEstadoCita(id, dto);
    }

    @DeleteMapping("/estados-de-cita/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminarEstadoCita(@PathVariable Long id) {
        catalogoService.eliminarEstadoCita(id);
    }

    /* =========================
       PREGUNTAS
       GET: PACIENTE
       CRUD: ADMIN
    ========================= */

    @GetMapping("/preguntas")
    @PreAuthorize("hasAnyRole('PACIENTE', 'ADMIN')")
    public List<PreguntaDTO> listarPreguntas() {
        return catalogoService.listarPreguntas();
    }

    @PostMapping("/preguntas")
    @PreAuthorize("hasRole('ADMIN')")
    public PreguntaDTO crearPregunta(@Valid @RequestBody PreguntaDTO dto) {
        return catalogoService.crearPregunta(dto);
    }

    @PutMapping("/preguntas/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public PreguntaDTO actualizarPregunta(@PathVariable Long id, @Valid @RequestBody PreguntaDTO dto) {
        return catalogoService.actualizarPregunta(id, dto);
    }

    @DeleteMapping("/preguntas/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminarPregunta(@PathVariable Long id) {
        catalogoService.eliminarPregunta(id);
    }

    /* =========================
       ESPECIALIDADES
       GET: PÚBLICO
       CRUD: ADMIN
    ========================= */

    @GetMapping("/especialidades")
    @PreAuthorize("permitAll()")
    public List<EspecialidadDTO> listarEspecialidades() {
        return catalogoService.listarEspecialidades();
    }

    @PostMapping("/especialidades")
    @PreAuthorize("hasRole('ADMIN')")
    public EspecialidadDTO crearEspecialidad(@Valid @RequestBody EspecialidadDTO dto) {
        return catalogoService.crearEspecialidad(dto);
    }

    @PutMapping("/especialidades/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public EspecialidadDTO actualizarEspecialidad(@PathVariable Long id, @Valid @RequestBody EspecialidadDTO dto) {
        return catalogoService.actualizarEspecialidad(id, dto);
    }

    @DeleteMapping("/especialidades/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminarEspecialidad(@PathVariable Long id) {
        catalogoService.eliminarEspecialidad(id);
    }
}