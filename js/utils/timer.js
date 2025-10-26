export function createTimer(duration) { // Crea un oggetto timer
    return {
        time: 0,
        duration: duration * 1000, // Trasforma da secondi(dati come parametro) in millisecondi
        running: true,

        update(delta) {
            if (!this.running) return;

            this.time += delta;
            if (this.time >= this.duration) {
                this.running = false;
            }
        },

        reset() {
            this.time = 0;
            this.running = true;
        }
    }
}