package com.microservice.user.feign.dto;
import java.time.LocalDate;
import java.util.Set;
public class EventDTO {
    private Long id; private String nombre; private String state; private LocalDate startDate; private Set<Long> artistIds;
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getNombre(){return nombre;} public void setNombre(String nombre){this.nombre=nombre;}
    public String getState(){return state;} public void setState(String state){this.state=state;}
    public LocalDate getStartDate(){return startDate;} public void setStartDate(LocalDate startDate){this.startDate=startDate;}
    public Set<Long> getArtistIds(){return artistIds;} public void setArtistIds(Set<Long> artistIds){this.artistIds=artistIds;}
}
