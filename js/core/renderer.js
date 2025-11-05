// renderer.js - Modulo Core che gestisce il disegno di tutti gli elementi del gioco (minimappa e vista 3D).


// ====================================================================================
// ===== IMPORTAZIONI DI MODULI ESTERNI =====
// ====================================================================================

import { globals, textures } from '../utils/globals.js'; // Variabili di stato, costanti e texture di base.
import { walls } from '../game/objects.js';             // Gli oggetti Muro da disegnare in 2D.
import { player } from '../game/player.js';             // L'oggetto Player (posizione, rotazione).
import { rays } from './raycaster.js';                  // I raggi calcolati dal Raycaster (per il rendering 3D e minimappa).
import { renderCombat } from '../game/combat.js';       // Funzione di rendering specifica per lo stato di Combattimento.


// ====================================================================================
// ===== VARIABILI DI STATO E CONSTANTI (EXPORT) =====
// ====================================================================================

/**
 * Contesti di disegno 2D (CanvasRenderingContext2D) per le due aree di visualizzazione.
 * Inizializzati in `main.js` e accessibili da qui.
 */
export const contexts = {
    gameCtx: null, // Contesto principale per la vista 3D.
    mapCtx: null,  // Contesto per la minimappa.
}

/**
 * Distanza virtuale dal giocatore al piano di proiezione 3D.
 * Questa costante è cruciale per calcolare l'altezza delle pareti (proiezione prospettica).
 * Formula: (LARGHEZZA_SCHERMO / 2) / tan(FOV_RADIANTI / 2).
 */
const distanceProjectionPlane = (globals.SCREEN_WIDTH / 2) / Math.tan((globals.fov * Math.PI / 180) / 2);


// ====================================================================================
// ===== FUNZIONI DI DISEGNO 2D (MINIMAPPA) =====
// ====================================================================================

/**
 * Disegna la rappresentazione 2D di tutti gli oggetti Muro sulla minimappa.
 * @param {CanvasRenderingContext2D} ctx Il contesto di disegno (mapCtx).
 * @param {Array<Object>} walls La lista degli oggetti muro.
 */
function drawWalls2D(ctx, walls) { 
    walls.forEach(wall => wall.draw2D(ctx));
}


// ====================================================================================
// ===== FUNZIONI DI DISEGNO 3D (VISTA PRINCIPALE) =====
// ====================================================================================

/**
 * Disegna i muri nella vista 3D. L'altezza delle "fette" di muro è calcolata 
 * in base alla distanza corretta dal Raycaster.
 * @param {CanvasRenderingContext2D} ctx Il contesto di disegno (gameCtx).
 */
function drawWalls3D(ctx) {
    // Larghezza di una singola "fetta" (slice) di muro (equivalente a un raggio).
    const sliceWidth = globals.SCREEN_WIDTH / globals.rayNumber;
    globals.wallSlices = []; // Array temporaneo per memorizzare i dati di ogni fetta di muro.

    // --- Calcolo delle Proprietà di Proiezione per ogni Raggio ---
    rays.forEach((ray, i) => {
        // Se il raggio non ha colpito nulla, usa una texture "vuota".
        const texture = ray.hitWall ? ray.hitWall.texture : textures.blankTexture;
        
        // 1. Calcolo della coordinata X sulla texture (da 0 a 64, per es.)
        // Determina dove il raggio ha colpito la parete all'interno di una tile.
        const textureX = ray.hitVertical
            ? Math.floor((ray.hitY % globals.tileSize) / globals.tileSize * texture.width) // Se colpisce lato X (verticale) si usa la Y mondiale.
            : Math.floor((ray.hitX % globals.tileSize) / globals.tileSize * texture.width); // Se colpisce lato Y (orizzontale) si usa la X mondiale.

        // 2. Calcolo dell'altezza della fetta proiettata (height)
        // La distanza proiettata è inversamente proporzionale all'altezza apparente.
        const height = (globals.tileSize / ray.correctedDistance) * distanceProjectionPlane;

        // Memorizza i dati per il disegno finale.
        globals.wallSlices.push({
            texture: texture,
            height: height,
            distance: ray.correctedDistance,
            textureX: textureX
        });
    });

    // --- Disegno Effettivo delle Fette (Colonna per Colonna) ---
    globals.wallSlices.forEach((slice, i) => {
        // Calcola la posizione Y (Top) per centrare la fetta verticalmente.
        const top = globals.SCREEN_HEIGHT / 2 - slice.height / 2;
        
        ctx.drawImage(
            slice.texture,
            slice.textureX, 0, // Posizione e dimensioni (solo 1px) del frammento da tagliare dalla texture originale
            1, slice.texture.height,
            i * sliceWidth, top, // Posizione dove disegnare la fetta sullo schermo
            sliceWidth, slice.height // Dimensioni della fetta sullo schermo
        );
    });
}


// ====================================================================================
// ===== FUNZIONE DI RENDERING PRINCIPALE (EXPORT) =====
// ====================================================================================

/**
 * La funzione `render()` è chiamata ad ogni frame per disegnare l'intera scena.
 * Gestisce il disegno di cielo/pavimento, minimappa e vista 3D, a seconda dello stato di gioco.
 */
export function render() {
    const gameCtx = contexts.gameCtx; // Contesto 3D
    const mapCtx = contexts.mapCtx;   // Contesto Minimappa

    // --- 1. Disegno Cielo e Pavimento (Sfondo 3D) ---
    // Pulisce il frame precedente e imposta i colori di base.
    
    // Metà superiore (Cielo)
    gameCtx.fillStyle = globals.ceilingColor;
    gameCtx.fillRect(0, 0, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT / 2);

    // Metà inferiore (Pavimento)
    gameCtx.fillStyle = globals.floorColor;
    gameCtx.fillRect(0, globals.SCREEN_HEIGHT / 2, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT / 2);

    
    // --- 2. Inizializzazione Minimappa (Pulizia e Setup Trasformazione) ---
    const mapContainer = document.getElementById("map-container")
    mapCtx.fillStyle = 'black';
    mapCtx.fillRect(0, 0, globals.MAP_WIDTH, globals.MAP_HEIGHT);

    mapCtx.save(); // Salva lo stato di default (prima della trasformazione)
    
    // Calcola il centro del contenitore della mappa
    const mapCenterX = mapContainer.clientWidth / 2;
    const mapCenterY = mapContainer.clientHeight / 2;
    
    // Applica lo Zoom e poi la Traslazione
    mapCtx.scale(globals.mapZoom, globals.mapZoom);
    // Sposta il mondo in modo che le coordinate del player (x, y) appaiano al centro del canvas.
    mapCtx.translate(mapCenterX - player.x, mapCenterY - player.y); 


    // --- 3. Rendering in base allo Stato del Gioco ---
    if (globals.gameState === "exploration") {
        
        // --- Rendering Minimappa (Esplorazione) ---
        drawWalls2D(mapCtx, walls);
        player.draw2D(mapCtx);
        rays.forEach(ray => ray.draw(mapCtx)); // Disegna la frusta di raggi per debug.
        globals.entities.forEach(entity => {entity.draw2D(mapCtx)}); // Disegna le entità in 2D.

        mapCtx.restore(); // Ripristina lo stato del contesto (rimuove zoom e traslazione).
        
        // --- Rendering 3D (Esplorazione) ---
        drawWalls3D(gameCtx);
        
        // Entità (Sprites): calcolo distanza, ordinamento e disegno per il corretto Z-Buffering.
        globals.entities.forEach(entity => {entity.updateDistance()})
        globals.entities.sort((a, b) => b.distance - a.distance); // Ordina dalla più LONTANA alla più VICINA (Algoritmo Painter's)
        globals.entities.forEach(entity => {entity.draw3D(gameCtx)})
        
    } else if (globals.gameState === "combat") {
        // Rendering specifico per la schermata di combattimento.
        mapCtx.restore(); // Assicura che il contesto sia ripristinato anche qui.
        renderCombat(gameCtx);
    }
}