// ===== IMPORTAZIONI =====
import { globals } from './utils/globals.js';
import { inputHandler } from './core/input.js';
import { mapToWalls } from './game/objects.js';
import { mapToEntities } from './game/enemies.js';
import { player } from './game/player.js';
import { raycast, createRays } from './core/raycaster.js';
import { contexts, render } from './core/renderer.js';
import { scaleCanvas, fitGameMap } from './core/scaling.js';
import { Enemy, createNodeMap } from './game/enemies.js';
import { combat } from './game/combat.js';
import { sounds } from './core/audio.js';


// ===== INIZIALIZZAZIONE DEL GIOCO =====
async function initGame() {
    // --- Caricamento risorse ---
    await loadDialogues();
    await loadMaps();

    // --- Setup iniziale ---
    mapToWalls("map");
    createNodeMap();
    mapToEntities("map");
    initCanvasContexts();
    createRays();

    // --- Scaling ---
    setupScaling();

    // Playa i suoni iniziali
    sounds.wind.play();
    sounds.birds.play();
}


// ===== FUNZIONI DI SUPPORTO =====
async function loadDialogues() {
    try {
        const response = await fetch("assets/dialogues.json");
        globals.dialogues = await response.json();
        console.log("Dialoghi caricati:", globals.dialogues);
    } catch {
        console.error("Errore nel caricamento dei dialoghi");
    }
}

async function loadMaps() {
    try {
        const response = await fetch("assets/map.json");
        globals.maps = await response.json();
        console.log("Mappe caricate:", globals.maps);
    } catch {
        console.error("Errore nel caricamento delle mappe");
    }
}

function initCanvasContexts() {
    globals.gameCanvas = document.getElementById("game-area");
    globals.mapCanvas  = document.getElementById("game-map");

    contexts.gameCtx = globals.gameCanvas.getContext('2d');
    contexts.mapCtx  = globals.mapCanvas.getContext('2d');

    contexts.gameCtx.imageSmoothingEnabled = false;
}

function setupScaling() {
    scaleCanvas(globals.gameCanvas, contexts.gameCtx, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT);
    fitGameMap(); // Prima di scalare la mappa
    scaleCanvas(globals.mapCanvas, contexts.mapCtx, globals.MAP_WIDTH, globals.MAP_HEIGHT);
}


let lastTime = performance.now();
let fps = 0;
let frameCounter = 0;
let fpsAccumulator = 0;

// ===== GAME LOOP =====
function gameloop(currentTime) {
    const delta = (currentTime - lastTime) / 1000; // Tempo trascorso in secondi
    globals.deltaTime = Math.min(delta, 0.1); // Limita i salti di frame a 0.1s max
    lastTime = currentTime;

    // --- Aggiornamento FPS ---
    updateFPS(delta);

    // --- Logica di gioco ---
    handleInput();
    updateGame();
    renderGame();

    requestAnimationFrame(gameloop);
}


function updateFPS(delta) {
    frameCounter++;
    fpsAccumulator += delta;

    if (fpsAccumulator >= 1) {
        fps = frameCounter;
        frameCounter = 0;
        fpsAccumulator -= 1;
    }
}

function handleInput() {
    inputHandler();
}

function updateGame() {
    switch (globals.gameState) {
        case "exploration":
            updateExploration();
            break;
        case "combat":
            combat(globals.deltaTime);
            break;
    }
}

function renderGame() {
    raycast();
    render();
    drawFPS(contexts.gameCtx);
}

function drawFPS(ctx) {
    ctx.save();

    const text = `FPS: ${fps.toFixed(0)}`;
    ctx.font = "16px monospace";
    const textWidth = ctx.measureText(text).width;
    const padding = 6;

    const boxX = 8;
    const boxY = 6;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = 22;

    // Sfondo semitrasparente nero
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    // Testo bianco
    ctx.fillStyle = "white";
    ctx.fillText(text, boxX + padding, boxY + 16);

    ctx.restore();
}

function updateExploration() {
    player.update();
    for (const entity of globals.entities) {
        if (entity instanceof Enemy) entity.followPlayer(player);
    }
}


// ===== AVVIO =====
window.addEventListener("DOMContentLoaded", async () => {
    await initGame();
    requestAnimationFrame(gameloop);
});
