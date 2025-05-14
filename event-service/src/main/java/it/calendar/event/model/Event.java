package it.calendar.event.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event extends PanacheEntity {
    
    @NotBlank
    public String title;
    
    public String description;
    
    @NotNull
    public LocalDateTime startDateTime;
    
    public LocalDateTime endDateTime;
    
    @NotNull
    public Long userId;
    
    @ManyToOne
    @JoinColumn(name = "category_id")
    public Category category;
    
    // Costruttore vuoto richiesto da JPA
    public Event() {
    }
    
    public Event(String title, String description, LocalDateTime startDateTime, 
                 LocalDateTime endDateTime, Long userId, Category category) {
        this.title = title;
        this.description = description;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.userId = userId;
        this.category = category;
    }
}