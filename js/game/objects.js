import { globals, textures } from '../utils/globals.js';
import { player } from './player.js';

export const walls = [];


class Wall {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, globals.tileSize, globals.tileSize);
    }
}

export function mapToWalls(id) {
    const map = globals.maps[id]; // Usa la mappa caricata
    console.log(globals.maps, globals.maps[id]);

    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            if (map[i][j] == 1) { // 1 Rappresenta un muro
                walls.push(new Wall(j * globals.tileSize, i * globals.tileSize));
            }
        }
    }
}

export class Entity {
    constructor(x, y, z = 0, scale, name, texture, interactable) {
        this.x = x * globals.tileSize - globals.tileSize / 2; 
        this.y = y * globals.tileSize - globals.tileSize / 2;
        this.z = z - 10;
        this.scale = scale / 10;
        this.name = name;
        this.texture = texture;
        this.interactable = interactable;
        this.onScreen = true;
    }

    draw3D(ctx) {
        const distanceProjectionPlane = (globals.SCREEN_WIDTH / 2) / Math.tan((globals.fov * Math.PI / 180) / 2);

        let dx = this.x - player.x;
        let dy = this.y - player.y;

        const dirX = Math.cos(player.angle * Math.PI / 180);
        const dirY = Math.sin(player.angle * Math.PI / 180);

        const fovScale = globals.fov / 100;
        const planeX = -Math.sin(player.angle * Math.PI / 180) * fovScale;  
        const planeY = Math.cos(player.angle * Math.PI / 180) * fovScale;

        const invDet = 1 / (planeX * dirY - dirX * planeY);
        const transformX = invDet * (dirY * dx - dirX * dy);
        const transformY = invDet * (-planeY * dx + planeX * dy);

        if (transformY <= 0) return; // dietro il player
        const depth = Math.max(transformY, 0.1); // evita valori troppo piccoli

        // Calcola dimensioni sprite proporzionali alla distanza
        let spriteHeight = this.texture.height / depth * distanceProjectionPlane * this.scale;
        let spriteWidth  = this.texture.width  / depth * distanceProjectionPlane * this.scale;


        const spriteScreenX = (globals.SCREEN_WIDTH / 2) * (1 + transformX / transformY) - spriteWidth / 2;
        const spriteScreenY = globals.SCREEN_HEIGHT / 2 - (this.z * distanceProjectionPlane / transformY) - spriteHeight / 2;

        // Se lo sprite è completamente fuori schermo, non disegnarlo
        if (spriteScreenX + spriteWidth < 0 || spriteScreenX > globals.SCREEN_WIDTH) return;


        // Disegna lo sprite a colonne per depth
        const textureWidth = this.texture.width;
        for (let x = 0; x < spriteWidth; x++) {


            let screenX = Math.floor(spriteScreenX + x);
            if (screenX < 0 || screenX >= globals.SCREEN_WIDTH) continue;
            const sliceIndex = Math.floor(screenX * globals.wallSlices.length / globals.SCREEN_WIDTH);
            if (!globals.wallSlices[sliceIndex]) continue;
            // controlla la distanza con il depth buffer dei muri
            if (transformY < globals.wallSlices[sliceIndex].distance) {
                // colonna corrispondente nella texture
                const textureX = Math.floor((x / spriteWidth) * textureWidth);
                ctx.drawImage(
                    this.texture,
                    textureX, 0, 1, this.texture.height, // 1px verticale dalla texture
                    screenX, spriteScreenY, 1, spriteHeight // disegna scalato
                );
            }
        }
    }


    draw2D(ctx) {
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}

