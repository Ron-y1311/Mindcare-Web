package com.upc.mindcare.controllers;

import com.upc.mindcare.dtos.RespuestaDTO;
import com.upc.mindcare.services.RespuestaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/respuestas")
@Tag(name = "Respuestas", description = "Registro de respuestas de encuestas")
public class RespuestaController {

    @Autowired
    private RespuestaService respuestaService;

    @PostMapping
    @PreAuthorize("hasRole('PACIENTE')")
    public RespuestaDTO registrarRespuesta(@Valid @RequestBody RespuestaDTO dto) {
        return respuestaService.registrarRespuesta(dto);
    }

    @GetMapping("/encuesta/{encuestaId}")
    @PreAuthorize("hasRole('PACIENTE')")
    public List<RespuestaDTO> listarRespuestasPorEncuesta(@PathVariable Long encuestaId) {
        return respuestaService.listarRespuestasPorEncuesta(encuestaId);
    }
}