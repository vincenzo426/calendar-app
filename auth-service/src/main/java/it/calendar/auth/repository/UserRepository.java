package it.calendar.auth.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import it.calendar.auth.model.User;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;

@ApplicationScoped
public class UserRepository implements PanacheRepository<User> {
    
    /**
     * Trova un utente per nome utente
     * 
     * @param username Il nome utente da cercare
     * @return L'utente trovato o null se non esiste
     */
    public User findByUsername(String username) {
        return find("username", username).firstResult();
    }
    
    /**
     * Trova un utente per email
     * 
     * @param email L'email da cercare
     * @return L'utente trovato o null se non esiste
     */
    public User findByEmail(String email) {
        return find("email", email).firstResult();
    }
    
    /**
     * Verifica se esiste un utente con il nome utente specificato
     * 
     * @param username Il nome utente da verificare
     * @return true se esiste, false altrimenti
     */
    public boolean existsByUsername(String username) {
        return findByUsername(username) != null;
    }
    
    /**
     * Verifica se esiste un utente con l'email specificata
     * 
     * @param email L'email da verificare
     * @return true se esiste, false altrimenti
     */
    public boolean existsByEmail(String email) {
        return findByEmail(email) != null;
    }
}