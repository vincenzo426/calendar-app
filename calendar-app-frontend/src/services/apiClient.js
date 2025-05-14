// services/apiClient.js
/**
 * Client per effettuare chiamate API al backend
 */
class ApiClient {
  constructor() {
    // URL di base dell'API
    this.baseURL = process.env.REACT_APP_API_URL || '/api';
    console.log('Base URL:', this.baseURL);
    console.log('demo mode:', process.env.REACT_APP_DEMO_MODE);
    // Headers predefiniti per le richieste
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Imposta il token di autenticazione da utilizzare per le richieste
   * @param {string} token - Il token JWT
   */
  setAuthToken(token) {
    this.headers.Authorization = `Bearer ${token}`;
  }

  /**
   * Rimuove il token di autenticazione
   */
  removeAuthToken() {
    delete this.headers.Authorization;
  }

  /**
   * Effettua una richiesta HTTP
   * @param {string} method - Il metodo HTTP (GET, POST, PUT, DELETE, ecc.)
   * @param {string} endpoint - L'endpoint API
   * @param {Object} data - I dati da inviare (per POST, PUT, ecc.)
   * @returns {Promise<any>} La risposta della richiesta
   */
  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    
    const options = {
      method,
      headers: this.headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      // Parsa la risposta JSON
      const contentType = response.headers.get('content-type');
      const responseData = contentType && contentType.includes('application/json') 
        ? await response.json() 
        : await response.text();
      
      // Verifica se la risposta è OK (status 2xx)
      if (!response.ok) {
        throw {
          status: response.status,
          statusText: response.statusText,
          response: responseData,
        };
      }
      
      return responseData;
    } catch (error) {
      console.error(`Errore nella richiesta ${method} ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Effettua una richiesta GET
   * @param {string} endpoint - L'endpoint API
   * @returns {Promise<any>} La risposta della richiesta
   */
  get(endpoint) {
    return this.request('GET', endpoint);
  }

  /**
   * Effettua una richiesta POST
   * @param {string} endpoint - L'endpoint API
   * @param {Object} data - I dati da inviare
   * @returns {Promise<any>} La risposta della richiesta
   */
  post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }

  /**
   * Effettua una richiesta PUT
   * @param {string} endpoint - L'endpoint API
   * @param {Object} data - I dati da inviare
   * @returns {Promise<any>} La risposta della richiesta
   */
  put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  }

  /**
   * Effettua una richiesta DELETE
   * @param {string} endpoint - L'endpoint API
   * @returns {Promise<any>} La risposta della richiesta
   */
  delete(endpoint) {
    return this.request('DELETE', endpoint);
  }
}

// Esporta un'istanza singleton del client API
export const apiClient = new ApiClient();