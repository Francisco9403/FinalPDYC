package com.microservice.artist.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "artists")
public class Artist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column
    private String genero;

    @Column
    private boolean active = true;

    @Column
    private String email;

    // getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
