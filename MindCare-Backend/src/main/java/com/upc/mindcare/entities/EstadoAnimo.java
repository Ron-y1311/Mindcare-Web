package com.upc.mindcare.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "estados_animo")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EstadoAnimo
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado_animo")
    private Long idEstadoAnimo;

    @Column(name = "nombre", length = 50)
    private String nombre;

    @Column(name = "descripcion")
    private String descripcion;
}

