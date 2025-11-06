package com.microservice.event.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "events")
public class Event {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, length = 2000)
    private String descripcion;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column
    private String state = "TENTATIVE"; // Strings para simplicidad

    @ElementCollection
    @CollectionTable(name = "event_artists", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "artist_id")
    private Set<Long> artistIds = new HashSet<>();

    // getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public Set<Long> getArtistIds() { return artistIds; }
    public void setArtistIds(Set<Long> artistIds) { this.artistIds = artistIds; }
    public Event orElseThrow(Exception exception) {
        throw new UnsupportedOperationException("Unimplemented method 'orElseThrow'");
    }
}
