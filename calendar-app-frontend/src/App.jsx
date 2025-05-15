// App.js (corretto)
import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from './components/Calendar';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { EventModal } from './components/events/EventModal';
import { CategoryModal } from './components/categories/CategoryModal';
import { ToastContainer, useToast } from './components/ui/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EventProvider } from './contexts/EventContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { Loading } from './components/ui/Loading';

// Componente principale dell'applicazione
const CalendarApp = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const toast = useToast();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Ref per tenere traccia se l'utente ha già ricevuto il messaggio di benvenuto
  const welcomeMessageShown = useRef(false);

  // Gestisce l'apertura del modal per la creazione/modifica di eventi
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Gestisce la creazione di un nuovo evento
  const handleAddEvent = (date) => {
    setSelectedEvent(null);
    setSelectedDate(date || new Date());
    setShowEventModal(true);
  };

  // Gestisce l'apertura del modal per la creazione/modifica di categorie
  const handleAddCategory = () => {
    setShowCategoryModal(true);
  };

  // Gestisce la chiusura dei form modali
  const handleCloseModals = () => {
    setShowLoginForm(false);
    setShowRegisterForm(false);
    setShowEventModal(false);
    setShowCategoryModal(false);
  };

  // Reindirizza alla registrazione se l'utente clicca su "Registrati"
  const handleRegisterClick = () => {
    setShowLoginForm(false);
    setShowRegisterForm(true);
  };

  // Reindirizza al login se l'utente clicca su "Accedi"
  const handleLoginClick = () => {
    setShowRegisterForm(false);
    setShowLoginForm(true);
  };

  // Gestisce il toggle della sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Mostra un messaggio di benvenuto dopo il login
  // Corretto per evitare notifiche multiple usando una ref
  useEffect(() => {
    if (isAuthenticated && user && !welcomeMessageShown.current) {
      toast.success(`Benvenuto, ${user.username}!`);
      welcomeMessageShown.current = true;
    } else if (!isAuthenticated) {
      // Reset della ref quando l'utente fa logout
      welcomeMessageShown.current = false;
    }
  }, [isAuthenticated, user, toast]);

  // Mostra il loader durante il caricamento dell'autenticazione
  if (authLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar con logo e controlli di autenticazione */}
      <Navbar 
        onLoginClick={() => setShowLoginForm(true)} 
        onRegisterClick={() => setShowRegisterForm(true)}
        onToggleSidebar={toggleSidebar}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar con categorie e controlli */}
        {isAuthenticated && isSidebarOpen && (
          <Sidebar 
            onAddEvent={() => handleAddEvent()} 
            onAddCategory={handleAddCategory}
          />
        )}
        
        {/* Contenuto principale - Calendario o messaggio di benvenuto */}
        <main className="flex-1 overflow-auto p-4">
          {isAuthenticated ? (
            <Calendar 
              onEventClick={handleEventClick} 
              onAddEvent={handleAddEvent}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Benvenuto nell'App Calendario</h1>
              <p className="text-lg text-gray-600 mb-8">Accedi o registrati per gestire il tuo calendario personale</p>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowLoginForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow transition"
                >
                  Accedi
                </button>
                <button 
                  onClick={() => setShowRegisterForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md shadow transition"
                >
                  Registrati
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Modali per login, registrazione, eventi e categorie */}
      {showLoginForm && (
        <LoginForm 
          onClose={handleCloseModals} 
          onRegisterClick={handleRegisterClick} 
        />
      )}
      
      {showRegisterForm && (
        <RegisterForm 
          onClose={handleCloseModals} 
          onLoginClick={handleLoginClick} 
        />
      )}
      
      {showEventModal && (
        <EventModal 
          event={selectedEvent} 
          date={selectedDate}
          onClose={() => setShowEventModal(false)} 
        />
      )}
      
      {showCategoryModal && (
        <CategoryModal 
          onClose={() => setShowCategoryModal(false)} 
        />
      )}
    </div>
  );
};

// App root che fornisce i context necessari
const App = () => {
  return (
    <AuthProvider>
      <CategoryProvider>
        <EventProvider>
          <ToastContainer />
          <CalendarApp />
        </EventProvider>
      </CategoryProvider>
    </AuthProvider>
  );
};

export default App;