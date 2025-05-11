package it.calendar.gateway.client;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import it.calendar.gateway.dto.event.*;

@RegisterRestClient(configKey = "event-service")
public interface EventServiceClient {
    
    // Categorie
    @GET
    @Path("/categories")
    @Produces(MediaType.APPLICATION_JSON)
    Response getAllCategories(@HeaderParam("Authorization") String token);
    
    @POST
    @Path("/categories")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Response createCategory(@HeaderParam("Authorization") String token, CategoryDto categoryDto);
    
    @PUT
    @Path("/categories/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Response updateCategory(@HeaderParam("Authorization") String token, @PathParam("id") Long id, CategoryDto categoryDto);
    
    @DELETE
    @Path("/categories/{id}")
    Response deleteCategory(@HeaderParam("Authorization") String token, @PathParam("id") Long id);
    
    // Eventi
    @GET
    @Path("/events")
    @Produces(MediaType.APPLICATION_JSON)
    Response getAllEvents(@HeaderParam("Authorization") String token, 
                         @QueryParam("start") String start, 
                         @QueryParam("end") String end);
    
    @POST
    @Path("/events")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Response createEvent(@HeaderParam("Authorization") String token, EventDto eventDto);
    
    @PUT
    @Path("/events/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Response updateEvent(@HeaderParam("Authorization") String token, @PathParam("id") Long id, EventDto eventDto);
    
    @DELETE
    @Path("/events/{id}")
    Response deleteEvent(@HeaderParam("Authorization") String token, @PathParam("id") Long id);
}