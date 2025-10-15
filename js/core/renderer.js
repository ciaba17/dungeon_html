import { globals } from '../utils/globals.js';
import { walls } from '../game/mapObjects.js';
import { player } from '../game/player.js';

function scaleCanvas(ctx) {
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

function drawWalls(ctx, walls) {
    walls.forEach(wall => wall.draw(ctx));
}

export function render() {
    const ctx = globals.canvas.getContext('2d'); // Crea contesto 2D di rendering

    scaleCanvas(ctx);

    // Pulisce lo schermo
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT);

    // Disegna gli oggetti
    drawWalls(ctx, walls);
    player.draw(ctx);
}
