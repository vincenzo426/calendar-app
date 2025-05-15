// utils/datetimeUtils.js
/**
 * Utilità per la gestione di date e orari con correzione del fuso orario
 */

/**
 * Crea un oggetto Date con l'orario specificato, compensando l'offset del fuso orario
 * 
 * @param {string} dateStr - Data in formato 'YYYY-MM-DD'
 * @param {string} timeStr - Orario in formato 'HH:MM'
 * @returns {Date} - Oggetto Date corretto
 */
export const createDateTimeWithCorrectTimezone = (dateStr, timeStr) => {
  // Crea una stringa ISO compatibile
  const dateTimeStr = `${dateStr}T${timeStr}:00`;
  
  // Ottieni l'offset del fuso orario locale in minuti
  const offsetInMinutes = new Date().getTimezoneOffset();
  
  // Crea un oggetto Date senza applicare l'offset del fuso orario
  const date = new Date(dateTimeStr);
  // Aggiungi l'offset per compensare la conversione automatica
  date.setMinutes(date.getMinutes() - offsetInMinutes);
  
  console.log(`Timezone Debug - Conversione: ${dateStr} ${timeStr} -> ${date.toISOString()} (offset: ${offsetInMinutes} min)`);
  
  return date;
};

/**
 * Estrae data e ora da una stringa ISO, con correzione del fuso orario
 * 
 * @param {string} isoString - Data in formato ISO
 * @returns {Object} - Oggetto con data e ora
 */
export const extractDateTimeFromISO = (isoString) => {
  if (!isoString) return { date: '', time: '' };
  
  // Correggi manualmente l'offset del fuso orario
  // Parsing manuale della stringa ISO
  // Esempio: "2023-05-15T15:00:00.000Z"
  try {
    const dateMatch = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (dateMatch && dateMatch.length >= 6) {
      const year = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]);
      const day = parseInt(dateMatch[3]);
      const hour = parseInt(dateMatch[4]);
      const minute = parseInt(dateMatch[5]);
      
      // Formatta la data
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Formatta l'ora
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      
      return { date: dateStr, time: timeStr };
    }
  } catch (error) {
    console.error('Errore nel parsing della data ISO:', error);
  }
  
  // Fallback al metodo standard
  const date = new Date(isoString);
  
  return {
    date: formatDateForInput(date),
    time: formatTimeForInput(date)
  };
};

/**
 * Formatta una data per input HTML di tipo 'date'
 * 
 * @param {Date} date - Oggetto Date da formattare
 * @returns {string} - Data formattata come 'YYYY-MM-DD'
 */
export const formatDateForInput = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formatta un'ora per input HTML di tipo 'time'
 * 
 * @param {Date} date - Oggetto Date da formattare
 * @returns {string} - Ora formattata come 'HH:MM'
 */
export const formatTimeForInput = (date) => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Controlla se una data è nel passato
 * 
 * @param {string|Date} date - Data da controllare
 * @returns {boolean} - true se la data è nel passato
 */
export const isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkDate = typeof date === 'string' 
    ? new Date(date)
    : new Date(date);
  
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate < today;
};

/**
 * Debug di fuso orario - Mostra informazioni dettagliate sul fuso orario del browser
 */
export const debugTimezone = () => {
  const now = new Date();
  
  console.log('=== Debug Timezone ===');
  console.log(`Data e ora locale: ${now.toString()}`);
  console.log(`ISO String: ${now.toISOString()}`);
  console.log(`Locale String: ${now.toLocaleString()}`);
  console.log(`Timezone offset: ${now.getTimezoneOffset()} minuti`);
  console.log(`Timezone name: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  
  // Test di conversione
  console.log('=== Test conversioni ===');
  const testTime = '15:00';
  const testDate = formatDateForInput(now);
  
  console.log(`Ora di test: ${testDate} ${testTime}`);
  
  const correctedDate = createDateTimeWithCorrectTimezone(testDate, testTime);
  console.log(`Data corretta: ${correctedDate.toString()}`);
  console.log(`ISO corretta: ${correctedDate.toISOString()}`);
  
  // Estrai nuovamente
  const extracted = extractDateTimeFromISO(correctedDate.toISOString());
  console.log(`Riestratto: ${extracted.date} ${extracted.time}`);
  
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    offset: now.getTimezoneOffset(),
    current: now.toString(),
    iso: now.toISOString(),
    locale: now.toLocaleString()
  };
};