import { globals } from '../utils/globals.js';
import { walls } from '../game/mapObjects.js';
import { player } from '../game/player.js';
import { rays } from './raycaster.js';

export const renderer = {
    gameCtx: null,
    mapCtx: null,
}

function drawWalls2D(ctx, walls) { // Disegna tutti i muri
    walls.forEach(wall => wall.draw(ctx));
}

function drawWalls3D(ctx) {
    const pixelWidth = globals.SCREEN_WIDTH / globals.rayNumber;
    ctx.beginPath();
    for (let [i, ray] of rays.entries()) { // Si utilizza entries per avere l'indice e il raggio per ogni iterazione dell'array
        const wallLength = 20000/ray.correctedDistance;
        ctx.lineWidth = pixelWidth
        //let a = 255/ray.correctedDistance * 80
        //ctx.strokeStyle = "rgb(" + a + ", " + a + ", " + a + ")";
        ctx.strokeStyle = "white";
        ctx.moveTo(i * pixelWidth, globals.SCREEN_HEIGHT/2 - wallLength/2);
        ctx.lineTo(i * pixelWidth, globals.SCREEN_HEIGHT/2 + wallLength/2);
    }
    
    ctx.stroke();

}



export function render() {
    const gameCtx = renderer.gameCtx; 
    const mapCtx = renderer.mapCtx; 

    // Pulisce gli schermi
    gameCtx.fillStyle = 'black';
    gameCtx.fillRect(0, 0, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT);
    mapCtx.fillStyle = 'black';
    mapCtx.fillRect(0, 0, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT);

    // Disegna gli oggetti
    drawWalls2D(mapCtx, walls);
    player.draw(mapCtx);
    rays.forEach(ray => ray.draw(mapCtx));

    drawWalls3D(gameCtx)
}



export function scaleCanvas(canvas, ctx) { // Scala il canvas per adattarlo alla finestra mantenendo le proporzioni
    // Le dimensioni del canvas concettuale diventano quelle del canvas fisico (in pixel dello schermo effettivi)
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Fattori di scala rispetto al mondo logico
    const scaleX = canvas.width / globals.SCREEN_WIDTH;
    const scaleY = canvas.height / globals.SCREEN_HEIGHT;
    const scale = Math.min(scaleX, scaleY); // Usa la scala minore per mantenere le proporzioni

    // Centra il mondo
    const offsetX = (canvas.width - globals.SCREEN_WIDTH * scale) / 2;
    const offsetY = (canvas.height - globals.SCREEN_HEIGHT * scale) / 2;

    // Imposta la trasformazione
    ctx.setTransform(scale, 0, 0, scale, offsetX / scale, offsetY / scale);
}


window.addEventListener("resize", () => {
    scaleCanvas(globals.gameCanvas, renderer.gameCtx);
    scaleCanvas(globals.mapCanvas, renderer.mapCtx);
});
