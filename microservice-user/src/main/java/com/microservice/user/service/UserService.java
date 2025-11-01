package com.microservice.user.service;

import com.microservice.user.entity.User;
import com.microservice.user.dto.EventStateChangedDTO;
import com.microservice.user.dto.UserAuthDTO;

import java.util.List;

public interface UserService {
    List<User> getAll();
    void create(UserAuthDTO dto) throws Exception;
    void update(Long id, User user);
    User getInstance(Long id);
    void delete(Long id);
    User findByNombre(String nombre);

    void seguirArtista(Long userId, Long artistId) throws Exception;
    void dejarSeguirArtista(Long userId, Long artistId) throws Exception;

    void seguirEvento(Long userId, Long eventId) throws Exception;
    void dejarSeguirEvento(Long userId, Long eventId) throws Exception;

    List<User> recipientsByArtists(EventStateChangedDTO dto);
    void notifyByArtists(EventStateChangedDTO dto);
}
