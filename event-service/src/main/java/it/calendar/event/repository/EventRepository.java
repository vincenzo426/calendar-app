package it.calendar.event.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import it.calendar.event.model.Event;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class EventRepository implements PanacheRepository<Event> {
    
    /**
     * Trova tutti gli eventi appartenenti a un utente specifico
     * 
     * @param userId ID dell'utente
     * @return Lista di eventi
     */
    public List<Event> findByUserId(Long userId) {
        return list("userId", userId);
    }
    
    /**
     * Trova gli eventi di un utente in un determinato intervallo di date
     * 
     * @param userId ID dell'utente
     * @param start Data di inizio
     * @param end Data di fine
     * @return Lista di eventi
     */
    public List<Event> findByUserIdAndDateRange(Long userId, LocalDateTime start, LocalDateTime end) {
        return list("userId = ?1 and startDateTime >= ?2 and startDateTime <= ?3", 
                    userId, start, end);
    }
    
    /**
     * Trova un evento per ID e userId
     * 
     * @param eventId ID dell'evento
     * @param userId ID dell'utente
     * @return Optional con l'evento, se trovato
     */
    public Optional<Event> findByIdAndUserId(Long eventId, Long userId) {
        return find("id = ?1 and userId = ?2", eventId, userId).firstResultOptional();
    }
    
    /**
     * Elimina un evento per ID e userId
     * 
     * @param eventId ID dell'evento
     * @param userId ID dell'utente
     * @return true se l'evento è stato eliminato, false altrimenti
     */
    public boolean deleteByIdAndUserId(Long eventId, Long userId) {
        return delete("id = ?1 and userId = ?2", eventId, userId) > 0;
    }
}