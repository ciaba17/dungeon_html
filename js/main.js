// Variabili globali che servono nel gioco
const gameState = {
    currentScene: null,
    playerHP: 100,
  // altre proprietà da tracciare
};

// Funzione che inizializza il gioco
function initGame() {
    console.log("Inizio il gioco");
    gameState.currentScene = "intro";  // nome scena iniziale
    changeScene(gameState.currentScene);
}

// Funzione per cambiare scena
function changeScene(sceneName) {
    console.log("Cambio scena a:", sceneName);
    // TODO: nascondi elementi, carica dati, mostra nuovi elementi
    // es: scenes.loadScene(sceneName);
    // ui.updateForScene(sceneName);
}

// Quando la pagina è caricata, avvia il gioco
window.addEventListener("DOMContentLoaded", () => {
    initGame();
});
