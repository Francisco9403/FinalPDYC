package com.microservice.user.service;

import com.microservice.user.dto.EventStateChangedDTO;
import com.microservice.user.dto.UserAuthDTO;
import com.microservice.user.entity.User;
import com.microservice.user.repository.UserRepository;
import com.microservice.user.feign.ArtistClient;
import com.microservice.user.feign.EventClient;
import com.microservice.user.notification.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private ArtistClient artistClient;

    @Autowired
    private EventClient eventClient;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private com.microservice.user.util.PasswordEncoderUtil passwordEncoder; // define below

    @Override
    public List<User> getAll() { return repo.findAll(); }

    @Override
    public void create(UserAuthDTO dto) throws Exception {
        if (repo.existsByNombre(dto.getNombre())) throw new Exception("Nombre en uso");
        if (repo.existsByEmail(dto.getEmail())) throw new Exception("Email en uso");
        User u = new User();
        u.setNombre(dto.getNombre());
        u.setEmail(dto.getEmail());
        u.setPassword(passwordEncoder.encode(dto.getPassword()));
        repo.save(u);
    }

    @Override
    public void update(Long id, User user) {
        User u = repo.findById(id).orElseThrow();
        u.setNombre(user.getNombre());
        u.setEmail(user.getEmail());
        repo.save(u);
    }

    @Override
    public User getInstance(Long id) { return repo.findById(id).orElseThrow(); }

    @Override
    public void delete(Long id) { repo.delete(repo.findById(id).orElseThrow()); }

    @Override
    public User findByNombre(String nombre) { return repo.findByNombre(nombre); }

    @Override
    public void seguirArtista(Long userId, Long artistId) throws Exception {
        User u = repo.findById(userId).orElseThrow();
        // validar existencia via ArtistClient
        if (artistClient.getById(artistId) == null) throw new Exception("Artista no existe");
        u.getArtistasSeguidos().add(artistId);
        repo.save(u);
    }

        @Override
    public void dejarSeguirArtista(Long userId, Long artistId) throws Exception {
        User u = repo.findById(userId).orElseThrow();
        u.getArtistasSeguidos().remove(artistId);
        repo.save(u);
    }

    @Override
    public void seguirEvento(Long userId, Long eventId) throws Exception {
        User u = repo.findById(userId).orElseThrow();
        // validar evento y estado via eventClient
        var event = eventClient.getById(eventId);
        if (event == null) throw new Exception("Evento no existe");
        if ("TENTATIVE".equals(event.getState())) throw new Exception("No se puede seguir evento tentativo");
        u.getEventosFavoritos().add(eventId);
        repo.save(u);
    }

    @Override
    public void dejarSeguirEvento(Long userId, Long eventId) throws Exception {
        User u = repo.findById(userId).orElseThrow();
        u.getEventosFavoritos().remove(eventId);
        repo.save(u);
    }

    @Override
    public List<User> recipientsByArtists(EventStateChangedDTO dto) {
        Set<Long> artists = dto.getArtistIds() != null ? dto.getArtistIds() : new HashSet<>();
        List<User> seguidores = repo.findDistinctByArtistasSeguidosIn(artists);
        List<User> fanaticos = repo.findDistinctByEventosFavoritosContaining(dto.getEventId());
        Set<User> destinatarios = new HashSet<>();
        destinatarios.addAll(seguidores);
        destinatarios.addAll(fanaticos);
        return destinatarios.stream().collect(Collectors.toList());
    }

    @Override
    public void notifyByArtists(EventStateChangedDTO dto) {
        List<User> recipients = recipientsByArtists(dto);
        String message = String.format("El evento «%s» cambió de %s a %s.", dto.getEventName(), dto.getOldState(), dto.getNewState());
        recipients.forEach(u -> notificationService.sendNotification(u, message));
    }
}
