// timer.js - Funzione factory per la creazione di un oggetto timer basato su deltaTime, 
// che garantisce un conteggio del tempo coerente indipendentemente dagli FPS del gioco.

/**
 * Crea e restituisce un nuovo oggetto Timer.
 * * @param {number} duration La durata del timer in secondi.
 * @returns {Object} Un oggetto timer con metodi 'update' e 'reset'.
 */
export function createTimer(duration) { 
    return {
        // --- Proprietà Interne ---
        time: 0,                   // Tempo accumulato (in secondi, come delta)
        duration: duration,        // Durata target (in secondi, come specificato nel parametro)
        running: true,             // Stato attuale del timer

        // --- Metodi ---

        /**
         * Aggiorna lo stato del timer.
         * * @param {number} delta Il tempo trascorso dall'ultimo frame (deltaTime) in secondi.
         */
        update(delta) {
            if (!this.running) return;

            this.time += delta; // Accumula il tempo trascorso (delta)
            
            // Verifica se il timer ha raggiunto o superato la durata
            if (this.time >= this.duration) {
                this.running = false; // Ferma il timer
            }
        },

        /**
         * Resetta il timer, riportando il tempo a zero e riavviandolo.
         */
        reset() {
            this.time = 0;
            this.running = true;
        }
    }
}