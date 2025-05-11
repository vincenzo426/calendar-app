package it.calendar.event;

import it.calendar.event.dto.EventDto;
import it.calendar.event.model.Event;
import it.calendar.event.service.EventService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Path("/events")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EventResource {
    
    @Inject
    EventService eventService;
    
    @Inject
    JsonWebToken jwt;
    
    @GET
    @RolesAllowed("user")
    public Response getAllEvents(@QueryParam("start") String startStr, 
                              @QueryParam("end") String endStr) {
        Long userId = Long.parseLong(jwt.getClaim("userId"));
        List<Event> events;
        
        // Se sono specificati parametri di ricerca per date, filtra per intervallo
        if (startStr != null && endStr != null) {
            LocalDateTime start = LocalDateTime.parse(startStr, DateTimeFormatter.ISO_DATE_TIME);
            LocalDateTime end = LocalDateTime.parse(endStr, DateTimeFormatter.ISO_DATE_TIME);
            events = eventService.getEventsByUserIdAndDateRange(userId, start, end);
        } else {
            events = eventService.getEventsByUserId(userId);
        }
        
        List<EventDto> eventDtos = events.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        
        return Response.ok(eventDtos).build();
    }
    
    @POST
    @RolesAllowed("user")
    public Response createEvent(EventDto eventDto) {
        Long userId = Long.parseLong(jwt.getClaim("userId"));
        
        try {
            Event event = eventService.createEvent(
                    eventDto.getTitle(),
                    eventDto.getDescription(),
                    eventDto.getStartDateTime(),
                    eventDto.getEndDateTime(),
                    userId,
                    eventDto.getCategoryId()
            );
            
            return Response.status(Response.Status.CREATED)
                    .entity(mapToDto(event))
                    .build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(e.getMessage())
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}")
    @RolesAllowed("user")
    public Response updateEvent(@PathParam("id") Long id, EventDto eventDto) {
        Long userId = Long.parseLong(jwt.getClaim("userId"));
        
        Optional<Event> updatedEvent = eventService.updateEvent(
                id,
                eventDto.getTitle(),
                eventDto.getDescription(),
                eventDto.getStartDateTime(),
                eventDto.getEndDateTime(),
                userId,
                eventDto.getCategoryId()
        );
        
        if (updatedEvent.isPresent()) {
            return Response.ok(mapToDto(updatedEvent.get())).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }
    
    @DELETE
    @Path("/{id}")
    @RolesAllowed("user")
    public Response deleteEvent(@PathParam("id") Long id) {
        Long userId = Long.parseLong(jwt.getClaim("userId"));
        
        boolean deleted = eventService.deleteEvent(id, userId);
        
        if (deleted) {
            return Response.noContent().build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }
    
    private EventDto mapToDto(Event event) {
        EventDto dto = new EventDto();
        dto.setId(event.id);
        dto.setTitle(event.title);
        dto.setDescription(event.description);
        dto.setStartDateTime(event.startDateTime);
        dto.setEndDateTime(event.endDateTime);
        
        if (event.category != null) {
            dto.setCategoryId(event.category.id);
            dto.setCategoryName(event.category.name);
            dto.setCategoryColor(event.category.color);
        }
        
        return dto;
    }
}