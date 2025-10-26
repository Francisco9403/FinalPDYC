-- Evento 1: Concierto de Rock
INSERT INTO events (nombre, descripcion, start_date, state) VALUES ('Rock Fest 2025', 'Un festival de rock de dos días con bandas legendarias y emergentes.', '2025-10-15', 'CONFIRMED');
-- Artistas para el evento 1 (Rock Fest 2025)
INSERT INTO event_artists (event_id, artist_id) VALUES (1, 3); -- Queen
INSERT INTO event_artists (event_id, artist_id) VALUES (1, 10); -- Metallica

-- Evento 2: Gira Mundial de Pop
INSERT INTO events (nombre, descripcion, start_date, state) VALUES ('The Eras Tour Live', 'El esperado concierto de Taylor Swift para su gira mundial.', '2025-11-20', 'CONFIRMED');
-- Artistas para el evento 2 (The Eras Tour Live)
INSERT INTO event_artists (event_id, artist_id) VALUES (2, 2); -- Taylor Swift

-- Evento 3: Festival de Música Electrónica
INSERT INTO events (nombre, descripcion, start_date, state) VALUES ('Electra Night', 'Una noche de música electrónica con DJs de renombre internacional.', '2025-12-05', 'TENTATIVE');
-- Artistas para el evento 3 (Electra Night)
-- Nota: En este caso no se agregan artistas, dado que el evento es 'TENTATIVE'.

-- Evento 4: Noche de Hip Hop
INSERT INTO events (nombre, descripcion, start_date, state) VALUES ('Urban Flow', 'Un showcase de talentos del hip hop local y global.', '2026-01-10', 'CONFIRMED');
-- Artistas para el evento 4 (Urban Flow)
INSERT INTO event_artists (event_id, artist_id) VALUES (4, 8); -- Eminem