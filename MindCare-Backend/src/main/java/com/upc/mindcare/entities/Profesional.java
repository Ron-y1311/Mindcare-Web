package com.upc.mindcare.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "profesionales")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Profesional {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_profesional")
    private Long idProfesional;

    @OneToOne
    @JoinColumn(name = "id_usuario", unique = true)
    private Usuario usuario;

    @Column(name = "especialidad")
    private String especialidad;

    @ManyToMany
    @JoinTable(
            name = "profesional_especialidad",
            joinColumns = @JoinColumn(name = "id_profesional"),
            inverseJoinColumns = @JoinColumn(name = "id_especialidad")
    )
    private Set<Especialidad> especialidades = new HashSet<>();

    @Column(name = "numero_colegiatura")
    private String numeroColegiatura;

    @Column(name = "etiquetas")
    private String etiquetas;

    @Column(name = "anios_experiencia")
    private Integer aniosExperiencia;

    @Column(name = "descripcion_perfil")
    private String descripcionPerfil;

    @Column(name = "documento_validacion")
    private String documentoValidacion;

    @Column(name = "estado_validacion")
    private String estadoValidacion;

    @Column(name = "motivo_rechazo")
    private String motivoRechazo;

    @Column(name = "fecha_solicitud")
    private LocalDateTime fechaSolicitud;

    @Column(name = "fecha_validacion")
    private LocalDateTime fechaValidacion;
}