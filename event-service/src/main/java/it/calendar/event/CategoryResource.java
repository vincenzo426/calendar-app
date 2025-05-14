package it.calendar.event;

import it.calendar.event.dto.CategoryDto;
import it.calendar.event.model.Category;
import it.calendar.event.service.CategoryService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Path("/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CategoryResource {
    
    private static final Logger LOG = Logger.getLogger(CategoryResource.class);
    
    @Inject
    CategoryService categoryService;
    
    @Inject
    JsonWebToken jwt;
    
    @GET
    @RolesAllowed("user")
    public Response getAllCategories() {
        LOG.debug("JWT principal: " + jwt.getName());
        LOG.debug("JWT claims: " + jwt.getClaimNames());
        
        Long userId;
        try {
            userId = getUserIdFromToken();
            LOG.debug("Fetching categories for user ID: " + userId);
            
            List<Category> categories = categoryService.getCategoriesByUserId(userId);
            
            List<CategoryDto> categoryDtos = categories.stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
            
            return Response.ok(categoryDtos).build();
        } catch (Exception e) {
            LOG.error("Error getting categories", e);
            return Response.serverError().entity("Error: " + e.getMessage()).build();
        }
    }
    
    @POST
    @RolesAllowed("user")
    public Response createCategory(CategoryDto categoryDto) {
        try {
            Long userId = getUserIdFromToken();
            LOG.debug("Creating category for user ID: " + userId);
            
            Category category = categoryService.createCategory(
                    categoryDto.getName(),
                    categoryDto.getColor(),
                    userId
            );
            
            return Response.status(Response.Status.CREATED)
                    .entity(mapToDto(category))
                    .build();
        } catch (IllegalArgumentException e) {
            LOG.warn("Bad request creating category", e);
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(e.getMessage())
                    .build();
        } catch (Exception e) {
            LOG.error("Error creating category", e);
            return Response.serverError().entity("Error: " + e.getMessage()).build();
        }
    }
    
    @PUT
    @Path("/{id}")
    @RolesAllowed("user")
    public Response updateCategory(@PathParam("id") Long id, CategoryDto categoryDto) {
        try {
            Long userId = getUserIdFromToken();
            LOG.debug("Updating category ID: " + id + " for user ID: " + userId);
            
            Optional<Category> updatedCategory = categoryService.updateCategory(
                    id,
                    categoryDto.getName(),
                    categoryDto.getColor(),
                    userId
            );
            
            if (updatedCategory.isPresent()) {
                return Response.ok(mapToDto(updatedCategory.get())).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
        } catch (Exception e) {
            LOG.error("Error updating category", e);
            return Response.serverError().entity("Error: " + e.getMessage()).build();
        }
    }
    
    @DELETE
    @Path("/{id}")
    @RolesAllowed("user")
    public Response deleteCategory(@PathParam("id") Long id) {
        try {
            Long userId = getUserIdFromToken();
            LOG.debug("Deleting category ID: " + id + " for user ID: " + userId);
            
            boolean deleted = categoryService.deleteCategory(id, userId);
            
            if (deleted) {
                return Response.noContent().build();
            } else {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
        } catch (Exception e) {
            LOG.error("Error deleting category", e);
            return Response.serverError().entity("Error: " + e.getMessage()).build();
        }
    }
    
    private CategoryDto mapToDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.id);
        dto.setName(category.name);
        dto.setColor(category.color);
        return dto;
    }
    
    private Long getUserIdFromToken() {
        // Primo tentativo: prova a ottenere l'ID utente usando la chiave "userId"
        if (jwt.containsClaim("userId")) {
            LOG.debug("Found userId claim in token");
            return Long.parseLong(jwt.getClaim("userId").toString());
        }
        
        // Secondo tentativo: prova a ottenere l'ID utente dal soggetto del token
        LOG.debug("Using subject claim as userId");
        return Long.parseLong(jwt.getSubject());
    }
}