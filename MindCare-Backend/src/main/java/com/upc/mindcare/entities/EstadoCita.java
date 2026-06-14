package com.upc.mindcare.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "estados_cita")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EstadoCita
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado_cita")
    private Long idEstadoCita;

    @Column(name = "nombre", length = 50)
    private String nombre;
}

