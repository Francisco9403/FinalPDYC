package com.microservice.user.service;

import com.microservice.user.entity.User;
import com.microservice.user.feign.dto.ArtistDTO;
import com.microservice.user.feign.dto.EventDTO;
import com.microservice.user.dto.EventStateChangedDTO;
import com.microservice.user.dto.UserDTO;

import java.util.List;

public interface UserService {
    List<User> getAll();
    void create(UserDTO dto) throws Exception;
    void update(Long id, UserDTO user) throws Exception;
    User getInstance(Long id);
    void delete(Long id);
    User findByNombre(String nombre);

    void seguirArtista(Long userId, Long artistId) throws Exception;
    void dejarSeguirArtista(Long userId, Long artistId) throws Exception;
    List<ArtistDTO> listaArtista(Long userId);

    void seguirEvento(Long userId, Long eventId) throws Exception;
    void dejarSeguirEvento(Long userId, Long eventId) throws Exception;
    List<EventDTO> listaEventoVigente(Long userId);
    List<EventDTO> listaEventoProximosDeMisArtistas(Long userId);
    
    List<User> recipientsByArtists(EventStateChangedDTO dto);
    void notifyByArtists(EventStateChangedDTO dto);

    List<ArtistDTO> getGeneroArtists(String genero);

    
    
}
