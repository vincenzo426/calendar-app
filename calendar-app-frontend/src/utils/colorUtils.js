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
