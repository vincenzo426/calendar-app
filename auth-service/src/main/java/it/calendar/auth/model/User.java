package it.calendar.auth.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "users")
public class User extends PanacheEntity {
    
    @NotBlank
    @Column(unique = true)
    public String username;
    
    @NotBlank
    @Email
    @Column(unique = true)
    public String email;
    
    @NotBlank
    public String password;
    
    // Costruttore vuoto richiesto da JPA
    public User() {
    }
    
    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
}