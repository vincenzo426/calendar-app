package it.calendar.event.service;

import it.calendar.event.model.Category;
import it.calendar.event.model.Event;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class EventService {
    
    @Inject
    CategoryService categoryService;
    
    @Transactional
    public Event createEvent(String title, String description, 
                           LocalDateTime startDateTime, LocalDateTime endDateTime,
                           Long userId, Long categoryId) {
        
        // Verifica che la categoria esista e appartenga all'utente
        Category category = null;
        if (categoryId != null) {
            Optional<Category> categoryOpt = categoryService.getCategoryById(categoryId, userId);
            if (categoryOpt.isPresent()) {
                category = categoryOpt.get();
            } else {
                throw new IllegalArgumentException("Invalid category");
            }
        }
        
        Event event = new Event(title, description, startDateTime, endDateTime, userId, category);
        event.persist();
        
        return event;
    }
    
    public List<Event> getEventsByUserId(Long userId) {
        return Event.findByUserId(userId);
    }
    
    public List<Event> getEventsByUserIdAndDateRange(Long userId, LocalDateTime start, LocalDateTime end) {
        return Event.findByUserIdAndDateRange(userId, start, end);
    }
    
    @Transactional
    public Optional<Event> updateEvent(Long eventId, String title, String description,
                                     LocalDateTime startDateTime, LocalDateTime endDateTime,
                                     Long userId, Long categoryId) {
        
        Optional<Event> eventOpt = Event.findByIdOptional(eventId);
        
        if (eventOpt.isPresent()) {
            Event event = eventOpt.get();
            
            // Verifica che l'evento appartenga all'utente
            if (!event.userId.equals(userId)) {
                return Optional.empty();
            }
            
            // Aggiorna i campi
            event.title = title;
            event.description = description;
            event.startDateTime = startDateTime;
            event.endDateTime = endDateTime;
            
            // Aggiorna la categoria se specificata
            if (categoryId != null) {
                Optional<Category> categoryOpt = categoryService.getCategoryById(categoryId, userId);
                if (categoryOpt.isPresent()) {
                    event.category = categoryOpt.get();
                } else {
                    throw new IllegalArgumentException("Invalid category");
                }
            } else {
                event.category = null;
            }
            
            return Optional.of(event);
        }
        
        return Optional.empty();
    }
    
    @Transactional
    public boolean deleteEvent(Long eventId, Long userId) {
        return Event.delete("id = ?1 and userId = ?2", eventId, userId) > 0;
    }
}