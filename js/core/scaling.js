import { globals } from "../utils/globals.js";
import { contexts } from "./renderer.js";

export function scaleCanvas(canvas, ctx, width, height) { // Scala il canvas per adattarlo alla finestra mantenendo le proporzioni
    // Le dimensioni del canvas concettuale diventano quelle del canvas fisico (in pixel dello schermo effettivi)
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Fattori di scala rispetto al mondo logico
    const scaleX = canvas.width / width;
    const scaleY = canvas.height / height;
    const scale = Math.min(scaleX, scaleY); // Usa la scala minore per mantenere le proporzioni

    // Centra il mondo
    const offsetX = (canvas.width - width * scale) / 2;
    const offsetY = (canvas.height - height * scale) / 2;


    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    
}

export function fitGameMap() { 
    const container = document.getElementById('map-container');

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Mantieni l'aspect ratio della minimappa (lato più piccolo)
    const mapAspect = (globals.MAP_WIDTH) / (globals.MAP_HEIGHT);
    let finalWidth, finalHeight;

    if (containerWidth / containerHeight > mapAspect) {
        // container più largo: limita l'altezza
        finalHeight = containerHeight;
        finalWidth = containerHeight * mapAspect;
    } else {
        // container più stretto: limita la larghezza
        finalWidth = containerWidth;
        finalHeight = containerWidth / mapAspect;
    }

    globals.mapCanvas.style.width = finalWidth + 'px';
    globals.mapCanvas.style.height = finalHeight + 'px';
}



window.addEventListener("resize", () => {
    scaleCanvas(globals.gameCanvas, contexts.gameCtx, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT);
    fitGameMap(); // Da chiamare prima di scalare la mappa
    scaleCanvas(globals.mapCanvas, contexts.mapCtx, globals.MAP_WIDTH, globals.MAP_HEIGHT);
});




