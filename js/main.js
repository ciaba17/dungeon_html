// main.js - Punto di ingresso principale del gioco Raycasting RPG
// Questo script gestisce l'inizializzazione del gioco e il ciclo di gioco (Game Loop).

// ====================================================================================
// ===== BLOCCO DI IMPORTAZIONI E MODULI =====
// ====================================================================================

// Moduli Core: Contengono le funzionalità principali (motore, input, rendering).
import { globals } from './utils/globals.js';   // Variabili globali e stato del gioco.
import { inputHandler } from './core/input.js';              // Gestione degli input dell'utente.
import { raycast, createRays } from './core/raycaster.js';   // Logica del raycasting per la visione 3D.
import { contexts, render } from './core/renderer.js';       // Gestione dei canvas e rendering degli elementi.
import { scaleCanvas, fitGameMap } from './core/scaling.js'; // Funzioni per l'adattamento dello schermo.
import { sounds } from './core/audio.js';                    // Gestione e riproduzione degli effetti sonori e musiche.
import { combat } from './game/combat.js';                   // Logica del sistema di combattimento.
import { loadTextures } from './utils/globals.js';           // Funzione per il caricamento delle texture.

// Moduli di Gioco: Contengono la logica specifica del mondo di gioco, personaggi e oggetti.
import { mapToWalls } from './game/objects.js';              // Trasforma la mappa dati in oggetti (muri) per il raycasting.
import { mapToEntities } from './game/enemies.js';           // Inizializza le entità nemiche sulla mappa.
import { player } from './game/player.js';                   // Oggetto e logica del giocatore.
import { Enemy, createNodeMap } from './game/enemies.js';    // Definizioni e utilità per i nemici (es. pathfinding).


// ====================================================================================
// ===== INIZIALIZZAZIONE DEL GIOCO (SETUP) =====
// ====================================================================================

/**
 * Funzione asincrona principale per l'inizializzazione di tutte le risorse e componenti del gioco.
 */
async function initGame() {
    // --- Caricamento delle Risorse Essenziali ---
    // Questi dati (dialoghi e mappe) sono necessari prima di avviare il setup.
    await loadDialogues();
    await loadMaps();

    // --- Configurazione Iniziale del Mondo ---
    // Trasforma i dati JSON della mappa in oggetti gestibili dal motore.
    mapToWalls("map");      // Genera i muri per la visuale 3D.
    createNodeMap();        // Prepara la griglia per il pathfinding dei nemici.
    mapToEntities("map");   // Posiziona i nemici e altri oggetti interattivi.
    initCanvasContexts();   // Ottiene e configura i contesti di disegno (2D) dei canvas HTML.
    createRays();           // Pre-calcola gli angoli dei raggi per il raycasting.

    // --- Adattamento dello Schermo (Scaling) ---
    setupScaling();

    // --- Avvio dei Suoni di Sottofondo ---
    sounds.wind.play();
    sounds.birds.play();

    // --- Caricamento delle Texture ---
    loadTextures();
}


// ====================================================================================
// ===== FUNZIONI DI SUPPORTO E CARICAMENTO =====
// ====================================================================================

/**
 * Carica in modo asincrono i dialoghi dal file JSON esterno e li memorizza nelle globali.
 */
async function loadDialogues() {
    try {
        const response = await fetch("assets/dialogues.json");
        globals.dialogues = await response.json();
    } catch {
        console.error("Error: can't load dialogues");
    }
}

/**
 * Carica in modo asincrono le definizioni delle mappe dal file JSON e le memorizza.
 */
async function loadMaps() {
    try {
        const response = await fetch("assets/map.json");
        globals.maps = await response.json();
    } catch {
        console.error("Error: can't load maps");
    }
}

/**
 * Collega le variabili globali agli elementi Canvas HTML e ottiene i contesti di disegno 2D.
 */
function initCanvasContexts() {
    globals.gameCanvas = document.getElementById("game-area");
    globals.mapCanvas  = document.getElementById("game-map");

    contexts.gameCtx = globals.gameCanvas.getContext('2d'); // Contesto per la vista 3D/scena di gioco
    contexts.mapCtx  = globals.mapCanvas.getContext('2d');  // Contesto per la minimappa

    // Disabilita l'anti-aliasing per un look 'pixel art' più autentico.
    contexts.gameCtx.imageSmoothingEnabled = false;
}

/**
 * Configura lo scaling dei canvas per adattarsi alla finestra e mantenere le proporzioni.
 */
function setupScaling() {
    // Scala la canvas principale del gioco.
    scaleCanvas(globals.gameCanvas, contexts.gameCtx, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT);
    
    // Adatta la logica della mappa alla visualizzazione corrente prima di scalarla.
    fitGameMap(); 
    
    // Scala la canvas della minimappa.
    scaleCanvas(globals.mapCanvas, contexts.mapCtx, globals.MAP_WIDTH, globals.MAP_HEIGHT);
}


// ====================================================================================
// ===== CICLO DI GIOCO (GAME LOOP) E CONTATORI =====
// ====================================================================================

// Variabili per il calcolo del DeltaTime e degli FPS (Frames Per Second).
let lastTime = performance.now(); // Ultimo tempo di esecuzione del loop.
let fps = 0;                      // FPS attuali.
let frameCounter = 0;             // Contatore di frame per il calcolo degli FPS.
let fpsAccumulator = 0;           // Accumulatore di tempo per il calcolo degli FPS.

/**
 * La funzione principale del ciclo di gioco. Viene richiamata ad ogni frame.
 * @param {number} currentTime Il timestamp fornito da requestAnimationFrame.
 */
function gameloop(currentTime) {
    // --- Calcolo del DeltaTime ---
    // DeltaTime è il tempo trascorso dall'ultimo frame (essenziale per movimenti fluidi).
    const delta = (currentTime - lastTime) / 1000; 
    globals.deltaTime = Math.min(delta, 0.1); // Limita il delta a 0.1s (10 FPS min) per evitare bug in caso di lag.
    lastTime = currentTime;

    // --- Aggiornamento dei Contatori ---
    updateFPS(delta);

    // --- Fasi Principali del Loop ---
    handleInput();  // 1. Gestione degli input utente.
    updateGame();   // 2. Logica di gioco (movimento, IA, fisica, ecc.).
    renderGame();   // 3. Disegno degli elementi grafici.

    // Richiama il loop per il prossimo frame disponibile.
    requestAnimationFrame(gameloop);
}

/**
 * Calcola e aggiorna il valore degli FPS ogni secondo.
 * @param {number} delta Il tempo trascorso in secondi dall'ultimo frame.
 */
function updateFPS(delta) {
    frameCounter++;
    fpsAccumulator += delta;

    // Se è trascorso almeno un secondo, aggiorna gli FPS.
    if (fpsAccumulator >= 1) {
        fps = frameCounter;
        frameCounter = 0;
        fpsAccumulator -= 1;
    }
}

/**
 * Invocazione della funzione di gestione degli input.
 */
function handleInput() {
    inputHandler();
}

/**
 * Aggiorna lo stato logico del gioco in base al `gameState` corrente.
 */
function updateGame() {
    switch (globals.gameState) {
        case "exploration": // Stato di movimento libero sulla mappa.
            updateExploration();
            break;
        case "combat":      // Stato di combattimento a turni o in tempo reale.
            combat(globals.deltaTime);
            break;
        // Altri stati (es. "menu", "dialogue") verranno aggiunti qui.
    }
}

/**
 * Funzione dedicata all'aggiornamento della logica nello stato di Esplorazione.
 */
function updateExploration() {
    player.update(); // Aggiorna posizione e logica del giocatore.
    
    // Aggiorna la logica per tutte le entità (es. nemici in movimento o inseguimento).
    for (const entity of globals.entities) {
        // Solo gli oggetti di tipo 'Enemy' eseguono la logica di inseguimento (IA).
        if (entity instanceof Enemy) entity.followPlayer(player);
    }
}

/**
 * Esegue le operazioni di disegno e rendering.
 */
function renderGame() {
    raycast();                 // Calcola le intersezioni dei raggi con i muri e aggiorna il buffer 3D.
    render();                  // Disegna il mondo 3D e la minimappa sui rispettivi canvas.
    drawFPS(contexts.gameCtx); // Disegna l'indicatore FPS in sovrimpressione.
}

/**
 * Disegna un box semitrasparente nell'angolo in alto a sinistra con l'indicatore degli FPS.
 * @param {CanvasRenderingContext2D} ctx Il contesto di disegno del canvas di gioco.
 */
function drawFPS(ctx) {
    ctx.save(); // Salva lo stato corrente (colore, font, trasformazioni, ecc.)

    // --- Preparazione Testo e Box ---
    const text = `FPS: ${fps.toFixed(0)}`;
    ctx.font = "16px monospace";
    const textWidth = ctx.measureText(text).width;
    const padding = 6;
    const boxX = 8;
    const boxY = 6;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = 22;

    // --- Disegno dello Sfondo (Box) ---
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // Sfondo semitrasparente nero
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    // --- Disegno del Testo ---
    ctx.fillStyle = "white"; // Testo bianco
    ctx.fillText(text, boxX + padding, boxY + 16); // +16 per allineare verticalmente

    ctx.restore(); // Ripristina lo stato salvato (non influenza gli altri disegni).
}


// ====================================================================================
// ===== AVVIO DEL GIOCO (ENTRY POINT) =====
// ====================================================================================

/**
 * Event listener che attende il caricamento completo del DOM prima di avviare il gioco.
 * Questo è il vero e proprio punto di inizio dell'applicazione.
 */
window.addEventListener("DOMContentLoaded", async () => {
    await initGame();                // Prima: inizializzazione di tutte le risorse.
    requestAnimationFrame(gameloop); // Poi: avvio del ciclo di gioco.
});