package com.upc.mindcare.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "encuestas")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Encuesta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_encuesta")
    private Long idEncuesta;

    @ManyToOne
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @Column(name = "tipo_encuesta")
    private String tipoEncuesta;

    @Column(name = "estado")
    private String estado;

    @Column(name = "resultado_total")
    private Integer resultadoTotal;

    @Column(name="interpretacion_resultado")
    private String interpretacionResultado;
}