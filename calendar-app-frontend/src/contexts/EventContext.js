// contexts/EventContext.js - Versione corretta
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  
  // Ref per evitare duplicazioni delle notifiche di errore
  const fetchErrorShown = useRef(false);
  // Ref per tenere traccia se la prima richiesta di caricamento è stata effettuata
  const initialFetchDone = useRef(false);
  
  // Carica gli eventi all'avvio se l'utente è autenticato
  useEffect(() => {
    // Se l'utente è autenticato e non abbiamo ancora caricato gli eventi
    if (isAuthenticated && !initialFetchDone.current) {
      initialFetchDone.current = true; // Segnala che abbiamo fatto il caricamento iniziale
      fetchEvents(); // Carica gli eventi
    } else if (!isAuthenticated) {
      // Se l'utente non è autenticato, reimposta lo stato
      setEvents([]);
      initialFetchDone.current = false; // Reimposta il flag per il prossimo login
      fetchErrorShown.current = false; // Reimposta il flag degli errori
    }
  }, [isAuthenticated]);
  
  // Funzione per caricare tutti gli eventi
  const fetchEvents = async (startDate, endDate) => {
    // Se è già in corso un caricamento, non fare nulla
    if (loading) return;
    
    try {
      setLoading(true);
      fetchErrorShown.current = false; // Reimposta il flag degli errori per ogni nuova richiesta
      
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
      console.error('Errore durante il caricamento degli eventi:', error);
      
      // Mostra la notifica di errore solo se non è già stata mostrata
      if (!fetchErrorShown.current) {
        toast.error('Errore durante il caricamento degli eventi');
        fetchErrorShown.current = true; // Segna che abbiamo mostrato l'errore
      }
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
      // Usa il functional update per prevenire race conditions
      setEvents(prevEvents => [...prevEvents, response]);
      
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
      // Invece di sostituire solo l'evento aggiornato, sostituisce l'intera lista
      // per mantenere l'ordinamento coerente (questo verrà gestito dal componente Calendar)
      setEvents(prevEvents => {
        // Rimuove l'evento vecchio e aggiunge quello nuovo
        const updatedEvents = prevEvents.filter(event => event.id !== eventId);
        return [...updatedEvents, response];
      });
      
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