package it.calendar.auth;

import it.calendar.auth.dto.AuthRequest;
import it.calendar.auth.dto.AuthResponse;
import it.calendar.auth.dto.RegisterRequest;
import it.calendar.auth.model.User;
import it.calendar.auth.service.AuthService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Optional;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {
    
    @Inject
    AuthService authService;
    
    @POST
    @Path("/register")
    public Response register(@Valid RegisterRequest request) {
        try {
            User user = authService.register(
                request.getUsername(), 
                request.getEmail(), 
                request.getPassword()
            );
            
            return Response.status(Response.Status.CREATED)
                    .entity(new AuthResponse("User registered successfully", null))
                    .build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new AuthResponse(e.getMessage(), null))
                    .build();
        }
    }
    
    @POST
    @Path("/login")
    public Response login(@Valid AuthRequest request) {
        Optional<String> token = authService.authenticate(
            request.getUsername(), 
            request.getPassword()
        );
        
        if (token.isPresent()) {
            return Response.ok(new AuthResponse("Authentication successful", token.get())).build();
        } else {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new AuthResponse("Invalid credentials", null))
                    .build();
        }
    }
}