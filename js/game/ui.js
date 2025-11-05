// ui.js - Modulo dedicato alla gestione dell'interfaccia utente, in particolare 
// l'apparizione animata dei testi di dialogo.

// ====================================================================================
// ===== IMPORTAZIONI DI MODULI ESTERNI =====
// ====================================================================================

import { globals } from '../utils/globals.js';
import { player } from './player.js'; // L'oggetto player (per disattivare l'interazione)
// import { showElement, hideElement } from '../utils/cssHandler.js'; // Utili per mostrare/nascondere elementi UI.

// ====================================================================================
// ===== VARIABILI GLOBALI E SETUP =====
// ====================================================================================

// Riferimento al gestore di eventi per l'avanzamento (necessario per rimuoverlo in seguito)
let dialogueAdvanceHandler = null; 

// Riferimento al bottone di interazione HTML
const interactButton = document.getElementById("interact-btn");

// ====================================================================================
// ===== FUNZIONE PRINCIPALE: showDialogues =====
// ====================================================================================

/**
 * Avvia la visualizzazione di una sequenza di dialoghi con effetto "typing".
 * Gestisce l'avanzamento e la conclusione dell'interazione.
 * @param {string} id L'ID del dialogo da caricare dalla collezione globals.dialogues.
 */
export function showDialogues(id) {
    const container = document.getElementById("info-container"); // Contenitore generale (per il click)
    const textboxContent = document.getElementById("textbox-content"); // L'elemento che contiene il testo
    const INTERVAL_TIME = 20; // Velocità del testo: millisecondi tra un carattere e l'altro.

    // 1. Pulisce l'handler precedente per evitare doppi gestori
    if (dialogueAdvanceHandler) {
        container.removeEventListener('click', dialogueAdvanceHandler);
        document.removeEventListener('keydown', dialogueAdvanceHandler);
        interactButton.removeEventListener('click', dialogueAdvanceHandler); // Rimuove anche dal bottone "Interact"
    }
    
    // Ferma qualsiasi animazione di dialogo precedente
    if (globals.currentDialogueInterval) {
        clearInterval(globals.currentDialogueInterval);
        globals.currentDialogueInterval = null; // Pulisce il riferimento globale.
    }

    let i = 0; // Indice del dialogo corrente nell'array (riga di testo).
    let j = 0; // Indice del carattere corrente nella riga.

    // --- Logica di Selezione del Dialogo (Random/Sequenziale) ---
    const randomChoiceKeys = [
        "sword_player", "shield_player", "magic_player",
        "sword_enemy", "shield_enemy", "magic_enemy",
        "draw", "victory_player", "victory_enemy"
    ];
    
    const dialogueOptions = globals.dialogues[id];
    let dialogue; 

    // Gestione della scelta casuale vs sequenziale
    if (randomChoiceKeys.includes(id) && Array.isArray(dialogueOptions) && dialogueOptions.every(Array.isArray)) {
        const randomChoice = dialogueOptions[Math.floor(Math.random() * dialogueOptions.length)];
        dialogue = randomChoice; 
    } else {
        dialogue = dialogueOptions;
    }
    
    if (!dialogue) return; // Se il dialogo non esiste, esci.
    // -----------------------------------------------------------


    /**
     * Fa avanzare il testo di un singolo carattere.
     */
    function textForward() {
        if (!dialogue[i] || j >= dialogue[i].length) {
            clearInterval(globals.currentDialogueInterval);
            globals.currentDialogueInterval = null;
            return;
        }

        textboxContent.textContent += dialogue[i][j];
        j++;

        // Se la riga è terminata, ferma l'animazione in attesa del click/tasto.
        if (j >= dialogue[i].length) {
            clearInterval(globals.currentDialogueInterval);
            globals.currentDialogueInterval = null;
        }
    }

    /**
     * Inizializza o fa avanzare alla riga successiva.
     */
    function showDialogue() {
        if (i < dialogue.length) {
            // Prepara la nuova riga
            textboxContent.textContent = "";
            j = 0;
            
            // Avvia l'intervallo per l'effetto "typing"
            globals.currentDialogueInterval = setInterval(textForward, INTERVAL_TIME);
        } else { // Tutti i dialoghi sono finiti
            
            // Logica di Conclusione dialogo
            if (player.interacting) {
                player.exitInteract(); 
            }
            
            // Resetta la textbox
            if (id !== "blank_dialogue") {
                showDialogues("blank_dialogue"); 
            }

            // Gestione della fine del gioco/demo
            if (id === "demo_end") { 
                // Rimuove l'handler finale prima di reindirizzare
                container.removeEventListener('click', dialogueAdvanceHandler);
                document.removeEventListener('keydown', dialogueAdvanceHandler);
                interactButton.removeEventListener('click', dialogueAdvanceHandler); // Rimuove anche qui
                
                setTimeout(() => {
                    location.href = "index.html"; // Torna alla pagina principale
                }, 2000); 
            }
        }
    }

    /**
     * Gestore unico per l'avanzamento del testo (usato da click, tastiera 'E', e bottone 'Interact').
     * @param {Event} event Evento di click o keydown.
     */
    dialogueAdvanceHandler = (event) => {
        // Intercetta solo il tasto 'e' o 'E' se l'evento è KeyDown
        // Il click sul container o sul bottone passa senza filtri.
        if (event.type === 'keydown' && event.key.toLowerCase() !== 'e') return; 

        if (i >= dialogue.length) return; // Se tutti i dialoghi sono finiti, ignora.

        if (globals.currentDialogueInterval) {
            // Caso 1: Salta l'animazione della riga corrente (se l'intervallo è attivo)
            textboxContent.textContent = dialogue[i];
            j = dialogue[i].length;
            clearInterval(globals.currentDialogueInterval);
            globals.currentDialogueInterval = null;
        } else {
            // Caso 2: Passa alla riga successiva (se l'animazione è ferma)
            i++;
            showDialogue();
        }
    }
    
    // 2. Associa il gestore a tutti e tre gli input:
    // A. Click sul contenitore del dialogo
    container.addEventListener('click', dialogueAdvanceHandler);
    // B. Pressione del tasto 'E'
    document.addEventListener('keydown', dialogueAdvanceHandler);
    // C. Click sul bottone 'Interact'
    interactButton.addEventListener('click', dialogueAdvanceHandler); 

    // Inizializza il primo dialogo
    showDialogue();
}