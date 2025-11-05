// scaling.js - Modulo Core responsabile dell'adattamento grafico (scaling) del gioco a diverse risoluzioni.
// Assicura che la vista 3D e la minimappa mantengano le proporzioni e siano centrate.


// ====================================================================================
// ===== IMPORTAZIONI DI MODULI ESTERNI =====
// ====================================================================================

import { globals } from "../utils/globals.js"; // Accesso a costanti come SCREEN_WIDTH, MAP_WIDTH, e canvas globali.
import { contexts } from "./renderer.js";      // Accesso ai contesti di rendering per applicare le trasformazioni.


// ====================================================================================
// ===== FUNZIONE PRINCIPALE DI SCALING (EXPORT) =====
// ====================================================================================

/**
 * Scala un canvas specifico (vista 3D o minimappa) per riempire lo spazio disponibile
 * nel browser, mantenendo l'aspetto ratio definito dalle dimensioni logiche (width, height).
 *
 * @param {HTMLCanvasElement} canvas L'elemento Canvas da scalare.
 * @param {CanvasRenderingContext2D} ctx Il contesto 2D del canvas.
 * @param {number} width La larghezza logica (interna) del mondo di gioco.
 * @param {number} height L'altezza logica (interna) del mondo di gioco.
 */
export function scaleCanvas(canvas, ctx, width, height) { 
    
    // --- 1. Aggiornamento Dimensioni Fisiche ---
    // Imposta le dimensioni interne (di disegno) del canvas per corrispondere ai pixel reali del contenitore.
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // --- 2. Calcolo del Fattore di Scala ---
    // Calcola il fattore di scala necessario per X e Y.
    const scaleX = canvas.width / width;
    const scaleY = canvas.height / height;
    
    // Usa il fattore di scala MINORE per garantire che l'intero contenuto sia visibile (letterboxing).
    const scale = Math.min(scaleX, scaleY); 

    // --- 3. Calcolo dell'Offset per il Centramento ---
    // Calcola lo spazio extra su X e Y per centrare il contenuto scalato all'interno del canvas.
    const offsetX = (canvas.width - width * scale) / 2;
    const offsetY = (canvas.height - height * scale) / 2;

    // --- 4. Applicazione della Matrice di Trasformazione ---
    // Resetta le trasformazioni precedenti e applica il nuovo scaling e centramento.
    // [scaleX, skewX, skewY, scaleY, offsetX, offsetY]
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
}


// ====================================================================================
// ===== FUNZIONE DI ADATTAMENTO SPECIFICA PER LA MINIMAPPA (EXPORT) =====
// ====================================================================================

/**
 * Adatta le dimensioni dell'elemento Canvas della minimappa (`globals.mapCanvas`) 
 * per garantire che mantenga le proporzioni corrette all'interno del suo contenitore 
 * e sfrutti lo spazio disponibile.
 */
export function fitGameMap() { 
    const container = document.getElementById('map-container');

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calcola il rapporto d'aspetto (aspect ratio) ideale della mappa logica.
    const mapAspect = (globals.MAP_WIDTH) / (globals.MAP_HEIGHT);
    let finalWidth, finalHeight;

    // --- Logica di Mantenimento delle Proporzioni ---
    if (containerWidth / containerHeight > mapAspect) {
        // Caso A: Il contenitore è più "largo" del contenuto ideale (limita l'altezza).
        finalHeight = containerHeight;
        finalWidth = containerHeight * mapAspect;
    } else {
        // Caso B: Il contenitore è più "stretto" del contenuto ideale (limita la larghezza).
        finalWidth = containerWidth;
        finalHeight = containerWidth / mapAspect;
    }

    // Applica le dimensioni calcolate allo stile CSS del canvas (dimensioni visive).
    globals.mapCanvas.style.width = finalWidth + 'px';
    globals.mapCanvas.style.height = finalHeight + 'px';
}


// ====================================================================================
// ===== GESTIONE DELL'EVENTO DI RIDIMENSIONAMENTO DELLA FINESTRA =====
// ====================================================================================

/**
 * Event listener che ricalcola lo scaling ogni volta che l'utente ridimensiona la finestra del browser.
 */
window.addEventListener("resize", () => {
    // 1. Scala il canvas principale (vista 3D).
    scaleCanvas(globals.gameCanvas, contexts.gameCtx, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT);
    
    // 2. Adatta il contenitore della minimappa (stile CSS).
    fitGameMap(); 
    
    // 3. Scala il canvas della minimappa (trasformazione interna).
    scaleCanvas(globals.mapCanvas, contexts.mapCtx, globals.MAP_WIDTH, globals.MAP_HEIGHT);
});