// ui.js - Modulo dedicato alla gestione dell'interfaccia utente, in particolare 
// l'apparizione animata dei testi di dialogo.

// ====================================================================================
// ===== IMPORTAZIONI DI MODULI ESTERNI =====
// ====================================================================================

import { globals } from '../utils/globals.js';
import { player } from './player.js'; // L'oggetto player (per disattivare l'interazione)
// import { showElement, hideElement } from '../utils/cssHandler.js'; // Non usate direttamente qui, ma sono utili.


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

    // Ferma qualsiasi dialogo precedente per evitarne la sovrapposizione.
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

    // Se l'ID è nella lista delle scelte casuali E le opzioni sono un array (di array di stringhe)
    if (randomChoiceKeys.includes(id) && Array.isArray(dialogueOptions) && dialogueOptions.every(Array.isArray)) {
        // Scegli un'opzione casuale e la imposta come unico dialogo da mostrare.
        const randomChoice = dialogueOptions[Math.floor(Math.random() * dialogueOptions.length)];
        dialogue = randomChoice; 
    } else {
        // Altrimenti, usa l'array di dialoghi completo.
        dialogue = dialogueOptions;
    }
    
    if (!dialogue) return; // Se il dialogo non esiste, esci.
    // -----------------------------------------------------------


    /**
     * Fa avanzare il testo di un singolo carattere.
     */
    function textForward() {
        // Condizione di arresto: se non c'è una riga o la riga è finita.
        if (!dialogue[i] || j >= dialogue[i].length) {
            clearInterval(globals.currentDialogueInterval);
            globals.currentDialogueInterval = null;
            return;
        }

        textboxContent.textContent += dialogue[i][j];
        j++;

        // Se la riga è terminata, ferma l'animazione in attesa del click.
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
            
            // --- Logica di Conclusione ---
            if (player.interactingWithNpc) {
                player.exitInteract(); 
            }
            
            // Gestione della fine della demo
            if (id === "demo_end") { 
                setTimeout(() => {
                    location.href = "index.html"; // Torna alla pagina principale
                }, 5000); // 5 secondi
            }

            // Resetta la textbox con un dialogo vuoto per pulizia (se non è già il reset)
            if (id !== "blank_dialogue") {
                showDialogues("blank_dialogue") 
            }
            
        }
    }

    /**
     * Gestore del click per avanzare il testo o saltare l'animazione.
     */
    container.onclick = () => {
        if (i >= dialogue.length) return; // Se tutti i dialoghi sono finiti, ignora.

        if (j < dialogue[i].length) {
            // Caso 1: Salta l'animazione della riga corrente
            textboxContent.textContent = dialogue[i];
            j = dialogue[i].length;
            clearInterval(globals.currentDialogueInterval);
            globals.currentDialogueInterval = null;
        }
        else {
            // Caso 2: Passa alla riga successiva
            i++;
            showDialogue();
        }
    }

    // Inizializza il primo dialogo
    showDialogue();
}