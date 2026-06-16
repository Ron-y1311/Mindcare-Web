package com.upc.mindcare.security.controllers;

import com.upc.mindcare.entities.Usuario;
import com.upc.mindcare.repositories.UsuarioRepositorio;
import com.upc.mindcare.security.dtos.AuthRequestDTO;
import com.upc.mindcare.security.dtos.AuthResponseDTO;
import com.upc.mindcare.security.services.CustomUserDetailsService;
import com.upc.mindcare.security.util.JwtUtil;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final UsuarioRepositorio usuarioRepositorio;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          CustomUserDetailsService userDetailsService,
                          UsuarioRepositorio usuarioRepositorio) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.usuarioRepositorio = usuarioRepositorio;
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthResponseDTO> createAuthenticationToken(@RequestBody AuthRequestDTO authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getCorreo(), authRequest.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getCorreo());
        String token = jwtUtil.generateToken(userDetails);
        Usuario usuario = usuarioRepositorio.findByCorreoAndActivoTrue(authRequest.getCorreo())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado o inactivo"));

        Set<String> roles = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

                Long pacienteId = usuario.getPaciente() != null ? usuario.getPaciente().getPacienteId() : null;
        Long profesionalId = usuario.getProfesional() != null ? usuario.getProfesional().getIdProfesional() : null;
        AuthResponseDTO response = new AuthResponseDTO(
                token,
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getCorreo(),
                roles,
                pacienteId,
                profesionalId
        );
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        return ResponseEntity.ok().headers(headers).body(response);
    }
}
