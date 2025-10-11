// Variabili globali che servono nel gioco
let dialoghi = {};  // oggetto per i dialoghi caricati da JSON


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
    if (dialoghi = await response.json())
        console.log("Dialoghi caricati:", dialoghi); // verifica caricamento
    else
        console.log("Errore: Dialoghi non caricati correttamente");
        

    mostraDialoghi("test1");
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
    const textbox = document.getElementById("textbox");
    const textboxContent = document.getElementById("textbox-content");
    const dialogo = dialoghi[id];
    const TEXTSPEED = 50 
    let i = 0;
    let j = 0;
    let intervallo;


    function avanzaTesto() { // Aggiunge il prossimo carattere al testo
        textboxContent.textContent += dialogo[i][j]
        j++;
        if (j >= dialogo[i].length) { // Fine del testo corrente
            clearInterval(intervallo);
        }
    }
    
    function mostraDialogo() { // Mostra il dialogo corrente
        if (i <= dialogo.length) {
            textboxContent.textContent = "";
            j = 0;
            intervallo = setInterval(avanzaTesto, TEXTSPEED); // Crea intervallo per avanzare il testo ogni TEXTSPEED ms
        }
    }
    
    // Gestione del click per avanzare il dialogo
    textbox.onclick = () => {
        if (i >= dialogo.length) return; // Fine dialogo

        // Se il testo non è ancora completo, completalo al click
        if (j < dialogo[i].length) {
            textboxContent.textContent = dialogo[i];
            j = dialogo[i].length;
            clearInterval(intervallo); // Cancella l'intervallo
        }
        else { // Altrimenti passa al prossimo dialogo
            i++;
            mostraDialogo();
        }
    }

    mostraDialogo(); // Mostra il primo dialogo
}

