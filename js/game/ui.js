import { globals } from '../utils/globals.js';


export function showDialogues(id) {
    const container = document.getElementById("info-container");
    const textboxContent = document.getElementById("textbox-content")
    const INTERVAL_TIME = 20; // Velocità del testo: più è bassa più è veloce

    // Ferma qualsiasi dialogo precedente prima di iniziarne uno nuovo.
    if (globals.currentDialogueInterval) {
        clearInterval(globals.currentDialogueInterval);
    }

    let i = 0;
    let j = 0;
    // 'interval' non è più una 'let', useremo direttamente 'globals.currentDialogueInterval'

    // ... (Qui va la tua logica 'randomChoiceKeys' che ti ho dato prima)
    // ... (per scegliere 'dialogue' in modo casuale o sequenziale)
    const randomChoiceKeys = [
        "sword_player", "shield_player", "magic_player",
        "sword_enemy", "shield_enemy", "magic_enemy",
        "draw", "victory_player", "victory_enemy"
    ];
    const dialogueOptions = globals.dialogues[id];
    let dialogue; 
    if (randomChoiceKeys.includes(id) && Array.isArray(dialogueOptions)) {
        const randomChoice = dialogueOptions[Math.floor(Math.random() * dialogueOptions.length)];
        dialogue = [randomChoice]; 
    } else {
        dialogue = dialogueOptions;
    }
    if (!dialogue) return;
    // ... (Fine logica 'randomChoiceKeys')


    function textForward() {
        if (!dialogue[i] || j >= dialogue[i].length) {
            // --- MODIFICA 2: Pulisci l'intervallo GLOBALE ---
            clearInterval(globals.currentDialogueInterval);
            globals.currentDialogueInterval = null;
            return;
        }

        textboxContent.textContent += dialogue[i][j];
        j++;

        if (j >= dialogue[i].length) {
            // --- MODIFICA 3: Pulisci l'intervallo GLOBALE ---
            clearInterval(globals.currentDialogueInterval);
            globals.currentDialogueInterval = null;
        }
    }

    function showDialogue() {
        if (i < dialogue.length) {
            textboxContent.textContent = "";
            j = 0;
            // --- MODIFICA 4: Assegna all'intervallo GLOBALE ---
            globals.currentDialogueInterval = setInterval(textForward, INTERVAL_TIME);
        }
    }

    container.onclick = () => {
        if (i >= dialogue.length) return;

        if (j < dialogue[i].length) {
            textboxContent.textContent = dialogue[i];
            j = dialogue[i].length;
            // --- MODIFICA 5: Pulisci l'intervallo GLOBALE ---
            clearInterval(globals.currentDialogueInterval);
            globals.currentDialogueInterval = null;
        }
        else {
            i++;
            showDialogue();
        }
    }

    showDialogue();
}