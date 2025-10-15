import { globals } from './utils/globals.js';
import { mostraDialoghi } from './game/ui.js';
import { render } from './core/renderer.js';
import { inputHandler } from './core/input.js';
import { mapToWalls } from './game/mapObjects.js';
import { player } from './game/player.js';
import { raycast } from './core/raycaster.js';

async function initGame() {
    console.log("Inizio il gioco");

    // Carica i dialoghi
    let response = await fetch("../assets/dialoghi.json") 
    if (globals.dialoghi = await response.json())
        console.log("Dialoghi caricati:", globals.dialoghi); // verifica caricamento
    else
        console.log("Errore: Dialoghi non caricati correttamente");

    // Carica le mappe
    response = await fetch("../assets/maps.json")
    if (globals.maps = await response.json())
        console.log("Mappe caricate:", globals.maps); // verifica caricamento
    else
        console.log("Errore: Mappe non caricate correttamente");
    // Crea i muri dalla mappa
    mapToWalls("map1"); 

    // Inizializza il canvas
    globals.canvas = document.getElementById("game-area");
}


function gameloop() {
    inputHandler(); // Gestione input (da implementare)
    player.update(); // Aggiorna lo stato del giocatore
    raycast();
    render();
    requestAnimationFrame(gameloop); // Chiede il prossimo frame
}


// Main
window.addEventListener("DOMContentLoaded", async () => {
    await initGame();

    mostraDialoghi("test1");
    requestAnimationFrame(gameloop);

});


