package com.upc.mindcare.interfaces;

import com.upc.mindcare.dtos.PacienteDTO;
import com.upc.mindcare.dtos.ProfesionalDTO;
import com.upc.mindcare.dtos.UsuarioDTO;

import java.util.List;

public interface IUsuarioService {
    UsuarioDTO registrarUsuario(UsuarioDTO dto);    List<UsuarioDTO> listarUsuarios();
    List<UsuarioDTO> listarAdministradores();
    List<UsuarioDTO> listarPacientesUsuarios();
    List<UsuarioDTO> listarProfesionalesUsuarios();
    UsuarioDTO obtenerUsuarioPorId(Long id);
    UsuarioDTO actualizarUsuario(Long id, UsuarioDTO dto);
    UsuarioDTO buscarUsuarioPorCorreo(String correo);
    void eliminarUsuario(Long id);
    PacienteDTO registrarPaciente(PacienteDTO dto);
    PacienteDTO obtenerPacientePorId(Long id);
    PacienteDTO actualizarPaciente(Long id, PacienteDTO dto);
    ProfesionalDTO registrarProfesional(ProfesionalDTO dto);
    String solicitarRecuperacionPassword(String correo);
    String restablecerPassword(String token, String nuevaPassword);
    String recuperarPassword(String correo, String nuevaPassword);
}