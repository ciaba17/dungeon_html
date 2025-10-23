import { globals } from '../utils/globals.js';
import { player } from './player.js';

export function mostraDialoghi(id) {
    const container = document.getElementById("info-container");
    const textboxContent = globals.textBoxContent;
    const dialogo = globals.dialoghi[id];
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
    container.onclick = () => {
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

