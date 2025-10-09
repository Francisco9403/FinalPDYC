package com.microservice.user.feign.dto;

import java.util.Set;

public class ArtistDTO {
    private Long id; private String nombre; private boolean active; private Set<Long> eventsIds; 
    // getters/setters
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getNombre(){return nombre;} public void setNombre(String nombre){this.nombre=nombre;}
    public boolean isActive(){return active;} public void setActive(boolean active){this.active=active;}
    public Set<Long> getEventsIds(){return eventsIds;} public void setEventsIds(Set<Long> eventsIds){this.eventsIds=eventsIds;}

}
