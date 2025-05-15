// utils/dateUtils.js
/**
 * Formatta una data secondo il formato specificato
 * @param {Date|string} date - La data da formattare
 * @param {string} format - Il formato desiderato (default: 'dd/MM/yyyy')
 * @returns {string} La data formattata
 */
export const formatDate = (date, format = 'dd/MM/yyyy') => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Verifica che la data sia valida
  if (isNaN(d.getTime())) {
    console.error('Data non valida:', date);
    return '';
  }
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  switch (format) {
    case 'dd/MM/yyyy':
      return `${day}/${month}/${year}`;
    case 'MM/dd/yyyy':
      return `${month}/${day}/${year}`;
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`;
    case 'dd/MM/yyyy HH:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case 'HH:mm':
      return `${hours}:${minutes}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

/**
 * Converte una stringa in formato ISO in un oggetto Date
 * @param {string} isoString - La stringa ISO da convertire
 * @returns {Date} L'oggetto Date
 */
export const parseISODate = (isoString) => {
  if (!isoString) return null;
  
  return new Date(isoString);
};

/**
 * Calcola il range di date per un mese
 * @param {number} year - L'anno
 * @param {number} month - Il mese (0-11)
 * @returns {Object} L'oggetto contenente la data di inizio e fine del mese
 */
export const getMonthRange = (year, month) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  return {
    start: startDate,
    end: endDate
  };
};

// utils/colorUtils.js
/**
 * Genera un colore casuale in formato esadecimale
 * @returns {string} Il colore generato
 */
export const generateRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  
  return color;
};

/**
 * Schiarisce un colore della percentuale specificata
 * @param {string} hex - Il colore in formato esadecimale
 * @param {number} percent - La percentuale di schiarimento (0-100)
 * @returns {string} Il colore schiarito
 */
export const lightenColor = (hex, percent) => {
  // Rimuovi il carattere '#' se presente
  hex = hex.replace(/^#/, '');
  
  // Converte in RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Schiarisce
  r = Math.round(r + (255 - r) * (percent / 100));
  g = Math.round(g + (255 - g) * (percent / 100));
  b = Math.round(b + (255 - b) * (percent / 100));
  
  // Converte in esadecimale
  const rHex = r.toString(16).padStart(2, '0');
  const gHex = g.toString(16).padStart(2, '0');
  const bHex = b.toString(16).padStart(2, '0');
  
  return `#${rHex}${gHex}${bHex}`;
};

// utils/validators.js
/**
 * Valida un indirizzo email
 * @param {string} email - L'email da validare
 * @returns {boolean} True se l'email è valida, altrimenti false
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida una password
 * @param {string} password - La password da validare
 * @returns {Object} Un oggetto contenente il risultato della validazione
 */
export const validatePassword = (password) => {
  const result = {
    isValid: true,
    errors: []
  };
  
  if (!password || password.length < 6) {
    result.isValid = false;
    result.errors.push('La password deve contenere almeno 6 caratteri');
  }
  
  return result;
};