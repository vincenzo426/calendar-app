-- File da posizionare in: auth-service/src/main/resources/import-dev.sql

-- Inserimento utenti di esempio con password "password" (hash BCrypt)
INSERT INTO users (id, username, email, password) 
VALUES (1, 'admin', 'admin@example.com', '$2a$10$MZeP.cOcvqD2C8s7xAYbFeK/aH0R3UBwSdnTEwlBFkGGdlph4lv5a');

INSERT INTO users (id, username, email, password) 
VALUES (2, 'user1', 'user1@example.com', '$2a$10$MZeP.cOcvqD2C8s7xAYbFeK/aH0R3UBwSdnTEwlBFkGGdlph4lv5a');

INSERT INTO users (id, username, email, password) 
VALUES (3, 'user2', 'user2@example.com', '$2a$10$MZeP.cOcvqD2C8s7xAYbFeK/aH0R3UBwSdnTEwlBFkGGdlph4lv5a');

-- Imposta la sequenza per gli ID
ALTER SEQUENCE users_seq RESTART WITH 4;