import { walls } from "../game/mapObjects.js";
import { player } from "../game/player.js";
import { globals } from "../utils/globals.js";

export let rays = [];

const STEP = 1; // Passo di avanzamento del raggio
const MAX_DISTANCE = 1000; // Distanza massima di lancio del raggio


class Ray {
    constructor() {
        this.position = [player.x, player.y]; 
        this.angle = null; 
        this.distance = 0; // Distanza percorsa dal raggio prima di colpire un oggetto
        this.correctedDistance = 0; // Distanza corretta per la distorsione prospettica (fish-eye)
    }

    cast(walls) {
        let startX = Math.floor(player.x / globals.tileSize);
        let startY = Math.floor(player.y / globals.tileSize);

        let rayDirX = Math.cos(this.angle);
        let rayDirY = Math.sin(this.angle);

        let deltaDistX = Math.abs(1 / rayDirX) * globals.tileSize;
        let deltaDistY = Math.abs(1 / rayDirY) * globals.tileSize;

        let stepX = rayDirX < 0 ? -1 : 1;
        let stepY = rayDirY < 0 ? -1 : 1;

        let sideDistX, sideDistY;
        if (rayDirX < 0)
            sideDistX = (player.x - startX * globals.tileSize) * Math.abs(1 / rayDirX);
        else
            sideDistX = ((startX + 1) * globals.tileSize - player.x) * Math.abs(1 / rayDirX);

        if (rayDirY < 0)
            sideDistY = (player.y - startY * globals.tileSize) * Math.abs(1 / rayDirY);
        else
            sideDistY = ((startY + 1) * globals.tileSize - player.y) * Math.abs(1 / rayDirY);

        let hit = false;
        let side = 0; // 0 = X, 1 = Y

        while (!hit && this.distance < MAX_DISTANCE) {
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                startX += stepX;
                side = 0;
            } else {
                sideDistY += deltaDistY;
                startY += stepY;
                side = 1;
            }

            for (let wall of walls) {
                const wallMapX = Math.floor(wall.x / globals.tileSize);
                const wallMapY = Math.floor(wall.y / globals.tileSize);
                if (startX === wallMapX && startY === wallMapY) {
                    hit = true;
                    break;
                }
            }
        }

        if (side === 0) {
            this.distance = (startX - player.x / globals.tileSize + (1 - stepX) / 2) / rayDirX * globals.tileSize;
            this.hitX = player.x + rayDirX * this.distance;
            this.hitY = player.y + rayDirY * this.distance;
            this.hitVertical = true;
        } else {
            this.distance = (startY - player.y / globals.tileSize + (1 - stepY) / 2) / rayDirY * globals.tileSize;
            this.hitX = player.x + rayDirX * this.distance;
            this.hitY = player.y + rayDirY * this.distance;
            this.hitVertical = false;
        }

        this.correctedDistance = this.distance * Math.cos(this.angle - (player.angle * Math.PI / 180));
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

        // Lancia il raggio
        ray.cast(walls);
    }
}

export function createRays() { // Crea i raggi iniziali
    rays = []; // resetta l’array se si ricreano i raggi
    for (let i = 0; i < globals.rayNumber; i++) {
        const ray = new Ray();
        ray.angle = (player.angle + (i * (globals.fov / globals.rayNumber) - globals.fov / 2)) * Math.PI / 180;
        rays.push(ray);
    }
}
