package it.calendar.event.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "categories")
public class Category extends PanacheEntity {
    
    @NotBlank
    @Column(unique = true)
    public String name;
    
    public String color;
    
    public Long userId;
    
    // Costruttore vuoto richiesto da JPA
    public Category() {
    }
    
    public Category(String name, String color, Long userId) {
        this.name = name;
        this.color = color;
        this.userId = userId;
    }
    
    // Metodo per trovare categorie di un utente
    public static java.util.List<Category> findByUserId(Long userId) {
        return find("userId", userId).list();
    }
}