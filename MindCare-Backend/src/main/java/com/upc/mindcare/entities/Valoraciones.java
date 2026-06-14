package com.upc.mindcare.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "valoraciones")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Valoraciones {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_valoracion")
    private Long idValoracion;

    @OneToOne
    @JoinColumn(name = "id_cita", unique = true)
    private Cita cita;

    @Column(name = "puntuacion")
    private Integer puntuacion;

    @Column(name = "comentario")
    private String comentario;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;
}
