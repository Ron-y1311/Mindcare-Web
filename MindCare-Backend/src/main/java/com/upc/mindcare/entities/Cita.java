package com.upc.mindcare.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "citas")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Cita
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cita")
    private Long idCita;

    @ManyToOne
    @JoinColumn(name = "id_paciente")
    private Paciente paciente;

    @ManyToOne
    @JoinColumn(name = "id_profesional")
    private Profesional profesional;

    @ManyToOne
    @JoinColumn(name = "id_estado_cita")
    private EstadoCita estadoCita;

    @Column(name = "fecha")
    private LocalDateTime fecha;

    @Column(name = "nota")
    private String nota;

    @Column(name = "motivo_consulta")
    private String motivoConsulta;

    @Column(name = "observaciones_clinicas")
    private String observacionesClinicas;

    @Column(name = "plan_accion")
    private String planAccion;

    @Column(name = "estado_nota")
    private String estadoNota;

    @Column(name = "fecha_nota")
    private LocalDateTime fechaNota;
}

