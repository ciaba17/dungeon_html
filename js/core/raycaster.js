import { walls } from "../game/objects.js";
import { player } from "../game/player.js";
import { globals } from "../utils/globals.js";

export let rays = [];
export let wallDistances = []; // Distanze dei muri colpiti dai raggi per ordine di rendering

const MAX_DISTANCE = 5000; // Distanza massima di lancio del raggio



class Ray {
    constructor(entity) {
        this.angle = null; 
        this.distance = 0; // Distanza percorsa dal raggio prima di colpire un oggetto
        this.correctedDistance = 0; // Distanza corretta per la distorsione prospettica (fish-eye)
        // Punti di incontro con il muro
        this.hitX = null; 
        this.hitY = null;
        this.entity = entity;
    }

    cast(walls) {
        let startX = Math.floor(this.entity.x / globals.tileSize);
        let startY = Math.floor(this.entity.y / globals.tileSize);
    
        const rayDirX = Math.cos(this.angle);
        const rayDirY = Math.sin(this.angle);
    
        const deltaDistX = Math.abs(1 / rayDirX) * globals.tileSize;
        const deltaDistY = Math.abs(1 / rayDirY) * globals.tileSize;
    
        const stepX = rayDirX < 0 ? -1 : 1;
        const stepY = rayDirY < 0 ? -1 : 1;
    
        let sideDistX = rayDirX < 0
            ? (this.entity.x - startX * globals.tileSize) * Math.abs(1 / rayDirX)
            : ((startX + 1) * globals.tileSize - this.entity.x) * Math.abs(1 / rayDirX);
        let sideDistY = rayDirY < 0
            ? (this.entity.y - startY * globals.tileSize) * Math.abs(1 / rayDirY)
            : ((startY + 1) * globals.tileSize - this.entity.y) * Math.abs(1 / rayDirY);
    
        let hit = false;
        let side = 0; // 0 = X, 1 = Y
        let hitWall = null; // ← SALVA QUI IL MURO
    
        while (!hit) {
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
                    hitWall = wall; // ← ASSEGNA IL MURO COLPITO
                    break;
                }
            }
        }
    
        if (side === 0) {
            this.distance = (startX - this.entity.x / globals.tileSize + (1 - stepX) / 2) / rayDirX * globals.tileSize;
            this.hitX = this.entity.x + rayDirX * this.distance;
            this.hitY = this.entity.y + rayDirY * this.distance;
            this.hitVertical = true;
        } else {
            this.distance = (startY - this.entity.y / globals.tileSize + (1 - stepY) / 2) / rayDirY * globals.tileSize;
            this.hitX = this.entity.x + rayDirX * this.distance;
            this.hitY = this.entity.y + rayDirY * this.distance;
            this.hitVertical = false;
        }
    
        this.correctedDistance = this.distance * Math.cos(this.angle - (this.entity.angle * Math.PI / 180));
    
        this.hitWall = hitWall; // ← SALVA IL MURO NEL RAGGIO
        wallDistances.push(this.correctedDistance);
    }


    draw(ctx) {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.entity.x, this.entity.y);
        ctx.lineTo(this.hitX, this.hitY);
        ctx.strokeStyle = 'grey';
        ctx.stroke();
    }
}

export function raycast() { // Lancia tutti i raggi ad ogni frame
    wallDistances = []; // Resetta l’array delle distanze dei muri
    for (let i = 0; i < rays.length; i++) {
        const ray = rays[i];

        // Calcolo dell’angolo del raggio in base all'angolo del giocatore(gradi) e al FOV
        ray.angle = (player.angle + (i * (globals.fov / globals.rayNumber) - globals.fov / 2)) * Math.PI / 180; // in radianti

        ray.cast(walls); // Lancia il raggio
    }
}

export function createRays() { // Crea i raggi iniziali
    rays = []; // resetta l’array se si ricreano i raggi
    for (let i = 0; i < globals.rayNumber; i++) {
        const ray = new Ray(player);
        rays.push(ray);
    }
}
