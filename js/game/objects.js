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
    constructor(x, y, z = 0, scale, name, texture) { // z = altezza oggetto
        this.x = x * globals.tileSize - globals.tileSize / 2; 
        this.y = y * globals.tileSize - globals.tileSize / 2;
        this.z = z - 10; // altezza in pixel o unità virtuali
        this.scale = scale / 10;
        this.name = name;
        this.texture = texture;
    }

    draw3D(ctx) {
        // Distanza virtuale tra il giocatore e lo schermo di proiezione DA METTERE IN GLOBALS
        const distanceProjectionPlane = (globals.SCREEN_WIDTH / 2 ) / Math.tan((globals.fov * Math.PI / 180) / 2); 

        // Distanza oggetto-giocatore
        let dx = this.x - player.x;
        let dy = this.y - player.y;

        // Direzione del giocatore
        let dirX = Math.cos(player.angle * Math.PI / 180);
        let dirY = Math.sin(player.angle * Math.PI / 180);

        // Calcolo del piano della camera: serve a sapere la larghezza del campo visivo
        const fovScale = globals.fov / 100;
        const planeX = -Math.sin(player.angle * Math.PI / 180) * fovScale;  
        const planeY = Math.cos(player.angle * Math.PI / 180) * fovScale;

        // Trasforma da coordinate a spazio sulla camera (non sul canvas))
        let invDet = 1 / (planeX * dirY - dirX * planeY);
        let transformX = invDet * (dirY * dx - dirX * dy);
        let transformY = invDet * (-planeY * dx + planeX * dy);

        if (transformY <= 0) return; // dietro il player, non disegnare

        // Dimensioni dello sprite
        let spriteHeight = Math.abs(this.texture.height / transformY * distanceProjectionPlane * this.scale);
        let spriteWidth = Math.abs(this.texture.width / transformY * distanceProjectionPlane * this.scale);
        
        // Posizione x e y sul canvas
        let spriteScreenX = (globals.SCREEN_WIDTH / 2 ) * (1 + transformX / transformY) - spriteWidth / 2;
        let spriteScreenY = globals.SCREEN_HEIGHT / 2 - (this.z * distanceProjectionPlane / transformY) - spriteHeight / 2;

        // Disegna a schermo
        ctx.drawImage(this.texture, spriteScreenX, spriteScreenY, spriteWidth, spriteHeight);
    }

    draw2D(ctx) {
        ctx.fillStyle = "green";

        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2); // x, y, raggio, inizio, fine
        ctx.fill();

    }
}


