// components/events/CalendarEvent.jsx (soluzione radicale timezone)
import React from 'react';

export const CalendarEvent = ({ event, onClick }) => {
  // Estrai il colore della categoria o usa un colore default
  const categoryColor = event.categoryColor || '#3b82f6'; // Default blue
  
  // Funzione per formattare l'orario correttamente con compensazione del fuso orario
  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    
    // Parsing manuale della stringa ISO
    // Esempio: "2023-05-15T15:00:00.000Z"
    try {
      // Estrai direttamente la parte dell'ora dalla stringa ISO
      // Questo evita completamente le conversioni automatiche del fuso orario
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
  
  return (
    <div
      onClick={onClick}
      className="cursor-pointer text-xs p-1 rounded truncate"
      style={{ 
        backgroundColor: `${categoryColor}20`, // Usa un colore con opacità ridotta
        borderLeft: `3px solid ${categoryColor}`
      }}
    >
      <div className="font-medium truncate text-gray-800">{event.title}</div>
      {event.startDateTime && (
        <div className="text-gray-600">
          {formatTime(event.startDateTime)}
        </div>
      )}
    </div>
  );
};