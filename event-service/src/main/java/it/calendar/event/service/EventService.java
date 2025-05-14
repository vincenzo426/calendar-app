package it.calendar.event.service;

import it.calendar.event.model.Category;
import it.calendar.event.model.Event;
import it.calendar.event.repository.EventRepository;
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
    
    @Inject
    EventRepository eventRepository;
    
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
        eventRepository.persist(event);
        
        return event;
    }
    
    public List<Event> getEventsByUserId(Long userId) {
        return eventRepository.findByUserId(userId);
    }
    
    public List<Event> getEventsByUserIdAndDateRange(Long userId, LocalDateTime start, LocalDateTime end) {
        return eventRepository.findByUserIdAndDateRange(userId, start, end);
    }
    
    @Transactional
    public Optional<Event> updateEvent(Long eventId, String title, String description,
                                     LocalDateTime startDateTime, LocalDateTime endDateTime,
                                     Long userId, Long categoryId) {
        
        Optional<Event> eventOpt = eventRepository.findByIdAndUserId(eventId, userId);
        
        if (eventOpt.isPresent()) {
            Event event = eventOpt.get();
            
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
        return eventRepository.deleteByIdAndUserId(eventId, userId);
    }
}