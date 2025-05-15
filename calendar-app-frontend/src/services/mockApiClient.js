// src/services/mockApiClient.js
// Mock del client API per la modalità demo
class MockApiClient {
  constructor() {
    // Carica dati mock dalla localStorage se esistono, altrimenti usa valori predefiniti
    this.loadData();

    console.log("[MockAPI] Inizializzato con i dati:", this.data);
  }

  // Carica i dati dalla localStorage o usa valori predefiniti
  loadData() {
    try {
      const savedData = localStorage.getItem("calendarAppDemo");

      if (savedData) {
        try {
          this.data = JSON.parse(savedData);

          // Verifica l'integrità dei dati
          if (
            !this.data.auth ||
            !this.data.categories ||
            !this.data.events ||
            !this.data.nextId
          ) {
            console.error(
              "[MockAPI] Dati localStorage corrotti o incompleti, reset..."
            );
            throw new Error("Dati corrotti");
          }
        } catch (e) {
          console.error(
            "[MockAPI] Errore nel parsing dei dati localStorage:",
            e
          );
          // Rimuovi i dati corrotti
          localStorage.removeItem("calendarAppDemo");
          // Usa i dati predefiniti
          this.resetData();
          return;
        }
      } else {
        // Dati demo predefiniti
        this.data = {
          auth: {
            users: [
              {
                id: 1,
                username: "demo",
                email: "demo@example.com",
                password: "password",
              },
            ],
            tokens: {},
          },
          categories: [
            { id: 1, name: "Lavoro", color: "#3b82f6", userId: 1 },
            { id: 2, name: "Personale", color: "#10b981", userId: 1 },
            { id: 3, name: "Famiglia", color: "#8b5cf6", userId: 1 },
          ],
          events: [
            {
              id: 1,
              title: "Meeting di lavoro",
              description: "Discussione progetto calendario",
              startDateTime: this.getRelativeDate(0, 10, 0),
              endDateTime: this.getRelativeDate(0, 11, 30),
              categoryId: 1,
              userId: 1,
              categoryName: "Lavoro",
              categoryColor: "#3b82f6",
            },
            {
              id: 2,
              title: "Pranzo con amici",
              description: "Ristorante italiano in centro",
              startDateTime: this.getRelativeDate(1, 13, 0),
              endDateTime: this.getRelativeDate(1, 14, 30),
              categoryId: 2,
              userId: 1,
              categoryName: "Personale",
              categoryColor: "#10b981",
            },
            {
              id: 3,
              title: "Compleanno di Marco",
              description: "Portare un regalo",
              startDateTime: this.getRelativeDate(3, 18, 0),
              endDateTime: this.getRelativeDate(3, 22, 0),
              categoryId: 3,
              userId: 1,
              categoryName: "Famiglia",
              categoryColor: "#8b5cf6",
            },
          ],
          nextId: {
            user: 2,
            category: 4,
            event: 4,
          },
        };

        this.saveData();
      }
    } catch (error) {
      console.error("[MockAPI] Errore nel caricamento dei dati:", error);

      // In caso di errore, usa dati predefiniti
      this.resetData();
    }
  }

  // Salva i dati nella localStorage
  saveData() {
    try {
      localStorage.setItem("calendarAppDemo", JSON.stringify(this.data));
    } catch (error) {
      console.error("[MockAPI] Errore nel salvataggio dei dati:", error);
    }
  }

  // Reimposta i dati allo stato iniziale
  resetData() {
    localStorage.removeItem("calendarAppDemo");
    this.loadData();
  }

  // Genera una data relativa rispetto a oggi
  getRelativeDate(daysFromToday, hours, minutes) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  }

  // Simula l'impostazione di un token di autenticazione
  setAuthToken(token) {
    this.token = token;
    console.log("[MockAPI] Token impostato:", token);
  }

  // Simula la rimozione di un token di autenticazione
  removeAuthToken() {
    this.token = null;
    console.log("[MockAPI] Token rimosso");
  }

  // Funzione per simulare un ritardo di rete
  async delay(ms = 200) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Funzione generica per le richieste mock
  async request(method, endpoint, reqData = null) {
    console.log(`[MockAPI] ${method} ${endpoint}`, reqData);

    // Simula un ritardo di rete
    await this.delay();

    // Gestisce i diversi endpoint
    if (endpoint === "/api/auth/register") {
      return this.handleRegister(reqData);
    } else if (endpoint === "/api/auth/login") {
      return this.handleLogin(reqData);
    } else if (endpoint === "/api/categories") {
      if (method === "GET") {
        return this.handleGetCategories();
      } else if (method === "POST") {
        return this.handleCreateCategory(reqData);
      }
    } else if (endpoint.match(/^\/api\/categories\/(\d+)$/)) {
      const id = parseInt(endpoint.split("/").pop());
      if (method === "PUT") {
        return this.handleUpdateCategory(id, reqData);
      } else if (method === "DELETE") {
        return this.handleDeleteCategory(id);
      }
    } else if (endpoint.match(/^\/api\/events$/)) {
      if (method === "GET") {
        const url = new URL(`http://example.com${endpoint}`);
        const start = url.searchParams.get("start");
        const end = url.searchParams.get("end");
        return this.handleGetEvents(start, end);
      } else if (method === "POST") {
        return this.handleCreateEvent(reqData);
      }
    } else if (endpoint.match(/^\/api\/events\/(\d+)$/)) {
      const id = parseInt(endpoint.split("/").pop());
      if (method === "PUT") {
        return this.handleUpdateEvent(id, reqData);
      } else if (method === "DELETE") {
        return this.handleDeleteEvent(id);
      }
    }

    throw new Error(`Endpoint non supportato: ${method} ${endpoint}`);
  }

  // Versioni semplificate dei metodi HTTP
  async get(endpoint) {
    return this.request("GET", endpoint);
  }

  async post(endpoint, data) {
    return this.request("POST", endpoint, data);
  }

  async put(endpoint, data) {
    return this.request("PUT", endpoint, data);
  }

  async delete(endpoint) {
    return this.request("DELETE", endpoint);
  }

  // Handler specifici per i diversi endpoint
  async handleRegister(data) {
    // Verifica se l'utente esiste già
    const existingUser = this.data.auth.users.find(
      (u) => u.username === data.username || u.email === data.email
    );

    if (existingUser) {
      throw {
        status: 400,
        message: "Username o email già esistenti",
      };
    }

    // Crea nuovo utente
    const newUser = {
      id: this.data.nextId.user++,
      username: data.username,
      email: data.email,
      password: data.password, // In una vera app, questa sarebbe hashata
    };

    this.data.auth.users.push(newUser);
    this.saveData();

    return { message: "Registrazione completata con successo" };
  }

  async handleLogin(data) {
    // Trova l'utente
    const user = this.data.auth.users.find(
      (u) => u.username === data.username && u.password === data.password
    );

    if (!user) {
      throw {
        status: 401,
        message: "Credenziali non valide",
      };
    }

    // Genera un token fittizio
    const token = this.generateToken(user);

    // Salva il token
    this.data.auth.tokens[user.id] = token;
    this.saveData();

    return {
      message: "Login effettuato con successo",
      token,
    };
  }

  async handleGetCategories() {
    // Estrae l'ID utente dal token
    const userId = this.getUserIdFromToken();

    // Filtra le categorie per l'utente corrente
    return this.data.categories.filter((cat) => cat.userId === userId);
  }

  async handleCreateCategory(data) {
    const userId = this.getUserIdFromToken();

    // Verifica se la categoria esiste già per questo utente
    const existingCategory = this.data.categories.find(
      (c) => c.name === data.name && c.userId === userId
    );

    if (existingCategory) {
      throw {
        status: 400,
        message: "Categoria già esistente",
      };
    }

    // Crea nuova categoria
    const newCategory = {
      id: this.data.nextId.category++,
      name: data.name,
      color: data.color,
      userId,
    };

    this.data.categories.push(newCategory);
    this.saveData();

    return newCategory;
  }

  async handleUpdateCategory(categoryId, data) {
    const userId = this.getUserIdFromToken();

    // Trova l'indice della categoria
    const index = this.data.categories.findIndex(
      (c) => c.id === categoryId && c.userId === userId
    );

    if (index === -1) {
      throw {
        status: 404,
        message: "Categoria non trovata",
      };
    }

    // Aggiorna la categoria
    const updatedCategory = {
      ...this.data.categories[index],
      name: data.name,
      color: data.color,
    };

    this.data.categories[index] = updatedCategory;

    // Aggiorna anche i nomi e colori delle categorie negli eventi
    this.data.events.forEach((event) => {
      if (event.categoryId === categoryId) {
        event.categoryName = data.name;
        event.categoryColor = data.color;
      }
    });

    this.saveData();

    return updatedCategory;
  }

  async handleDeleteCategory(categoryId) {
    const userId = this.getUserIdFromToken();

    // Trova l'indice della categoria
    const index = this.data.categories.findIndex(
      (c) => c.id === categoryId && c.userId === userId
    );

    if (index === -1) {
      throw {
        status: 404,
        message: "Categoria non trovata",
      };
    }

    // Rimuove la categoria
    this.data.categories.splice(index, 1);

    // Rimuove il riferimento alla categoria dagli eventi
    this.data.events.forEach((event) => {
      if (event.categoryId === categoryId) {
        event.categoryId = null;
        event.categoryName = null;
        event.categoryColor = null;
      }
    });

    this.saveData();

    return null;
  }

  async handleGetEvents(startDate, endDate) {
    try {
      const userId = this.getUserIdFromToken();
      console.log("[MockAPI] Recupero eventi per userId:", userId);

      // Verifica che gli eventi esistano
      if (!Array.isArray(this.data.events)) {
        console.warn(
          "[MockAPI] this.data.events non è un array, inizializzazione..."
        );
        this.data.events = [];
        this.saveData();
        return [];
      }

      // Filtra gli eventi per l'utente corrente
      let events = this.data.events.filter((evt) => evt.userId === userId);
      console.log(`[MockAPI] Trovati ${events.length} eventi per l'utente`);

      // Se sono specificate date di inizio e fine, filtra per intervallo
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        events = events.filter((evt) => {
          try {
            const eventDate = new Date(evt.startDateTime);
            return eventDate >= start && eventDate <= end;
          } catch (e) {
            console.error(
              "[MockAPI] Errore nel parsing della data evento:",
              e,
              evt
            );
            return false;
          }
        });
        console.log(`[MockAPI] Dopo filtro date: ${events.length} eventi`);
      }

      return events;
    } catch (error) {
      console.error("[MockAPI] Errore in handleGetEvents:", error);
      if (error.status === 401) {
        throw error; // Propaga l'errore di autenticazione
      }
      // Per altri errori, restituisci un array vuoto
      return [];
    }
  }

  async handleCreateEvent(data) {
    const userId = this.getUserIdFromToken();

    // Trova i dettagli della categoria se specificata
    let categoryName = null;
    let categoryColor = null;

    if (data.categoryId) {
      const category = this.data.categories.find(
        (c) => c.id === parseInt(data.categoryId) && c.userId === userId
      );

      if (category) {
        categoryName = category.name;
        categoryColor = category.color;
      }
    }

    // Crea nuovo evento
    const newEvent = {
      id: this.data.nextId.event++,
      title: data.title,
      description: data.description,
      startDateTime: data.startDateTime,
      endDateTime: data.endDateTime,
      categoryId: data.categoryId ? parseInt(data.categoryId) : null,
      categoryName,
      categoryColor,
      userId,
    };

    this.data.events.push(newEvent);
    this.saveData();

    return newEvent;
  }

  async handleUpdateEvent(eventId, data) {
    const userId = this.getUserIdFromToken();

    // Trova l'indice dell'evento
    const index = this.data.events.findIndex(
      (e) => e.id === eventId && e.userId === userId
    );

    if (index === -1) {
      throw {
        status: 404,
        message: "Evento non trovato",
      };
    }

    // Trova i dettagli della categoria se specificata
    let categoryName = null;
    let categoryColor = null;

    if (data.categoryId) {
      const category = this.data.categories.find(
        (c) => c.id === parseInt(data.categoryId) && c.userId === userId
      );

      if (category) {
        categoryName = category.name;
        categoryColor = category.color;
      }
    }

    // Aggiorna l'evento
    const updatedEvent = {
      ...this.data.events[index],
      title: data.title,
      description: data.description,
      startDateTime: data.startDateTime,
      endDateTime: data.endDateTime,
      categoryId: data.categoryId ? parseInt(data.categoryId) : null,
      categoryName,
      categoryColor,
    };

    this.data.events[index] = updatedEvent;
    this.saveData();

    return updatedEvent;
  }

  async handleDeleteEvent(eventId) {
    const userId = this.getUserIdFromToken();

    // Trova l'indice dell'evento
    const index = this.data.events.findIndex(
      (e) => e.id === eventId && e.userId === userId
    );

    if (index === -1) {
      throw {
        status: 404,
        message: "Evento non trovato",
      };
    }

    // Rimuove l'evento
    this.data.events.splice(index, 1);
    this.saveData();

    return null;
  }

  // Funzioni di utilità
  generateToken(user) {
    // In una vera app, questo sarebbe un JWT firmato
    const header = this.base64encode(
      JSON.stringify({ alg: "HS256", typ: "JWT" })
    );
    const payload = this.base64encode(
      JSON.stringify({
        sub: user.id.toString(),
        username: user.username,
        email: user.email,
        userId: user.id.toString(),
        groups: ["user"],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400, // 24 ore
      })
    );
    const signature = this.base64encode("fakesignature");

    return `${header}.${payload}.${signature}`;
  }

  base64encode(str) {
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  getUserIdFromToken() {
    if (!this.token) {
      console.warn("[MockAPI] Token non presente, utente non autenticato");
      throw {
        status: 401,
        message: "Non autenticato",
      };
    }

    try {
      // Estrae il payload dal token
      const payload = this.token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));

      return parseInt(decodedPayload.userId);
    } catch (error) {
      console.error("[MockAPI] Errore decodifica token:", error);
      throw {
        status: 401,
        message: "Token non valido",
      };
    }
  }
}

export const mockApiClient = new MockApiClient();
