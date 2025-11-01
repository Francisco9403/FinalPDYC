package com.microservice.user.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "nombre"),
        @UniqueConstraint(columnNames = "email")
})
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @ElementCollection
    @CollectionTable(name = "user_follow_artists", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "artist_id")
    private Set<Long> artistasSeguidos = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "user_favorite_events", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "event_id")
    private Set<Long> eventosFavoritos = new HashSet<>();

    // getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Set<Long> getArtistasSeguidos() { return artistasSeguidos; }
    public void setArtistasSeguidos(Set<Long> artistasSeguidos) { this.artistasSeguidos = artistasSeguidos; }
    public Set<Long> getEventosFavoritos() { return eventosFavoritos; }
    public void setEventosFavoritos(Set<Long> eventosFavoritos) { this.eventosFavoritos = eventosFavoritos; }
}
