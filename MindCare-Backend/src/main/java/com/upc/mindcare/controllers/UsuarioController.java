package com.upc.mindcare.controllers;

import com.upc.mindcare.dtos.*;
import com.upc.mindcare.services.UsuarioService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@Tag(name = "Usuarios", description = "Registro, login y gestion de usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/registrar-usuario")
    @PreAuthorize("hasRole('ADMIN')")
    public UsuarioDTO registrarUsuario(@Valid @RequestBody UsuarioDTO dto) {
        return usuarioService.registrarUsuario(dto);
    }

    //Registro de paciente
    @PostMapping("/pacientes")
    @PreAuthorize("permitAll()")
    public PacienteDTO registrarPaciente(@Valid @RequestBody PacienteDTO dto) {
        return usuarioService.registrarPaciente(dto);
    }


    @GetMapping("/pacientes/{id}")
    @PreAuthorize("hasAnyRole('PACIENTE','ADMIN')")
    public PacienteDTO obtenerPacientePorId(@PathVariable Long id) {
        return usuarioService.obtenerPacientePorId(id);
    }

    @PutMapping("/pacientes/{id}")
    @PreAuthorize("hasAnyRole('PACIENTE','ADMIN')")
    public PacienteDTO actualizarPaciente(@PathVariable Long id, @Valid @RequestBody PacienteDTO dto) {
        return usuarioService.actualizarPaciente(id, dto);
    }

    @PostMapping("/profesionales")
    @PreAuthorize("permitAll()")
    //Agregar endpoint POST con metodo "registrarProfesional"
    public ProfesionalDTO registrarProfesional(@Valid @RequestBody ProfesionalDTO dto) {
        return usuarioService.registrarProfesional(dto);
    }
    //Implementar endpoints de recuperacion de password para conectar con el frontend
    @PostMapping("/recuperar-password")
    @PreAuthorize("permitAll()")
    public String solicitarRecuperacion(@Valid @RequestBody PasswordResetRequestDTO dto) {
        return usuarioService.solicitarRecuperacionPassword(dto.getCorreo());
    }

    @PutMapping("/restablecer-password")
    @PreAuthorize("permitAll()")
    public String restablecerPassword(@Valid @RequestBody PasswordResetConfirmDTO dto) {
        return usuarioService.restablecerPassword(dto.getToken(), dto.getNuevaPassword());
    }

    @PutMapping("/recuperar-password")
    @PreAuthorize("hasRole('ADMIN')")
    public String recuperarPassword(@RequestParam String correo, @RequestParam String nuevaPassword) {
        return usuarioService.recuperarPassword(correo, nuevaPassword);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UsuarioDTO> listarUsuarios() {
        return usuarioService.listarUsuarios();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UsuarioDTO obtenerUsuarioPorId(@PathVariable Long id) {
        return usuarioService.obtenerUsuarioPorId(id);
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PACIENTE','PROFESIONAL','ADMIN')")
    public UsuarioDTO actualizarUsuario(@PathVariable Long id, @RequestBody UsuarioDTO dto) {
        return usuarioService.actualizarUsuario(id, dto);
    }

    @GetMapping("/correo")
    @PreAuthorize("hasRole('ADMIN')")
    public UsuarioDTO buscarUsuarioPorCorreo(@RequestParam String correo) {
        return usuarioService.buscarUsuarioPorCorreo(correo);
    }

    @GetMapping("/administradores")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UsuarioDTO> listarAdministradores() {
        return usuarioService.listarAdministradores();
    }

    @GetMapping("/pacientes")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UsuarioDTO> listarPacientesUsuarios() {
        return usuarioService.listarPacientesUsuarios();
    }

    @GetMapping("/profesionales")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UsuarioDTO> listarProfesionalesUsuarios() {
        return usuarioService.listarProfesionalesUsuarios();
    }

    @PutMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMIN')")
    public void activarUsuario(@PathVariable Long id) {
        usuarioService.activarUsuario(id);
    }

    @PutMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMIN')")
    public void desactivarUsuario(@PathVariable Long id) {
        usuarioService.desactivarUsuario(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
    }

    @GetMapping("/debug-auth")
    public Object debugAuth() {
        return org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication();
    }
}