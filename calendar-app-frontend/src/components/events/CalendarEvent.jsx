// components/events/CalendarEvent.jsx
import React from 'react';

export const CalendarEvent = ({ event, onClick }) => {
  // Estrai il colore della categoria o usa un colore default
  const categoryColor = event.categoryColor || '#3b82f6'; // Default blue
  
  // Funzione per formattare l'orario correttamente con compensazione del fuso orario
  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    
    // Parsing manuale della stringa ISO
    try {
      // Estrai direttamente la parte dell'ora dalla stringa ISO
      // Esempio: "2023-05-15T15:00:00.000Z"
      const timeMatch = dateTimeStr.match(/T(\d{2}):(\d{2})/);
      if (timeMatch && timeMatch.length >= 3) {
        return `${timeMatch[1]}:${timeMatch[2]}`;
      }
      
      // Fallback: usa l'oggetto Date se il parsing manuale fallisce
      const date = new Date(dateTimeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (error) {
      console.error('Errore nel parsing della data:', error);
      return 'Orario non valido';
    }
  };
  
  // Determina il tipo di evento: giornaliero o multi-giorno
  const isMultiDayEvent = () => {
    if (!event.startDateTime || !event.endDateTime) return false;
    
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);
    
    // Reimposta le ore a 0 per confrontare solo le date
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    // Se la data di inizio e fine sono diverse, è un evento multi-giorno
    return start.getTime() !== end.getTime();
  };
  
  // Lo stile cambia se è un evento multi-giorno
  const multiDay = isMultiDayEvent();
  
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer text-xs p-1 rounded truncate ${
        multiDay ? 'border border-dashed' : ''
      }`}
      style={{ 
        backgroundColor: `${categoryColor}20`, // Usa un colore con opacità ridotta
        borderLeft: `3px solid ${categoryColor}`,
        borderColor: multiDay ? categoryColor : 'transparent'
      }}
    >
      <div className="font-medium truncate text-gray-800">
        {event.title}
        {multiDay && ' 📆'}
      </div>
      {event.startDateTime && !multiDay && (
        <div className="text-gray-600">
          {formatTime(event.startDateTime)}
        </div>
      )}
    </div>
  );
};