import { walls } from "../game/mapObjects.js";
import { player } from "../game/player.js";
import { globals } from "../utils/globals.js";

export let rays = [];

const STEP = 1; // Passo di avanzamento del raggio
const MAX_DISTANCE = 800; // Distanza massima di lancio del raggio


class Ray {
    constructor() {
        this.position = [player.x, player.y]; 
        this.angle = null; 
        this.direction = null;
        this.distance = 0; // Distanza percorsa dal raggio prima di colpire un oggetto
        this.correctedDistance = 0; // Distanza corretta per la distorsione prospettica (fish-eye)
    }

    cast(walls) {
        // Posizione del player nella griglia
        let mapX = Math.floor(player.x / globals.tileSize);
        let mapY = Math.floor(player.y / globals.tileSize);

        // Direzione del raggio
        let rayDirX = Math.cos(this.angle);
        let rayDirY = Math.sin(this.angle);

        // Distanza dal player al prossimo lato della griglia
        let sideDistX, sideDistY;

        // Distanza che il raggio percorre per attraversare una cella
        let deltaDistX = Math.abs(1 / rayDirX) * globals.tileSize;
        let deltaDistY = Math.abs(1 / rayDirY) * globals.tileSize;

        // Step indica se il raggio va positivo o negativo nella griglia
        let stepX = rayDirX < 0 ? -1 : 1;
        let stepY = rayDirY < 0 ? -1 : 1;

        // Calcola le distanze iniziali ai lati della cella
        if (rayDirX < 0) sideDistX = (player.x - mapX * globals.tileSize) * deltaDistX / globals.tileSize;
        else sideDistX = ((mapX + 1) * globals.tileSize - player.x) * deltaDistX / globals.tileSize;

        if (rayDirY < 0) sideDistY = (player.y - mapY * globals.tileSize) * deltaDistY / globals.tileSize;
        else sideDistY = ((mapY + 1) * globals.tileSize - player.y) * deltaDistY / globals.tileSize;

        let hit = false;
        let distance = 0;

        while (!hit && distance < MAX_DISTANCE) {
            // Avanza verso il lato più vicino
            if (sideDistX < sideDistY) {
                mapX += stepX;
                distance = sideDistX;
                sideDistX += deltaDistX;
            } else {
                mapY += stepY;
                distance = sideDistY;
                sideDistY += deltaDistY;
            }

            // Calcola la posizione reale
            this.position[0] = player.x + rayDirX * distance;
            this.position[1] = player.y + rayDirY * distance;

            // Controlla se la nuova cella contiene un muro
            for (let wall of walls) {
                let wallMapX = Math.floor(wall.x / globals.tileSize);
                let wallMapY = Math.floor(wall.y / globals.tileSize);
                if (mapX === wallMapX && mapY === wallMapY) {
                    hit = true;
                    break;
                }
            }
        }

        const dx = this.position[0] - player.x;
        const dy = this.position[1] - player.y;
        this.distance = Math.sqrt(dx * dx + dy * dy);

        // Correzione fish-eye
        this.correctedDistance = this.distance * Math.cos(this.angle - player.angle * Math.PI / 180);
    }
    
    draw(ctx) {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(this.position[0], this.position[1]);
        ctx.strokeStyle = 'grey';
        ctx.stroke();
    }
}

export function raycast() { // Lancia tutti i raggi ad ogni frame
    for (let i = 0; i < rays.length; i++) {
        const ray = rays[i];

        // Calcolo dell’angolo del raggio in base all'angolo del giocatore(gradi) e al FOV
        ray.angle = (player.angle + (i * (globals.fov / globals.rayNumber) - globals.fov / 2)) * Math.PI / 180; // in radianti

        // Ricalcola la direzione del raggio
        ray.direction = [Math.cos(ray.angle), Math.sin(ray.angle)];

        // Lancia il raggio
        ray.cast(walls);
    }
}

export function createRays() { // Crea i raggi iniziali
    rays = []; // resetta l’array se si ricreano i raggi
    for (let i = 0; i < globals.rayNumber; i++) {
        const ray = new Ray();
        ray.angle = (player.angle + (i * (globals.fov / globals.rayNumber) - globals.fov / 2)) * Math.PI / 180;
        ray.direction = [Math.cos(ray.angle), Math.sin(ray.angle)];
        rays.push(ray);
    }
}
