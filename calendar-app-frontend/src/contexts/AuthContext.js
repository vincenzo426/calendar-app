// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient'; 
import { mockApiClient } from '../services/mockApiClient';
import { useToast } from '../components/ui/Toast';

// Usa il client mock per la demo su GitHub Pages
const client = process.env.REACT_APP_DEMO_MODE === 'true' ? mockApiClient : apiClient;

// Creazione del contesto
const AuthContext = createContext();

// Provider del contesto di autenticazione
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  
  // Verifica lo stato di autenticazione all'avvio
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          // Imposta il token nell'header delle richieste API
          client.setAuthToken(token);
          
          // Decodifichiamo il token JWT per ottenere le informazioni dell'utente
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          
          setUser({
            userId: tokenData.userId,
            username: tokenData.username,
            email: tokenData.email
          });
        } catch (error) {
          console.error('Token non valido:', error);
          logout();
        }
      }
      
      setLoading(false);
    };
    
    verifyToken();
  }, [token]);
  
  // Funzione per effettuare il login
  const login = async (username, password) => {
    try {
      setLoading(true);
      
      // Chiamata API per il login
      const response = await client.post('/api/auth/login', {
        username,
        password
      });
      
      // Salva il token
      const { token } = response;
      localStorage.setItem('token', token);
      setToken(token);
      
      // Imposta il token nell'header delle richieste API
      client.setAuthToken(token);
      
      // Decodifica il token JWT per ottenere le informazioni dell'utente
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      
      setUser({
        userId: tokenData.userId,
        username: tokenData.username,
        email: tokenData.email
      });
      
      toast.success('Login effettuato con successo!');
      
      return response;
    } catch (error) {
      toast.error('Credenziali non valide. Riprova.');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Funzione per effettuare la registrazione
  const register = async (username, email, password) => {
    try {
      setLoading(true);
      
      // Chiamata API per la registrazione
      const response = await client.post('/api/auth/register', {
        username,
        email,
        password
      });
      
      toast.success('Registrazione effettuata con successo! Ora puoi accedere.');
      
      return response;
    } catch (error) {
      // Gestione degli errori di registrazione
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
        throw new Error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
        throw new Error(error.message);
      } else {
        toast.error('Si è verificato un errore durante la registrazione. Riprova!');
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Funzione per effettuare il logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    client.removeAuthToken();
    
    toast.info('Logout effettuato con successo.');
  };
  
  // Valori esposti dal context
  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook per utilizzare il contesto dell'autenticazione
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve essere utilizzato all\'interno di un AuthProvider');
  }
  
  return context;
};