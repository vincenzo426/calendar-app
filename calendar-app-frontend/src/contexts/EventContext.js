// contexts/EventContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ui/Toast';

// Creazione del contesto
const EventContext = createContext();

// Provider del contesto degli eventi
export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  
  // Carica gli eventi all'avvio se l'utente è autenticato
  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    } else {
      setEvents([]);
    }
  }, [isAuthenticated]);
  
  // Funzione per caricare tutti gli eventi
  const fetchEvents = async (startDate, endDate) => {
    try {
      setLoading(true);
      
      // Costruisci l'URL di query
      let url = '/api/events';
      const params = new URLSearchParams();
      
      if (startDate) {
        params.append('start', startDate.toISOString());
      }
      
      if (endDate) {
        params.append('end', endDate.toISOString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      // Chiamata API per ottenere gli eventi
      const response = await apiClient.get(url);
      setEvents(response);
      
      return response;
    } catch (error) {
      toast.error('Errore durante il caricamento degli eventi');
      console.error('Errore durante il caricamento degli eventi:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Funzione per aggiungere un nuovo evento
  const addEvent = async (eventData) => {
    try {
      setLoading(true);
      
      // Chiamata API per creare un nuovo evento
      const response = await apiClient.post('/api/events', eventData);
      
      // Aggiorna la lista degli eventi
      setEvents([...events, response]);
      
      toast.success('Evento creato con successo!');
      
      return response;
    } catch (error) {
      toast.error('Errore durante la creazione dell\'evento');
      console.error('Errore durante la creazione dell\'evento:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Funzione per aggiornare un evento esistente
  const updateEvent = async (eventId, eventData) => {
    try {
      setLoading(true);
      
      // Chiamata API per aggiornare un evento
      const response = await apiClient.put(`/api/events/${eventId}`, eventData);
      
      // Aggiorna la lista degli eventi
      setEvents(
        events.map(event => (event.id === eventId ? response : event))
      );
      
      toast.success('Evento aggiornato con successo!');
      
      return response;
    } catch (error) {
      toast.error('Errore durante l\'aggiornamento dell\'evento');
      console.error('Errore durante l\'aggiornamento dell\'evento:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Funzione per eliminare un evento
  const deleteEvent = async (eventId) => {
    try {
      setLoading(true);
      
      // Chiamata API per eliminare un evento
      await apiClient.delete(`/api/events/${eventId}`);
      
      // Aggiorna la lista degli eventi
      setEvents(events.filter(event => event.id !== eventId));
      
      toast.success('Evento eliminato con successo!');
      
      return true;
    } catch (error) {
      toast.error('Errore durante l\'eliminazione dell\'evento');
      console.error('Errore durante l\'eliminazione dell\'evento:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Valori esposti dal context
  const value = {
    events,
    loading,
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent
  };
  
  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

// Hook per utilizzare il contesto degli eventi
export const useEvent = () => {
  const context = useContext(EventContext);
  
  if (!context) {
    throw new Error('useEvent deve essere utilizzato all\'interno di un EventProvider');
  }
  
  return context;
};