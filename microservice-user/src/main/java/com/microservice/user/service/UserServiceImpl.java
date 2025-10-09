package com.microservice.user.service;

import com.microservice.user.dto.EventStateChangedDTO;
import com.microservice.user.dto.UserDTO;
import com.microservice.user.entity.User;
import com.microservice.user.repository.UserRepository;
import com.microservice.user.feign.ArtistClient;
import com.microservice.user.feign.EventClient;
import com.microservice.user.feign.dto.ArtistDTO;
import com.microservice.user.feign.dto.EventDTO;
import com.microservice.user.notification.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository repoUser;

    @Autowired
    private ArtistClient artistClient;

    @Autowired
    private EventClient eventClient;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private com.microservice.user.util.PasswordEncoderUtil passwordEncoder; // define below

    @Override
    public List<User> getAll() { return repoUser.findAll(); }

    @Override
    public void create(UserDTO dto) throws Exception {
        if (repoUser.existsByNombre(dto.getNombre())) throw new Exception("Nombre en uso");
        if (repoUser.existsByEmail(dto.getEmail())) throw new Exception("Email en uso");
        User u = new User();
        u.setNombre(dto.getNombre());
        u.setEmail(dto.getEmail());
        u.setPassword(passwordEncoder.encode(dto.getPassword()));
        u.setRol("ROLE_USER");
        repoUser.save(u);
    }

    @Override
    public void update(Long id, UserDTO dto) throws Exception {
        User u = repoUser.findById(id).orElseThrow();
        if (repoUser.existsByNombre(dto.getNombre())) throw new Exception("Nombre en uso");
        if (repoUser.existsByEmail(dto.getEmail())) throw new Exception("Email en uso");
        u.setNombre(dto.getNombre());
        u.setEmail(dto.getEmail());
        repoUser.save(u);
    }

    @Override
    public User getInstance(Long id) { return repoUser.findById(id).orElseThrow(); }

    @Override
    public void delete(Long id) { repoUser.delete(repoUser.findById(id).orElseThrow()); }

    @Override
    public User findByNombre(String nombre){
        return repoUser.findByNombre(nombre)
                .orElseThrow(() -> new RuntimeException("el usuario: "+nombre+" no se encontro")); 
    }

    @Override
    public void seguirArtista(Long userId, Long artistId) throws Exception {
        User u = repoUser.findById(userId).orElseThrow();
        // validar existencia via ArtistClient
        if (artistClient.getById(artistId) == null) throw new Exception("Artista no existe");
        u.getArtistasSeguidos().add(artistId);
        repoUser.save(u);
    }

        @Override
    public void dejarSeguirArtista(Long userId, Long artistId) throws Exception {
        User u = repoUser.findById(userId).orElseThrow();
        u.getArtistasSeguidos().remove(artistId);
        repoUser.save(u);
    }

    @Override
    public void seguirEvento(Long userId, Long eventId) throws Exception {
        User u = repoUser.findById(userId).orElseThrow();
        // validar evento y estado via eventClient
        var event = eventClient.getById(eventId);
        if (event == null) throw new Exception("Evento no existe");
        if ("TENTATIVE".equals(event.getState())) throw new Exception("No se puede seguir evento tentativo");
        u.getEventosFavoritos().add(eventId);
        repoUser.save(u);
    }

    @Override
    public void dejarSeguirEvento(Long userId, Long eventId) throws Exception {
        User u = repoUser.findById(userId).orElseThrow();
        u.getEventosFavoritos().remove(eventId);
        repoUser.save(u);
    }

    @Override
    public List<EventDTO> listaEventoVigente(Long userId) {
        LocalDate now = LocalDate.now();

        User user = repoUser.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return user.getEventosFavoritos().stream()
                .map(eventId -> {
                    try {
                        return eventClient.getById(eventId); // llamado al microservicio de eventos
                    } catch (Exception ex) {
                        // si el evento no existe o el microservicio no responde, lo ignoramos
                        return null;
                    }
                })
                .filter(Objects::nonNull) // eliminamos los null
                .filter(e -> e.getStartDate().isAfter(now)
                        && !("CANCELLED".equals(e.getState()) || "TENTATIVE".equals(e.getState())))
                .collect(Collectors.toList());
    }

    @Override
    public List<User> recipientsByArtists(EventStateChangedDTO dto) {
        Set<Long> artists = dto.getArtistIds() != null ? dto.getArtistIds() : new HashSet<>();
        List<User> seguidores = repoUser.findDistinctByArtistasSeguidosIn(artists);
        List<User> fanaticos = repoUser.findDistinctByEventosFavoritosContaining(dto.getEventId());
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

    @Override
    public List<EventDTO> listaEventoProximosDeMisArtistas(Long userId) {
        LocalDate now = LocalDate.now();

        User user = repoUser.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return user.getArtistasSeguidos().stream()             //El usuario trae los artistas que sigue
                .map(artistId -> {
                    try {
                        return artistClient.getById(artistId); // llamado al microservicio de artista
                    } catch (Exception ex) {
                        // si el artista no existe o el microservicio no responde, lo ignoramos
                        return null;
                    }
                })
                .filter(Objects::nonNull) // eliminamos los null
                
                .flatMap(artist -> artist.getEventsIds().stream())  //te trae los eventos en que participa un artista y 
                .map(eventId -> {                                   //verifica que NO esten ni tentativos o cancelados, que no hallan sucedido y los muestra
                    try {
                        return eventClient.getById(eventId); // llamado al microservicio de eventos
                    } catch (Exception ex) {
                        // si el evento no existe o el microservicio no responde, lo ignoramos
                        return null;
                    }
                })
                .filter(Objects::nonNull) // eliminamos los null
                
                .filter(e -> e.getStartDate().isAfter(now)
                        && !("CANCELLED".equals(e.getState()) || "TENTATIVE".equals(e.getState())))
                .sorted((e1, e2) -> e1.getStartDate().compareTo(e2.getStartDate())) //ver si cumple el mostrar las fechas mas proximas
                .collect(Collectors.toList());
    }

    public List<ArtistDTO> listaArtista(Long userId){
        User user = repoUser.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return user.getArtistasSeguidos().stream()             //El usuario trae los artistas que sigue
                .map(artistId -> {
                    try {
                        return artistClient.getById(artistId); // llamado al microservicio de artista
                    } catch (Exception ex) {
                        // si el artista no existe o el microservicio no responde, lo ignoramos
                        return null;
                    }
                })
                .filter(Objects::nonNull) // eliminamos los null
                .collect(Collectors.toList());
    }
}
