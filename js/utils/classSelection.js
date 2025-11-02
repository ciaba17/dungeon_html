// ===== Pulsanti classi =====
const classButtons = document.querySelectorAll(".class-btn");

// Funzione simulata per inizializzare la classe del player
// In pratica, nel tuo main.js dovrai avere questa funzione
import { player } from './game/player.js'; // o dove hai la tua classe player

function initClassType(className) {
    player.initClassType(className);
    console.log("Classe selezionata:", className);
}

// Gestione click
classButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const className = btn.dataset.class;
        initClassType(className);

        // Passa al gioco
        window.location.href = "game.html"; // sostituisci con la tua pagina del gioco
    });
});
