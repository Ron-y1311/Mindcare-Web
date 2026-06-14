package com.upc.mindcare.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "respuestas")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Respuesta
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_respuesta")
    private Long idRespuesta;

    @ManyToOne
    @JoinColumn(name = "id_encuesta")
    private Encuesta encuesta;

    @ManyToOne
    @JoinColumn(name = "id_pregunta")
    private Pregunta pregunta;

    @Column(name = "respuesta", columnDefinition = "TEXT")
    private String contenido;
}

