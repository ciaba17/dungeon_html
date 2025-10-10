// Variabili globali che servono nel gioco
let dialoghi = {};  // oggetto per i dialoghi caricati da JSON


const gameState = {
    currentScene: null,
    playerHP: 100,
  // altre proprietà da tracciare
};

// Funzione che inizializza il gioco
function initGame() {
    console.log("Inizio il gioco");
    gameState.currentScene = "intro";  // Nome scena iniziale
    changeScene(gameState.currentScene);

    // Carica i dialoghi da un file JSON
    fetch("../assets/dialoghi.json") 
        .then(response => response.json())
        .then(data => {
            dialoghi = data;
            console.log("Dialoghi caricati:", dialoghi); // verifica caricamento
            mostraDialoghi("test1")

        })
        .catch(error => {
            console.error("Errore nel caricamento dei dialoghi:", error);
        });
        
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


function mostraDialoghi(id) {
    const textboxContent = document.getElementById("textbox-content");
    const dialogo = dialoghi[id]


    textboxContent.innerText = dialogo[0]
}
