import {globals} from './utils/globals.js';
import {mostraDialoghi} from './game/ui.js';

const gameState = {
    currentScene: null,
    playerHP: 100,
  // altre proprietà da tracciare
};

// Funzione che inizializza il gioco
async function initGame() {
    console.log("Inizio il gioco");
    gameState.currentScene = "intro";  // Nome scena iniziale
    changeScene(gameState.currentScene);

    // Carica i dialoghi da un file JSON
    const response = await fetch("../assets/dialoghi.json") 
    if (globals.dialoghi = await response.json())
        console.log("Dialoghi caricati:", globals.dialoghi); // verifica caricamento
    else
        console.log("Errore: Dialoghi non caricati correttamente");

    // Inizializza variavili globali
    globals.canvas = document.getElementById('canvas');
    globals.tileSize = 64; // esempio, dimensione di una piastrella


}

// Funzione per cambiare scena
function changeScene(sceneName) {
    console.log("Cambio scena a:", sceneName);
    // TODO: nascondi elementi, carica dati, mostra nuovi elementi
    // es: scenes.loadScene(sceneName);
    // ui.updateForScene(sceneName);
}

// MAIN
window.addEventListener("DOMContentLoaded", async () => {
    await initGame();

    mostraDialoghi("test1");

});


