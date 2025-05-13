// components/Calendar.jsx (con restrizione date passate)
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useEvent } from '../contexts/EventContext';
import { CalendarEvent } from './events/CalendarEvent';
import { useToast } from '../components/ui/Toast';

// Array di nomi mesi per visualizzazione
const MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

// Array di nomi giorni per visualizzazione
const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

export const Calendar = ({ onEventClick, onAddEvent }) => {
  const { events, fetchEvents } = useEvent();
  const toast = useToast();
  
  // Stato per tenere traccia della data corrente visualizzata
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  
  // Estrai anno e mese dalla data corrente
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Carica gli eventi all'avvio e quando cambia il mese visualizzato
  useEffect(() => {
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    fetchEvents(startOfMonth, endOfMonth);
  }, [currentYear, currentMonth, fetchEvents]);
  
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
    setCurrentDate(new Date());
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
  
  // Filtra gli eventi per data
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDateTime);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
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
          
          return (
            <div 
              key={index}
              className={`min-h-[100px] p-1 border-b border-r border-gray-200 relative ${
                !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 
                isPast ? 'bg-gray-50' : 'bg-white'
              }`}
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
                
                {day.isCurrentMonth && (
                  <button 
                    onClick={() => handleAddEventClick(day.date)}
                    className={`${
                      isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-blue-600 cursor-pointer'
                    } transition`}
                    disabled={isPast}
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
              
              {/* Eventi del giorno */}
              <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                {dayEvents.map(event => (
                  <CalendarEvent 
                    key={event.id} 
                    event={event} 
                    onClick={() => onEventClick(event)} 
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};