import { globals, textures } from '../utils/globals.js';
import { walls } from '../game/objects.js';
import { player } from '../game/player.js';
import { rays } from './raycaster.js';


export const contexts = {
    gameCtx: null,
    mapCtx: null,
}

const distanceProjectionPlane = (globals.SCREEN_WIDTH / 2) / Math.tan((globals.fov * Math.PI / 180) / 2); // Distanza virtuale tra il giocatore e lo schermo di proiezione


function drawWalls2D(ctx, walls) { // Disegna tutti i muri
    walls.forEach(wall => wall.draw(ctx));
}

function drawWalls3D(ctx) {
    // Dati per il rendering
    globals.wallSlices = []; // Resetta l'array delle slice dei muri
    globals.wallSlices = rays.map(ray => {
        return {
            texture: textures.wallTexture,
            height: (globals.tileSize / ray.distance) * distanceProjectionPlane, // Altezza del muro
            distance: ray.correctedDistance,
            textureX: Math.floor(((ray.hitVertical ? ray.hitY : ray.hitX) % globals.tileSize) / globals.tileSize * textures.wallTexture.width), // Posizione sulla texture orizzontale
        }
    });

    const sliceWidth = globals.SCREEN_WIDTH / globals.rayNumber; // Larghezza di una linea del muro
    for (let i = 0; i < rays.length; i++) {
        const slice = globals.wallSlices[i];
        const top = globals.SCREEN_HEIGHT / 2 - slice.height / 2;
        ctx.drawImage(
            slice.texture,
            slice.textureX, 0, 1, slice.texture.height, // Parte della texture
            i * sliceWidth, top, sliceWidth, slice.height // Sullo schermo
        );

        
    }
}



export function render() {
    const gameCtx = contexts.gameCtx; 
    const mapCtx = contexts.mapCtx; 

    // Pulisce gli schermi
    gameCtx.fillStyle = "rgba(0, 0, 0, 1)";
    gameCtx.fillRect(0, 0, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT);
    
    const mapContainer = document.getElementById("map-container")
    mapCtx.fillStyle = 'black';
    mapCtx.fillRect(0, 0, globals.MAP_WIDTH, globals.MAP_HEIGHT);

    mapCtx.save(); // Salva lo stato corrente del contesto
    const mapCenterX = mapContainer.clientWidth / 2;
    const mapCenterY = mapContainer.clientHeight / 2;
    mapCtx.scale(globals.mapZoom, globals.mapZoom);
    mapCtx.translate(mapCenterX - player.x, mapCenterY - player.y); // Trasla il contesto in modo che il player sia al centro

    // Disegna gli oggetti nella minimappa
    drawWalls2D(mapCtx, walls);
    player.draw(mapCtx);
    rays.forEach(ray => ray.draw(mapCtx));
    globals.entities.forEach(entity => {entity.draw2D(mapCtx)});
    globals.entities.forEach(obj => {obj.draw2D(mapCtx)})

    mapCtx.restore(); // Ripristina lo stato originale
    
    // Disegna la vista 3D
    drawWalls3D(gameCtx);
    globals.entities.sort((a, b) => a.distance - b.distance);
    globals.entities.forEach(entity => {entity.draw3D(gameCtx)})

}



