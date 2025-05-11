-- File da posizionare in: event-service/src/main/resources/import-dev.sql

-- Inserimento categorie di esempio
INSERT INTO categories (id, name, color, userId) 
VALUES (1, 'Lavoro', '#ff5722', 1);

INSERT INTO categories (id, name, color, userId) 
VALUES (2, 'Personale', '#3f51b5', 1);

INSERT INTO categories (id, name, color, userId) 
VALUES (3, 'Sport', '#4caf50', 1);

INSERT INTO categories (id, name, color, userId) 
VALUES (4, 'Lavoro', '#f44336', 2);

INSERT INTO categories (id, name, color, userId) 
VALUES (5, 'Famiglia', '#9c27b0', 2);

-- Imposta la sequenza per gli ID delle categorie
ALTER SEQUENCE categories_seq RESTART WITH 6;

-- Inserimento eventi di esempio
INSERT INTO events (id, title, description, startDateTime, endDateTime, userId, category_id) 
VALUES (
  1, 
  'Riunione di team', 
  'Discussione progetti Q2', 
  '2025-05-10T10:00:00', 
  '2025-05-10T11:30:00', 
  1, 
  1
);

INSERT INTO events (id, title, description, startDateTime, endDateTime, userId, category_id) 
VALUES (
  2, 
  'Cena con amici', 
  'Ristorante La Pergola', 
  '2025-05-12T20:00:00', 
  '2025-05-12T23:00:00', 
  1, 
  2
);

INSERT INTO events (id, title, description, startDateTime, endDateTime, userId, category_id) 
VALUES (
  3, 
  'Partita di calcetto', 
  'Centro sportivo', 
  '2025-05-14T18:30:00', 
  '2025-05-14T20:00:00', 
  1, 
  3
);

INSERT INTO events (id, title, description, startDateTime, endDateTime, userId, category_id) 
VALUES (
  4, 
  'Incontro con cliente', 
  'Presentazione progetto', 
  '2025-05-11T15:00:00', 
  '2025-05-11T16:30:00', 
  2, 
  4
);

INSERT INTO events (id, title, description, startDateTime, endDateTime, userId, category_id) 
VALUES (
  5, 
  'Compleanno di Marco', 
  'Comprare regalo', 
  '2025-05-18T19:00:00', 
  '2025-05-18T23:30:00', 
  2, 
  5
);

-- Imposta la sequenza per gli ID degli eventi
ALTER SEQUENCE events_seq RESTART WITH 6;

-- Pulisce le tabelle per evitare duplicati nei test/dev
DELETE FROM events;
DELETE FROM categories;
