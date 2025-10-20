import { globals, textures } from '../utils/globals.js';
import { walls } from '../game/objects.js';
import { player } from '../game/player.js';
import { rays } from './raycaster.js';

//PROVVISORIO
import { enemies } from '../game/enemies.js';

export const context = {
    gameCtx: null,
    mapCtx: null,
}
const distanceProjectionPlane = (globals.SCREEN_WIDTH / 2) / Math.tan((globals.fov * Math.PI / 180) / 2); // Distanza virtuale tra il giocatore e lo schermo di proiezione


function drawWalls2D(ctx, walls) { // Disegna tutti i muri
    walls.forEach(wall => wall.draw(ctx));
}

function drawWalls3D(ctx) {
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

    const sliceWidth = globals.SCREEN_WIDTH / globals.rayNumber; // Larghezza di una linea del muro
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
    const gameCtx = context.gameCtx; 
    const mapCtx = context.mapCtx; 

    // Pulisce gli schermi
    //gameCtx.fillStyle = "rgba(134, 134, 134, 1)";
    gameCtx.fillStyle = "rgba(0, 0, 0, 1)";
    gameCtx.fillRect(0, globals.SCREEN_HEIGHT/2, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT/2);
    //gameCtx.fillStyle = "rgba(101, 170, 235, 1)";
    gameCtx.fillStyle = "rgba(0, 0, 0, 1)";
    gameCtx.fillRect(0, 0, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT/2);
    
    mapCtx.fillStyle = 'black';
    mapCtx.fillRect(0, 0, globals.tileSize * globals.tileNumber, globals.tileSize * globals.tileNumber);

    // Disegna gli oggetti nella minimappa
    drawWalls2D(mapCtx, walls);
    player.draw(mapCtx);
    rays.forEach(ray => ray.draw(mapCtx));
    enemies.forEach(monster => {monster.draw2D(mapCtx)});
    
    // Disegna la vista 3D
    drawWalls3D(gameCtx);
    enemies.forEach(monster => {monster.draw3D(gameCtx)});

}



