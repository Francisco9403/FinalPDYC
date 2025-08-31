package com.microservice.user.repository;

import com.microservice.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    User findByNombre(String nombre);
    boolean existsByNombre(String nombre);
    boolean existsByEmail(String email);

    List<User> findDistinctByArtistasSeguidosIn(Set<Long> artistas);
    List<User> findDistinctByEventosFavoritosContaining(Long eventId);
}
