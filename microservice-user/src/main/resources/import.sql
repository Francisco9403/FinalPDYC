INSERT INTO users (nombre, email, password) VALUES ('juan_perez', 'juan.perez@example.com', 'pass123');
INSERT INTO users (nombre, email, password) VALUES ('maria_gomez', 'maria.gomez@example.com', 'pass123');
INSERT INTO users (nombre, email, password) VALUES ('carlos_ruiz', 'carlos.ruiz@example.com', 'pass123');

-- Juan Pérez sigue al artista con ID 1
INSERT INTO user_follow_artists (user_id, artist_id) VALUES (1, 1);
-- María Gómez sigue al artista con ID 2
INSERT INTO user_follow_artists (user_id, artist_id) VALUES (2, 2);
-- Carlos Ruiz sigue a los artistas con ID 1 y 3
INSERT INTO user_follow_artists (user_id, artist_id) VALUES (3, 1);
INSERT INTO user_follow_artists (user_id, artist_id) VALUES (3, 3);


-- Juan Pérez tiene como favorito el evento con ID 101
INSERT INTO user_favorite_events (user_id, event_id) VALUES (1, 101);
-- María Gómez tiene como favoritos los eventos con ID 102 y 103
INSERT INTO user_favorite_events (user_id, event_id) VALUES (2, 102);
INSERT INTO user_favorite_events (user_id, event_id) VALUES (2, 103);
-- Carlos Ruiz no tiene eventos favoritos


