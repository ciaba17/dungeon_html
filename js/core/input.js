// input.js - Modulo dedicato alla gestione e al monitoraggio degli input dell'utente (tastiera e UI)
// Contiene la mappa dello stato degli input e gli event listener per intercettare le azioni


// ====================================================================================
// ===== IMPORTAZIONI DI MODULI ESTERNI =====
// ====================================================================================

import { globals } from '../utils/globals.js'; // Accesso alle variabili di stato globale (es. blocchi input)
import { contexts } from './renderer.js';      // Non usato direttamente in questo script, ma mantenuto per coerenza
import { player } from '../game/player.js';    // Accesso all'oggetto giocatore per chiamare funzioni specifiche (es. interazione)


// ====================================================================================
// ===== STATO GLOBALE DEGLI INPUT (EXPORT) =====
// ====================================================================================

/**
 * Mappa di stato che tiene traccia di quali input sono attualmente attivi (premuti)
 * Viene esportata per essere consultata dal modulo 'player' e dalla logica di 'combat'
 */
export const inputState = { 
    // --- Input di Movimento e Esplorazione ---
    movement: {
        up: false,        // Tasto/Bottone per l'avanzamento
        down: false,      // Tasto/Bottone per l'indietreggiamento
        left: false,      // Tasto/Bottone per lo spostamento laterale a sinistra (strafe)
        right: false,     // Tasto/Bottone per lo spostamento laterale a destra (strafe)
        turnLeft: false,  // Tasto per la rotazione della visuale a sinistra
        turnRight: false, // Tasto per la rotazione della visuale a destra
    },

    // --- Input Specifici per la Modalità Combattimento ---
    combat: {
        sword: false,  // Scelta di attacco con la spada
        shield: false, // Scelta di difesa con lo scudo
        magic: false,  // Scelta di attacco magico
    }
};


// ====================================================================================
// ===== FUNZIONE PRINCIPALE DI GESTIONE (EXPORT) =====
// ====================================================================================

/**
 * Funzione stub (segnaposto) che viene chiamata ad ogni frame dal Game Loop
 * Attualmente vuota, ma serve come punto di iniezione per logiche di input complesse
 */
export function inputHandler() {
    // La maggior parte della logica di input in questo progetto è gestita
    // dagli Event Listener, che aggiornano direttamente inputState
};


// ====================================================================================
// ===== EVENT LISTENERS PER GLI INPUT UI (BOTTONI) =====
// ====================================================================================

/**
 * Event Listener per i bottoni dell'interfaccia utente (UI) (es. su schermi touch)
 * Viene attivato solo dopo che il DOM è stato completamente caricato
 */
document.addEventListener("DOMContentLoaded", () => {
    // Raccoglie tutti i bottoni di combattimento e movimento dalla pagina
    const buttons = Array.from(document.querySelectorAll(".combat-btn, .move-btn"));

    // --- Gestione dei click sui bottoni di movimento e combattimento ---
    for (let button of buttons) {
        button.addEventListener("click", () => {
            // Ignora il click se lo stato del gioco ha bloccato gli input di combattimento (es. durante l'animazione)
            if (globals.combatInputLocked) return; 

            // Estrae il tipo di input (es. 'sword', 'up') dall'ID del bottone
            const input = button.id.replace("-btn", ""); 
            
            if (button.classList.contains("move-btn")) {
                // Se è un bottone di movimento, imposta lo stato a 'true' (simula il 'keydown')
                inputState.movement[input] = true;
            } else if (button.classList.contains("combat-btn")) {
                // Se è un bottone di combattimento, imposta lo stato a 'true'
                inputState.combat[input] = true;
                // Blocca immediatamente altri click, in attesa che il ciclo di combattimento sblocchi l'input
                globals.combatInputLocked = true; 
            }
        });
    }

    // --- Gestione specifica del bottone di interazione ---
    document.getElementById("interact-btn").onclick = () => {
        // Chiama direttamente la funzione di interazione del giocatore
        player.interact();
    }
});


// ====================================================================================
// ===== EVENT LISTENERS PER GLI INPUT DA TASTIERA (KEYBOARD) =====
// ====================================================================================

/**
 * Event Listener per la pressione di un tasto (keydown)
 * Imposta a 'true' il flag corrispondente nella mappa inputState
 */
document.addEventListener('keydown', event => {
    switch (event.key) {
        // --- Movimento (traslazione) ---
        case 'ArrowUp':
            inputState.movement.up = true;
            break;
        case 'ArrowDown':
            inputState.movement.down = true;
            break;
        case 'ArrowLeft':
            inputState.movement.left = true;
            break;
        case 'ArrowRight':
            inputState.movement.right = true;
            break;
        // --- Rotazione (Look) ---
        case 'z':
            inputState.movement.turnLeft = true;
            break;
        case 'x':
            inputState.movement.turnRight = true;
            break;
        // --- Interazione ---
        case ' ': // Tasto spacebar
            player.interact(); // L'interazione è un'azione istantanea, non un flag da mantenere premuto
            break;
    }
});

/**
 * Event listener per il rilascio di un tasto (keyup)
 * Imposta a 'false' il flag corrispondente per interrompere l'azione
 */
document.addEventListener('keyup', event => {
    switch (event.key) {
        // --- Movimento (traslazione) ---
        case 'ArrowUp':
            inputState.movement.up = false;
            break;
        case 'ArrowDown':
            inputState.movement.down = false;
            break;
        case 'ArrowLeft':
            inputState.movement.left = false;
            break;
        case 'ArrowRight':
            inputState.movement.right = false;
            break;
        // --- Rotazione (look) ---
        case 'z':
            inputState.movement.turnLeft = false;
            break;
        case 'x':
            inputState.movement.turnRight = false;
            break;
        // Le azioni istantanee come 'interact' (Spacebar) non hanno bisogno di un keyup
    }
});