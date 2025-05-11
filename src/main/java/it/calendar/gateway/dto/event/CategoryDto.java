package it.calendar.gateway.dto.event;

import jakarta.validation.constraints.NotBlank;

public class CategoryDto {
    
    private Long id;
    
    @NotBlank(message = "Category name cannot be blank")
    private String name;
    
    private String color;
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getColor() {
        return color;
    }
    
    public void setColor(String color) {
        this.color = color;
    }
}
