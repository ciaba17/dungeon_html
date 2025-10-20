import { walls } from "../game/objects.js";
import { player } from "../game/player.js";
import { globals } from "../utils/globals.js";

export let rays = [];
export let wallDistances = [];
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
        // Posizione iniziale nella griglia della mappa
        let startX = Math.floor(this.entity.x / globals.tileSize);
        let startY = Math.floor(this.entity.y / globals.tileSize);

        // Direzione del raggio 
        const rayDirX = Math.cos(this.angle);
        const rayDirY = Math.sin(this.angle);

        // Distanza che il raggio percorre per spostarsi da cella a cella
        const deltaDistX = Math.abs(1 / rayDirX) * globals.tileSize;
        const deltaDistY = Math.abs(1 / rayDirY) * globals.tileSize;

        // Vede se fare il passo(spostarsi) a sinistra o a destra in base alla direzione
        const stepX = rayDirX < 0 ? -1 : 1;
        const stepY = rayDirY < 0 ? -1 : 1;

        // In base alla direzione del raggio, trova la distanza tra il this.entity e il bordo verticale della cella in cui esso si trova
        let sideDistX, sideDistY;
        if (rayDirX < 0) 
            sideDistX = (this.entity.x - startX * globals.tileSize) * Math.abs(1 / rayDirX); // Se il raggio è diretto a sinistra
        else
            sideDistX = ((startX + 1) * globals.tileSize - this.entity.x) * Math.abs(1 / rayDirX); // Se il raggio è diretto a destra
        // Stessa cosa per il bordo orizzontale
        if (rayDirY < 0)
            sideDistY = (this.entity.y - startY * globals.tileSize) * Math.abs(1 / rayDirY);
        else
            sideDistY = ((startY + 1) * globals.tileSize - this.entity.y) * Math.abs(1 / rayDirY);

        let hit = false; // True quando il raggio colpisce un muro
        let side = 0; // 0 = X, 1 = Y

        // Ciclo di avanzamento del raggio
        while (!hit && this.distance < MAX_DISTANCE) { 
            if (sideDistX < sideDistY) { // Se il raggio colpisce prima la cella in verticale
                sideDistX += deltaDistX; // Aggiorna la distanza al prossimo bordo verticale
                startX += stepX; // Il raggio avanza di una cella
                side = 0; // Segna di aver colpito un muro verticale
            } else {
                sideDistY += deltaDistY;
                startY += stepY;
                side = 1;
            }

            for (let wall of walls) { // Cicla tutti i muri
                // Posizione dei muri sulla griglia
                const wallMapX = Math.floor(wall.x / globals.tileSize); 
                const wallMapY = Math.floor(wall.y / globals.tileSize);

                if (startX === wallMapX && startY === wallMapY) {// Se il ,muro si trova nella stessa casella del raggio
                    hit = true; // Il raggio ha colpito un muro
                    break;
                }
            }
        }

        if (side === 0) { // Se il muro che ha colpito è verticale
            this.distance = (startX - this.entity.x / globals.tileSize + (1 - stepX) / 2) / rayDirX * globals.tileSize; // Calcola la distanza tra this.entity e impatto
            // Coordinate della collisione raggio-muro
            this.hitX = this.entity.x + rayDirX * this.distance;
            this.hitY = this.entity.y + rayDirY * this.distance;
            this.hitVertical = true; // Segna che il raggio ha colpito un muro verticale
        } else { // Se il muro che ha colpito è orizzontale
            this.distance = (startY - this.entity.y / globals.tileSize + (1 - stepY) / 2) / rayDirY * globals.tileSize;
            this.hitX = this.entity.x + rayDirX * this.distance;
            this.hitY = this.entity.y + rayDirY * this.distance;
            this.hitVertical = false;
        }

        this.correctedDistance = this.distance * Math.cos(this.angle - (this.entity.angle * Math.PI / 180)); // DA SISTEMARE
        wallDistances.push(this.correctedDistance); // Salva la distanza per compararla a quella delle entità
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
