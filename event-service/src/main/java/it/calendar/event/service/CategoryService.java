package it.calendar.event.service;

import it.calendar.event.model.Category;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class CategoryService {
    
    @Transactional
    public Category createCategory(String name, String color, Long userId) {
        // Verifica se la categoria esiste già per questo utente
        Optional<Category> existingCategory = Category.find("name = ?1 and userId = ?2", 
                                                            name, userId).firstResultOptional();
        
        if (existingCategory.isPresent()) {
            throw new IllegalArgumentException("Category already exists for this user");
        }
        
        Category category = new Category(name, color, userId);
        category.persist();
        
        return category;
    }
    
    public List<Category> getCategoriesByUserId(Long userId) {
        return Category.findByUserId(userId);
    }
    
    /**
     * Ottiene una categoria per ID, verificando che appartenga all'utente specificato
     * 
     * @param categoryId ID della categoria
     * @param userId ID dell'utente
     * @return Optional con la categoria se esiste e appartiene all'utente, altrimenti empty
     */
    public Optional<Category> getCategoryById(Long categoryId, Long userId) {
        if (categoryId == null) {
            return Optional.empty();
        }
        
        Optional<Category> categoryOpt = Category.findByIdOptional(categoryId);
        
        // Verifica che la categoria esista e appartenga all'utente
        if (categoryOpt.isPresent() && categoryOpt.get().userId.equals(userId)) {
            return categoryOpt;
        }
        
        return Optional.empty();
    }
    
    @Transactional
    public Optional<Category> updateCategory(Long categoryId, String name, String color, Long userId) {
        Optional<Category> categoryOpt = getCategoryById(categoryId, userId);
        
        if (categoryOpt.isPresent()) {
            Category category = categoryOpt.get();
            
            // Aggiorna i campi
            category.name = name;
            category.color = color;
            
            return Optional.of(category);
        }
        
        return Optional.empty();
    }
    
    @Transactional
    public boolean deleteCategory(Long categoryId, Long userId) {
        return Category.delete("id = ?1 and userId = ?2", categoryId, userId) > 0;
    }
}