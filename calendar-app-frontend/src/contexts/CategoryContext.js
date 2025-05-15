// contexts/CategoryContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ui/Toast';

// Creazione del contesto
const CategoryContext = createContext();

// Provider del contesto delle categorie
export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  
  // Carica le categorie all'avvio se l'utente è autenticato
  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    } else {
      setCategories([]);
    }
  }, [isAuthenticated]);
  
  // Funzione per caricare tutte le categorie
  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Chiamata API per ottenere le categorie
      const response = await apiClient.get('/api/categories');
      setCategories(response);
      
      return response;
    } catch (error) {
      toast.error('Errore durante il caricamento delle categorie');
      console.error('Errore durante il caricamento delle categorie:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Funzione per aggiungere una nuova categoria
  const addCategory = async (categoryData) => {
    try {
      setLoading(true);
      
      // Chiamata API per creare una nuova categoria
      const response = await apiClient.post('/api/categories', categoryData);
      
      // Aggiorna la lista delle categorie
      setCategories([...categories, response]);
      
      toast.success('Categoria creata con successo!');
      
      return response;
    } catch (error) {
      toast.error('Errore durante la creazione della categoria');
      console.error('Errore durante la creazione della categoria:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Funzione per aggiornare una categoria esistente
  const updateCategory = async (categoryId, categoryData) => {
    try {
      setLoading(true);
      
      // Chiamata API per aggiornare una categoria
      const response = await apiClient.put(`/api/categories/${categoryId}`, categoryData);
      
      // Aggiorna la lista delle categorie
      setCategories(
        categories.map(category => (category.id === categoryId ? response : category))
      );
      
      toast.success('Categoria aggiornata con successo!');
      
      return response;
    } catch (error) {
      toast.error('Errore durante l\'aggiornamento della categoria');
      console.error('Errore durante l\'aggiornamento della categoria:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Funzione per eliminare una categoria
  const deleteCategory = async (categoryId) => {
    try {
      setLoading(true);
      
      // Chiamata API per eliminare una categoria
      await apiClient.delete(`/api/categories/${categoryId}`);
      
      // Aggiorna la lista delle categorie
      setCategories(categories.filter(category => category.id !== categoryId));
      
      toast.success('Categoria eliminata con successo!');
      
      return true;
    } catch (error) {
      toast.error('Errore durante l\'eliminazione della categoria');
      console.error('Errore durante l\'eliminazione della categoria:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Valori esposti dal context
  const value = {
    categories,
    loading,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory
  };
  
  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
};

// Hook per utilizzare il contesto delle categorie
export const useCategory = () => {
  const context = useContext(CategoryContext);
  
  if (!context) {
    throw new Error('useCategory deve essere utilizzato all\'interno di un CategoryProvider');
  }
  
  return context;
};