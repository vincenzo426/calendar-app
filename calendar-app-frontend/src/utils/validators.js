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