// components/events/DayEventsModal.jsx
import React from 'react';
import { X, Clock } from 'lucide-react';

// Funzione helper per formattare l'orario
const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  
  try {
    // Estrai direttamente la parte dell'ora dalla stringa ISO
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

// Funzione per formattare la data in formato leggibile
const formatDate = (date) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

export const DayEventsModal = ({ date, events, onClose, onEventClick }) => {
  // Formatta la data per l'intestazione
  const formattedDate = formatDate(date);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Eventi del {formattedDate}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nessun evento per questa data.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div 
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                  style={{ 
                    borderLeft: `4px solid ${event.categoryColor || '#3b82f6'}`,
                  }}
                >
                  <div className="font-medium text-gray-800">{event.title}</div>
                  
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Clock size={14} className="mr-1" />
                    <span>
                      {formatTime(event.startDateTime)}
                      {event.endDateTime && ` - ${formatTime(event.endDateTime)}`}
                    </span>
                  </div>
                  
                  {event.description && (
                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {event.description}
                    </div>
                  )}
                  
                  {event.categoryName && (
                    <div 
                      className="text-xs mt-2 px-2 py-1 rounded-full inline-block"
                      style={{ 
                        backgroundColor: `${event.categoryColor}20`, 
                        color: event.categoryColor 
                      }}
                    >
                      {event.categoryName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};