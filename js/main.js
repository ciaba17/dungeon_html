import { globals } from './utils/globals.js';
import { mostraDialoghi } from './game/ui.js';
import { inputHandler } from './core/input.js';
import { mapToWalls } from './game/objects.js';
import { player } from './game/player.js';
import { raycast, createRays } from './core/raycaster.js';
import { contexts, render } from './core/renderer.js';
import { scaleCanvas, fitGameMap } from './core/scaling.js';
import { Enemy } from './game/enemies.js';
import { combat } from './game/combat.js';
import { bgMusic } from './core/audio.js';
import { createNodeMap } from './game/enemies.js';

async function initGame() {
    console.log("Inizio il gioco");

    // Carica i dialoghi
    let response = await fetch("../assets/dialoghi.json");
    globals.dialoghi = await response.json();
    if (globals.dialoghi != null)
        console.log("Dialoghi caricati:", globals.dialoghi); // verifica caricamento
    else
        console.log("Errore: Dialoghi non caricati correttamente");

    // Carica le mappe
    response = await fetch("../assets/maps.json");
    globals.maps = await response.json();
    if (globals.maps != null)
        console.log("Mappe caricate:", globals.maps); // verifica caricamento
    else
        console.log("Errore: Mappe non caricate correttamente");
    
    // Crea i muri dalla mappa
    mapToWalls("map1");

    // Inizializza il canvas
    globals.gameCanvas = document.getElementById("game-area");
    globals.mapCanvas = document.getElementById("game-map");

    // Crea contesti 2D di rendering
    contexts.gameCtx = globals.gameCanvas.getContext('2d');
    contexts.mapCtx = globals.mapCanvas.getContext('2d');

    // Crea i raggi per il raycasting
    createRays();

    // Crea la mappa per il pathdinding
    createNodeMap();

    // Resizing iniziale
    scaleCanvas(globals.gameCanvas, contexts.gameCtx, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT);
    fitGameMap(); // Da chiamare prima di scalare la mappa
    scaleCanvas(globals.mapCanvas, contexts.mapCtx, globals.MAP_WIDTH, globals.MAP_HEIGHT);

    contexts.gameCtx.imageSmoothingEnabled = false;

    globals.textBoxContent = document.getElementById("textbox-content");
    globals.statsDisplay = document.getElementById("stats-display");
    globals.combatControls = document.getElementById("combat-controls"); // Resolved addition
    globals.moveControls = document.getElementById("move-controls"); // Resolved addition

    alert("inizio gioco!");
}





// Variabili necessarie per la gestione del gameloop in base al tempo reale
let lastTime = performance.now(); // Prende il tempo attuale in ms
let fps = 0;
let frameCount = 0;
let fpsTimer = 0;

function drawFPS(ctx) {
    ctx.fillStyle = "white";
    ctx.font = "16px monospace";
    ctx.fillText(`FPS: ${fps}`, 10, 20);
}

function gameloop(time) {
    const delta = time - lastTime; // Tempo trascorso dall'ultimo frame in ms
    globals.deltaTime = Math.min(delta / 1000, 0.1); // Calcola delta limitandone il valore massimo a 0.1 secondi
    lastTime = time;

    // Calcolo FPS
    fpsTimer += globals.deltaTime * 1000;
    frameCount++;
    if (fpsTimer >= 1000) { // ogni secondo
        fps = frameCount;
        frameCount = 0;
        fpsTimer = 0;
    }

    lastTime = time;
    inputHandler();

    // Update
    switch(globals.gameState) {
        case 0:
            player.update();
            globals.entities.forEach(entity => {
                if (entity instanceof Enemy) {
                    entity.followPlayer(player);
                }
            });
            break;
        case 1:
            combat(globals.deltaTime); // Resolved addition
            break;
    }

    raycast();

    // Draw
    render();
    drawFPS(contexts.gameCtx);

    requestAnimationFrame(gameloop);
}

// Avvio
window.addEventListener("DOMContentLoaded", async () => {
    await initGame();

    mostraDialoghi("test1");

    requestAnimationFrame(gameloop);
});