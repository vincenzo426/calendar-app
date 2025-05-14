// components/events/EventModal.jsx (soluzione timezone radicale)
import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { useEvent } from '../../contexts/EventContext';
import { useCategory } from '../../contexts/CategoryContext';
import { useToast } from '../../components/ui/Toast';

export const EventModal = ({ event = null, date = null, onClose }) => {
  const { addEvent, updateEvent, deleteEvent } = useEvent();
  const { categories } = useCategory();
  const toast = useToast();
  
  // State per il form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [errors, setErrors] = useState({}); // Per gli errori di validazione
  
  // Funzione helper per formattare la data per l'input
  const formatDateForInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Funzione helper per formattare l'ora per l'input
  const formatTimeForInput = (date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`; // Format HH:MM
  };
  
  // Funzione per arrotondare l'ora al quarto d'ora più vicino
  const roundTimeToQuarter = (date) => {
    const d = new Date(date);
    const minutes = d.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    d.setMinutes(roundedMinutes >= 60 ? 0 : roundedMinutes);
    if (roundedMinutes >= 60) {
      d.setHours(d.getHours() + 1);
    }
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
  };
  
  // Verifica se una data è nel passato (prima di oggi)
  const isPastDate = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Imposta l'ora a mezzanotte per confrontare solo le date
    
    const selectedDate = new Date(dateStr);
    selectedDate.setHours(0, 0, 0, 0);
    
    return selectedDate < today;
  };
  
  // SOLUZIONE RADICALE: Correzione offset fuso orario nella creazione delle date
  const createDateTimeWithCorrectTimezone = (dateStr, timeStr) => {
    // Crea una stringa ISO compatibile
    const dateTimeStr = `${dateStr}T${timeStr}:00`;
    
    // Ottieni l'offset del fuso orario locale in minuti
    const offsetInMinutes = new Date().getTimezoneOffset();
    
    // Crea un oggetto Date senza applicare l'offset del fuso orario
    const date = new Date(dateTimeStr);
    // Aggiungi l'offset per compensare la conversione automatica
    date.setMinutes(date.getMinutes() - offsetInMinutes);
    
    console.log(`Conversione: ${dateStr} ${timeStr} -> ${date.toISOString()} (offset: ${offsetInMinutes} min)`);
    
    return date;
  };
  
  // Estrai la data e l'ora da un timestamp ISO con correzione del fuso orario
  const extractDateTimeFromISO = (isoString) => {
    if (!isoString) return { date: '', time: '' };
    
    // Crea un oggetto Date dalla stringa ISO
    const date = new Date(isoString);
    
    // Formatta la data come YYYY-MM-DD
    const dateStr = formatDateForInput(date);
    
    // Formatta l'ora come HH:MM
    const timeStr = formatTimeForInput(date);
    
    return { date: dateStr, time: timeStr };
  };
  
  // Inizializza il form con i dati dell'evento se esiste, o con la data selezionata
  useEffect(() => {
    if (event) {
      // Se stiamo modificando un evento esistente
      setTitle(event.title || '');
      setDescription(event.description || '');
      
      if (event.startDateTime) {
        const { date: startDateValue, time: startTimeValue } = extractDateTimeFromISO(event.startDateTime);
        setStartDate(startDateValue);
        setStartTime(startTimeValue);
      }
      
      if (event.endDateTime) {
        const { date: endDateValue, time: endTimeValue } = extractDateTimeFromISO(event.endDateTime);
        setEndDate(endDateValue);
        setEndTime(endTimeValue);
      }
      
      setCategoryId(event.categoryId || '');
    } else {
      // Se stiamo creando un nuovo evento
      setTitle('');
      setDescription('');
      
      // Utilizza la data selezionata o la data corrente
      let now = date ? new Date(date) : new Date();
      
      // Se la data selezionata è fornita, imposta l'ora su un valore ragionevole (es. 9:00)
      if (date) {
        const currentHour = new Date().getHours();
        // Se l'ora attuale è tra le 9 e le 18, usa quella, altrimenti imposta alle 9
        const hour = (currentHour >= 9 && currentHour <= 18) ? currentHour : 9;
        now = new Date(date);
        now.setHours(hour, 0, 0, 0);
      } else {
        // Altrimenti arrotonda l'ora attuale al quarto d'ora più vicino
        now = roundTimeToQuarter(now);
      }
      
      setStartDate(formatDateForInput(now));
      setStartTime(formatTimeForInput(now));
      
      // Imposta la data di fine allo stesso giorno, un'ora dopo
      const endTime = new Date(now);
      endTime.setHours(endTime.getHours() + 1);
      
      setEndDate(formatDateForInput(endTime));
      setEndTime(formatTimeForInput(endTime));
    }
  }, [event, date]);
  
  // Validazione del form
  const validateForm = () => {
    const newErrors = {};
    
    // Verifica che il titolo non sia vuoto
    if (!title.trim()) {
      newErrors.title = 'Il titolo è obbligatorio';
    }
    
    // Verifica che la data di inizio non sia nel passato
    if (isPastDate(startDate) && !event) {
      newErrors.startDate = 'Non è possibile creare eventi in date passate';
    }
    
    // Verifica che la data/ora di fine sia successiva alla data/ora di inizio
    if (startDate && startTime && endDate && endTime) {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);
      
      if (endDateTime <= startDateTime) {
        newErrors.endDateTime = 'La data/ora di fine deve essere successiva alla data/ora di inizio';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handler per il submit del form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Valida il form
    if (!validateForm()) {
      return;
    }
    
    // SOLUZIONE RADICALE: Crea date ISO con correzione del fuso orario
    const startDateTime = createDateTimeWithCorrectTimezone(startDate, startTime);
    const endDateTime = endDate && endTime ? createDateTimeWithCorrectTimezone(endDate, endTime) : null;
    
    // Costruisci l'oggetto evento
    const eventData = {
      title,
      description,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime ? endDateTime.toISOString() : null,
      categoryId: categoryId || null
    };
    
    console.log('Debug - Form input:');
    console.log(`Start date/time: ${startDate} ${startTime}`);
    console.log(`End date/time: ${endDate} ${endTime}`);
    console.log('Debug - Adjusted date objects:');
    console.log(`Start DateTime: ${startDateTime.toString()} (ISO: ${startDateTime.toISOString()})`);
    console.log(`End DateTime: ${endDateTime ? endDateTime.toString() : 'null'} (ISO: ${endDateTime ? endDateTime.toISOString() : 'null'})`);
    console.log('Event data being submitted:', eventData);
    
    try {
      if (event) {
        // Modifica evento esistente
        updateEvent(event.id, eventData);
      } else {
        // Crea nuovo evento
        addEvent(eventData);
      }
      
      onClose();
    } catch (error) {
      console.error('Errore nel salvataggio dell\'evento:', error);
      toast.error('Si è verificato un errore nel salvataggio dell\'evento');
    }
  };
  
  // Handler per eliminare un evento
  const handleDelete = () => {
    if (event && window.confirm('Sei sicuro di voler eliminare questo evento?')) {
      deleteEvent(event.id);
      onClose();
    }
  };
  
  // Handler per il cambio della data di inizio
  const handleStartDateChange = (e) => {
    const newDate = e.target.value;
    
    // Se è una nuova data nel passato, mostra errore
    if (isPastDate(newDate) && !event) {
      setErrors({...errors, startDate: 'Non è possibile creare eventi in date passate'});
    } else {
      // Rimuovi l'errore se la data è valida
      const { startDate, ...restErrors } = errors;
      setErrors(restErrors);
    }
    
    setStartDate(newDate);
    
    // Se la data di fine è vuota o precedente alla nuova data di inizio, aggiornala
    if (!endDate || new Date(endDate) < new Date(newDate)) {
      setEndDate(newDate);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {event ? 'Modifica Evento' : 'Nuovo Evento'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Titolo evento */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titolo
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                {errors.title}
              </p>
            )}
          </div>
          
          {/* Descrizione */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Date e orari */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data inizio
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={handleStartDateChange}
                  required
                  min={!event ? formatDateForInput(new Date()) : undefined}
                  className={`w-full pl-10 pr-3 py-2 border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.startDate}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Ora inizio
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data fine
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                Ora fine
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="time"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          {errors.endDateTime && (
            <p className="text-sm text-red-600 flex items-center mt-1">
              <AlertCircle size={16} className="mr-1" />
              {errors.endDateTime}
            </p>
          )}
          
          {/* Categoria */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Nessuna categoria</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Pulsanti azioni */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            {event && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 transition"
              >
                Elimina
              </button>
            )}
            <div className="flex space-x-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md transition"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                {event ? 'Aggiorna' : 'Crea'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};