import { globals, textures } from '../utils/globals.js';
import { walls } from '../game/mapObjects.js';
import { player } from '../game/player.js';
import { rays } from './raycaster.js';

export const renderer = {
    gameCtx: null,
    mapCtx: null,
}
const distanceProjectionPlane = (globals.SCREEN_WIDTH / 2) / Math.tan((globals.fov * Math.PI / 180) / 2); // Distanza virtuale tra il giocatore e lo schermo di proiezione


function drawWalls2D(ctx, walls) { // Disegna tutti i muri
    walls.forEach(wall => wall.draw(ctx));
}

function drawWalls3D(ctx, wallSlices) {
    const sliceWidth = globals.SCREEN_WIDTH / globals.rayNumber;
    for (let i = 0; i < rays.length; i++) {
        const slice = wallSlices[i];
        const top = globals.SCREEN_HEIGHT / 2 - slice.height / 2;
        const bottom = globals.SCREEN_HEIGHT / 2 + slice.height / 2;
        if(slice.texture) {
            // Disegna parte della texture corrispondente
            ctx.drawImage(
                slice.texture,
                slice.textureX, 0, 1, slice.texture.height, // Parte della texture
                i * sliceWidth, top, sliceWidth, slice.height // Sullo schermo
            );
        } else {
            // Fallback colore semplice
            ctx.fillStyle = "white";
            ctx.fillRect(i * sliceWidth, top, sliceWidth, slice.height);
        }
    }
}



export function render() {
    const gameCtx = renderer.gameCtx; 
    const mapCtx = renderer.mapCtx; 

    // Pulisce gli schermi
    gameCtx.fillStyle = "rgba(134, 134, 134, 1)";
    gameCtx.fillRect(0, globals.SCREEN_HEIGHT/2, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT/2);
    gameCtx.fillStyle = "rgba(101, 170, 235, 1)";
    gameCtx.fillRect(0, 0, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT/2);
    
    mapCtx.fillStyle = 'black';
    mapCtx.fillRect(0, 0, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT);

    // Disegna gli oggetti
    drawWalls2D(mapCtx, walls);
    player.draw(mapCtx);
    rays.forEach(ray => ray.draw(mapCtx));


    // Dati per il rendering
    const wallSlices = rays.map(ray => {
        const wallHeight = (globals.tileSize / ray.distance) * distanceProjectionPlane; // Altezza del muro
        return {
            x: null, // Posizione sullo schermo in pixel
            texture: textures.wallTexture,
            height: wallHeight,
            distance: ray.correctedDistance,
            textureX: Math.floor(((ray.hitVertical ? ray.hitY : ray.hitX) % globals.tileSize) / globals.tileSize * textures.wallTexture.width), // Posizione sulla texture orizzontale
        }
    });
    drawWalls3D(gameCtx, wallSlices);
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
