package com.upc.mindcare.services;

import com.upc.mindcare.interfaces.IUsuarioService;

import com.upc.mindcare.dtos.PacienteDTO;
import com.upc.mindcare.dtos.ProfesionalDTO;
import com.upc.mindcare.dtos.UsuarioDTO;
import com.upc.mindcare.entities.*;
import com.upc.mindcare.repositories.*;
import org.modelmapper.ModelMapper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UsuarioService implements IUsuarioService {

    private static final String ROL_ADMIN = "ADMIN";
    private static final String ROL_PACIENTE = "PACIENTE";
    private static final String ROL_PROFESIONAL = "PROFESIONAL";

    @Autowired private UsuarioRepositorio usuarioRepositorio;
    @Autowired private PacienteRepositorio pacienteRepositorio;
    @Autowired private ProfesionalRepositorio profesionalRepositorio;
    @Autowired private RolRepositorio rolRepositorio;
    @Autowired private EspecialidadRepositorio especialidadRepositorio;
    @Autowired private PasswordResetTokenRepositorio passwordResetTokenRepositorio;
    @Autowired private ModelMapper modelMapper;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String mailFrom;

    @Transactional
    public UsuarioDTO registrarUsuario(UsuarioDTO dto) {
        if (usuarioRepositorio.findByCorreo(dto.getCorreo()).isPresent()) {
            throw new RuntimeException("El correo ya esta registrado");
        }
        if (dto.getRolId() == null) {
            throw new RuntimeException("El rol es obligatorio");
        }

        Rol rol = rolRepositorio.findById(dto.getRolId())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        Usuario usuario = modelMapper.map(dto, Usuario.class);
        usuario.setRol(rol);
        usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        usuario.setVerificado(!ROL_PROFESIONAL.equalsIgnoreCase(rol.getNombre()));
        usuario.setActivo(Boolean.TRUE);
        usuario.setFechaRegistro(LocalDateTime.now());
        usuario.setUltimoAcceso(null);

        return modelMapper.map(usuarioRepositorio.save(usuario), UsuarioDTO.class);
    }


    public List<UsuarioDTO> listarUsuarios() {
        return usuarioRepositorio.findAll().stream().map(u -> modelMapper.map(u, UsuarioDTO.class)).toList();
    }

    public List<UsuarioDTO> listarAdministradores() { return listarPorRol(ROL_ADMIN); }
    public List<UsuarioDTO> listarPacientesUsuarios() { return listarPorRol(ROL_PACIENTE); }
    public List<UsuarioDTO> listarProfesionalesUsuarios() { return listarPorRol(ROL_PROFESIONAL); }

    public UsuarioDTO obtenerUsuarioPorId(Long id) {
        return modelMapper.map(buscarUsuario(id), UsuarioDTO.class);
    }

    public UsuarioDTO buscarUsuarioPorCorreo(String correo) {
        Usuario usuario = usuarioRepositorio.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return modelMapper.map(usuario, UsuarioDTO.class);
    }
    @Transactional
    public UsuarioDTO actualizarUsuario(Long id, UsuarioDTO dto) {
        Usuario usuario = buscarUsuario(id);
        validarPuedeActualizarUsuario(usuario);

        if (!esVacio(dto.getNombre())) {
            usuario.setNombre(dto.getNombre().trim());
        }
        if (!esVacio(dto.getUsername())) {
            usuario.setUsername(dto.getUsername().trim());
        }
        if (!esVacio(dto.getCorreo()) && !dto.getCorreo().trim().equalsIgnoreCase(usuario.getCorreo())) {
            String nuevoCorreo = dto.getCorreo().trim().toLowerCase();
            if (usuarioRepositorio.findByCorreo(nuevoCorreo).isPresent()) {
                throw new RuntimeException("El correo ya esta registrado");
            }
            usuario.setCorreo(nuevoCorreo);
        }
        if (!esVacio(dto.getPassword())) {
            usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        return modelMapper.map(usuarioRepositorio.save(usuario), UsuarioDTO.class);
    }

    @Transactional
    public void eliminarUsuario(Long id) { cambiarEstadoActivo(id, false); }

    @Transactional
    public PacienteDTO registrarPaciente(PacienteDTO dto) {
        Usuario usuario = obtenerOCrearUsuarioRegistro(dto.getUsuarioId(), dto.getNombre(), dto.getUsername(),
                dto.getCorreo(), dto.getPassword(), ROL_PACIENTE);
        validarRol(usuario, ROL_PACIENTE);
        if (pacienteRepositorio.existsByUsuario_IdUsuario(usuario.getIdUsuario())) {
            throw new RuntimeException("El usuario ya tiene un perfil de paciente");
        }
        Paciente paciente = new Paciente();
        paciente.setUsuario(usuario);
        paciente.setEdad(dto.getEdad());
        paciente.setGenero(dto.getGenero());
        paciente.setFechaNacimiento(dto.getFechaNacimiento());
        paciente.setTelefono(dto.getTelefono());
        paciente.setContactoEmergencia(dto.getContactoEmergencia());
        Paciente guardado = pacienteRepositorio.save(paciente);
        PacienteDTO response = modelMapper.map(guardado, PacienteDTO.class);
        response.setUsuarioId(usuario.getIdUsuario());
        response.setNombre(usuario.getNombre());
        response.setUsername(usuario.getUsername());
        response.setCorreo(usuario.getCorreo());
        return response;
    }
    public PacienteDTO obtenerPacientePorId(Long id) {
      return mapPacienteDTO(buscarPaciente(id));
    }

    @Transactional
    public PacienteDTO actualizarPaciente(Long id, PacienteDTO dto) {
        Paciente paciente = buscarPaciente(id);
        Usuario usuario = paciente.getUsuario();

        paciente.setEdad(dto.getEdad());
        paciente.setGenero(dto.getGenero());
        paciente.setFechaNacimiento(dto.getFechaNacimiento());
        paciente.setTelefono(dto.getTelefono());
        paciente.setContactoEmergencia(dto.getContactoEmergencia());

        if (!esVacio(dto.getNombre())) {
            usuario.setNombre(dto.getNombre().trim());
        }
        if (!esVacio(dto.getUsername())) {
            usuario.setUsername(dto.getUsername().trim());
        }
        if (!esVacio(dto.getCorreo()) && !dto.getCorreo().trim().equalsIgnoreCase(usuario.getCorreo())) {
            String nuevoCorreo = dto.getCorreo().trim().toLowerCase();
            if (usuarioRepositorio.findByCorreo(nuevoCorreo).isPresent()) {
                throw new RuntimeException("El correo ya esta registrado");
            }
            usuario.setCorreo(nuevoCorreo);
        }
        if (!esVacio(dto.getPassword())) {
            usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        usuarioRepositorio.save(usuario);
        return mapPacienteDTO(pacienteRepositorio.save(paciente));
    }
    @Transactional
    //Implementar metodo para registrar profesional
    public ProfesionalDTO registrarProfesional(ProfesionalDTO dto) {
        Usuario usuario = obtenerOCrearUsuarioRegistro(dto.getUsuarioId(), dto.getNombre(), dto.getUsername(),
                dto.getCorreo(), dto.getPassword(), ROL_PROFESIONAL);
        validarRol(usuario, ROL_PROFESIONAL);
        if (profesionalRepositorio.existsByUsuario_IdUsuario(usuario.getIdUsuario())) {
            throw new RuntimeException("El usuario ya tiene un perfil profesional");
        }
        Profesional profesional = new Profesional();
        profesional.setUsuario(usuario);
        profesional.setEspecialidad(dto.getEspecialidad());
        profesional.setNumeroColegiatura(dto.getNumeroColegiatura());
        profesional.setEtiquetas(dto.getEtiquetas());
        profesional.setAniosExperiencia(dto.getAniosExperiencia());
        profesional.setDescripcionPerfil(dto.getDescripcionPerfil());
        profesional.setDocumentoValidacion(dto.getDocumentoValidacion());
        profesional.setEstadoValidacion("PENDIENTE");
        profesional.setFechaSolicitud(LocalDateTime.now());
        if (dto.getEspecialidad() != null) {
            especialidadRepositorio.findByNombreIgnoreCase(dto.getEspecialidad().trim())
                    .ifPresent(esp -> profesional.getEspecialidades().add(esp));
        }
        Profesional guardado = profesionalRepositorio.save(profesional);
        ProfesionalDTO response = modelMapper.map(guardado, ProfesionalDTO.class);
        response.setUsuarioId(usuario.getIdUsuario());
        response.setNombre(usuario.getNombre());
        response.setUsername(usuario.getUsername());
        response.setCorreo(usuario.getCorreo());
        return response;
    }

    @Transactional
    public String solicitarRecuperacionPassword(String correo) {
        Usuario usuario = usuarioRepositorio.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("El correo no existe"));
        PasswordResetToken reset = new PasswordResetToken();
        reset.setUsuario(usuario);

        String randomToken;
        do {
            randomToken = String.format("%07d", new java.util.Random().nextInt(10000000));
        } while (passwordResetTokenRepositorio.findByToken(randomToken).isPresent());
        reset.setToken(randomToken);

        reset.setFechaExpiracion(LocalDateTime.now().plusMinutes(30));
        reset.setUsado(Boolean.FALSE);
        passwordResetTokenRepositorio.save(reset);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            helper.setFrom(mailFrom, "MindCare");
            helper.setTo(correo);
            helper.setSubject("Recuperación de contraseña - MindCare");

            String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #dbe4f0; border-radius: 12px;\">"
                    + "<h2 style=\"color: #2563eb; text-align: center;\">Recuperación de Contraseña - MindCare</h2>"
                    + "<p>Hola <strong>" + usuario.getNombre() + "</strong>,</p>"
                    + "<p>Has solicitado restablecer tu contraseña en MindCare. Tu código de recuperación es:</p>"
                    + "<div style=\"text-align: center; margin: 25px 0;\">"
                    + "  <span style=\"font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #1e40af; background-color: #f1f5f9; padding: 12px 28px; border-radius: 8px; border: 1px dashed #cbd5e1; display: inline-block;\">" + reset.getToken() + "</span>"
                    + "</div>"
                    + "<p>Puedes ingresar este código manualmente en la web o hacer clic en el siguiente botón para restablecer tu contraseña directamente:</p>"
                    + "<div style=\"text-align: center; margin: 25px 0;\">"
                    + "  <a href=\"http://localhost:4200/restablecer-password?token=" + reset.getToken() + "\" style=\"background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;\">Restablecer contraseña</a>"
                    + "</div>"
                    + "<p style=\"color: #64748b; font-size: 14px;\">Este enlace y código expirarán en 30 minutos. Si no solicitaste este cambio, puedes ignorar este mensaje.</p>"
                    + "<hr style=\"border: none; border-top: 1px solid #eef2f6; margin: 20px 0;\">"
                    + "<p style=\"color: #94a3b8; font-size: 12px; text-align: center;\">El equipo de MindCare</p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Error al enviar correo: " + e.getMessage());
            e.printStackTrace();
        }

        return "Token de recuperacion generado: " + reset.getToken();
    }

    //Implementar metodos en UsuarioService para solicitar recuperacion y recuperar password
    @Transactional
    public String restablecerPassword(String token, String nuevaPassword) {
        PasswordResetToken reset = passwordResetTokenRepositorio.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token de recuperacion invalido"));
        if (Boolean.TRUE.equals(reset.getUsado())) {
            throw new RuntimeException("El token ya fue utilizado");
        }
        if (reset.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El token expiro");
        }
        Usuario usuario = reset.getUsuario();
        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepositorio.save(usuario);
        reset.setUsado(Boolean.TRUE);
        passwordResetTokenRepositorio.save(reset);
        return "Contrasena actualizada correctamente";
    }

    @Transactional
    public String recuperarPassword(String correo, String nuevaPassword) {
        Usuario usuario = usuarioRepositorio.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("El correo no existe"));
        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepositorio.save(usuario);
        return "Contrasena actualizada correctamente";
    }

    @Transactional public void activarUsuario(Long id) { cambiarEstadoActivo(id, true); }
    @Transactional public void desactivarUsuario(Long id) { cambiarEstadoActivo(id, false); }


    private Paciente buscarPaciente(Long id) {
        return pacienteRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
    }

    private PacienteDTO mapPacienteDTO(Paciente paciente) {
        PacienteDTO response = modelMapper.map(paciente, PacienteDTO.class);
        Usuario usuario = paciente.getUsuario();
        if (usuario != null) {
            response.setUsuarioId(usuario.getIdUsuario());
            response.setNombre(usuario.getNombre());
            response.setUsername(usuario.getUsername());
            response.setCorreo(usuario.getCorreo());
        }
        return response;
    }
    private List<UsuarioDTO> listarPorRol(String rol) {
        return usuarioRepositorio.findByRol_Nombre(rol).stream().map(u -> modelMapper.map(u, UsuarioDTO.class)).toList();
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepositorio.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
    private void validarPuedeActualizarUsuario(Usuario usuario) {
        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("No autorizado para actualizar el usuario");
        }
        boolean esAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equalsIgnoreCase(a.getAuthority()));
        if (esAdmin) {
            return;
        }
        String correoAutenticado = auth.getName();
        if (correoAutenticado == null || usuario.getCorreo() == null
                || !usuario.getCorreo().equalsIgnoreCase(correoAutenticado)) {
            throw new RuntimeException("No autorizado para actualizar otro usuario");
        }
    }


    private Usuario obtenerOCrearUsuarioRegistro(Long usuarioId, String nombre, String username,
                                                 String correo, String password, String rolNombre) {
        if (usuarioId != null) {
            return buscarUsuario(usuarioId);
        }
        if (esVacio(nombre) || esVacio(correo) || esVacio(password)) {
            throw new RuntimeException("Nombre, correo y password son obligatorios");
        }
        if (usuarioRepositorio.findByCorreo(correo).isPresent()) {
            throw new RuntimeException("El correo ya esta registrado");
        }
        Rol rol = rolRepositorio.findByNombreIgnoreCase(rolNombre)
                .orElseThrow(() -> new RuntimeException("Rol " + rolNombre + " no encontrado"));

        Usuario usuario = new Usuario();
        usuario.setNombre(nombre.trim());
        usuario.setUsername(esVacio(username) ? generarUsername(correo) : username.trim());
        usuario.setCorreo(correo.trim().toLowerCase());
        usuario.setPassword(passwordEncoder.encode(password));
        usuario.setRol(rol);
        usuario.setVerificado(!ROL_PROFESIONAL.equalsIgnoreCase(rolNombre));
        usuario.setActivo(Boolean.TRUE);
        usuario.setFechaRegistro(LocalDateTime.now());
        usuario.setUltimoAcceso(null);
        return usuarioRepositorio.save(usuario);
    }

    private String generarUsername(String correo) {
        return correo == null ? null : correo.split("@")[0];
    }

    private boolean esVacio(String texto) {
        return texto == null || texto.trim().isEmpty();
    }

    private void cambiarEstadoActivo(Long id, boolean activo) {
        Usuario usuario = buscarUsuario(id);
        validarPuedeActualizarUsuario(usuario);
        usuario.setActivo(activo);
        usuarioRepositorio.save(usuario);
    }

    private void validarRol(Usuario usuario, String rolEsperado) {
        if (usuario.getRol() == null || usuario.getRol().getNombre() == null) {
            throw new RuntimeException("El usuario no tiene rol asignado");
        }
        if (!usuario.getRol().getNombre().equalsIgnoreCase(rolEsperado)) {
            throw new RuntimeException("El usuario no tiene rol de " + rolEsperado);
        }
    }
}
