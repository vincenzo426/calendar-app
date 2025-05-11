package it.calendar.gateway;

import it.calendar.gateway.client.AuthServiceClient;
import it.calendar.gateway.client.EventServiceClient;
import it.calendar.gateway.dto.auth.AuthRequest;
import it.calendar.gateway.dto.auth.RegisterRequest;
import it.calendar.gateway.dto.event.CategoryDto;
import it.calendar.gateway.dto.event.EventDto;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.jboss.logging.Logger;

@Path("/api")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ApiGatewayResource {
    
    private static final Logger LOG = Logger.getLogger(ApiGatewayResource.class);
    
    @Inject
    @RestClient
    AuthServiceClient authServiceClient;
    
    @Inject
    @RestClient
    EventServiceClient eventServiceClient;
    
    // Endpoint autenticazione
    @POST
    @Path("/auth/register")
    @PermitAll
    public Response register(RegisterRequest request) {
        LOG.debug("Registering user: " + request.getUsername());
        return authServiceClient.register(request);
    }
    
    @POST
    @Path("/auth/login")
    @PermitAll
    public Response login(AuthRequest request) {
        LOG.debug("Login attempt for user: " + request.getUsername());
        return authServiceClient.login(request);
    }
    
    // Endpoint categorie
    @GET
    @Path("/categories")
    @RolesAllowed("user")
    public Response getAllCategories(@Context HttpHeaders headers) {
        String authHeader = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
        LOG.debug("Fetching all categories with auth header: " + (authHeader != null ? "present" : "missing"));
        return eventServiceClient.getAllCategories(authHeader);
    }
    
    @POST
    @Path("/categories")
    @RolesAllowed("user")
    public Response createCategory(@Context HttpHeaders headers, CategoryDto categoryDto) {
        String authHeader = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
        LOG.debug("Creating category: " + categoryDto.getName() + " with auth header: " + (authHeader != null ? "present" : "missing"));
        
        try {
            Response response = eventServiceClient.createCategory(authHeader, categoryDto);
            return response;
        } catch (Exception e) {
            LOG.error("Error creating category", e);
            return Response.serverError().entity("Error creating category: " + e.getMessage()).build();
        }
    }
    
    @PUT
    @Path("/categories/{id}")
    @RolesAllowed("user")
    public Response updateCategory(@Context HttpHeaders headers, 
                               @PathParam("id") Long id, 
                               CategoryDto categoryDto) {
        String authHeader = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
        LOG.debug("Updating category: " + id);
        return eventServiceClient.updateCategory(authHeader, id, categoryDto);
    }
    
    @DELETE
    @Path("/categories/{id}")
    @RolesAllowed("user")
    public Response deleteCategory(@Context HttpHeaders headers, @PathParam("id") Long id) {
        String authHeader = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
        LOG.debug("Deleting category: " + id);
        return eventServiceClient.deleteCategory(authHeader, id);
    }
    
    // Endpoint eventi
    @GET
    @Path("/events")
    @RolesAllowed("user")
    public Response getAllEvents(@Context HttpHeaders headers,
                              @QueryParam("start") String start,
                              @QueryParam("end") String end) {
        String authHeader = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
        LOG.debug("Fetching events with date range: " + (start != null ? start : "none") + " to " + (end != null ? end : "none"));
        return eventServiceClient.getAllEvents(authHeader, start, end);
    }
    
    @POST
    @Path("/events")
    @RolesAllowed("user")
    public Response createEvent(@Context HttpHeaders headers, EventDto eventDto) {
        String authHeader = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
        LOG.debug("Creating event: " + eventDto.getTitle());
        return eventServiceClient.createEvent(authHeader, eventDto);
    }
    
    @PUT
    @Path("/events/{id}")
    @RolesAllowed("user")
    public Response updateEvent(@Context HttpHeaders headers, 
                             @PathParam("id") Long id, 
                             EventDto eventDto) {
        String authHeader = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
        LOG.debug("Updating event: " + id);
        return eventServiceClient.updateEvent(authHeader, id, eventDto);
    }
    
    @DELETE
    @Path("/events/{id}")
    @RolesAllowed("user")
    public Response deleteEvent(@Context HttpHeaders headers, @PathParam("id") Long id) {
        String authHeader = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
        LOG.debug("Deleting event: " + id);
        return eventServiceClient.deleteEvent(authHeader, id);
    }
    
    // Endpoint di health check
    @GET
    @Path("/health")
    @PermitAll
    public Response checkHealth() {
        return Response.ok().entity("API Gateway is up and running").build();
    }
}
