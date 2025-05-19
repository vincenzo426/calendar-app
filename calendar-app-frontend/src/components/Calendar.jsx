// components/Calendar.jsx - Versione migliorata
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Info } from 'lucide-react';
import { useEvent } from '../contexts/EventContext';
import { CalendarEvent } from './events/CalendarEvent';
import { DayEventsModal } from './events/DayEventsModal';
import { useToast } from '../components/ui/Toast';

// Array di nomi mesi per visualizzazione
const MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

// Array di nomi giorni per visualizzazione
const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

export const Calendar = ({ onEventClick, onAddEvent }) => {
  const { events, fetchEvents, loading } = useEvent();
  const toast = useToast();
  
  // Stato per tenere traccia della data corrente visualizzata
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  
  // Stato per il modale degli eventi del giorno
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Ref per tracciare se il calendario è già stato caricato per questo mese
  const calendarLoadedForMonth = useRef({});
  
  // Estrai anno e mese dalla data corrente
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Chiave unica per questo mese e anno
  const monthKey = `${currentYear}-${currentMonth}`;
  
  // Carica gli eventi all'avvio e quando cambia il mese visualizzato
  useEffect(() => {
    // Previene caricamenti multipli per lo stesso mese
    if (!calendarLoadedForMonth.current[monthKey] && !loading) {
      calendarLoadedForMonth.current[monthKey] = true;
      
      // Calcoliamo un range di date più ampio per includere gli eventi multi-giorno
      // che potrebbero iniziare nel mese precedente o finire nel mese successivo
      const startOfMonth = new Date(currentYear, currentMonth - 1, 1); // Include il mese precedente
      const endOfMonth = new Date(currentYear, currentMonth + 2, 0); // Include il mese successivo
      
      fetchEvents(startOfMonth, endOfMonth);
    }
  }, [currentYear, currentMonth, fetchEvents, loading, monthKey]);
  
  // Funzione per spostarsi al mese precedente
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  // Funzione per spostarsi al mese successivo
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  // Funzione per tornare al mese corrente
  const goToToday = () => {
    const today = new Date();
    const newMonthKey = `${today.getFullYear()}-${today.getMonth()}`;
    
    // Se stiamo tornando a un mese che abbiamo già visto, cancelliamo il flag
    // in modo che venga ricaricato (potrebbe essere cambiato nel frattempo)
    if (calendarLoadedForMonth.current[newMonthKey]) {
      calendarLoadedForMonth.current[newMonthKey] = false;
    }
    
    setCurrentDate(today);
  };
  
  // Calcola i giorni da visualizzare nel calendario
  useEffect(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // Ottieni il giorno della settimana del primo giorno del mese (0 = Domenica, 6 = Sabato)
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    // Calcola quanti giorni del mese precedente devo visualizzare
    const daysFromPrevMonth = firstDayWeekday;
    
    // Ottieni l'ultimo giorno del mese precedente
    const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    // Calcola quanti giorni devo visualizzare in totale (42 = 6 righe x 7 giorni)
    const totalDaysToShow = 42;
    
    // Prepara l'array di tutti i giorni da visualizzare
    const days = [];
    
    // Aggiungi i giorni del mese precedente
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const day = lastDayOfPrevMonth - i;
      const date = new Date(currentYear, currentMonth - 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
      });
    }
    
    // Aggiungi i giorni del mese corrente
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push({
        date,
        day,
        isCurrentMonth: true,
      });
    }
    
    // Aggiungi i giorni del mese successivo per riempire la griglia
    const remainingDays = totalDaysToShow - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
      });
    }
    
    setCalendarDays(days);
  }, [currentDate, currentMonth, currentYear]);
  
  // Filtra e ordina gli eventi per data, includendo eventi multi-giorno
  const getEventsForDate = (date) => {
    // Converti date in timestamp alla mezzanotte per confronti corretti
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    const dayTimestamp = dayStart.getTime();
    
    // Filtra gli eventi che:
    // 1. Iniziano in questo giorno, O
    // 2. Finiscono in questo giorno, O
    // 3. Iniziano prima e finiscono dopo questo giorno (evento in corso)
    const filteredEvents = events.filter(event => {
      if (!event || !event.startDateTime) return false;
      
      try {
        const eventStartDate = new Date(event.startDateTime);
        eventStartDate.setHours(0, 0, 0, 0);
        const eventStartTimestamp = eventStartDate.getTime();
        
        // Se non c'è data di fine, considera solo l'evento nel giorno di inizio
        if (!event.endDateTime) {
          return eventStartTimestamp === dayTimestamp;
        }
        
        const eventEndDate = new Date(event.endDateTime);
        eventEndDate.setHours(0, 0, 0, 0);
        const eventEndTimestamp = eventEndDate.getTime();
        
        return (
          // L'evento inizia in questo giorno
          eventStartTimestamp === dayTimestamp ||
          // L'evento finisce in questo giorno
          eventEndTimestamp === dayTimestamp ||
          // L'evento è in corso (inizia prima e finisce dopo)
          (eventStartTimestamp < dayTimestamp && eventEndTimestamp > dayTimestamp)
        );
      } catch (err) {
        console.error("Errore nel parsing della data dell'evento:", err);
        return false;
      }
    });
    
    // Poi ordina gli eventi per orario di inizio
    return filteredEvents.sort((a, b) => {
      try {
        const aStartTime = new Date(a.startDateTime);
        const bStartTime = new Date(b.startDateTime);
        
        // Se una data non è valida, usa l'ID per stabilità
        if (isNaN(aStartTime) || isNaN(bStartTime)) {
          return (a.id || 0) - (b.id || 0);
        }
        
        return aStartTime - bStartTime;
      } catch (err) {
        console.error("Errore nell'ordinamento degli eventi:", err);
        return 0;
      }
    });
  };
  
  // Verifica se una data è oggi
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  // Verifica se una data è nel passato
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Imposta l'ora a mezzanotte per confrontare solo le date
    
    return date < today;
  };

  // Gestisce il click sul pulsante "+" di un giorno
  const handleAddEventClick = (date) => {
    // Verifica se la data è nel passato
    if (isPastDate(date)) {
      toast.error('Non è possibile creare eventi in date passate');
      return;
    }
    
    // Crea una copia della data per evitare problemi di riferimento
    const selectedDate = new Date(date.getTime());
    onAddEvent(selectedDate);
  };
  
  // Gestisce il click su una casella del calendario per mostrare gli eventi del giorno
  const handleDayClick = (date) => {
    setSelectedDay(date);
    setShowDayEventsModal(true);
  };
  
  // Chiude il modale degli eventi del giorno
  const handleCloseDayEventsModal = () => {
    setShowDayEventsModal(false);
    setSelectedDay(null);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Intestazione del calendario */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex space-x-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button 
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition"
          >
            Oggi
          </button>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={goToPreviousMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={goToNextMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {/* Griglia del calendario */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {WEEKDAYS.map(day => (
          <div 
            key={day} 
            className="text-center py-2 text-sm font-medium text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 grid-rows-6 h-full">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day.date);
          const isCurrentDay = isToday(day.date);
          const isPast = isPastDate(day.date);
          const hasEvents = dayEvents.length > 0;
          
          return (
            <div 
              key={index}
              onClick={() => handleDayClick(day.date)}
              className={`min-h-[100px] p-1 border-b border-r border-gray-200 relative ${
                !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 
                isPast ? 'bg-gray-50' : 'bg-white'
              } ${hasEvents ? 'cursor-pointer hover:bg-blue-50' : 'cursor-default'}`}
            >
              {/* Intestazione giorno */}
              <div className="flex justify-between items-center">
                <span 
                  className={`flex items-center justify-center w-7 h-7 rounded-full ${
                    isCurrentDay ? 'bg-blue-600 text-white' : ''
                  }`}
                >
                  {day.day}
                </span>
                
                <div className="flex items-center">
                  {/* Indicatore di eventi */}
                  {hasEvents && (
                    <span className="mr-1 text-blue-600">
                      <Info size={14} />
                    </span>
                  )}
                  
                  {/* Pulsante aggiungi evento */}
                  {day.isCurrentMonth && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Previene l'apertura del modale
                        handleAddEventClick(day.date);
                      }}
                      className={`${
                        isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-blue-600 cursor-pointer'
                      } transition`}
                      disabled={isPast}
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Eventi del giorno (max 3) */}
              <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                {dayEvents.slice(0, 3).map(event => (
                  <CalendarEvent 
                    key={event.id} 
                    event={event} 
                    onClick={(e) => {
                      e.stopPropagation(); // Previene l'apertura del modale
                      onEventClick(event);
                    }} 
                  />
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-center text-blue-600 mt-1">
                    +{dayEvents.length - 3} altri
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Modale per la visualizzazione degli eventi del giorno */}
      {showDayEventsModal && selectedDay && (
        <DayEventsModal
          date={selectedDay}
          events={getEventsForDate(selectedDay)}
          onClose={handleCloseDayEventsModal}
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
};