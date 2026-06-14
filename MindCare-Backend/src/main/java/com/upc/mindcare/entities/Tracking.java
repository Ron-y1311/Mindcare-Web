package com.upc.mindcare.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "tracking")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Tracking
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tracking")
    private Long idTracking;

    @ManyToOne
    @JoinColumn(name = "id_paciente")
    private Paciente paciente;

    @ManyToOne
    @JoinColumn(name = "id_estado_animo")
    private EstadoAnimo estadoAnimo;

    @Column(name = "fecha")
    private LocalDateTime fecha;

    @Column(name = "nota", columnDefinition = "TEXT")
    private String nota;

    @Column(name = "numero_intensidad")
    private Integer numeroIntensidad;

    @Column(name = "reflexion_descripcion")
    private String reflexionDescripcion;
}

