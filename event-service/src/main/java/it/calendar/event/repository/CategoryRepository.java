package it.calendar.event.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import it.calendar.event.model.Category;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class CategoryRepository implements PanacheRepository<Category> {
    
    /**
     * Trova tutte le categorie appartenenti a un utente specifico
     * 
     * @param userId ID dell'utente
     * @return Lista di categorie
     */
    public List<Category> findByUserId(Long userId) {
        return list("userId", userId);
    }
    
    /**
     * Trova una categoria per nome e userId
     * 
     * @param name Nome della categoria
     * @param userId ID dell'utente
     * @return Optional con la categoria, se trovata
     */
    public Optional<Category> findByNameAndUserId(String name, Long userId) {
        return find("name = ?1 and userId = ?2", name, userId).firstResultOptional();
    }
    
    /**
     * Trova una categoria per ID e verifica che appartenga all'utente specificato
     * 
     * @param categoryId ID della categoria
     * @param userId ID dell'utente
     * @return Optional con la categoria, se trovata e appartiene all'utente
     */
    public Optional<Category> findByIdAndUserId(Long categoryId, Long userId) {
        if (categoryId == null) {
            return Optional.empty();
        }
        
        return find("id = ?1 and userId = ?2", categoryId, userId).firstResultOptional();
    }
    
    /**
     * Elimina una categoria per ID e userId
     * 
     * @param categoryId ID della categoria
     * @param userId ID dell'utente
     * @return true se la categoria è stata eliminata, false altrimenti
     */
    public boolean deleteByIdAndUserId(Long categoryId, Long userId) {
        return delete("id = ?1 and userId = ?2", categoryId, userId) > 0;
    }
}