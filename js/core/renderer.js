import { globals, textures } from '../utils/globals.js';
import { walls } from '../game/objects.js';
import { player } from '../game/player.js';
import { rays } from './raycaster.js';
import { renderCombat } from '../game/combat.js';


export const contexts = {
    gameCtx: null,
    mapCtx: null,
}

const distanceProjectionPlane = (globals.SCREEN_WIDTH / 2) / Math.tan((globals.fov * Math.PI / 180) / 2); // Distanza virtuale tra il giocatore e lo schermo di proiezione


function drawWalls2D(ctx, walls) { // Disegna tutti i muri
    walls.forEach(wall => wall.draw2D(ctx));
}

function drawWalls3D(ctx) {
    const sliceWidth = globals.SCREEN_WIDTH / globals.rayNumber;
    globals.wallSlices = [];

    rays.forEach((ray, i) => {
        // La texture viene presa direttamente dal muro colpito
        const texture = ray.hitWall ? ray.hitWall.texture : textures.errorTexture;
        ;

        // Posizione della slice sulla texture
        const textureX = ray.hitVertical
            ? Math.floor((ray.hitY % globals.tileSize) / globals.tileSize * texture.width)
            : Math.floor((ray.hitX % globals.tileSize) / globals.tileSize * texture.width);

        const height = (globals.tileSize / ray.distance) * distanceProjectionPlane;

        globals.wallSlices.push({
            texture: texture,
            height: height,
            distance: ray.correctedDistance,
            textureX: textureX
        });
    });

    globals.wallSlices.forEach((slice, i) => {
        const top = globals.SCREEN_HEIGHT / 2 - slice.height / 2;
        ctx.globalAlpha = Math.exp(-slice.distance / (globals.VIEW_DISTANCE * 0.7));
        ctx.drawImage(
            slice.texture,
            slice.textureX, 0, 1, slice.texture.height,
            i * sliceWidth, top, sliceWidth, slice.height
        );
    });

    ctx.globalAlpha = 1;
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

    if (globals.gameState === "exploration") {
        // Disegna gli oggetti nella minimappa
        drawWalls2D(mapCtx, walls);
        player.draw2D(mapCtx);
        rays.forEach(ray => ray.draw(mapCtx));
        globals.entities.forEach(entity => {entity.draw2D(mapCtx)});

        mapCtx.restore(); // Ripristina lo stato originale
        
        // Disegna la vista 3D
        drawWalls3D(gameCtx);
        globals.entities.sort((a, b) => a.distance - b.distance); // Ordina per distanza le entità
        globals.entities.forEach(entity => {entity.draw3D(gameCtx)})
        
    } else if (globals.gameState === "combat") {
        renderCombat(gameCtx);
    }
}



