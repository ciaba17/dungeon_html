// globals.js - Configurazione Core e Stato Globale del Gioco Raycasting.

/**
 * L'oggetto 'globals' contiene tutte le variabili di stato e configurazione
 * necessarie per l'esecuzione del gioco e per il rendering.
 */
export const globals = {
    // --- Configurazione Schermo e Finestra di Gioco ---
    SCREEN_WIDTH: 800, 
    SCREEN_HEIGHT: 600,

    // --- Configurazione Minimappa (2D) ---
    MAP_WIDTH: 400,
    MAP_HEIGHT: 300,
    VIEW_DISTANCE: 150, // Distanza di visibilità sulla minimappa

    // --- Stato del Gioco ---
    gameState: "exploration", // Stato attuale (es. "exploration", "combat", "gameover")
    enemyOnCombat: null,      // Riferimento all'oggetto Enemy attualmente in combattimento

    // --- Oggetti Risorsa e Riferimenti DOM (Popolati all'avvio) ---
    dialogues: {},                  // Contenitore per tutti i dati dei dialoghi
    currentDialogueInterval: null,  // Riferimento all'intervallo attivo per l'effetto "typing"
    maps: {},                       // Contenitore per tutte le definizioni delle mappe
    gameCanvas: null,               // Riferimento all'elemento Canvas principale (3D)
    mapCanvas: null,                // Riferimento all'elemento Canvas della minimappa (2D)

    // --- Configurazione Mappa Logica ---
    tileSize: 32, // Dimensione in pixel di una singola cella/piastrella (tile)
    mapZoom: 1,   // Livello di zoom della minimappa

    // --- Parametri di Raycasting (3D) ---
    rayNumber: 400, // Numero di raggi lanciati (risoluzione orizzontale)
    fov: 60,        // Campo Visivo (Field of View) in gradi
    FPS_LIMIT: 60,  // Limite massimo di Frame Per Secondo

    // --- Buffer e Dati Dinamici ---
    wallSlices: [],   // Array (Z-Buffer) che memorizza la distanza di ogni raggio/colonna muro
    entities: [],     // Array di tutte le entità dinamiche (Enemy, Npc, GameObject) nel mondo
    deltaTime: null,  // Tempo trascorso dall'ultimo frame (per movimenti indipendenti dall'FPS)

    // --- Stato Combattimento/Input ---
    combatInputLocked: false, // Flag per bloccare l'input durante le animazioni di combattimento

    // --- Rendering: Colori Celo e Pavimento ---
    ceilingColor: "rgb(86, 152, 232)",
    floorColor: "rgb(67, 112, 11)",
};


/**
 * L'oggetto 'textures' contiene tutte le istanze Image pre-caricate.
 */
export const textures = {
    blankTexture: new Image(),
    wallTexture: new Image(),
    outside1_1: new Image(),
    gate: new Image(),
    errorTexture: new Image(), 
};

/**
 * Ciclo per assegnare automaticamente il percorso di origine (src) 
 * a ciascuna istanza Image in base al nome della chiave.
 */
export function loadTextures() {
    for (let key in textures) {
        textures[key].src = "assets/images/" + key + ".png";
    }
}