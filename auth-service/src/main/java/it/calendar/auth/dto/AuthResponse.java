package it.calendar.auth.dto;

public class AuthResponse {
    
    private String message;
    private String token;
    
    public AuthResponse() {
    }
    
    public AuthResponse(String message, String token) {
        this.message = message;
        this.token = token;
    }
    
    // Getters and setters
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
}