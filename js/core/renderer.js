import { globals } from '../utils/globals.js';
import { walls } from '../game/mapObjects.js';
import { player } from '../game/player.js';
import { rays } from './raycaster.js';


function drawWalls2D(ctx, walls) { // Disegna tutti i muri
    walls.forEach(wall => wall.draw(ctx));
}

function drawWalls3D(ctx) {
    for (let [i, ray] of rays.entries()) { // Si utilizza entries per avere l'indice del raggio
        const wallLength = 20000/ray.correctedDistance;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(globals.SCREEN_WIDTH/2 - globals.rayNumber + i * 6 , globals.SCREEN_HEIGHT/2 - wallLength/2);
        ctx.lineTo(globals.SCREEN_WIDTH/2 - globals.rayNumber + i * 6, globals.SCREEN_HEIGHT/2 + wallLength/2);
        ctx.strokeStyle = 'rgb(255,0,0)';
        ctx.stroke();
    }
}



export function render() {
    const ctx = globals.canvas.getContext('2d'); // Crea contesto 2D di rendering

    // Pulisce lo schermo
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT);

    // Disegna gli oggetti
    drawWalls2D(ctx, walls);
    player.draw(ctx);
    rays.forEach(ray => ray.draw(ctx));

    drawWalls3D(ctx)
}



export function scaleCanvas() { // Scala il canvas per adattarlo alla finestra mantenendo le proporzioni
    const ctx = globals.canvas.getContext('2d');
    // Le dimensioni del canvas concettuale diventano quelle del canvas fisico (in pixel dello schermo effettivi)
    globals.canvas.width = globals.canvas.clientWidth;
    globals.canvas.height = globals.canvas.clientHeight;

    // Fattori di scala rispetto al mondo logico
    const scaleX = globals.canvas.width / globals.SCREEN_WIDTH;
    const scaleY = globals.canvas.height / globals.SCREEN_HEIGHT;
    const scale = Math.min(scaleX, scaleY); // Usa la scala minore per mantenere le proporzioni

    // Centra il mondo
    const offsetX = (globals.canvas.width - globals.SCREEN_WIDTH * scale) / 2;
    const offsetY = (globals.canvas.height - globals.SCREEN_HEIGHT * scale) / 2;

    // Imposta la trasformazione
    ctx.setTransform(scale, 0, 0, scale, offsetX / scale, offsetY / scale);
}


window.addEventListener("resize", () => {
    scaleCanvas();
});
